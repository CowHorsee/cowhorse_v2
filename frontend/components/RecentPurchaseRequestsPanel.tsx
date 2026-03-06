import Link from 'next/link';
import type { PurchaseRequest } from '../utils/purchaseRequestsData';

type RecentPurchaseRequestsPanelProps = {
  requests: PurchaseRequest[];
};

export default function RecentPurchaseRequestsPanel({
  requests,
}: RecentPurchaseRequestsPanelProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-red">
            Work Queue
          </p>
          <h3 className="mt-2 font-heading text-2xl font-semibold text-brand-blue">
            Recent Purchase Requests
          </h3>
        </div>
        <Link href="/pr">
          <a className="text-sm font-bold text-brand-blue hover:text-brand-red">
            View all
          </a>
        </Link>
      </div>
      <ul className="space-y-3">
        {requests.map((item) => (
          <li
            key={item.id}
            className="flex flex-col justify-between gap-3 rounded-[20px] border border-slate-200 p-4 md:flex-row md:items-center"
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
          </li>
        ))}
      </ul>
    </div>
  );
}
