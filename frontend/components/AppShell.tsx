import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode, useState } from 'react';
import Card from './atoms/Card';
import type { AuthUser } from '../utils/authApi';
import { getSidebarTabsForUser } from '../utils/rbac';

type AppShellProps = {
  children: ReactNode;
  user: AuthUser;
};

function getUserInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

function formatRoleLabel(role: AuthUser['role']) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

export default function AppShell({ children, user }: AppShellProps) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navItems = getSidebarTabsForUser(user);
  const userInitials = user ? getUserInitials(user.name) : 'NA';

  return (
    <div className="min-h-screen bg-app">
      <aside
        className={`w-full border-b border-brand-white/20 bg-gradient-to-b from-[#11183A] via-[#172554] to-[#0F172A] p-4 text-brand-white transition-[width] duration-300 md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex md:flex-col md:border-b-0 md:border-r md:overflow-y-auto ${
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
              <span className="font-heading text-xl font-bold tracking-[0.18em] text-white text-align-center">
                PPIS
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed((current) => !current)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold text-white transition hover:bg-white/15"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-pressed={isCollapsed}
          >
            <img
              src="/sidebar-chevron.svg"
              alt="Toggle sidebar"
              width="20"
              height="20"
              className={`invert transition-transform duration-300 ${
                isCollapsed ? '' : 'rotate-180'
              }`}
            />
          </button>
        </div>

        <nav className="mt-6 flex-1">
          <ul className="grid gap-2">
            {navItems.map((item) => {
              const isActive =
                router.pathname === item.href ||
                (item.href !== '/' && router.pathname.startsWith(item.href));
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
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                        <img
                          src={item.iconPath || '/element-2.svg'}
                          alt={`${item.label} icon`}
                          width="20"
                          height="20"
                          className="invert"
                        />
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
          <a className="mt-6 block transition hover:opacity-95">
            <Card variant="glass" padding="md">
              <div
                className={`flex items-center ${
                  isCollapsed ? 'justify-center' : 'gap-3'
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-base font-bold text-white">
                  {userInitials}
                </div>
                <div
                  className={`min-w-0 transition-all duration-300 ${
                    isCollapsed
                      ? 'md:max-w-0 md:overflow-hidden md:opacity-0'
                      : ''
                  }`}
                >
                  <p className="truncate text-sm font-semibold text-white">
                    {user?.name || 'Unknown User'}
                  </p>
                  <p className="mt-1 truncate text-xs uppercase tracking-[0.18em] text-sky-100/70">
                    {user ? formatRoleLabel(user.role) : 'No Role'}
                  </p>
                </div>
              </div>
            </Card>
          </a>
        </Link>
      </aside>

      <main
        className={`p-4 transition-[margin] duration-300 md:p-8 ${
          isCollapsed ? 'md:ml-24' : 'md:ml-80'
        }`}
      >
        {children}
      </main>
    </div>
  );
}
