import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode, useState } from 'react';

type AppShellProps = {
  children: ReactNode;
};

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/pr', label: 'Purchase Requests' },
  { href: '/profile', label: 'Profile' },
];

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-app md:flex">
      <aside
        className={`w-full border-b border-brand-white/20 bg-gradient-to-b from-[#11183A] via-[#172554] to-[#0F172A] p-4 text-brand-white transition-[width] duration-300 md:flex md:min-h-screen md:flex-col md:border-b-0 md:border-r ${
          isCollapsed ? 'md:w-24' : 'md:w-80'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div
            className={`min-w-0 transition-all duration-300 ${
              isCollapsed ? 'md:max-w-0 md:overflow-hidden md:opacity-0' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-heading text-xl font-bold tracking-[0.18em] text-white">
                Chin Hin
              </span>
              <span className="text-lg text-white/50">|</span>
              <span className="font-heading text-xl font-bold tracking-[0.18em] text-white">
                Fiamma
              </span>
            </div>
            <p className="mt-3 text-sm text-brand-white/70">
              Procurement workspace for operational planning and request
              visibility.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed((current) => !current)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-lg font-semibold text-white transition hover:bg-white/15"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-pressed={isCollapsed}
          >
            {isCollapsed ? '>' : '<'}
          </button>
        </div>

        <div className="mt-6 rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-red text-sm font-bold tracking-[0.2em] text-white">
              CH
            </div>
            <div
              className={`min-w-0 transition-all duration-300 ${
                isCollapsed ? 'md:max-w-0 md:overflow-hidden md:opacity-0' : ''
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-100/70">
                Workspace
              </p>
              <p className="mt-1 font-heading text-lg font-semibold">
                Chin Hin | Fiamma
              </p>
            </div>
          </div>
        </div>

        <nav className="mt-6 flex-1">
          <ul className="grid gap-2">
            {navItems.map((item) => {
              const isActive =
                router.pathname === item.href ||
                (item.href !== '/' && router.pathname.startsWith(item.href));
              const initials = item.label
                .split(' ')
                .map((word) => word[0])
                .join('')
                .slice(0, 2);

              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <a
                      className={`flex items-center rounded-2xl px-4 py-3 font-semibold transition-colors ${
                        isActive
                          ? 'bg-brand-red text-brand-white'
                          : 'text-brand-white hover:bg-brand-white/10'
                      } ${isCollapsed ? 'justify-center md:px-2' : 'gap-3'}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-sm font-bold uppercase tracking-[0.12em]">
                        {initials}
                      </span>
                      <span
                        className={`min-w-0 transition-all duration-300 ${
                          isCollapsed
                            ? 'md:max-w-0 md:overflow-hidden md:opacity-0'
                            : ''
                        }`}
                      >
                        {item.label}
                      </span>
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Link href="/profile">
          <a className="mt-6 block rounded-[26px] border border-white/10 bg-white/10 p-4 backdrop-blur transition hover:bg-white/15">
            <div
              className={`flex items-center ${
                isCollapsed ? 'justify-center' : 'gap-3'
              }`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-base font-bold text-white">
                AC
              </div>
              <div
                className={`min-w-0 transition-all duration-300 ${
                  isCollapsed
                    ? 'md:max-w-0 md:overflow-hidden md:opacity-0'
                    : ''
                }`}
              >
                <p className="truncate text-sm font-semibold text-white">
                  Ashley Chan
                </p>
                <p className="mt-1 truncate text-xs uppercase tracking-[0.18em] text-sky-100/70">
                  Procurement Admin
                </p>
              </div>
            </div>
            {!isCollapsed ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-[#0F172A]/60 px-3 py-2 text-xs uppercase tracking-[0.2em] text-sky-100/70">
                View profile
              </div>
            ) : null}
          </a>
        </Link>
      </aside>

      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
