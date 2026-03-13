import Link from 'next/link';
import Button from '../../components/atoms/Button';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Card, { CardHeader } from '../../components/atoms/Card';
import { ApiError } from '../../utils/api/apiClient';
import {
  getCreatedPurchaseRequests,
  getUserSession,
} from '../../utils/localStorage';
import { listPrByUser } from '../../utils/api/prApi';

export default function PrPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadRequests() {
      const sessionUser = getUserSession();
      const createdRows = getCreatedPurchaseRequests();

      setIsLoading(true);
      setErrorMessage('');

      try {
        const apiRows = sessionUser?.user_id
          ? await listPrByUser(sessionUser.user_id)
          : fallbackRequests;

        const baseRows = (apiRows.length ? apiRows : fallbackRequests).filter(
          (baseRow) =>
            !createdRows.some((createdRow) => createdRow.id === baseRow.id)
        );

        if (isMounted) {
          setRequests([...createdRows, ...baseRows]);
        }
      } catch (error) {
        const baseRows = fallbackRequests.filter(
          (baseRow) =>
            !createdRows.some((createdRow) => createdRow.id === baseRow.id)
        );

        if (isMounted) {
          setErrorMessage(
            error instanceof ApiError
              ? error.message
              : 'Unable to load purchase requests from the API.'
          );
          setRequests([...createdRows, ...baseRows]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadRequests();

    return () => {
      isMounted = false;
    };
  }, [router.asPath]);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return requests.filter((request) => {
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
  }, [requests, searchTerm]);

  const pendingCount = requests.filter(
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
              {requests.length}
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
          <Card variant="soft" padding="md">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Create Purchase Request
            </p>
            <Button variant="primary" className="mt-4" href="/pr/create">
              Create New
            </Button>
          </Card>
        </div>
        {errorMessage ? (
          <p className="mt-3 text-sm font-medium text-brand-red">
            {errorMessage}
          </p>
        ) : null}
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
                <th className="px-4 py-3">Title / Justification</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Loading purchase requests...
                  </td>
                </tr>
              ) : filteredRequests.length ? (
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
                    colSpan={4}
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
