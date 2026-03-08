import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type InventoryOverviewPoint = {
  label: string;
  itemName: string;
  actualSkuInventory: number;
  actualSales: number;
  predictedSales: number;
};

type InventoryOverviewChartProps = {
  data: InventoryOverviewPoint[];
};

type SeriesKey = keyof Omit<InventoryOverviewPoint, 'label' | 'itemName'>;

type SeriesConfig = {
  key: SeriesKey;
  label: string;
  color: string;
  backgroundClassName: string;
};

type AggregatedPoint = {
  label: string;
  actualSkuInventory: number;
  actualSales: number;
  predictedSales: number;
};

const chartSeries: SeriesConfig[] = [
  {
    key: 'actualSkuInventory',
    label: 'Actual SKU Inventory',
    color: '#60A5FA',
    backgroundClassName: 'bg-sky-400',
  },
  {
    key: 'actualSales',
    label: 'Actual Sales',
    color: '#34D399',
    backgroundClassName: 'bg-emerald-400',
  },
  {
    key: 'predictedSales',
    label: 'Predicted Sales',
    color: '#F59E0B',
    backgroundClassName: 'bg-amber-400',
  },
];

const allItemsOption = 'Items Filter -All items';

function aggregateByLabel(data: InventoryOverviewPoint[]): AggregatedPoint[] {
  const grouped = new Map<string, AggregatedPoint>();

  data.forEach((point) => {
    const current = grouped.get(point.label);

    if (current) {
      current.actualSkuInventory += point.actualSkuInventory;
      current.actualSales += point.actualSales;
      current.predictedSales += point.predictedSales;
      return;
    }

    grouped.set(point.label, {
      label: point.label,
      actualSkuInventory: point.actualSkuInventory,
      actualSales: point.actualSales,
      predictedSales: point.predictedSales,
    });
  });

  return Array.from(grouped.values());
}

export default function InventoryOverviewChart({
  data,
}: InventoryOverviewChartProps) {
  const [selectedItemName, setSelectedItemName] =
    useState<string>(allItemsOption);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleSeries, setVisibleSeries] = useState<
    Record<SeriesKey, boolean>
  >({
    actualSkuInventory: true,
    actualSales: true,
    predictedSales: true,
  });

  const itemOptions = useMemo(() => {
    const names = Array.from(
      new Set(data.map((point) => point.itemName))
    ).sort();
    return [allItemsOption, ...names];
  }, [data]);

  useEffect(() => {
    if (!itemOptions.includes(selectedItemName)) {
      setSelectedItemName(allItemsOption);
    }
  }, [itemOptions, selectedItemName]);

  const filteredData = useMemo(() => {
    if (selectedItemName === allItemsOption) {
      return aggregateByLabel(data);
    }

    return data
      .filter((point) => point.itemName === selectedItemName)
      .map((point) => ({
        label: point.label,
        actualSkuInventory: point.actualSkuInventory,
        actualSales: point.actualSales,
        predictedSales: point.predictedSales,
      }));
  }, [data, selectedItemName]);

  useEffect(() => {
    setActiveIndex(Math.max(filteredData.length - 1, 0));
  }, [filteredData]);

  const activePoint = filteredData[activeIndex];

  if (!filteredData.length) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-4 text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.08)] md:p-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-red">
              Procurement Planning Intelligence System
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold text-brand-blue">
              Demand & SKU overview
            </h2>
          </div>
        </div>
        <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          No chart data is available for the selected item.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-4 text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.08)] md:p-5">
      <div className="border-b border-slate-200 pb-3">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-red">
          Procurement Planning Intelligence System
        </p>
        <h2 className="mt-2 font-heading text-2xl font-semibold text-brand-blue">
          Demand & SKU overview
        </h2>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-500">
            <span>Weekly range</span>
            <span>{activePoint.label}</span>
          </div>

          <div className="px-2 pb-2 pt-3">
            <div
              className="h-[300px] w-full"
              role="img"
              aria-label="Interactive inventory, actual sales, and predicted sales chart"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={filteredData}
                  margin={{ top: 12, right: 12, bottom: 4, left: 0 }}
                  onMouseMove={(state) => {
                    if (
                      state &&
                      typeof state.activeTooltipIndex === 'number' &&
                      state.activeTooltipIndex >= 0
                    ) {
                      setActiveIndex(state.activeTooltipIndex);
                    }
                  }}
                >
                  <CartesianGrid
                    stroke="rgba(148, 163, 184, 0.18)"
                    strokeDasharray="4 8"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: 'rgba(71, 85, 105, 0.9)', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(71, 85, 105, 0.85)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                  />
                  <Tooltip
                    cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid rgba(148,163,184,0.24)',
                      background: 'rgba(255, 255, 255, 0.97)',
                    }}
                    labelStyle={{ color: 'rgba(30, 41, 59, 0.95)' }}
                    formatter={(value: number, name: string) => [
                      value.toLocaleString(),
                      name,
                    ]}
                  />
                  {chartSeries
                    .filter((series) => visibleSeries[series.key])
                    .map((series) => (
                      <Line
                        key={series.key}
                        type="monotone"
                        dataKey={series.key}
                        name={series.label}
                        stroke={series.color}
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          stroke: 'rgba(15, 23, 42, 0.95)',
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 6,
                          stroke: 'rgba(15, 23, 42, 0.95)',
                          strokeWidth: 2,
                        }}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <aside className="space-y-4 rounded-[24px] border border-slate-200 bg-white p-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Item filter
            </p>
            <select
              id="inventory-item-filter"
              value={selectedItemName}
              onChange={(event) => setSelectedItemName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300"
            >
              {itemOptions.map((itemName) => (
                <option
                  key={itemName}
                  value={itemName}
                  className="text-slate-900"
                >
                  {itemName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Toggle series
            </p>
            <div className="mt-2 space-y-2">
              {chartSeries.map((series) => {
                const isVisible = visibleSeries[series.key];

                return (
                  <button
                    key={series.key}
                    type="button"
                    onClick={() =>
                      setVisibleSeries((current) => ({
                        ...current,
                        [series.key]: !current[series.key],
                      }))
                    }
                    className={`w-full rounded-2xl border px-3 py-2 text-left transition ${
                      isVisible
                        ? 'border-slate-200 bg-slate-50'
                        : 'border-slate-200 bg-white opacity-60'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm text-slate-600">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${series.backgroundClassName}`}
                      />
                      {series.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Overview {activePoint.label}
            </p>
            <div className="mt-3 space-y-2.5">
              {chartSeries.map((series) => (
                <div
                  key={series.key}
                  className={`flex items-center justify-between gap-3 ${
                    visibleSeries[series.key] ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${series.backgroundClassName}`}
                    />
                    <span className="text-sm text-slate-600">
                      {series.label}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {activePoint[series.key].toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
