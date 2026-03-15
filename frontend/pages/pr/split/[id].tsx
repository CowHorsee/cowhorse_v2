import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Breadcrumb from '../../../components/atoms/Breadcrumb';
import Button, { buttonClassName } from '../../../components/atoms/Button';
import Card, { CardHeader } from '../../../components/atoms/Card';
import { useToast } from '../../../components/ToastProvider';
import { ApiError } from '../../../utils/api/apiClient';
import { getUserSession } from '../../../utils/localStorage';
import { getPrDetails, type PurchaseRequest } from '../../../utils/api/prApi';

type SplitLine = {
  id: string;
  vendor: string;
  amount: number;
  eta: string;
};

function formatCurrency(value: number) {
  return `RM ${value.toLocaleString()}`;
}

export default function PrSplitPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const prId = useMemo(() => {
    const rawId = router.query.id;
    return typeof rawId === 'string' ? rawId : '';
  }, [router.query.id]);

  const [currentRequest, setCurrentRequest] = useState<PurchaseRequest | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [splitLines, setSplitLines] = useState<SplitLine[]>([]);

  const allocatedTotal = useMemo(
    () => splitLines.reduce((total, line) => total + line.amount, 0),
    [splitLines]
  );

  const poolAmount = Math.max(
    (currentRequest?.amount || 0) - allocatedTotal,
    0
  );

  useEffect(() => {
    let isMounted = true;

    async function loadDetails() {
      if (!prId) {
        setIsLoading(false);
        return;
      }

      const user = getUserSession();
      if (!user?.user_id) {
        showToast({
          title: 'Unable to load PR split',
          description:
            'User session required before loading this purchase request.',
          variant: 'error',
        });
        setCurrentRequest(null);
        setSplitLines([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const details = await getPrDetails(user.user_id, prId);
        if (!isMounted || !details) {
          return;
        }

        setCurrentRequest(details);
        setSplitLines([
          {
            id: 'PO-SPLIT-01',
            vendor: details.vendor,
            amount: Math.round(details.amount * 0.6),
            eta: '2026-04-15',
          },
          {
            id: 'PO-SPLIT-02',
            vendor: 'Alt Vendor Sdn Bhd',
            amount: Math.round(details.amount * 0.25),
            eta: '2026-04-22',
          },
        ]);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setCurrentRequest(null);
        setSplitLines([]);
        showToast({
          title: 'Unable to load PR split',
          description:
            error instanceof ApiError
              ? error.message
              : 'Unable to load latest PR details from API.',
          variant: 'error',
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDetails();

    return () => {
      isMounted = false;
    };
  }, [prId, showToast]);

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

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <Card variant="surface" padding="lg">
          <p className="text-sm text-slate-500">Loading purchase request...</p>
        </Card>
      </div>
    );
  }

  if (!currentRequest) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <Card variant="surface" padding="lg">
          <p className="text-sm font-medium text-brand-red">
            Purchase request not found.
          </p>
          <Link href="/pr">
            <a className="mt-4 inline-flex text-sm font-bold text-brand-blue hover:text-brand-red">
              Back to PR Board
            </a>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <Card variant="surface" padding="lg">
        <Breadcrumb
          items={[
            { label: 'PR Board', href: '/pr' },
            { label: currentRequest.id, href: `/pr/${currentRequest.id}` },
            { label: 'PO Split' },
          ]}
        />

        <CardHeader
          subtitle=""
          title={currentRequest.id}
          subtitleClassName="text-brand-red"
          titleClassName="text-brand-blue"
        />
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
