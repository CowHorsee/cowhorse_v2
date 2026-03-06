import Link from 'next/link';
import DashboardMetricCard from '../components/DashboardMetricCard';
import InventoryOverviewChart, {
  type InventoryOverviewPoint,
} from '../components/InventoryOverviewChart';
import RecentPurchaseRequestsPanel from '../components/RecentPurchaseRequestsPanel';
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
    <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl flex-col gap-4">
      <InventoryOverviewChart data={inventoryOverviewData} />

      <section className="grid flex-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <aside className="grid gap-3 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div className="rounded-[22px] bg-[linear-gradient(135deg,_#11183A_0%,_#172554_100%)] p-4 text-white">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-100/70">
              Forecast Pulse
            </p>
            <p className="mt-3 font-heading text-4xl font-semibold">
              {latestSnapshot.predictedSales.toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-slate-200">
              Predicted sales versus{' '}
              {latestSnapshot.actualSkuInventory.toLocaleString()} live units in
              inventory.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
            <DashboardMetricCard
              label="Total Requests"
              value={purchaseRequests.length}
            />
            <DashboardMetricCard
              label="Budget Exposure"
              value={`RM ${totalSpend.toLocaleString()}`}
            />
            <DashboardMetricCard
              label="Pending / Review"
              value={pendingCount + inReviewCount}
              description={`${pendingCount} pending and ${inReviewCount} in review.`}
            />
            <DashboardMetricCard label="Approved" value={approvedCount} />
          </div>
        </aside>

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
              weekly snapshot.
            </li>
            <li className="rounded-[20px] bg-slate-50 p-4">
              Procurement demand is concentrated in engineering and logistics,
              making approval turnaround the main operational bottleneck.
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
