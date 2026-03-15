import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Card, { CardHeader } from '../components/atoms/Card';
import DashboardMetricCard from '../components/molecules/DashboardMetricCard';
import DashboardChart, {
  type InventoryOverviewPoint,
} from '../components/organisms/DashboardChart';
import {
  fetchInventoryCounts,
  fetchInventoryGraphData,
} from '../utils/api/inventoryApi';
import { USER_ROLES } from '../utils/constants';
import type { AuthUser } from '../utils/api/authApi';
import { getUserSession } from '../utils/localStorage';
import { listPrByUser, type PurchaseRequest } from '../utils/api/prApi';

function mapCountsToOverviewData(
  counts: Record<string, number>
): InventoryOverviewPoint[] {
  const entries = Object.entries(counts);
  if (!entries.length) {
    return [];
  }

  return entries.map(([itemName, quantity]) => ({
    label: 'Current',
    itemName,
    actualSkuInventory: Number(quantity) || 0,
    actualSales: 0,
    predictedSales: 0,
  }));
}

function mapCountToOverviewPoint(
  itemName: string,
  counts: Record<string, number>
): InventoryOverviewPoint[] {
  return [
    {
      label: 'Current',
      itemName,
      actualSkuInventory: Number(counts[itemName]) || 0,
      actualSales: 0,
      predictedSales: 0,
    },
  ];
}

const Home = () => {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);
  const [inventoryChartData, setInventoryChartData] = useState<
    InventoryOverviewPoint[]
  >([]);
  const [inventoryCounts, setInventoryCounts] = useState<
    Record<string, number>
  >({});
  const [inventoryItemOptions, setInventoryItemOptions] = useState<string[]>(
    []
  );
  const [selectedInventoryItem, setSelectedInventoryItem] = useState('');
  const [selectedInventoryYear, setSelectedInventoryYear] = useState(
    Math.max(currentYear, 2026)
  );
  const [personalRequests, setPersonalRequests] = useState<PurchaseRequest[]>(
    []
  );

  const yearOptions = useMemo(() => {
    const start = Math.max(currentYear, 2026);
    return Array.from(
      { length: start - 2026 + 1 },
      (_, index) => start - index
    );
  }, [currentYear]);

  useEffect(() => {
    const user = getUserSession();
    if (!user) {
      void router.replace('/login');
      return;
    }

    setSessionUser(user);
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    async function loadInventoryCounts() {
      try {
        const counts = await fetchInventoryCounts();
        if (!isMounted) {
          return;
        }

        setInventoryCounts(counts);
        const itemNames = Object.keys(counts).filter((name) => name.trim());
        setInventoryItemOptions(itemNames);
        setSelectedInventoryItem((current) => current || itemNames[0] || '');
      } catch {
        if (isMounted) {
          setInventoryCounts({});
          setInventoryItemOptions([]);
          setSelectedInventoryItem('');
        }
      }
    }

    void loadInventoryCounts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadGraphDataForSelection() {
      if (!selectedInventoryItem || !Object.keys(inventoryCounts).length) {
        if (isMounted) {
          setInventoryChartData(mapCountsToOverviewData(inventoryCounts));
        }
        return;
      }

      try {
        const graphData = await fetchInventoryGraphData(inventoryCounts, {
          itemNames: [selectedInventoryItem],
          year: selectedInventoryYear,
        });
        if (!isMounted) {
          return;
        }

        const apiChartData = graphData.length
          ? graphData
          : mapCountToOverviewPoint(selectedInventoryItem, inventoryCounts);
        setInventoryChartData(apiChartData);
      } catch {
        if (isMounted) {
          setInventoryChartData(
            mapCountToOverviewPoint(selectedInventoryItem, inventoryCounts)
          );
        }
      }
    }

    void loadGraphDataForSelection();

    return () => {
      isMounted = false;
    };
  }, [inventoryCounts, selectedInventoryItem, selectedInventoryYear]);

  useEffect(() => {
    let isMounted = true;

    async function loadRequestMetrics() {
      if (!sessionUser?.user_id) {
        return;
      }

      try {
        const requests = await listPrByUser(sessionUser.user_id);
        if (isMounted) {
          setPersonalRequests(requests);
        }
      } catch {
        if (isMounted) {
          setPersonalRequests([]);
        }
      }
    }

    void loadRequestMetrics();

    return () => {
      isMounted = false;
    };
  }, [sessionUser?.user_id]);

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
  const waitingApprovalCount = personalPendingCount;
  const totalInventoryUnits = Object.values(inventoryCounts).reduce(
    (sum, quantity) => sum + quantity,
    0
  );

  const isManager = sessionUser?.role === USER_ROLES.MANAGER;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl flex-col gap-4">
      <DashboardChart
        data={inventoryChartData}
        itemOptions={inventoryItemOptions}
        selectedItemName={selectedInventoryItem}
        onSelectedItemChange={setSelectedInventoryItem}
        yearOptions={yearOptions}
        selectedYear={selectedInventoryYear}
        onSelectedYearChange={setSelectedInventoryYear}
      />

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
            <DashboardMetricCard
              label="Inventory (Units)"
              value={totalInventoryUnits}
              description="From warehouse count_inventory endpoint."
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
