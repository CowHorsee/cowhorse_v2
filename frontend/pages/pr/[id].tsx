import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { buttonClassName } from '../../components/atoms/Button';
import Card, { CardHeader } from '../../components/atoms/Card';
import { useToast } from '../../components/ToastProvider';
import { ApiError } from '../../utils/api/apiClient';
import { USER_ROLES } from '../../utils/constants';
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
        itemName: item.itemName || item.itemId,
        reference: item.docId || '-',
        quantity: item.quantity,
        unit: '-',
        unitPrice:
          typeof item.unitPrice === 'number'
            ? `RM ${item.unitPrice.toLocaleString()}`
            : '-',
      }));
    }

    return createdItems.map((item, index) => ({
      key: `${item.sku}-${index}`,
      itemName: item.itemName,
      reference: item.sku,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: `RM ${item.unitPrice.toLocaleString()}`,
    }));
  }, [createdItems, detailItems]);

  useEffect(() => {
    const user = getUserSession();

    if (user?.role === USER_ROLES.MANAGER && prId) {
      void router.replace(`/pr/approval/${prId}`);
    }
  }, [prId, router]);

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
                ...payload,
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
        <div className="mb-3 flex items-center">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
            <Link href="/pr">
              <a className="transition hover:text-brand-blue">PR Board</a>
            </Link>
            <span className="mx-1.5 text-slate-400">/</span>
            <span className="text-brand-blue">{currentRequest.id || prId}</span>
          </div>
        </div>

        <CardHeader
          title={currentRequest.id || prId}
          className="mb-1"
          titleClassName="text-lg"
        />
        <div className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-center md:justify-between"></div>
        <div className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">Requester</p>
          <strong className="font-semibold text-brand-blue">
            {apiHeader?.createdBy || currentRequest.requester}
          </strong>
        </div>
        <div className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">Status</p>
          <span className="inline-flex rounded-full bg-brand-red/10 px-2.5 py-1 text-xs font-bold text-brand-red">
            {currentRequest.status}
          </span>
        </div>
        <div className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">Total Amount (RM)</p>
          <strong className="font-semibold text-brand-blue">
            {currentRequest.amount.toLocaleString()}
          </strong>
        </div>
        <div className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-start md:justify-between md:gap-4">
          <p className="text-sm text-slate-600">Justification</p>
          <strong className="text-right font-semibold text-brand-blue md:max-w-[70%]">
            {apiHeader?.justification || currentRequest.description || '-'}
          </strong>
        </div>
        {apiHeader ? (
          <>
            <div className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-600">Created At</p>
              <strong className="font-semibold text-brand-blue">
                {apiHeader.createdAt || '-'}
              </strong>
            </div>
          </>
        ) : null}
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Unit Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {itemRows.length ? (
                itemRows.map((row) => (
                  <tr key={row.key}>
                    <td className="px-4 py-3 font-semibold text-brand-blue">
                      {row.itemName}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {row.reference}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {row.quantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.unit}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {row.unitPrice}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No item rows returned by API.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href={`/pr/split/${currentRequest.id}`}>
            <a className={buttonClassName({ variant: 'primary' })}>
              Send For Approval
            </a>
          </Link>
        </div>
      </Card>
    </div>
  );
}
