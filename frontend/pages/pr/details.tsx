import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Breadcrumb from '../../components/atoms/Breadcrumb';
import Card, { CardHeader } from '../../components/atoms/Card';
import DataTableWithTotal from '../../components/molecules/DataTableWithTotal';
import { ApiError } from '../../utils/api/apiClient';
import { USER_ROLES } from '../../utils/constants';
import { getUserSession } from '../../utils/localStorage';
import {
  getPrDetails,
  normalizePurchaseRequest,
  type PurchaseRequest,
} from '../../utils/api/prApi';

export default function PrDetailsPage() {
  const router = useRouter();
  const prId = useMemo(() => {
    const rawId = router.query.id;
    return typeof rawId === 'string' ? rawId : '';
  }, [router.query.id]);
  const [purchaseRequest, setPurchaseRequest] =
    useState<PurchaseRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getUserSession();

    if (user?.role === USER_ROLES.MANAGER && prId) {
      void router.replace(`/pr/approval/${encodeURIComponent(prId)}`);
    }
  }, [prId, router]);

  useEffect(() => {
    let isMounted = true;

    async function loadPurchaseRequest() {
      if (!prId) {
        setIsLoading(false);
        return;
      }

      const sessionUser = getUserSession();

      setIsLoading(true);
      setErrorMessage('');

      if (!sessionUser?.user_id) {
        setPurchaseRequest(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await getPrDetails(sessionUser.user_id, prId);
        if (isMounted) {
          setPurchaseRequest(
            response ? normalizePurchaseRequest(response) : null
          );
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof ApiError
              ? error.message
              : 'Unable to load this purchase request.'
          );
          setPurchaseRequest(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPurchaseRequest();

    return () => {
      isMounted = false;
    };
  }, [prId]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <Card variant="surface" padding="lg">
          <p className="text-sm text-slate-500">Loading purchase request...</p>
        </Card>
      </div>
    );
  }

  if (!purchaseRequest) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <Card variant="surface" padding="lg">
          <p className="text-sm font-medium text-brand-red">
            {errorMessage || 'Purchase request not found.'}
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

  const detailRows = [
    { key: 'title', values: { field: 'Title', value: purchaseRequest.title } },
    {
      key: 'department',
      values: { field: 'Department', value: purchaseRequest.department },
    },
    {
      key: 'requester',
      values: { field: 'Requester', value: purchaseRequest.requester },
    },
    {
      key: 'vendor',
      values: { field: 'Vendor', value: purchaseRequest.vendor },
    },
    {
      key: 'amount',
      values: {
        field: 'Amount',
        value: `RM ${purchaseRequest.amount.toLocaleString()}`,
      },
    },
    {
      key: 'updatedAt',
      values: { field: 'Last Update', value: purchaseRequest.updatedAt },
    },
    {
      key: 'description',
      values: { field: 'Description', value: purchaseRequest.description },
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Card variant="surface" padding="lg">
        <Breadcrumb
          items={[
            { label: 'PR Board', href: '/pr' },
            { label: purchaseRequest.id },
          ]}
        />

        <CardHeader
          subtitle="Purchase request details"
          title={purchaseRequest.id}
          action={
            <span className="inline-flex rounded-full bg-brand-red/10 px-2.5 py-1 text-xs font-bold text-brand-red">
              {purchaseRequest.status}
            </span>
          }
          subtitleClassName="text-brand-red"
          titleClassName="text-brand-blue"
        />
        {errorMessage ? (
          <p className="mb-4 text-sm font-medium text-brand-red">
            {errorMessage}
          </p>
        ) : null}
        <DataTableWithTotal
          columns={[
            { key: 'field', label: 'Field' },
            { key: 'value', label: 'Value' },
          ]}
          rows={detailRows}
          emptyLabel="No purchase request details available."
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/pr/split?id=${encodeURIComponent(purchaseRequest.id)}`}>
            <a className="inline-flex items-center rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-brand-white transition hover:bg-[#ad2d2d]">
              Split into POs
            </a>
          </Link>
        </div>
      </Card>
    </div>
  );
}
