import Link from 'next/link';
import Card from '../../components/atoms/Card';
import { purchaseRequests } from '../../utils/mockdata/purchaseRequestsData';

export default function PrPage() {
  return (
    <div className="mx-auto w-full max-w-6xl rounded-2xl bg-brand-white p-6 shadow-surface md:p-8">
      <section className="mb-6">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-brand-red">
          Purchase requests
        </p>
        <h1 className="font-heading text-3xl font-semibold text-brand-blue md:text-4xl">
          PR Board
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
          Monitor purchase request status, owner, department, and latest
          updates.
        </p>
      </section>

      <Card as="section" variant="base" padding="lg">
        <ul className="space-y-3">
          {purchaseRequests.map((item) => (
            <Card
              as="li"
              key={item.id}
              variant="base"
              padding="md"
              className="grid gap-2 rounded-lg md:grid-cols-[minmax(280px,1fr)_130px_130px_140px_80px] md:items-center"
            >
              <div>
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.id}</p>
              </div>
              <p className="text-sm">
                <span className="inline-block rounded-full bg-brand-red/10 px-3 py-1 text-xs font-bold text-brand-red">
                  {item.status}
                </span>
              </p>
              <Link href={`/pr/${item.id}`}>
                <a className="text-sm font-bold text-brand-blue hover:text-brand-red">
                  Details
                </a>
              </Link>
            </Card>
          ))}
        </ul>
      </Card>
    </div>
  );
}
