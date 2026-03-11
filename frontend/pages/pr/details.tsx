import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Card, { CardHeader } from '../../components/atoms/Card';
import { ApiError } from '../../utils/api/apiClient';
import { getUserSession } from '../../utils/localStorage';
import { getPrDetails, normalizePurchaseRequest } from '../../utils/prApi';
import {
  purchaseRequests as fallbackRequests,
  type PurchaseRequest,
} from '../../utils/mockdata/purchaseRequestsData';

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

    if (user?.role === 'MANAGER' && prId) {
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
      const fallbackRequest = fallbackRequests.find((item) => item.id === prId);

      setIsLoading(true);
      setErrorMessage('');

      if (!sessionUser?.user_id) {
        setPurchaseRequest(fallbackRequest || null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await getPrDetails(sessionUser.user_id, prId);
        if (isMounted) {
          setPurchaseRequest(
            response
              ? normalizePurchaseRequest(response)
              : fallbackRequest || null
          );
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof ApiError
              ? error.message
              : 'Unable to load this purchase request.'
          );
          setPurchaseRequest(fallbackRequest || null);
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

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Card variant="surface" padding="lg">
        <div className="mb-3 flex items-center">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
            <Link href="/pr">
              <a className="transition hover:text-brand-blue">PR Board</a>
            </Link>
            <span className="mx-1.5 text-slate-400">/</span>
            <span className="text-brand-blue">{purchaseRequest.id}</span>
          </div>
        </div>

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
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                <th className="px-4 py-3">Field</th>
                <th className="px-4 py-3">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <tr>
                <td className="px-4 py-3 font-semibold text-brand-blue">
                  Title
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {purchaseRequest.title}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-brand-blue">
                  Department
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {purchaseRequest.department}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-brand-blue">
                  Requester
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {purchaseRequest.requester}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-brand-blue">
                  Vendor
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {purchaseRequest.vendor}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-brand-blue">
                  Amount
                </td>
                <td className="px-4 py-3 text-slate-700">
                  RM {purchaseRequest.amount.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-brand-blue">
                  Last Update
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {purchaseRequest.updatedAt}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-brand-blue">
                  Description
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {purchaseRequest.description}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

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
