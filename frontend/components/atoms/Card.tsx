import { ElementType, ReactNode } from 'react';

type CardVariant = 'base' | 'surface' | 'soft' | 'dark' | 'glass' | 'outlined';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

type CardProps = {
  as?: ElementType;
  variant?: CardVariant;
  padding?: CardPadding;
  className?: string;
  children: ReactNode;
};

type CardHeaderProps = {
  subtitle?: ReactNode;
  title: ReactNode;
  action?: ReactNode;
  className?: string;
  subtitleClassName?: string;
  titleClassName?: string;
};

const variantClasses: Record<CardVariant, string> = {
  base: 'rounded-xl border border-slate-200 bg-white',
  surface:
    'rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]',
  soft: 'rounded-[20px] bg-slate-50',
  dark: 'rounded-[22px] bg-brand-blue text-white',
  glass: 'rounded-[26px] border border-white/10 bg-white/10 backdrop-blur',
  outlined: 'rounded-xl border border-slate-200 bg-transparent',
};

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5 md:p-6',
};

function joinClasses(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function CardHeader({
  subtitle,
  title,
  action,
  className,
  subtitleClassName,
  titleClassName,
}: CardHeaderProps) {
  return (
    <div
      className={joinClasses(
        'mb-4 flex items-start justify-between gap-3',
        className
      )}
    >
      <div>
        {subtitle ? (
          <p
            className={joinClasses(
              'text-xs font-extrabold uppercase tracking-[0.14em] text-brand-red',
              subtitleClassName
            )}
          >
            {subtitle}
          </p>
        ) : null}
        <h3
          className={joinClasses(
            'mt-1 font-heading text-2xl font-semibold text-brand-blue',
            titleClassName
          )}
        >
          {title}
        </h3>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export default function Card({
  as = 'div',
  variant = 'base',
  padding = 'md',
  className,
  children,
}: CardProps) {
  const Component = as;

  return (
    <Component
      className={joinClasses(
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </Component>
  );
}
