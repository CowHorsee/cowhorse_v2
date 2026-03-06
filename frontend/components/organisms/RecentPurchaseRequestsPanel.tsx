import Link from 'next/link';
import Card, { CardHeader } from '../atoms/Card';
import type { PurchaseRequest } from '../../utils/purchaseRequestsData';

type RecentPurchaseRequestsPanelProps = {
  requests: PurchaseRequest[];
};

export default function RecentPurchaseRequestsPanel({
  requests,
}: RecentPurchaseRequestsPanelProps) {
  return (
    <Card variant="surface" padding="md" className="md:p-5">
      <CardHeader
        subtitle="Work Queue"
        title="Recent Purchase Requests"
        action={
          <Link href="/pr">
            <a className="text-sm font-bold text-brand-blue hover:text-brand-red">
              View all
            </a>
          </Link>
        }
      />
      <ul className="space-y-3">
        {requests.map((item) => (
          <Card
            as="li"
            key={item.id}
            variant="base"
            padding="md"
            className="flex flex-col justify-between gap-3 md:flex-row md:items-center"
          >
            <div>
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-600">
                {item.department} - {item.requester}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                {item.status} · RM {item.amount.toLocaleString()}
              </p>
            </div>
            <Link href={`/pr/${item.id}`}>
              <a className="inline-flex items-center rounded-full border border-brand-blue px-4 py-2 text-sm font-bold text-brand-blue transition hover:bg-brand-blue hover:text-brand-white">
                Details
              </a>
            </Link>
          </Card>
        ))}
      </ul>
    </Card>
  );
}
