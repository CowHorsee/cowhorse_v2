import Link from 'next/link';
import Button, { ButtonAnchor } from '../../components/atoms/Button';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Card, { CardHeader } from '../../components/atoms/Card';
import DataTableWithTotal from '../../components/molecules/DataTableWithTotal';
import { ApiError } from '../../utils/api/apiClient';
import { getUserSession } from '../../utils/localStorage';
import { listPrByUser } from '../../utils/api/prApi';

type PrRow = Awaited<ReturnType<typeof listPrByUser>>[number];

export default function PrPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState<PrRow[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadRequests() {
      const sessionUser = getUserSession();

      setIsLoading(true);
      setErrorMessage('');

      try {
        const apiRows = sessionUser?.user_id
          ? await listPrByUser(sessionUser.user_id)
          : [];

        if (isMounted) {
          setRequests(apiRows);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof ApiError
              ? error.message
              : 'Unable to load purchase requests from the API.'
          );
          setRequests([]);
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

  const tableRows = filteredRequests.map((request) => ({
    key: request.id,
    values: {
      id: request.id,
      title: request.title,
      status: (
        <span className="inline-flex rounded-full bg-brand-red/10 px-2.5 py-1 text-xs font-bold text-brand-red">
          {request.status}
        </span>
      ),
      details: (
        <Link href={`/pr/${request.id}`}>
          <a className="text-sm font-bold text-brand-blue transition hover:text-brand-red">
            View
          </a>
        </Link>
      ),
    },
  }));

  const emptyTableLabel = isLoading
    ? 'Loading purchase requests...'
    : 'No purchase requests match the current search.';

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
            <Link href="/pr/create" passHref>
              <ButtonAnchor variant="primary" className="mt-4">
                Create New
              </ButtonAnchor>
            </Link>
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

        <DataTableWithTotal
          columns={[
            { key: 'id', label: 'PR ID' },
            { key: 'title', label: 'Title / Justification' },
            { key: 'status', label: 'Status' },
            { key: 'details', label: 'Details' },
          ]}
          rows={isLoading ? [] : tableRows}
          emptyLabel={emptyTableLabel}
        />
      </Card>
    </div>
  );
}
