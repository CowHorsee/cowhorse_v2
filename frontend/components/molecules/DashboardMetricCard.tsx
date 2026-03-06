import Card from '../atoms/Card';

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
    <Card as="article" variant="soft" padding="md">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-heading text-3xl font-semibold text-brand-blue">
        {value}
      </p>
      {description ? (
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      ) : null}
    </Card>
  );
}
