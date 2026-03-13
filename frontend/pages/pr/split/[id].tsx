import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Button, { buttonClassName } from '../../../components/atoms/Button';
import Card, { CardHeader } from '../../../components/atoms/Card';
import { ApiError } from '../../../utils/api/apiClient';
import { getUserSession } from '../../../utils/localStorage';
import {
  getPrDetails,
  normalizePurchaseRequest,
} from '../../../utils/api/prApi';
import {
  purchaseRequests,
  type PurchaseRequest,
} from '../../../utils/mockdata/purchaseRequestsData';

type SplitLine = {
  id: string;
  vendor: string;
  amount: number;
  eta: string;
};

type PrSplitPageProps = {
  purchaseRequest: PurchaseRequest;
};

function formatCurrency(value: number) {
  return `RM ${value.toLocaleString()}`;
}

export default function PrSplitPage({ purchaseRequest }: PrSplitPageProps) {
  const [currentRequest, setCurrentRequest] = useState(purchaseRequest);
  const [errorMessage, setErrorMessage] = useState('');
  const [splitLines, setSplitLines] = useState<SplitLine[]>([
    {
      id: 'PO-SPLIT-01',
      vendor: currentRequest.vendor,
      amount: Math.round(currentRequest.amount * 0.6),
      eta: '2026-04-15',
    },
    {
      id: 'PO-SPLIT-02',
      vendor: 'Alt Vendor Sdn Bhd',
      amount: Math.round(purchaseRequest.amount * 0.25),
      eta: '2026-04-22',
    },
  ]);

  const allocatedTotal = useMemo(
    () => splitLines.reduce((total, line) => total + line.amount, 0),
    [splitLines]
  );

  const poolAmount = Math.max(currentRequest.amount - allocatedTotal, 0);

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

  function updateLine(lineId: string, field: keyof SplitLine, value: string) {
    setSplitLines((currentLines) =>
      currentLines.map((line) => {
        if (line.id !== lineId) {
          return line;
        }

        if (field === 'amount') {
          return {
            ...line,
            amount: Number(value) || 0,
          };
        }

        return {
          ...line,
          [field]: value,
        };
      })
    );
  }

  function addSplitLine() {
    const nextIndex = splitLines.length + 1;

    setSplitLines((currentLines) => [
      ...currentLines,
      {
        id: `PO-SPLIT-${String(nextIndex).padStart(2, '0')}`,
        vendor: '',
        amount: 0,
        eta: '',
      },
    ]);
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <Card variant="surface" padding="lg">
        <CardHeader
          subtitle="Split PR into purchase orders"
          title={currentRequest.id}
          subtitleClassName="text-brand-red"
          titleClassName="text-brand-blue"
          action={
            <span className="inline-flex rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-bold text-brand-blue">
              Split Workspace
            </span>
          }
        />

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
          <Link href="/pr">
            <a className="transition hover:text-brand-blue">PR Board</a>
          </Link>
          <span className="mx-1.5 text-slate-400">/</span>
          <Link href={`/pr/${currentRequest.id}`}>
            <a className="transition hover:text-brand-blue">
              {currentRequest.id}
            </a>
          </Link>
          <span className="mx-1.5 text-slate-400">/</span>
          <span className="text-brand-blue">PO Split</span>
        </div>
        {errorMessage ? (
          <p className="mt-3 text-sm font-medium text-brand-red">
            {errorMessage}
          </p>
        ) : null}
      </Card>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card variant="surface" padding="lg" className="xl:col-span-5">
          <CardHeader
            subtitle="Left panel"
            title="Purchase Request"
            titleClassName="text-xl"
          />

          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Title
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                {currentRequest.title}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  Department
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {currentRequest.department}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  Requester
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {currentRequest.requester}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  Status
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {currentRequest.status}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  Total Requested
                </p>
                <p className="mt-1 text-sm font-semibold text-brand-blue">
                  {formatCurrency(currentRequest.amount)}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Description
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                {currentRequest.description}
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-4 xl:col-span-7">
          <Card variant="surface" padding="lg">
            <CardHeader
              subtitle="Right panel"
              title="PO Details"
              titleClassName="text-xl"
              action={
                <button
                  type="button"
                  onClick={addSplitLine}
                  className="rounded-lg border border-brand-blue px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-brand-blue transition hover:bg-brand-blue hover:text-white"
                >
                  Add PO Line
                </button>
              }
            />

            <div className="space-y-3">
              {splitLines.map((line) => (
                <div
                  key={line.id}
                  className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1.1fr_1fr_0.9fr_auto]"
                >
                  <input
                    type="text"
                    value={line.vendor}
                    onChange={(event) =>
                      updateLine(line.id, 'vendor', event.target.value)
                    }
                    placeholder="Vendor name"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue"
                  />
                  <input
                    type="number"
                    min={0}
                    value={line.amount}
                    onChange={(event) =>
                      updateLine(line.id, 'amount', event.target.value)
                    }
                    placeholder="Amount"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue"
                  />
                  <input
                    type="date"
                    value={line.eta}
                    onChange={(event) =>
                      updateLine(line.id, 'eta', event.target.value)
                    }
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue"
                  />
                  <div className="flex items-center justify-center rounded-lg bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    {line.id}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button type="button">Save Split Draft</Button>
              <Link href={`/pr/${currentRequest.id}`}>
                <a className={buttonClassName({ variant: 'outline' })}>
                  Back to PR details
                </a>
              </Link>
            </div>
          </Card>

          <Card variant="surface" padding="lg">
            <CardHeader
              subtitle="Bottom-right panel"
              title="Pool"
              titleClassName="text-xl"
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  Requested Total
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {formatCurrency(currentRequest.amount)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  Allocated
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {formatCurrency(allocatedTotal)}
                </p>
              </div>
              <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-blue/70">
                  Remaining Pool
                </p>
                <p className="mt-1 text-sm font-semibold text-brand-blue">
                  {formatCurrency(poolAmount)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
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
