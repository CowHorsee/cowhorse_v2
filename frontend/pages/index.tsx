import Link from 'next/link';
import Card, { CardHeader } from '../components/atoms/Card';
import DashboardMetricCard from '../components/molecules/DashboardMetricCard';
import DashboardChart, {
  type InventoryOverviewPoint,
} from '../components/organisms/DashboardChart';
import RecentPurchaseRequestsPanel from '../components/organisms/RecentPurchaseRequestsPanel';
import { purchaseRequests } from '../utils/mockdata/purchaseRequestsData';

const inventoryOverviewData: InventoryOverviewPoint[] = [
  {
    label: 'Week 1',
    itemName: 'Industrial Sensors',
    actualSkuInventory: 920,
    actualSales: 510,
    predictedSales: 540,
  },
  {
    label: 'Week 2',
    itemName: 'Industrial Sensors',
    actualSkuInventory: 880,
    actualSales: 560,
    predictedSales: 575,
  },
  {
    label: 'Week 3',
    itemName: 'Industrial Sensors',
    actualSkuInventory: 845,
    actualSales: 590,
    predictedSales: 610,
  },
  {
    label: 'Week 4',
    itemName: 'Industrial Sensors',
    actualSkuInventory: 810,
    actualSales: 645,
    predictedSales: 660,
  },
  {
    label: 'Week 5',
    itemName: 'Industrial Sensors',
    actualSkuInventory: 770,
    actualSales: 680,
    predictedSales: 705,
  },
  {
    label: 'Week 6',
    itemName: 'Industrial Sensors',
    actualSkuInventory: 740,
    actualSales: 710,
    predictedSales: 760,
  },
  {
    label: 'Week 1',
    itemName: 'Copper Wiring',
    actualSkuInventory: 640,
    actualSales: 420,
    predictedSales: 450,
  },
  {
    label: 'Week 2',
    itemName: 'Copper Wiring',
    actualSkuInventory: 605,
    actualSales: 440,
    predictedSales: 470,
  },
  {
    label: 'Week 3',
    itemName: 'Copper Wiring',
    actualSkuInventory: 590,
    actualSales: 455,
    predictedSales: 485,
  },
  {
    label: 'Week 4',
    itemName: 'Copper Wiring',
    actualSkuInventory: 562,
    actualSales: 478,
    predictedSales: 505,
  },
  {
    label: 'Week 5',
    itemName: 'Copper Wiring',
    actualSkuInventory: 540,
    actualSales: 502,
    predictedSales: 530,
  },
  {
    label: 'Week 6',
    itemName: 'Copper Wiring',
    actualSkuInventory: 515,
    actualSales: 525,
    predictedSales: 555,
  },
  {
    label: 'Week 1',
    itemName: 'Safety Helmets',
    actualSkuInventory: 480,
    actualSales: 280,
    predictedSales: 295,
  },
  {
    label: 'Week 2',
    itemName: 'Safety Helmets',
    actualSkuInventory: 460,
    actualSales: 305,
    predictedSales: 320,
  },
  {
    label: 'Week 3',
    itemName: 'Safety Helmets',
    actualSkuInventory: 440,
    actualSales: 330,
    predictedSales: 340,
  },
  {
    label: 'Week 4',
    itemName: 'Safety Helmets',
    actualSkuInventory: 422,
    actualSales: 342,
    predictedSales: 360,
  },
  {
    label: 'Week 5',
    itemName: 'Safety Helmets',
    actualSkuInventory: 400,
    actualSales: 360,
    predictedSales: 382,
  },
  {
    label: 'Week 6',
    itemName: 'Safety Helmets',
    actualSkuInventory: 385,
    actualSales: 378,
    predictedSales: 400,
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
      <DashboardChart data={inventoryOverviewData} />

      <section className="grid flex-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_760px]">
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
              label="Pending / Review"
              value={pendingCount + inReviewCount}
            />
          </div>
        </Card>

        <Card as="aside" variant="surface" padding="lg">
          <CardHeader subtitle="Executive Notes" title="What to watch today" />
          <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
            <Card as="li" variant="soft" padding="md">
              Strait of Hormuz Disruptions: Geopolitical escalations have led to
              the effective closure of the Strait of Hormuz, a corridor
              responsible for 20% of global oil and LNG transit.
            </Card>
            <Card as="li" variant="soft" padding="md">
              Procurement demand is concentrated in engineering and logistics,
              making approval turnaround the main operational bottleneck.
            </Card>
            <Card as="li" variant="soft" padding="md">
              AI in Construction Procurement: Developers are increasingly using
              AI for &quot;material requirement planning&quot; to reduce excess
              procurement and accurately model labor productivity.
            </Card>
          </ul>
        </Card>
      </section>
    </div>
  );
};

export default Home;
