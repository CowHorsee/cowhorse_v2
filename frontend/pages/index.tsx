import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Card, { CardHeader } from '../components/atoms/Card';
import DashboardMetricCard from '../components/molecules/DashboardMetricCard';
import DashboardChart, {
  type InventoryOverviewPoint,
} from '../components/organisms/DashboardChart';
import RecentPurchaseRequestsPanel from '../components/organisms/RecentPurchaseRequestsPanel';
import { USER_ROLES } from '../utils/constants';
import type { AuthUser } from '../utils/api/authApi';
import { getUserSession } from '../utils/localStorage';
import { purchaseRequests } from '../utils/mockdata/purchaseRequestsData';

const inventoryOverviewData: InventoryOverviewPoint[] = [
  {
    label: 'Jan',
    itemName: 'Industrial Sensors',
    actualSkuInventory: 920,
    actualSales: 510,
    predictedSales: 540,
  },
  {
    label: 'Feb',
    itemName: 'Industrial Sensors',
    actualSkuInventory: 880,
    actualSales: 560,
    predictedSales: 575,
  },
  {
    label: 'Mar',
    itemName: 'Industrial Sensors',
    actualSkuInventory: 845,
    actualSales: 590,
    predictedSales: 610,
  },
  {
    label: 'Apr',
    itemName: 'Industrial Sensors',
    actualSkuInventory: 810,
    actualSales: 645,
    predictedSales: 660,
  },
  {
    label: 'May',
    itemName: 'Industrial Sensors',
    actualSkuInventory: 770,
    actualSales: 680,
    predictedSales: 705,
  },
  {
    label: 'Jun',
    itemName: 'Industrial Sensors',
    actualSkuInventory: 740,
    actualSales: 710,
    predictedSales: 760,
  },
  {
    label: 'Jan',
    itemName: 'Copper Wiring',
    actualSkuInventory: 640,
    actualSales: 420,
    predictedSales: 450,
  },
  {
    label: 'Feb',
    itemName: 'Copper Wiring',
    actualSkuInventory: 605,
    actualSales: 440,
    predictedSales: 470,
  },
  {
    label: 'Mar',
    itemName: 'Copper Wiring',
    actualSkuInventory: 590,
    actualSales: 455,
    predictedSales: 485,
  },
  {
    label: 'Apr',
    itemName: 'Copper Wiring',
    actualSkuInventory: 562,
    actualSales: 478,
    predictedSales: 505,
  },
  {
    label: 'May',
    itemName: 'Copper Wiring',
    actualSkuInventory: 540,
    actualSales: 502,
    predictedSales: 530,
  },
  {
    label: 'Jun',
    itemName: 'Copper Wiring',
    actualSkuInventory: 515,
    actualSales: 525,
    predictedSales: 555,
  },
  {
    label: 'Jan',
    itemName: 'Safety Helmets',
    actualSkuInventory: 480,
    actualSales: 280,
    predictedSales: 295,
  },
  {
    label: 'Feb',
    itemName: 'Safety Helmets',
    actualSkuInventory: 460,
    actualSales: 305,
    predictedSales: 320,
  },
  {
    label: 'Mar',
    itemName: 'Safety Helmets',
    actualSkuInventory: 440,
    actualSales: 330,
    predictedSales: 340,
  },
  {
    label: 'Apr',
    itemName: 'Safety Helmets',
    actualSkuInventory: 422,
    actualSales: 342,
    predictedSales: 360,
  },
  {
    label: 'May',
    itemName: 'Safety Helmets',
    actualSkuInventory: 400,
    actualSales: 360,
    predictedSales: 382,
  },
  {
    label: 'Jun',
    itemName: 'Safety Helmets',
    actualSkuInventory: 385,
    actualSales: 378,
    predictedSales: 400,
  },
];

const Home = () => {
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setSessionUser(getUserSession());
  }, []);

  const personalRequests = useMemo(() => {
    if (!sessionUser?.name) {
      return purchaseRequests;
    }

    const normalizedName = sessionUser.name.trim().toLowerCase();
    return purchaseRequests.filter(
      (item) => item.requester.trim().toLowerCase() === normalizedName
    );
  }, [sessionUser]);

  const totalRequests = personalRequests.length;
  const personalPendingCount = personalRequests.filter(
    (item) => item.status === 'Pending Approval'
  ).length;
  const inReviewCount = personalRequests.filter(
    (item) => item.status === 'In Review'
  ).length;
  const approvedCount = personalRequests.filter(
    (item) => item.status === 'Approved'
  ).length;
  const waitingApprovalCount = purchaseRequests.filter(
    (item) => item.status === 'Pending Approval'
  ).length;

  const isManager = sessionUser?.role === USER_ROLES.MANAGER;

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
            <DashboardMetricCard label="Total Requests" value={totalRequests} />
            <DashboardMetricCard
              label="Pending Approval"
              value={personalPendingCount}
              description="Your requests waiting for approval."
            />
            <DashboardMetricCard
              label="Pending / Review"
              value={personalPendingCount + inReviewCount}
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
