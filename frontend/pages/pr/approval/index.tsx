import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Card, { CardHeader } from '../../../components/atoms/Card';
import DataTableWithTotal from '../../../components/molecules/DataTableWithTotal';
import { ApiError } from '../../../utils/api/apiClient';
import { getUserSession } from '../../../utils/localStorage';
import { getPrTickets, type PurchaseRequest } from '../../../utils/api/prApi';

const approvableStatuses = new Set(['Pending Approval', 'In Review']);

export default function PrApprovalListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [approvals, setApprovals] = useState<PurchaseRequest[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadApprovals() {
      const sessionUser = getUserSession();
      if (!sessionUser?.user_id) {
        return;
      }

      try {
        const requests = await getPrTickets({ user_id: sessionUser.user_id });
        const filtered = requests.filter((request) =>
          approvableStatuses.has(request.status)
        );

        if (isMounted) {
          setApprovals(filtered);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof ApiError
              ? error.message
              : 'Unable to load approval rows from the API.'
          );
          setApprovals([]);
        }
      }
    }

    void loadApprovals();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredApprovals = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return approvals.filter((request) => {
      if (!normalizedSearch) {
        return true;
      }

      return (
        request.id.toLowerCase().includes(normalizedSearch) ||
        request.requester.toLowerCase().includes(normalizedSearch) ||
        request.status.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [approvals, searchTerm]);

  const tableRows = filteredApprovals.map((request) => ({
    key: request.id,
    values: {
      id: request.id,
      requester: request.requester,
      status: (
        <span className="inline-flex rounded-full bg-brand-red/10 px-2.5 py-1 text-xs font-bold text-brand-red">
          {request.status}
        </span>
      ),
      action: (
        <Link href={`/approval/${request.id}`}>
          <a className="text-sm font-bold text-brand-blue transition hover:text-brand-red">
            Review
          </a>
        </Link>
      ),
    },
  }));

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
            htmlFor="approval-search"
            className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500"
          >
            Search by id / requester / status
          </label>
          <input
            id="approval-search"
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Type id, requester, or status"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-blue"
          />
        </div>

        <DataTableWithTotal
          columns={[
            { key: 'id', label: 'PR ID' },
            { key: 'requester', label: 'Requester' },
            { key: 'status', label: 'Status' },
            { key: 'action', label: 'Action' },
          ]}
          rows={tableRows}
          emptyLabel="No approvals match the current search."
        />
      </Card>
    </div>
  );
}
