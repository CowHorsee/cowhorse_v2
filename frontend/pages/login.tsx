
import Link from 'next/link';
import { useRouter } from 'next/router';
import Card, { CardHeader } from '../components/atoms/Card';
import { saveUserSession } from '../utils/localStorage';
import { useEffect, useState } from 'react';
import { useToast } from '../components/ToastProvider';
import { ApiError } from '../utils/apiClient';
import { loginUser, mapBackendRole } from '../utils/authApi';

const heroPhrases = [
  'Maximize procurement visibility.',
  'Move approvals faster.',
  'Outsmart inventory delays.',
];

const statItems = [
  { label: 'Decisions', target: 1247, suffix: '+' },
  { label: 'Accuracy', target: 98, suffix: '%' },
  { label: 'Speed', target: 3, suffix: 'x' },
];

function LoadingSpinner() {
  return (
    <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-white/25 border-t-white" />
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [typedPhrase, setTypedPhrase] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [counters, setCounters] = useState<number[]>(statItems.map(() => 0));

  function updateField(field: keyof typeof formValues, value: string) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setLoginError('');

    try {
      saveUserSession({
        user_id: 'local-dev-user',
        name: formValues.email || 'Local User',
        email: formValues.email || 'local.user@cowhorse.dev',
        role: 'ADMIN',
      });
      await router.push('/');
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Unable to sign in right now.';

      setLoginError(message);
      showToast({
        title: 'Sign in failed',
        description: message,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-blue p-6">
      <Card
        variant="surface"
        padding="lg"
        className="w-full max-w-md bg-brand-white shadow-surface"
      >
        <CardHeader
          subtitle="Welcome back"
          title="Sign in"
          className="mb-0"
          titleClassName="text-3xl"
        />
        <form className="mt-5 flex flex-col gap-2" onSubmit={handleSubmit}>
          <label htmlFor="email" className="text-sm font-bold text-brand-blue">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={formValues.email}
            onChange={(event) => updateField('email', event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
          />

          <label
            htmlFor="password"
            className="mt-2 text-sm font-bold text-brand-blue"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="********"
            value={formValues.password}
            onChange={(event) => updateField('password', event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
          />

          {errorMessage ? (
            <p className="mt-3 text-sm font-medium text-brand-red">
              {errorMessage}
            </p>
          ) : null}

        <section className="flex w-full items-center justify-center bg-white px-6 py-8 md:w-1/2 md:px-10 md:py-10">
          <div className="w-full max-w-md">
            <div className="md:hidden">
              <div className="inline-flex items-center gap-3 rounded-[24px] border border-brand-blue/10 bg-brand-white px-4 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-red text-sm font-black tracking-[0.18em] text-white">
                  P
                </span>
                <div>
                  <p className="font-heading text-xl font-bold tracking-[0.22em] text-brand-blue">
                    PPIS
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-brand-blue/55">
                    Procurement Platform
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 md:mt-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-brand-red">
                Welcome Back
              </p>
              <h2 className="mt-3 font-heading text-4xl font-semibold tracking-[-0.02em] text-brand-blue">
                Sign in to PPIS
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Enter the procurement workspace. For now, this opens the
                dashboard directly.
              </p>
            </div>

            <div className="mt-10 rounded-[28px] border border-slate-200 bg-[#FBFBFD] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <div className="rounded-[24px] border border-brand-blue/10 bg-white p-5">
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-brand-blue/45">
                  Workspace Access
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Use your backend account credentials to continue to the dashboard.
                </p>

                <div className="mt-4 space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
                  />
                  {loginError ? (
                    <p className="text-sm font-semibold text-brand-red">{loginError}</p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isSubmitting}
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-[20px] bg-brand-blue px-5 py-4 text-sm font-bold text-white shadow-[0_20px_45px_rgba(39,36,92,0.28)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#1f1b4b] disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {isSubmitting ? <LoadingSpinner /> : null}
                  <span>
                    {isSubmitting ? 'Opening Dashboard...' : 'Log In'}
                  </span>
                </button>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 rounded-[20px] bg-brand-blue/[0.03] px-4 py-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-blue/45">
                    Access Mode
                  </p>
                  <p className="mt-1 text-sm font-semibold text-brand-blue">
                    Local prototype sign-in enabled
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/register')}
                  className="rounded-full bg-brand-red/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-red transition hover:bg-brand-red/20"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
