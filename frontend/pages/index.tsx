import Link from 'next/link';
import InventoryOverviewChart, {
  type InventoryOverviewPoint,
} from '../components/InventoryOverviewChart';
import { purchaseRequests } from '../utils/purchaseRequestsData';

const inventoryOverviewData: InventoryOverviewPoint[] = [
  {
    label: 'Week 1',
    actualSkuInventory: 920,
    actualSales: 510,
    predictedSales: 540,
  },
  {
    label: 'Week 2',
    actualSkuInventory: 880,
    actualSales: 560,
    predictedSales: 575,
  },
  {
    label: 'Week 3',
    actualSkuInventory: 845,
    actualSales: 590,
    predictedSales: 610,
  },
  {
    label: 'Week 4',
    actualSkuInventory: 810,
    actualSales: 645,
    predictedSales: 660,
  },
  {
    label: 'Week 5',
    actualSkuInventory: 770,
    actualSales: 680,
    predictedSales: 705,
  },
  {
    label: 'Week 6',
    actualSkuInventory: 740,
    actualSales: 710,
    predictedSales: 760,
  },
];

const Home = () => {
  const pendingCount = purchaseRequests.filter(
    (item) => item.status === 'Pending Approval'
  ).length;
  const inReviewCount = purchaseRequests.filter(
    (item) => item.status === 'In Review'
  ).length;
  const approvedCount = purchaseRequests.filter(
    (item) => item.status === 'Approved'
  ).length;
  const totalSpend = purchaseRequests.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const latestSnapshot =
    inventoryOverviewData[inventoryOverviewData.length - 1];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
        <div className="overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.35),_transparent_34%),linear-gradient(135deg,_#11183A_0%,_#172554_48%,_#0F172A_100%)] p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,0.34)] md:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-sky-200/80">
            Operations Overview
          </p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-3xl font-heading text-3xl font-semibold leading-tight md:text-5xl">
                Procurement visibility with inventory and sales in one decision
                surface.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 md:text-base">
                This dashboard gives anyone entering the system a quick view of
                request volume, spend exposure, and inventory demand trends. The
                graph template is ready to receive backend forecast data.
              </p>
            </div>
            <div className="min-w-[220px] rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-100/70">
                Current Forecast Pulse
              </p>
              <p className="mt-3 font-heading text-4xl font-semibold">
                {latestSnapshot.predictedSales.toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-slate-200">
                Predicted sales against{' '}
                {latestSnapshot.actualSkuInventory.toLocaleString()} live units
                in inventory.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-red">
              Purchase Request Volume
            </p>
            <h2 className="mt-3 font-heading text-4xl font-semibold text-brand-blue">
              {purchaseRequests.length}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Active requests across facilities, engineering, logistics, and IT.
            </p>
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-red">
              Budget Exposure
            </p>
            <h2 className="mt-3 font-heading text-4xl font-semibold text-brand-blue">
              RM {totalSpend.toLocaleString()}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Combined value from current purchase requests awaiting action or
              already approved.
            </p>
          </article>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">
            Total Requests
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold text-brand-blue">
            {purchaseRequests.length}
          </h2>
        </article>
        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">
            Pending Approval
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold text-brand-blue">
            {pendingCount}
          </h2>
        </article>
        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">
            In Review
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold text-brand-blue">
            {inReviewCount}
          </h2>
        </article>
        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">
            Approved
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold text-brand-blue">
            {approvedCount}
          </h2>
        </article>
      </section>

      <InventoryOverviewChart data={inventoryOverviewData} />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_340px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] md:p-6">
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
            {purchaseRequests.slice(0, 3).map((item) => (
              <li
                key={item.id}
                className="flex flex-col justify-between gap-3 rounded-[22px] border border-slate-200 p-4 md:flex-row md:items-center"
              >
                <div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.department} - {item.requester}
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

        <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] md:p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-red">
            Executive Notes
          </p>
          <h3 className="mt-2 font-heading text-2xl font-semibold text-brand-blue">
            What to watch today
          </h3>
          <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
            <li className="rounded-[20px] bg-slate-50 p-4">
              Predicted sales have moved above live inventory in the latest
              weekly snapshot. Backend data can drive replenishment alerts from
              this same chart contract.
            </li>
            <li className="rounded-[20px] bg-slate-50 p-4">
              Procurement demand is concentrated in engineering and logistics,
              which makes approval turnaround the main operational bottleneck.
            </li>
            <li className="rounded-[20px] bg-slate-50 p-4">
              Use this dashboard as the default landing surface for buyers,
              approvers, and operations leads entering the system.
            </li>
          </ul>
        </aside>
      </section>
    </div>
  );
};

export default Home;
