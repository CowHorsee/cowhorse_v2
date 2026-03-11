import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { buttonClassName } from '../../components/atoms/Button';
import Card, { CardHeader } from '../../components/atoms/Card';
import { ApiError } from '../../utils/api/apiClient';
import { getUserSession } from '../../utils/localStorage';
import { getPrDetails, normalizePurchaseRequest } from '../../utils/prApi';
import {
  purchaseRequests,
  type PurchaseRequest,
} from '../../utils/mockdata/purchaseRequestsData';

type PrDetailsPageProps = {
  purchaseRequest: PurchaseRequest;
};

export default function PrDetailsPage({ purchaseRequest }: PrDetailsPageProps) {
  const router = useRouter();
  const [currentRequest, setCurrentRequest] = useState(purchaseRequest);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const user = getUserSession();

    if (user?.role === 'MANAGER') {
      void router.replace(`/pr/approval/${purchaseRequest.id}`);
    }
  }, [purchaseRequest.id, router]);

  useEffect(() => {
    let isMounted = true;

    async function loadDetails() {
      const user = getUserSession();
      if (!user?.user_id) {
        return;
      }

      try {
        const details = await getPrDetails(user.user_id, purchaseRequest.id);
        if (isMounted && details) {
          setCurrentRequest(normalizePurchaseRequest(details));
          setErrorMessage('');
        }
      } catch (error) {
        if (isMounted) {
          setCurrentRequest(purchaseRequest);
          setErrorMessage(
            error instanceof ApiError
              ? error.message
              : 'Unable to load latest PR details from API.'
          );
        }
      }
    }

    void loadDetails();

    return () => {
      isMounted = false;
    };
  }, [purchaseRequest]);

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
        <div className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">Item 1 </p>
          <strong className="font-semibold text-brand-blue">
            Faber Chimney Hood - 99
          </strong>
        </div>
        <div className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">Item 2 </p>
          <strong className="font-semibold text-brand-blue">
            Elba Built-in Gas Hob - 19
          </strong>
        </div>
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

export async function getStaticPaths() {
  const paths = purchaseRequests.map((item) => ({ params: { id: item.id } }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }: { params: { id: string } }) {
  const purchaseRequest = purchaseRequests.find(
    (item) => item.id === params.id
  );

  if (!purchaseRequest) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      purchaseRequest,
    },
  };
}
