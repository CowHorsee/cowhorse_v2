import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Card, { CardHeader } from '../../../components/atoms/Card';
<<<<<<< HEAD
<<<<<<< HEAD
import { getUserSession } from '../../../utils/localStorage';
import {
=======
import { ApiError } from '../../../utils/apiClient';
import { getUserSession } from '../../../utils/localStorage';
import {
  getPrDetails,
  mergeDetailsIntoPurchaseRequest,
  reviewPr,
} from '../../../utils/prApi';
import {
>>>>>>> c29feea16da9cf0dc1b60a04f7912c8d82c668d8
=======
import { getUserSession } from '../../../utils/localStorage';
import {
>>>>>>> 3b6e34cc11df805a2fd1bf4eea223fe8a5c8a3f3
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
<<<<<<< HEAD
<<<<<<< HEAD
  const [decision, setDecision] = useState<ApprovalDecision>(null);
=======
  const [currentRequest, setCurrentRequest] = useState(purchaseRequest);
  const [decision, setDecision] = useState<ApprovalDecision>(null);
  const [decisionMessage, setDecisionMessage] = useState('');
>>>>>>> c29feea16da9cf0dc1b60a04f7912c8d82c668d8
=======
  const [decision, setDecision] = useState<ApprovalDecision>(null);
>>>>>>> 3b6e34cc11df805a2fd1bf4eea223fe8a5c8a3f3

  useEffect(() => {
    const user = getUserSession();

    if (user?.role !== 'MANAGER' && user?.role !== 'ADMIN') {
      router.replace(`/pr/${purchaseRequest.id}`);
    }
  }, [purchaseRequest.id, router]);

<<<<<<< HEAD
<<<<<<< HEAD
=======
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

  async function handleDecision(nextDecision: 'approve' | 'reject') {
    const user = getUserSession();

    if (!user?.user_id) {
      setDecisionMessage('User session is required to submit approval.');
      return;
    }

    try {
      const response = await reviewPr({
        pr_id: currentRequest.id,
        decision: nextDecision,
        manager_id: user.user_id,
      });

      setDecision(nextDecision === 'approve' ? 'APPROVED' : 'REJECTED');
      setDecisionMessage(response || 'Decision submitted.');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Unable to submit review right now.';
      setDecisionMessage(message);
    }
  }

>>>>>>> c29feea16da9cf0dc1b60a04f7912c8d82c668d8
=======
>>>>>>> 3b6e34cc11df805a2fd1bf4eea223fe8a5c8a3f3
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
<<<<<<< HEAD
<<<<<<< HEAD
              {purchaseRequest.status}
=======
              {currentRequest.status}
>>>>>>> c29feea16da9cf0dc1b60a04f7912c8d82c668d8
=======
              {purchaseRequest.status}
>>>>>>> 3b6e34cc11df805a2fd1bf4eea223fe8a5c8a3f3
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
<<<<<<< HEAD
<<<<<<< HEAD
                  {purchaseRequest.title}
=======
                  {currentRequest.title}
>>>>>>> c29feea16da9cf0dc1b60a04f7912c8d82c668d8
=======
                  {purchaseRequest.title}
>>>>>>> 3b6e34cc11df805a2fd1bf4eea223fe8a5c8a3f3
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-brand-blue">
                  Department
                </td>
                <td className="px-4 py-3 text-slate-700">
<<<<<<< HEAD
<<<<<<< HEAD
                  {purchaseRequest.department}
=======
                  {currentRequest.department}
>>>>>>> c29feea16da9cf0dc1b60a04f7912c8d82c668d8
=======
                  {purchaseRequest.department}
>>>>>>> 3b6e34cc11df805a2fd1bf4eea223fe8a5c8a3f3
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-brand-blue">
                  Requester
                </td>
                <td className="px-4 py-3 text-slate-700">
<<<<<<< HEAD
<<<<<<< HEAD
                  {purchaseRequest.requester}
=======
                  {currentRequest.requester}
>>>>>>> c29feea16da9cf0dc1b60a04f7912c8d82c668d8
=======
                  {purchaseRequest.requester}
>>>>>>> 3b6e34cc11df805a2fd1bf4eea223fe8a5c8a3f3
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-brand-blue">
                  Vendor
                </td>
                <td className="px-4 py-3 text-slate-700">
<<<<<<< HEAD
<<<<<<< HEAD
                  {purchaseRequest.vendor}
=======
                  {currentRequest.vendor}
>>>>>>> c29feea16da9cf0dc1b60a04f7912c8d82c668d8
=======
                  {purchaseRequest.vendor}
>>>>>>> 3b6e34cc11df805a2fd1bf4eea223fe8a5c8a3f3
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-brand-blue">
                  Amount
                </td>
                <td className="px-4 py-3 text-slate-700">
<<<<<<< HEAD
<<<<<<< HEAD
                  RM {purchaseRequest.amount.toLocaleString()}
=======
                  RM {currentRequest.amount.toLocaleString()}
>>>>>>> c29feea16da9cf0dc1b60a04f7912c8d82c668d8
=======
                  RM {purchaseRequest.amount.toLocaleString()}
>>>>>>> 3b6e34cc11df805a2fd1bf4eea223fe8a5c8a3f3
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-brand-blue">
                  Last Update
                </td>
                <td className="px-4 py-3 text-slate-700">
<<<<<<< HEAD
<<<<<<< HEAD
                  {purchaseRequest.updatedAt}
=======
                  {currentRequest.updatedAt}
>>>>>>> c29feea16da9cf0dc1b60a04f7912c8d82c668d8
=======
                  {purchaseRequest.updatedAt}
>>>>>>> 3b6e34cc11df805a2fd1bf4eea223fe8a5c8a3f3
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-brand-blue">
                  Description
                </td>
                <td className="px-4 py-3 text-slate-700">
<<<<<<< HEAD
<<<<<<< HEAD
                  {purchaseRequest.description}
=======
                  {currentRequest.description}
>>>>>>> c29feea16da9cf0dc1b60a04f7912c8d82c668d8
=======
                  {purchaseRequest.description}
>>>>>>> 3b6e34cc11df805a2fd1bf4eea223fe8a5c8a3f3
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
<<<<<<< HEAD
<<<<<<< HEAD
            onClick={() => setDecision('APPROVED')}
=======
            onClick={() => handleDecision('approve')}
>>>>>>> c29feea16da9cf0dc1b60a04f7912c8d82c668d8
=======
            onClick={() => setDecision('APPROVED')}
>>>>>>> 3b6e34cc11df805a2fd1bf4eea223fe8a5c8a3f3
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            Approve
          </button>
          <button
            type="button"
<<<<<<< HEAD
<<<<<<< HEAD
            onClick={() => setDecision('REJECTED')}
=======
            onClick={() => handleDecision('reject')}
>>>>>>> c29feea16da9cf0dc1b60a04f7912c8d82c668d8
=======
            onClick={() => setDecision('REJECTED')}
>>>>>>> 3b6e34cc11df805a2fd1bf4eea223fe8a5c8a3f3
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
        {decisionMessage ? (
          <p className="mt-2 text-sm text-slate-600">{decisionMessage}</p>
        ) : null}
>>>>>>> c29feea16da9cf0dc1b60a04f7912c8d82c668d8
=======
>>>>>>> 3b6e34cc11df805a2fd1bf4eea223fe8a5c8a3f3
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
