import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Breadcrumb from '../../components/atoms/Breadcrumb';
import Card from '../../components/atoms/Card';
import StatusProgressIndicator from '../../components/atoms/StatusProgressIndicator';
import DataTableWithTotal from '../../components/molecules/DataTableWithTotal';
import { useToast } from '../../components/ToastProvider';
import { ApiError } from '../../utils/api/apiClient';
import {
  normalizePrApprovalStage,
  PR_APPROVAL_STAGES,
} from '../../utils/constants';
import { getUserSession } from '../../utils/localStorage';
import {
  getPrDetailsPayload,
  normalizePrDetailHeader,
  normalizePrDetailItems,
  normalizePurchaseRequest,
  type PrDetailHeader,
  type PrDetailItem,
  type PurchaseRequest,
} from '../../utils/api/prApi';

type CreatedItemSnapshot = {
  itemName: string;
  sku: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

function readCreatedItemsSnapshot(prId: string): CreatedItemSnapshot[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.sessionStorage.getItem(`created-pr-items:${prId}`);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as Array<{
      itemName?: string;
      sku?: string;
      quantity?: number;
      unit?: string;
      unitPrice?: number;
    }>;

    return parsed
      .map((item) => ({
        itemName: String(item.itemName || '').trim(),
        sku: String(item.sku || '').trim(),
        quantity: Number(item.quantity || 0),
        unit: String(item.unit || 'pcs').trim(),
        unitPrice: Number(item.unitPrice || 0),
      }))
      .filter((item) => item.itemName);
  } catch {
    return [];
  }
}

function buildFallbackRequest(
  prId: string,
  createdItems: CreatedItemSnapshot[],
  createdJustification?: string
): PurchaseRequest | null {
  if (!createdItems.length) {
    return null;
  }

  const user = getUserSession();
  const totalAmount = createdItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  return {
    id: prId,
    title:
      createdItems.length > 1
        ? `${createdItems[0].itemName} and ${
            createdItems.length - 1
          } more item(s)`
        : `${createdItems[0].itemName} procurement request`,
    department: 'Operations',
    requester: user?.name || 'Current User',
    vendor: 'TBD',
    amount: totalAmount,
    status: 'Pending Approval',
    updatedAt: 'Just now',
    description:
      createdJustification ||
      createdItems
        .map(
          (item, index) =>
            `${index + 1}. ${item.itemName} (${
              item.sku
            }) - ${item.quantity.toLocaleString()} ${
              item.unit
            } x RM ${item.unitPrice.toLocaleString()}`
        )
        .join(' | '),
  };
}

function readCreatedJustification(prId: string) {
  if (typeof window === 'undefined') {
    return '';
  }

  return String(
    window.sessionStorage.getItem(`created-pr-justification:${prId}`) || ''
  ).trim();
}

export default function PrDetailsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const prId = useMemo(() => {
    const rawId = router.query.id;
    return typeof rawId === 'string' ? rawId : '';
  }, [router.query.id]);
  const [currentRequest, setCurrentRequest] = useState<PurchaseRequest | null>(
    null
  );
  const [detailItems, setDetailItems] = useState<PrDetailItem[]>([]);
  const [createdItems, setCreatedItems] = useState<
    Array<{
      itemName: string;
      sku: string;
      quantity: number;
      unit: string;
      unitPrice: number;
    }>
  >([]);
  const [apiHeader, setApiHeader] = useState<PrDetailHeader | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const itemRows = useMemo(() => {
    if (detailItems.length) {
      return detailItems.map((item, index) => ({
        key: `${item.itemId}-${index}`,
        values: {
          itemDescription: item.itemName || item.itemId,
          quantity: item.quantity.toLocaleString(),
          unitPrice:
            typeof item.unitPrice === 'number'
              ? `RM ${item.unitPrice.toLocaleString()}`
              : '-',
          totalCost:
            typeof item.unitPrice === 'number'
              ? `RM ${(item.quantity * item.unitPrice).toLocaleString()}`
              : '-',
        },
      }));
    }

    return createdItems.map((item, index) => ({
      key: `${item.sku}-${index}`,
      values: {
        itemDescription: `${item.itemName} (${item.sku})`,
        quantity: item.quantity.toLocaleString(),
        unitPrice: `RM ${item.unitPrice.toLocaleString()}`,
        totalCost: `RM ${(item.quantity * item.unitPrice).toLocaleString()}`,
      },
    }));
  }, [createdItems, detailItems]);

  const itemColumns = [
    { key: 'itemDescription', label: 'Item Description' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'unitPrice', label: 'Unit Price' },
    { key: 'totalCost', label: 'Total Cost' },
  ];

  const currentStatusStage = useMemo(
    () =>
      normalizePrApprovalStage(apiHeader?.statusName || currentRequest?.status),
    [apiHeader?.statusName, currentRequest?.status]
  );

  useEffect(() => {
    if (!prId) {
      return;
    }

    setCreatedItems(readCreatedItemsSnapshot(prId));
  }, [prId]);

  useEffect(() => {
    let isMounted = true;

    async function loadDetails() {
      if (!prId) {
        setIsLoading(false);
        return;
      }

      const createdSnapshot = readCreatedItemsSnapshot(prId);
      const createdJustification = readCreatedJustification(prId);
      const fallbackRequest = buildFallbackRequest(
        prId,
        createdSnapshot,
        createdJustification
      );

      const user = getUserSession();
      if (!user?.user_id) {
        showToast({
          title: 'Unable to load PR details',
          description:
            'User session required before loading this purchase request.',
          variant: 'error',
        });
        setCurrentRequest(fallbackRequest);
        setDetailItems(
          createdSnapshot.map((item) => ({
            itemId: item.sku || item.itemName,
            itemName: item.itemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            docId: '',
          }))
        );
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const payload = await getPrDetailsPayload(user.user_id, prId);
        if (!isMounted) {
          return;
        }

        setCurrentRequest(normalizePurchaseRequest(payload));
        const header = normalizePrDetailHeader(payload);
        if (header?.prId) {
          setCurrentRequest((current) => {
            if (!current) {
              return normalizePurchaseRequest({
                pr_id: header.prId,
                justification: header.justification,
              });
            }

            return {
              ...current,
              id: current.id || header.prId,
              description: current.description || header.justification,
            };
          });
        }
        setDetailItems(normalizePrDetailItems(payload));
        setApiHeader(header);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setCurrentRequest(fallbackRequest);
        setDetailItems(
          createdSnapshot.map((item) => ({
            itemId: item.sku || item.itemName,
            itemName: item.itemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            docId: '',
          }))
        );
        setApiHeader(null);
        showToast({
          title: 'Unable to load PR details',
          description:
            error instanceof ApiError
              ? error.message
              : 'Unable to load latest PR details from API.',
          variant: 'error',
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDetails();

    return () => {
      isMounted = false;
    };
  }, [prId, showToast]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <Card variant="surface" padding="lg">
          <p className="text-sm text-slate-500">Loading purchase request...</p>
        </Card>
      </div>
    );
  }

  if (!currentRequest) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <Card variant="surface" padding="lg">
          <p className="text-sm font-medium text-brand-red">
            Purchase request not found.
          </p>
          <Link href="/pr">
            <a className="mt-4 inline-flex text-sm font-bold text-brand-blue hover:text-brand-red">
              Back to PR Board
            </a>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Card variant="surface" padding="lg">
        <Breadcrumb
          items={[
            { label: 'PR Board', href: '/pr' },
            { label: currentRequest.id || prId },
          ]}
        />

        <h1 className="text-3xl font-bold tracking-tight text-brand-blue">
          {currentRequest.id || prId}
        </h1>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2 gap-3 flex flex-col">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Requester
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {apiHeader?.createdBy || currentRequest.requester}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Created At
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {apiHeader?.createdAt || currentRequest.updatedAt || '-'}
              </p>
            </div>
          </div>

          <StatusProgressIndicator
            title="PR Status"
            stages={PR_APPROVAL_STAGES}
            currentStatus={currentStatusStage}
          />
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Justification
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-800">
            {apiHeader?.justification || currentRequest.description || '-'}
          </p>
        </div>

        <DataTableWithTotal
          columns={itemColumns}
          rows={itemRows}
          emptyLabel="No item rows returned by API."
          totalLabel="Total Amount"
          totalValue={`RM ${currentRequest.amount.toLocaleString()}`}
        />
      </Card>
    </div>
  );
}
