import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

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

  return (
    <div className="min-h-screen bg-app md:flex">
      <aside className="w-full border-b border-brand-white/20 bg-gradient-to-b from-[#11183A] via-[#172554] to-[#0F172A] p-6 text-brand-white md:min-h-screen md:w-72 md:border-b-0 md:border-r">
        <p className="font-heading text-3xl font-bold">Cowhorse</p>
        <p className="mt-2 text-sm text-brand-white/75">
          Procurement Workspace
        </p>
        <div className="mt-8 rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-100/70">
            System Role
          </p>
          <p className="mt-3 font-heading text-xl font-semibold">
            Operations Command
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            Landing overview for inventory, demand, and procurement decisions.
          </p>
        </div>

        <nav className="mt-8">
          <ul className="grid gap-2">
            {navItems.map((item) => {
              const isActive =
                router.pathname === item.href ||
                (item.href !== '/' && router.pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <a
                      className={`block rounded-lg px-4 py-2.5 font-semibold transition-colors ${
                        isActive
                          ? 'bg-brand-red text-brand-white'
                          : 'text-brand-white hover:bg-brand-white/10'
                      }`}
                    >
                      {item.label}
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-8 grid grid-cols-2 gap-2 text-center text-sm md:mt-12">
          <Link href="/login">
            <a className="rounded-lg border border-brand-white/40 px-3 py-2 font-semibold hover:bg-brand-white/10">
              Login
            </a>
          </Link>
          <Link href="/register">
            <a className="rounded-lg bg-brand-red px-3 py-2 font-semibold text-brand-white hover:bg-[#ad2d2d]">
              Register
            </a>
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
