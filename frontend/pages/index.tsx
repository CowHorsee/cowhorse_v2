import Link from 'next/link';
import { purchaseRequests } from '../utils/purchaseRequestsData';

const Home = () => {
  const pendingCount = purchaseRequests.filter(
    (item) => item.status === 'Pending Approval'
  ).length;
  const inReviewCount = purchaseRequests.filter(
    (item) => item.status === 'In Review'
  ).length;

  return (
    <div className="mx-auto w-full max-w-6xl rounded-2xl bg-brand-white p-6 shadow-surface md:p-8">
      <section className="mb-6">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-brand-red">
          Welcome back
        </p>
        <h1 className="font-heading text-3xl font-semibold text-brand-blue md:text-4xl">
          Procurement Dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
          Track purchase request approvals, ownership, and budget impact from
          one operational dashboard.
        </p>
      </section>

      <section className="mb-5 grid gap-3 md:grid-cols-3">
        <article className="rounded-xl bg-brand-blue p-4 text-brand-white">
          <p className="text-sm text-brand-white/80">Total Requests</p>
          <h2 className="mt-2 font-heading text-3xl font-semibold">
            {purchaseRequests.length}
          </h2>
        </article>
        <article className="rounded-xl bg-brand-blue p-4 text-brand-white">
          <p className="text-sm text-brand-white/80">Pending Approval</p>
          <h2 className="mt-2 font-heading text-3xl font-semibold">
            {pendingCount}
          </h2>
        </article>
        <article className="rounded-xl bg-brand-blue p-4 text-brand-white">
          <p className="text-sm text-brand-white/80">In Review</p>
          <h2 className="mt-2 font-heading text-3xl font-semibold">
            {inReviewCount}
          </h2>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="font-heading text-lg font-semibold text-brand-blue">
            Recent Purchase Requests
          </h3>
          <Link href="/pr">
            <a className="text-sm font-bold text-brand-blue hover:text-brand-red">
              View all
            </a>
          </Link>
        </div>
        <ul className="space-y-3">
          {purchaseRequests.slice(0, 3).map((item) => (
            <li
              key={item.id}
              className="flex flex-col justify-between gap-3 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center"
            >
              <div>
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {item.department} - {item.requester}
                </p>
              </div>
              <Link href={`/pr/${item.id}`}>
                <a className="inline-flex items-center rounded-lg border border-brand-blue px-4 py-2 text-sm font-bold text-brand-blue transition hover:bg-brand-blue hover:text-brand-white">
                  Details
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Home;
