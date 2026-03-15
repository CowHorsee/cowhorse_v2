import Link from 'next/link';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="mb-3 flex items-center">
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
        {items.map((item, index) => (
          <span key={`${item.label}-${index}`}>
            {item.href ? (
              <Link href={item.href}>
                <a className="transition hover:text-brand-blue">{item.label}</a>
              </Link>
            ) : (
              <span className="text-brand-blue">{item.label}</span>
            )}
            {index < items.length - 1 ? (
              <span className="mx-1.5 text-slate-400">/</span>
            ) : null}
          </span>
        ))}
      </div>
    </div>
  );
}
