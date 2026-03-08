import Link from 'next/link';
<<<<<<< HEAD
<<<<<<< HEAD
import { useMemo, useState } from 'react';
import Card, { CardHeader } from '../../../components/atoms/Card';
import { purchaseRequests } from '../../../utils/mockdata/purchaseRequestsData';
=======
import { useEffect, useMemo, useState } from 'react';
import Card, { CardHeader } from '../../../components/atoms/Card';
import { getUserSession } from '../../../utils/localStorage';
import { purchaseRequests } from '../../../utils/mockdata/purchaseRequestsData';
import { getPrTickets, mapTicketToPurchaseRequest } from '../../../utils/prApi';
>>>>>>> c29feea16da9cf0dc1b60a04f7912c8d82c668d8
=======
import { useMemo, useState } from 'react';
import Card, { CardHeader } from '../../../components/atoms/Card';
import { purchaseRequests } from '../../../utils/mockdata/purchaseRequestsData';
>>>>>>> 3b6e34cc11df805a2fd1bf4eea223fe8a5c8a3f3

const approvableStatuses = new Set(['Pending Approval', 'In Review']);

export default function PrApprovalListPage() {
  const [searchTerm, setSearchTerm] = useState('');
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 3b6e34cc11df805a2fd1bf4eea223fe8a5c8a3f3

  const approvals = useMemo(
    () =>
      purchaseRequests.filter((request) =>
        approvableStatuses.has(request.status)
      ),
    []
<<<<<<< HEAD
=======
  const [requests, setRequests] = useState(purchaseRequests);

  useEffect(() => {
    async function loadRequests() {
      const sessionUser = getUserSession();

      try {
        const rows = await getPrTickets({ user_id: sessionUser?.user_id });
        if (rows.length) {
          setRequests(
            rows.map((row) =>
              mapTicketToPurchaseRequest(
                row,
                purchaseRequests.find((item) => item.id === row.pr_id)
              )
            )
          );
        }
      } catch {
        setRequests(purchaseRequests);
      }
    }

    loadRequests();
  }, []);

  const approvals = useMemo(
    () => requests.filter((request) => approvableStatuses.has(request.status)),
    [requests]
>>>>>>> c29feea16da9cf0dc1b60a04f7912c8d82c668d8
=======
>>>>>>> 3b6e34cc11df805a2fd1bf4eea223fe8a5c8a3f3
  );

  const filteredApprovals = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return approvals.filter((request) => {
      if (!normalizedSearch) {
        return true;
      }

      return (
        request.id.toLowerCase().includes(normalizedSearch) ||
        request.title.toLowerCase().includes(normalizedSearch) ||
        request.requester.toLowerCase().includes(normalizedSearch) ||
        request.status.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [approvals, searchTerm]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <Card variant="surface" padding="lg">
        <CardHeader
          subtitle="Approval module"
          title="PR Approvals"
          subtitleClassName="text-brand-red"
          titleClassName="text-brand-blue"
        />

        <div className="grid gap-3 md:grid-cols-3">
          <Card variant="soft" padding="md">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Needs Approval
            </p>
            <p className="mt-2 text-3xl font-semibold text-brand-red">
              {approvals.length}
            </p>
          </Card>

          <Card variant="soft" padding="md">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Visible Rows
            </p>
            <p className="mt-2 text-3xl font-semibold text-brand-blue">
              {filteredApprovals.length}
            </p>
          </Card>

          <Card variant="soft" padding="md">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Flow
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-700">
              Select a PR below to open approval detail.
            </p>
          </Card>
        </div>
      </Card>

      <Card variant="surface" padding="lg">
        <div>
          <label
            htmlFor="approval-search"
            className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500"
          >
            Search by id / title / requester / status
          </label>
          <input
            id="approval-search"
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Type id, title, requester, or status"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-blue"
          />
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                <th className="px-4 py-3">PR ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Requester</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredApprovals.length ? (
                filteredApprovals.map((request) => (
                  <tr key={request.id}>
                    <td className="px-4 py-3 font-semibold text-brand-blue">
                      {request.id}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {request.title}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {request.requester}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {request.department}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      RM {request.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-brand-red/10 px-2.5 py-1 text-xs font-bold text-brand-red">
                        {request.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/pr/approval/${request.id}`}>
                        <a className="text-sm font-bold text-brand-blue transition hover:text-brand-red">
                          Review
                        </a>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No approvals match the current search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
