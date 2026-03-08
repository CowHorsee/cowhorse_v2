import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Card, { CardHeader } from '../../../components/atoms/Card';
import { getUserSession } from '../../../utils/localStorage';
import {
  purchaseRequests,
  type PurchaseRequest,
} from '../../../utils/mockdata/purchaseRequestsData';

type ManagerApprovalPageProps = {
  purchaseRequest: PurchaseRequest;
};

type ApprovalDecision = 'APPROVED' | 'REJECTED' | null;

export default function ManagerApprovalPage({
  purchaseRequest,
}: ManagerApprovalPageProps) {
  const router = useRouter();
  const [decision, setDecision] = useState<ApprovalDecision>(null);

  useEffect(() => {
    const user = getUserSession();

    if (user?.role !== 'MANAGER' && user?.role !== 'ADMIN') {
      router.replace(`/pr/${purchaseRequest.id}`);
    }
  }, [purchaseRequest.id, router]);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Card variant="surface" padding="lg">
        <div className="mb-3 flex items-center justify-end">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
            <Link href="/pr">
              <a className="transition hover:text-brand-blue">PR Board</a>
            </Link>
            <span className="mx-1.5 text-slate-400">/</span>
            <Link href={`/pr/${purchaseRequest.id}`}>
              <a className="transition hover:text-brand-blue">
                {purchaseRequest.id}
              </a>
            </Link>
            <span className="mx-1.5 text-slate-400">/</span>
            <span className="text-brand-blue">Manager Approval</span>
          </div>
        </div>

        <CardHeader
          subtitle="Manager approval"
          title={purchaseRequest.id}
          action={
            <span className="inline-flex rounded-full bg-brand-red/10 px-2.5 py-1 text-xs font-bold text-brand-red">
              {purchaseRequest.status}
            </span>
          }
          subtitleClassName="text-brand-red"
          titleClassName="text-brand-blue"
        />

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
          <button
            type="button"
            onClick={() => setDecision('APPROVED')}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => setDecision('REJECTED')}
            className="inline-flex items-center rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-brand-white transition hover:bg-[#ad2d2d]"
          >
            Reject
          </button>
        </div>

        {decision ? (
          <p className="mt-3 text-sm font-semibold text-brand-blue">
            Manager decision recorded: {decision}.
          </p>
        ) : null}
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
