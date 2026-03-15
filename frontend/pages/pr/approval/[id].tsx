import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Breadcrumb from '../../../components/atoms/Breadcrumb';
import Button from '../../../components/atoms/Button';
import Card, { CardHeader } from '../../../components/atoms/Card';
import DataTableWithTotal from '../../../components/molecules/DataTableWithTotal';
import { useToast } from '../../../components/ToastProvider';
import { ApiError } from '../../../utils/api/apiClient';
import { USER_ROLES } from '../../../utils/constants';
import { getUserSession } from '../../../utils/localStorage';
import {
  getPrDetails,
  reviewPurchaseRequest,
  type PurchaseRequest,
} from '../../../utils/api/prApi';

type ApprovalDecision = 'APPROVED' | 'REJECTED' | null;

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
        const details = await getPrDetails(user.user_id, prId);
        if (isMounted) {
          setCurrentRequest(details);
        }
      } catch (error) {
        if (isMounted) {
          setCurrentRequest(null);
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

    setIsSubmitting(true);

    try {
      await reviewPurchaseRequest({
        pr_id: currentRequest.id,
        decision: nextDecision === 'approve' ? 'APPROVED' : 'REJECTED',
        manager_id: user.user_id,
      });
      setDecision(nextDecision === 'approve' ? 'APPROVED' : 'REJECTED');
      showToast({
        title: 'Decision submitted',
        description: 'The PR review decision was submitted successfully.',
        variant: 'success',
      });
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
          <Link href="/pr/approval">
            <a className="mt-4 inline-flex text-sm font-bold text-brand-blue hover:text-brand-red">
              Back to PR Approvals
            </a>
          </Link>
        </Card>
      </div>
    );
  }

  const detailRows = [
    { key: 'title', values: { field: 'Title', value: currentRequest.title } },
    {
      key: 'department',
      values: { field: 'Department', value: currentRequest.department },
    },
    {
      key: 'requester',
      values: { field: 'Requester', value: currentRequest.requester },
    },
    {
      key: 'vendor',
      values: { field: 'Vendor', value: currentRequest.vendor },
    },
    {
      key: 'amount',
      values: {
        field: 'Amount',
        value: `RM ${currentRequest.amount.toLocaleString()}`,
      },
    },
    {
      key: 'updatedAt',
      values: { field: 'Last Update', value: currentRequest.updatedAt },
    },
    {
      key: 'description',
      values: { field: 'Description', value: currentRequest.description },
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Card variant="surface" padding="lg">
        <Breadcrumb
          items={[
            { label: 'PR Board', href: '/pr' },
            { label: currentRequest.id, href: `/pr/${currentRequest.id}` },
          ]}
        />

        <CardHeader
          subtitle="Purchase request details"
          title={currentRequest.id}
          action={
            <span className="inline-flex rounded-full bg-brand-red/10 px-2.5 py-1 text-xs font-bold text-brand-red">
              {currentRequest.status}
            </span>
          }
          subtitleClassName="text-brand-red"
          titleClassName="text-brand-blue"
        />

        <DataTableWithTotal
          columns={[
            { key: 'field', label: 'Field' },
            { key: 'value', label: 'Value' },
          ]}
          rows={detailRows}
          emptyLabel="No purchase request details available."
        />

        <div className="mt-5">
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
            variant="ghost"
            disabled={isSubmitting}
            onClick={() => handleDecision('approve')}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
          >
            {isSubmitting ? 'Submitting...' : 'Approve'}
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleDecision('reject')}
            className="rounded-lg px-4 py-2"
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
