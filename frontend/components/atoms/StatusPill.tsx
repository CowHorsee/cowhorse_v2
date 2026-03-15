type StatusPillTone = 'neutral' | 'info' | 'warning' | 'success' | 'danger';

type StatusPillProps = {
  label: string;
  tone?: StatusPillTone;
  className?: string;
};

const toneClassMap: Record<StatusPillTone, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  info: 'bg-brand-blue/10 text-brand-blue',
  warning: 'bg-amber-100 text-amber-700',
  success: 'bg-emerald-100 text-emerald-700',
  danger: 'bg-brand-red/10 text-brand-red',
};

export default function StatusPill({
  label,
  tone = 'danger',
  className = '',
}: StatusPillProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${toneClassMap[tone]} ${className}`}
    >
      {label}
    </span>
  );
}
