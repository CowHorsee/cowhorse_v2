import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Button from '../components/atoms/Button';
import { saveUserSession } from '../utils/localStorage';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [typedPhrase, setTypedPhrase] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [counters, setCounters] = useState<number[]>(statItems.map(() => 0));
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    const currentPhrase = heroPhrases[phraseIndex];
    const typingComplete = typedPhrase === currentPhrase;
    const deletingComplete = typedPhrase.length === 0;

    const timeoutId = window.setTimeout(
      () => {
        if (!isDeleting && !typingComplete) {
          setTypedPhrase(currentPhrase.slice(0, typedPhrase.length + 1));
          return;
        }

        if (!isDeleting && typingComplete) {
          setIsDeleting(true);
          return;
        }

        if (isDeleting && !deletingComplete) {
          setTypedPhrase(currentPhrase.slice(0, typedPhrase.length - 1));
          return;
        }

        setIsDeleting(false);
        setPhraseIndex(
          (currentIndex) => (currentIndex + 1) % heroPhrases.length
        );
      },
      !isDeleting && typingComplete ? 1400 : isDeleting ? 45 : 85
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isDeleting, phraseIndex, typedPhrase]);

  useEffect(() => {
    const animationStart = window.performance.now();
    const animationDurationMs = 1400;
    let frameId = 0;

    const animateCounters = (now: number) => {
      const progress = Math.min(
        (now - animationStart) / animationDurationMs,
        1
      );
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setCounters(
        statItems.map((statItem) => Math.round(statItem.target * easedProgress))
      );

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animateCounters);
      }
    };

    frameId = window.requestAnimationFrame(animateCounters);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  function updateField(field: 'email' | 'password', value: string) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  async function handleLogin() {
    setIsSubmitting(true);
    setLoginError('');

    try {
      const email = formValues.email.trim() || 'guest@cowhorse.local';

      saveUserSession({
        user_id: `local-${Date.now()}`,
        name: email.split('@')[0] || 'Guest User',
        email,
        role: 'ADMIN',
      });

      await router.push('/');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBypassLogin() {
    setFormValues({ email: '', password: '' });
    void handleLogin();
  }

  return (
    <div
      className="min-h-screen bg-brand-white px-4 py-6 md:px-6 md:py-8"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1.5px 1.5px, rgba(39,36,92,0.12) 1.5px, transparent 0)',
        backgroundSize: '32px 32px',
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl overflow-hidden rounded-[36px] border border-brand-blue/10 bg-white shadow-[0_30px_80px_rgba(18,17,36,0.16)] md:min-h-[calc(100vh-4rem)] md:flex-row">
        <section className="relative flex w-full flex-col justify-between overflow-hidden bg-brand-blue px-6 py-8 text-white md:w-1/2 md:px-10 md:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
          <div className="relative">
            <div className="inline-flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <div>
                <p className="font-heading text-2xl font-bold tracking-[0.24em] text-white">
                  PPIS
                </p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                  Procurement Platform
                </p>
              </div>
            </div>

            <div className="mt-12 max-w-xl md:mt-20">
              <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight md:text-5xl md:leading-[1.05]">
                Procurement Planning Intelligence System
              </h1>
              <div className="mt-6 min-h-[2.5rem] text-lg font-semibold text-brand-white md:text-2xl">
                <span className="text-[#FFD700]">{typedPhrase}</span>
                <span className="ml-1 inline-block animate-pulse text-[#FFD700]">
                  |
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-10 grid gap-4 md:mt-0 md:grid-cols-3">
            {statItems.map((statItem, index) => (
              <div
                key={statItem.label}
                className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur"
              >
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/55">
                  {statItem.label}
                </p>
                <p className="mt-3 font-heading text-3xl font-semibold text-white">
                  {counters[index]}
                  {statItem.suffix}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex w-full items-center justify-center bg-white px-6 py-8 md:w-1/2 md:px-10 md:py-10">
          <div className="w-full max-w-md">
            <div className="mt-8 md:mt-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-brand-red">
                Welcome Back
              </p>
              <h2 className="mt-3 font-heading text-4xl font-semibold tracking-[-0.02em] text-brand-blue">
                Login to PPIS
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Enter your account credentials to continue to the dashboard.
              </p>
            </div>

            <div className="mt-10 rounded-[28px] border border-slate-200 bg-[#FBFBFD] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <div className="rounded-[24px] border border-brand-blue/10 bg-white p-5">
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-brand-blue/45">
                  Workspace Access
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Use the secure entry point below to continue to the dashboard.
                </p>

                <div className="mt-4 space-y-3">
                  <input
                    type="email"
                    value={formValues.email}
                    onChange={(event) =>
                      updateField('email', event.target.value)
                    }
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
                  />
                  <input
                    type="password"
                    value={formValues.password}
                    onChange={(event) =>
                      updateField('password', event.target.value)
                    }
                    placeholder="Password"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
                  />
                </div>

                <Button
                  variant="secondary"
                  onClick={handleLogin}
                  disabled={isSubmitting}
                  fullWidth
                  className="mt-6 rounded-[20px] px-5 py-4 font-bold shadow-[0_20px_45px_rgba(39,36,92,0.28)] duration-200 hover:-translate-y-0.5 hover:bg-[#1f1b4b]"
                >
                  {isSubmitting ? <LoadingSpinner /> : null}
                  <span>{isSubmitting ? 'Signing In...' : 'Log In'}</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleBypassLogin}
                  disabled={isSubmitting}
                  fullWidth
                  className="mt-3 rounded-[20px] border-brand-blue/30 px-5 py-3 font-bold hover:bg-brand-blue/5"
                >
                  Bypass Login
                </Button>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 rounded-[20px] bg-brand-blue/[0.03] px-4 py-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-blue/45">
                    Need Access?
                  </p>
                  <p className="mt-1 text-sm font-semibold text-brand-blue">
                    Request an account from an admin.
                  </p>
                </div>
                <Link href="/register">
                  <a className="rounded-full bg-brand-red/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-red transition hover:bg-brand-red/20">
                    Register
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
