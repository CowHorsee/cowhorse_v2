import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Card, { CardHeader } from '../../components/atoms/Card';
import { getUserSession } from '../../utils/localStorage';
import {
  getPrDetails,
  mergeDetailsIntoPurchaseRequest,
} from '../../utils/prApi';
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

  useEffect(() => {
    const user = getUserSession();

    if (user?.role === 'MANAGER') {
      router.replace(`/pr/approval/${purchaseRequest.id}`);
    }
  }, [purchaseRequest.id, router]);

  useEffect(() => {
    async function loadDetails() {
      const user = getUserSession();

      try {
        const details = await getPrDetails({
          user_id: user?.user_id,
          pr_id: purchaseRequest.id,
        });

        setCurrentRequest(
          mergeDetailsIntoPurchaseRequest(purchaseRequest, details)
        );
      } catch {
        setCurrentRequest(purchaseRequest);
      }
    }

    loadDetails();
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
            <span className="text-brand-blue">{purchaseRequest.id}</span>
          </div>
        </div>

        <CardHeader
          title={purchaseRequest.description}
          className="mb-1"
          titleClassName="text-lg"
        />
        <div className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">Department</p>
          <strong className="font-semibold text-brand-blue">
            {purchaseRequest.department}
          </strong>
        </div>
        <div className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">Requester</p>
          <strong className="font-semibold text-brand-blue">
            {purchaseRequest.requester}
          </strong>
        </div>
        <div className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">Status</p>
          <strong className="font-semibold text-brand-blue">
            {purchaseRequest.status}
          </strong>
        </div>
        <div className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">Vendor</p>
          <strong className="font-semibold text-brand-blue">
            {purchaseRequest.vendor}
          </strong>
        </div>
        <div className="flex flex-col border-b border-slate-200 py-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">Amount</p>
          <strong className="font-semibold text-brand-blue">
            RM {purchaseRequest.amount.toLocaleString()}
          </strong>
        </div>
        <div className="flex flex-col py-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">Last update</p>
          <strong className="font-semibold text-brand-blue">
            {purchaseRequest.updatedAt}
          </strong>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/pr/split/${purchaseRequest.id}`}>
            <a className="inline-flex items-center rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-brand-white transition hover:bg-[#ad2d2d]">
              Split into POs
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
