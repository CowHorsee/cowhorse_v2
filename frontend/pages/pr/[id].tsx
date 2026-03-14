import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { buttonClassName } from '../../components/atoms/Button';
import Card, { CardHeader } from '../../components/atoms/Card';
import { ApiError } from '../../utils/api/apiClient';
import { USER_ROLES } from '../../utils/constants';
import { getUserSession } from '../../utils/localStorage';
import {
  getPrDetailsPayload,
  normalizePrDetailItems,
  normalizePurchaseRequest,
  type PrDetailItem,
  type PurchaseRequest,
} from '../../utils/api/prApi';

export default function PrDetailsPage() {
  const router = useRouter();
  const prId = useMemo(() => {
    const rawId = router.query.id;
    return typeof rawId === 'string' ? rawId : '';
  }, [router.query.id]);
  const [currentRequest, setCurrentRequest] = useState<PurchaseRequest | null>(
    null
  );
  const [detailItems, setDetailItems] = useState<PrDetailItem[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getUserSession();

    if (user?.role === USER_ROLES.MANAGER && prId) {
      void router.replace(`/pr/approval/${prId}`);
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
        setErrorMessage(
          'User session required before loading this purchase request.'
        );
        setCurrentRequest(null);
        setDetailItems([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        const payload = await getPrDetailsPayload(user.user_id, prId);
        if (!isMounted) {
          return;
        }

        setCurrentRequest(normalizePurchaseRequest(payload));
        setDetailItems(normalizePrDetailItems(payload));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setCurrentRequest(null);
        setDetailItems([]);
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : 'Unable to load latest PR details from API.'
        );
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

  if (!currentRequest) {
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
            <span className="text-brand-blue">{currentRequest.id}</span>
          </div>
        </div>

        <CardHeader
          title={currentRequest.description}
          className="mb-1"
          titleClassName="text-lg"
        />
        {errorMessage ? (
          <p className="mb-3 text-sm font-medium text-brand-red">
            {errorMessage}
          </p>
        ) : null}
        <div className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-center md:justify-between"></div>
        <div className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">Requester</p>
          <strong className="font-semibold text-brand-blue">
            {currentRequest.requester}
          </strong>
        </div>
        <div className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">Status</p>
          <strong className="font-semibold text-brand-blue">
            {currentRequest.status}
          </strong>
        </div>
        {detailItems.length ? (
          detailItems.map((item, index) => (
            <div
              key={`${item.itemId}-${index}`}
              className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-center md:justify-between"
            >
              <p className="text-sm text-slate-600">Item {index + 1}</p>
              <strong className="font-semibold text-brand-blue">
                {item.itemId} - {item.quantity}
              </strong>
            </div>
          ))
        ) : (
          <div className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-600">Items</p>
            <strong className="font-semibold text-brand-blue">
              No item rows returned by API.
            </strong>
          </div>
        )}
        <div className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">Total Amount (RM)</p>
          <strong className="font-semibold text-brand-blue">
            {currentRequest.amount.toLocaleString()}
          </strong>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
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
