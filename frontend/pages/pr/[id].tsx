import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Button from '../../components/atoms/Button';
import Card from '../../components/atoms/Card';
import { useToast } from '../../components/ToastProvider';
import { ApiError } from '../../utils/api/apiClient';
import { USER_ROLES } from '../../utils/constants';
import { getUserSession } from '../../utils/localStorage';
import {
  getPrDetailsPayload,
  normalizePrDetailHeader,
  normalizePrDetailItems,
  normalizePurchaseRequest,
  reviewPurchaseRequest,
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
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  const statusStages = [
    'Pending Approval',
    'In Review',
    'Approved',
    'Rejected',
  ];
  const currentStatusIndex = statusStages.findIndex(
    (stage) => stage === currentRequest?.status
  );

  const itemRows = useMemo(() => {
    if (detailItems.length) {
      return detailItems.map((item, index) => ({
        key: `${item.itemId}-${index}`,
        itemDescription: item.itemName || item.itemId,
        quantity: item.quantity,
        unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : null,
        totalCost:
          typeof item.unitPrice === 'number'
            ? item.quantity * item.unitPrice
            : null,
      }));
    }

    return createdItems.map((item, index) => ({
      key: `${item.sku}-${index}`,
      itemDescription: `${item.itemName} (${item.sku})`,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalCost: item.quantity * item.unitPrice,
    }));
  }, [createdItems, detailItems]);

  async function handleDecision(decision: 'approve' | 'reject') {
    const user = getUserSession();
    if (!currentRequest?.id || !user?.user_id) {
      showToast({
        title: 'Unable to submit decision',
        description:
          'User session required before reviewing this purchase request.',
        variant: 'error',
      });
      return;
    }

    setIsSubmittingDecision(true);

    try {
      await reviewPurchaseRequest({
        pr_id: currentRequest.id,
        decision,
        manager_id: user.user_id,
      });

      showToast({
        title: 'Decision submitted',
        description:
          decision === 'approve'
            ? 'Purchase request approved successfully.'
            : 'Purchase request rejected successfully.',
        variant: 'success',
      });

      await router.push('/pr/approval');
    } catch (error) {
      showToast({
        title: 'Unable to submit decision',
        description:
          error instanceof ApiError
            ? error.message
            : 'Unable to submit review decision right now.',
        variant: 'error',
      });
    } finally {
      setIsSubmittingDecision(false);
    }
  }

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

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Approval Stage
            </p>
            <div className="mt-3 flex items-center gap-2">
              {statusStages.map((stage, index) => {
                const isActive = index === currentStatusIndex;
                const isCompleted =
                  currentStatusIndex > -1 &&
                  index < currentStatusIndex &&
                  currentRequest.status !== 'Rejected';

                return (
                  <div key={stage} className="flex items-center gap-2">
                    <span
                      className={`h-3.5 w-3.5 rounded-full border ${
                        isActive
                          ? 'border-brand-red bg-brand-red'
                          : isCompleted
                          ? 'border-brand-blue bg-brand-blue'
                          : 'border-slate-300 bg-white'
                      }`}
                    />
                    {index < statusStages.length - 1 ? (
                      <span className="h-[2px] w-4 bg-slate-300" />
                    ) : null}
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-sm font-semibold text-brand-blue">
              {currentRequest.status}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Justification
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-800">
            {apiHeader?.justification || currentRequest.description || '-'}
          </p>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                <th className="px-4 py-3">Item Description</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Unit Price</th>
                <th className="px-4 py-3">Total Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {itemRows.length ? (
                itemRows.map((row) => (
                  <tr key={row.key}>
                    <td className="px-4 py-3 font-semibold text-brand-blue">
                      {row.itemDescription}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {row.quantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {typeof row.unitPrice === 'number'
                        ? `RM ${row.unitPrice.toLocaleString()}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {typeof row.totalCost === 'number'
                        ? `RM ${row.totalCost.toLocaleString()}`
                        : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No item rows returned by API.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="border-t border-slate-200">
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.12em] text-slate-600"
                >
                  Total Amount
                </td>
                <td className="px-4 py-3 text-xs font-bold text-brand-blue">
                  RM {currentRequest.amount.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3 border-slate-200 pt-4">
          <Button
            type="button"
            disabled={isSubmittingDecision}
            onClick={() => void handleDecision('approve')}
            className="bg-brand-blue text-white hover:bg-[#1f1b4b]"
          >
            {isSubmittingDecision ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
