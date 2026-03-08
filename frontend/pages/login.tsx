import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Card, { CardHeader } from '../components/atoms/Card';
import { useToast } from '../components/ToastProvider';
import { saveUserSession } from '../utils/localStorage';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof typeof formValues, value: string) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      saveUserSession({
        user_id: 'local-dev-user',
        name: formValues.email || 'Local User',
        email: formValues.email || 'local.user@cowhorse.dev',
        role: 'ADMIN',
      });
      showToast({
        title: 'Signed in',
        description: 'Redirecting you to the dashboard.',
        variant: 'success',
      });
      router.push('/');
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 rounded-lg bg-brand-red px-4 py-2.5 text-sm font-bold text-brand-white transition hover:bg-[#ad2d2d]"
          >
            {isSubmitting ? 'Signing In...' : 'Log In'}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Need an account?{' '}
          <Link href="/register">
            <a className="font-bold text-brand-blue hover:text-brand-red">
              Create one
            </a>
          </Link>
        </p>
      </Card>
    </div>
  );
}
