import { useMemo, useState } from 'react';
import Card from '../atoms/Card';

export type InventoryOverviewPoint = {
  label: string;
  actualSkuInventory: number;
  actualSales: number;
  predictedSales: number;
};

type InventoryOverviewChartProps = {
  data: InventoryOverviewPoint[];
};

type SeriesKey = keyof Omit<InventoryOverviewPoint, 'label'>;

type SeriesConfig = {
  key: SeriesKey;
  label: string;
  color: string;
  backgroundClassName: string;
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

const chartWidth = 760;
const chartHeight = 250;
const padding = { top: 24, right: 20, bottom: 28, left: 20 };

function buildPath(values: number[], maxValue: number, pointCount: number) {
  if (!values.length || maxValue === 0) {
    return '';
  }

  return values
    .map((value, index) => {
      const x =
        padding.left +
        (index / Math.max(pointCount - 1, 1)) *
          (chartWidth - padding.left - padding.right);
      const y =
        chartHeight -
        padding.bottom -
        (value / maxValue) * (chartHeight - padding.top - padding.bottom);

      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

export default function InventoryOverviewChart({
  data,
}: InventoryOverviewChartProps) {
  const [activeIndex, setActiveIndex] = useState(data.length - 1);
  const [visibleSeries, setVisibleSeries] = useState<
    Record<SeriesKey, boolean>
  >({
    actualSkuInventory: true,
    actualSales: true,
    predictedSales: true,
  });

  const maxValue = useMemo(() => {
    return Math.max(
      ...data.flatMap((point) =>
        chartSeries
          .filter((series) => visibleSeries[series.key])
          .map((series) => point[series.key])
      ),
      0
    );
  }, [data, visibleSeries]);

  const activePoint = data[activeIndex];

  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-4 text-white shadow-[0_24px_70px_rgba(15,23,42,0.4)] backdrop-blur md:p-5">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-200/80">
            Procurement Planning Intelligence System
          </p>
          <h2 className="mt-2 font-heading text-2xl font-semibold">
            Demand & SKU overview
          </h2>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
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
                className={`rounded-2xl border px-3 py-2 text-left transition ${
                  isVisible
                    ? 'border-white/15 bg-white/10'
                    : 'border-white/10 bg-white/5 opacity-60'
                }`}
              >
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-200">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${series.backgroundClassName}`}
                  />
                  {series.label}
                </span>
                <span className="mt-2 block text-lg font-semibold text-white">
                  {activePoint[series.key].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[24px] border border-white/10 bg-slate-900/70">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-400">
          <span>Weekly range</span>
          <span>{activePoint.label}</span>
        </div>

        <div className="relative px-2 pb-2 pt-3">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="h-[250px] w-full"
            role="img"
            aria-label="Interactive inventory, actual sales, and predicted sales chart"
          >
            {[0.25, 0.5, 0.75, 1].map((step) => {
              const y =
                chartHeight -
                padding.bottom -
                step * (chartHeight - padding.top - padding.bottom);

              return (
                <line
                  key={step}
                  x1={padding.left}
                  x2={chartWidth - padding.right}
                  y1={y}
                  y2={y}
                  stroke="rgba(148, 163, 184, 0.18)"
                  strokeDasharray="4 8"
                />
              );
            })}

            {data.map((point, index) => {
              const x =
                padding.left +
                (index / Math.max(data.length - 1, 1)) *
                  (chartWidth - padding.left - padding.right);

              return (
                <g key={point.label}>
                  <line
                    x1={x}
                    x2={x}
                    y1={padding.top}
                    y2={chartHeight - padding.bottom}
                    stroke={
                      index === activeIndex
                        ? 'rgba(255, 255, 255, 0.22)'
                        : 'rgba(148, 163, 184, 0.08)'
                    }
                  />
                  <text
                    x={x}
                    y={chartHeight - 6}
                    fill="rgba(226, 232, 240, 0.75)"
                    fontSize="12"
                    textAnchor="middle"
                  >
                    {point.label}
                  </text>
                  <rect
                    x={x - 24}
                    y={padding.top}
                    width={48}
                    height={chartHeight - padding.top - padding.bottom}
                    fill="transparent"
                    onMouseEnter={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                  />
                </g>
              );
            })}

            {chartSeries.map((series) => {
              if (!visibleSeries[series.key]) {
                return null;
              }

              const values = data.map((point) => point[series.key]);
              const path = buildPath(values, maxValue, data.length);

              return (
                <g key={series.key}>
                  <path
                    d={path}
                    fill="none"
                    stroke={series.color}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                  />
                  {values.map((value, index) => {
                    const x =
                      padding.left +
                      (index / Math.max(data.length - 1, 1)) *
                        (chartWidth - padding.left - padding.right);
                    const y =
                      chartHeight -
                      padding.bottom -
                      (value / maxValue) *
                        (chartHeight - padding.top - padding.bottom);

                    return (
                      <circle
                        key={`${series.key}-${data[index].label}`}
                        cx={x}
                        cy={y}
                        r={index === activeIndex ? 7 : 4.5}
                        fill={series.color}
                        stroke="rgba(15, 23, 42, 0.95)"
                        strokeWidth="3"
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>

          <div className="pointer-events-none absolute right-4 top-4 w-48 rounded-2xl border border-white/10 bg-slate-950/85 p-3 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              {activePoint.label}
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
                    <span className="text-sm text-slate-200">
                      {series.label}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {activePoint[series.key].toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
