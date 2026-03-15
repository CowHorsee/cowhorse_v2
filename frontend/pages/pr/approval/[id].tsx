import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Breadcrumb from '../../../components/atoms/Breadcrumb';
import Button from '../../../components/atoms/Button';
import Card from '../../../components/atoms/Card';
import StatusProgressIndicator from '../../../components/atoms/StatusProgressIndicator';
import DataTableWithTotal from '../../../components/molecules/DataTableWithTotal';
import { useToast } from '../../../components/ToastProvider';
import { ApiError } from '../../../utils/api/apiClient';
import {
  normalizePrApprovalStage,
  PR_APPROVAL_STAGES,
  USER_ROLES,
} from '../../../utils/constants';
import { getUserSession } from '../../../utils/localStorage';
import {
  getPrDetailsPayload,
  normalizePrDetailHeader,
  normalizePrDetailItems,
  normalizePurchaseRequest,
  reviewPurchaseRequest,
  type PrDetailHeader,
  type PrDetailItem,
  type PurchaseRequest,
} from '../../../utils/api/prApi';

type ApprovalDecision = 'Approve' | 'Reject' | null;

export default function ManagerApprovalPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const prId = useMemo(() => {
    const rawId = router.query.id;
    return typeof rawId === 'string' ? rawId : '';
  }, [router.query.id]);
  const [currentRequest, setCurrentRequest] = useState<PurchaseRequest | null>(
    null
  );
  const [decision, setDecision] = useState<ApprovalDecision>(null);
  const [managerComment, setManagerComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [detailItems, setDetailItems] = useState<PrDetailItem[]>([]);
  const [apiHeader, setApiHeader] = useState<PrDetailHeader | null>(null);

  const itemRows = useMemo(
    () =>
      detailItems.map((item, index) => ({
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
      })),
    [detailItems]
  );

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
    const user = getUserSession();

    if (user?.role !== USER_ROLES.MANAGER && user?.role !== USER_ROLES.ADMIN) {
      if (prId) {
        void router.replace(`/pr/${prId}`);
      }
    }
  }, [prId, router]);

  useEffect(() => {
    let isMounted = true;

    async function loadDetails() {
      if (!prId) {
        setIsLoading(false);
        return;
      }

      const user = getUserSession();
      if (!user?.user_id) {
        setCurrentRequest(null);
        showToast({
          title: 'Unable to load approval details',
          description: 'User session required to review this purchase request.',
          variant: 'error',
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const payload = await getPrDetailsPayload(user.user_id, prId);
        if (isMounted) {
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
        }
      } catch (error) {
        if (isMounted) {
          setCurrentRequest(null);
          setDetailItems([]);
          setApiHeader(null);
          showToast({
            title: 'Unable to load approval details',
            description:
              error instanceof ApiError
                ? error.message
                : 'Unable to load this purchase request.',
            variant: 'error',
          });
        }
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

  async function handleDecision(nextDecision: 'approve' | 'reject') {
    const user = getUserSession();
    if (!user?.user_id || !currentRequest) {
      showToast({
        title: 'Unable to submit decision',
        description: 'User session is required to submit approval.',
        variant: 'error',
      });
      return;
    }

    const comment = managerComment.trim();
    if (nextDecision === 'reject' && !comment) {
      showToast({
        title: 'Comment required',
        description: 'Please provide a rejection comment before submitting.',
        variant: 'error',
      });
      return;
    }

    const decisionValue = nextDecision === 'approve' ? 'Approve' : 'Reject';
    const justification =
      nextDecision === 'approve'
        ? apiHeader?.statusName || currentRequest.status
        : comment;

    setIsSubmitting(true);

    try {
      await reviewPurchaseRequest({
        pr_id: currentRequest.id,
        decision: decisionValue,
        justification,
        manager_id: user.user_id,
      });
      setDecision(decisionValue);
      showToast({
        title: 'Decision submitted',
        description: 'The PR review decision was submitted successfully.',
        variant: 'success',
      });

      setManagerComment('');
      setCurrentRequest((current) =>
        current
          ? {
              ...current,
              status: decisionValue === 'Approve' ? 'Approved' : 'Rejected',
            }
          : current
      );
      setApiHeader((current) =>
        current
          ? {
              ...current,
              statusName: decisionValue === 'Approve' ? 'Approved' : 'Rejected',
            }
          : current
      );

      await router.push('/approval');
      return;
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Unable to submit review right now.';
      showToast({
        title: 'Unable to submit decision',
        description: message,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

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
          <Link href="/approval">
            <a className="mt-4 inline-flex text-sm font-bold text-brand-blue hover:text-brand-red">
              Back to PR Approvals
            </a>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <Card variant="surface" padding="lg">
        <Breadcrumb
          items={[
            { label: 'PR Board', href: '/pr' },
            { label: currentRequest.id, href: `/pr/${currentRequest.id}` },
          ]}
        />

        <h1 className="text-3xl font-bold tracking-tight text-brand-blue">
          {currentRequest.id}
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

      <Card variant="surface" padding="lg">
        <div>
          <label
            htmlFor="manager-comment"
            className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500"
          >
            Manager comment
          </label>
          <textarea
            id="manager-comment"
            value={managerComment}
            onChange={(event) => setManagerComment(event.target.value)}
            rows={4}
            placeholder="Add your approval or rejection notes"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-blue"
          />
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleDecision('approve')}
            className="rounded-lg !bg-emerald-600 px-4 py-2 text-sm font-bold !text-white hover:!bg-emerald-700 hover:!text-white"
          >
            {isSubmitting ? 'Submitting...' : 'Accept'}
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleDecision('reject')}
            variant="outline"
            className="rounded-lg border-brand-red px-4 py-2 text-brand-red hover:bg-brand-red/5"
          >
            Reject
          </Button>
        </div>

        {decision ? (
          <p className="mt-3 text-sm font-semibold text-brand-blue">
            Manager decision recorded: {decision}
            {managerComment.trim() ? ` - ${managerComment.trim()}` : '.'}
          </p>
        ) : null}
      </Card>
    </div>
  );
}
