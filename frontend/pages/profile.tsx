import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Card, { CardHeader } from '../components/atoms/Card';
import type { AuthUser } from '../utils/api/authApi';
import { clearUserSession, getUserSession } from '../utils/localStorage';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getUserSession());
  }, []);

  function handleSignOut() {
    clearUserSession();
    setUser(null);
    router.push('/login');
  }

  return (
    <div className="mx-auto w-full max-w-6xl rounded-2xl bg-brand-white p-6 shadow-surface md:p-8">
      <section className="mb-6">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-brand-red">
          User profile
        </p>
        <h1 className="font-heading text-3xl font-semibold text-brand-blue md:text-4xl">
          {user ? `Hi ${user.name}` : 'My Profile'}
        </h1>
      </section>

      <section className="grid gap-4">
        <Card as="article" variant="base" padding="lg">
          <CardHeader
            title="Account"
            className="mb-0"
            titleClassName="text-lg"
          />
          <p className="mt-3 text-sm text-slate-700">
            Name: {user?.name || 'Not available'}
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Email: {user?.email || 'Not available'}
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Role: {user?.role || 'Not available'}
          </p>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-brand-blue transition hover:border-brand-blue"
            >
              Sign Out
            </button>
          </div>
        </Card>
      </section>
    </div>
  );
}
