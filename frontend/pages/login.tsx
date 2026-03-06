import Link from 'next/link';
import Card, { CardHeader } from '../components/atoms/Card';

export default function LoginPage() {
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
        <form className="mt-5 flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-bold text-brand-blue">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@company.com"
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
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
          />

          <button
            type="button"
            className="mt-4 rounded-lg bg-brand-red px-4 py-2.5 text-sm font-bold text-brand-white transition hover:bg-[#ad2d2d]"
          >
            Log In
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
