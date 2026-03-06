type DashboardMetricCardProps = {
  label: string;
  value: string | number;
  description?: string;
};

export default function DashboardMetricCard({
  label,
  value,
  description,
}: DashboardMetricCardProps) {
  return (
    <article className="rounded-[20px] bg-slate-50 p-4">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-heading text-3xl font-semibold text-brand-blue">
        {value}
      </p>
      {description ? (
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      ) : null}
    </article>
  );
}
