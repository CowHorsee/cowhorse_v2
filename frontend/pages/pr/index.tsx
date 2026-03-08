import Link from 'next/link';
import { useMemo, useState } from 'react';
import Card, { CardHeader } from '../../components/atoms/Card';
import { purchaseRequests } from '../../utils/mockdata/purchaseRequestsData';

export default function PrPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return purchaseRequests.filter((request) => {
      if (!normalizedSearch) {
        return true;
      }

      return (
        request.id.toLowerCase().includes(normalizedSearch) ||
        request.title.toLowerCase().includes(normalizedSearch) ||
        request.department.toLowerCase().includes(normalizedSearch) ||
        request.status.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [searchTerm]);

  const pendingCount = purchaseRequests.filter(
    (request) => request.status === 'Pending Approval'
  ).length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <Card variant="surface" padding="lg">
        <CardHeader
          subtitle="Purchase requests"
          title="PR Board"
          subtitleClassName="text-brand-red"
          titleClassName="text-brand-blue"
        />

        <div className="grid gap-3 md:grid-cols-3">
          <Card variant="soft" padding="md">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Total Requests
            </p>
            <p className="mt-2 text-3xl font-semibold text-brand-blue">
              {purchaseRequests.length}
            </p>
          </Card>
          <Card variant="soft" padding="md">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Pending Approval
            </p>
            <p className="mt-2 text-3xl font-semibold text-brand-red">
              {pendingCount}
            </p>
          </Card>
        </div>
      </Card>

      <Card variant="surface" padding="lg">
        <div>
          <label
            htmlFor="pr-search"
            className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500"
          >
            Search by id / title / department / status
          </label>
          <input
            id="pr-search"
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Type id, title, department, or status"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-blue"
          />
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                <th className="px-4 py-3">PR ID</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredRequests.length ? (
                filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-4 py-3 font-semibold text-brand-blue">
                      {request.id}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {request.title}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-brand-red/10 px-2.5 py-1 text-xs font-bold text-brand-red">
                        {request.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/pr/${request.id}`}>
                        <a className="text-sm font-bold text-brand-blue transition hover:text-brand-red">
                          View
                        </a>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No purchase requests match the current search.
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
