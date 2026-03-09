import Card, { CardHeader } from '../atoms/Card';

type DashboardMetricCardProps = {
  label: string;
  value: string | number;
  description?: string;
};

export default function DashboardMetricCard({
  label,
  value,
}: DashboardMetricCardProps) {
  return (
    <Card as="article" variant="soft" padding="md">
      <CardHeader
        subtitle={label}
        title={value}
        className="mb-0"
        subtitleClassName="text-slate-500"
        titleClassName="mt-2 text-3xl"
      />
    </Card>
  );
}
