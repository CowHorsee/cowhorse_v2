import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Card, { CardHeader } from '../components/atoms/Card';
import Button from '../components/atoms/Button';
import { useToast } from '../components/ToastProvider';
import { saveUserSession } from '../utils/localStorage';
import {
  prototypeUsers,
  type PrototypeUserCredential,
} from '../utils/mockdata/prototypeUsers';

function roleTone(role: PrototypeUserCredential['role']) {
  if (role === 'ADMIN') {
    return 'bg-brand-red/10 text-brand-red';
  }

  if (role === 'MANAGER') {
    return 'bg-amber-100 text-amber-700';
  }

  return 'bg-sky-100 text-sky-700';
}

export default function PrototypeUsersPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  async function loginAsUser(user: PrototypeUserCredential) {
    setSelectedUserId(user.user_id);

    try {
      saveUserSession(user);
      showToast({
        title: 'Prototype user selected',
        description: `Signed in as ${user.name}.`,
        variant: 'success',
      });
      router.push('/');
    } finally {
      setSelectedUserId(null);
    }
  }

  return (
    <div className="min-h-screen bg-brand-white px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto w-full max-w-4xl rounded-[32px] border border-brand-blue/10 bg-white p-6 shadow-[0_30px_80px_rgba(18,17,36,0.16)] md:p-8">
        <CardHeader
          subtitle="Prototype Access"
          title="Choose a Prototype User"
          titleClassName="text-3xl md:text-4xl"
        />
        <p className="mt-2 text-sm leading-7 text-slate-600">
          Click any user to sign in immediately with that role and test role-
          based sidebar access.
        </p>

        <div className="mt-8 grid gap-4">
          {prototypeUsers.map((user) => (
            <Card key={user.user_id} variant="surface" padding="lg">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-heading text-xl font-semibold text-brand-blue">
                      {user.name}
                    </p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] ${roleTone(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Email: <span className="font-semibold">{user.email}</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Password:{' '}
                    <span className="font-mono font-semibold">
                      {user.password}
                    </span>
                  </p>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => loginAsUser(user)}
                  disabled={selectedUserId === user.user_id}
                  className="rounded-xl px-5 py-3 font-bold hover:bg-[#1f1b4b]"
                >
                  {selectedUserId === user.user_id
                    ? 'Signing In...'
                    : 'Log In as User'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/login">
            <a className="text-sm font-bold text-brand-blue transition hover:text-brand-red">
              Back to Login
            </a>
          </Link>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Prototype only
          </p>
        </div>
      </div>
    </div>
  );
}
