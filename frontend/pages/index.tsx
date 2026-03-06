import Link from 'next/link';
import Card from '../components/atoms/Card';
import DashboardMetricCard from '../components/molecules/DashboardMetricCard';
import InventoryOverviewChart, {
  type InventoryOverviewPoint,
} from '../components/organisms/InventoryOverviewChart';
import RecentPurchaseRequestsPanel from '../components/organisms/RecentPurchaseRequestsPanel';
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
        <Card
          as="aside"
          variant="surface"
          padding="md"
          className="grid gap-3 md:p-5"
        >

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
        </Card>

        <Card as="aside" variant="surface" padding="lg">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-red">
            Executive Notes
          </p>
          <h3 className="mt-2 font-heading text-2xl font-semibold text-brand-blue">
            What to watch today
          </h3>
          <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
            <Card as="li" variant="soft" padding="md">
              Predicted sales have moved above live inventory in the latest
              weekly snapshot.
            </Card>
            <Card as="li" variant="soft" padding="md">
              Procurement demand is concentrated in engineering and logistics,
              making approval turnaround the main operational bottleneck.
            </Card>
            <Card as="li" variant="soft" padding="md">
              Use this dashboard as the default landing surface for buyers,
              approvers, and operations leads entering the system.
            </Card>
          </ul>
        </Card>
      </section>
    </div>
  );
};

export default Home;
