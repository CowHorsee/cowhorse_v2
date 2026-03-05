import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app p-6">
      <div className="w-full max-w-md rounded-2xl bg-brand-white p-8 shadow-surface">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-brand-red">
          Create account
        </p>
        <h1 className="font-heading text-3xl font-semibold text-brand-blue">
          Register
        </h1>
        <form className="mt-5 flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-bold text-brand-blue">
            Full name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Your full name"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
          />

          <label
            htmlFor="email"
            className="mt-2 text-sm font-bold text-brand-blue"
          >
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
            placeholder="At least 8 characters"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
          />

          <button
            type="button"
            className="mt-4 rounded-lg bg-brand-red px-4 py-2.5 text-sm font-bold text-brand-white transition hover:bg-[#ad2d2d]"
          >
            Create Account
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login">
            <a className="font-bold text-brand-blue hover:text-brand-red">
              Sign in
            </a>
          </Link>
        </p>
      </div>
    </div>
  );
}
