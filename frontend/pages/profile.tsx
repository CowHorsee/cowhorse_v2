import { useEffect, useState } from 'react';
import type { AuthUser } from '../utils/authApi';
import { clearUserSession, getUserSession } from '../utils/localStorage';

import Card from '../components/atoms/Card';

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getUserSession());
  }, []);

  function handleSignOut() {
    clearUserSession();
    setUser(null);
  }

  return (
    <div className="mx-auto w-full max-w-6xl rounded-2xl bg-brand-white p-6 shadow-surface md:p-8">
      <section className="mb-6">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-brand-red">
          User profile
        </p>
        <h1 className="font-heading text-3xl font-semibold text-brand-blue md:text-4xl">
          My Profile
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
          Manage account details and approval workflow preferences.
        </p>
      </section>

      {!user ? (
        <section className="mb-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-brand-blue">
            No active session found.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Sign in through the login page to load profile data from the API.
          </p>
        </section>
      ) : (
        <section className="mb-6 flex items-center justify-between rounded-xl bg-slate-50 p-4">
          <div>
            <p className="text-sm font-semibold text-brand-blue">
              Signed in as {user.email}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              This profile is populated from the API login response.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-brand-blue transition hover:border-brand-blue"
          >
            Sign Out
          </button>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <Card as="article" variant="base" padding="lg">
          <h3 className="font-heading text-lg font-semibold text-brand-blue">
            Account
          </h3>
          <p className="mt-3 text-sm text-slate-700">
            Name: {user?.name || 'Not available'}
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Email: {user?.email || 'Not available'}
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Role: {user?.role || 'Not available'}
          </p>
          <p className="mt-2 text-sm text-slate-700">Role: Senior Engineer</p>
        </Card>
        <Card as="article" variant="base" padding="lg">
          <h3 className="font-heading text-lg font-semibold text-brand-blue">
            Approval settings
          </h3>
          <p className="mt-3 text-sm text-slate-700">
            Preferred category: IT Procurement
          </p>
          <p className="mt-2 text-sm text-slate-700">Notification: Instant</p>
          <p className="mt-2 text-sm text-slate-700">
            Timezone: Asia/Kuala_Lumpur
          </p>
        </Card>
      </section>
    </div>
  );
}
