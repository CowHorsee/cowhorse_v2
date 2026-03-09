import { useState } from 'react';
import Link from 'next/link';
import Card, { CardHeader } from '../components/atoms/Card';
import { useRouter } from 'next/router';
import type { UserRole } from '../utils/api/authApi';
// import { ApiError } from '../utils/api/apiClient';
// import { registerUser } from '../utils/api/authApi';
// import { getUserSession } from '../utils/localStorage';

export default function RegisterPage() {
  const router = useRouter();
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    role: 'EMPLOYEE' as UserRole,
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof typeof formValues, value: string) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      // const sessionUser = getUserSession();
      // if (!sessionUser?.user_id) {
      //   throw new Error('Admin session is required to register a user.');
      // }
      // const response = await registerUser({
      //   admin_id: sessionUser.user_id,
      //   email: formValues.email,
      //   name: formValues.name,
      //   role_name: formValues.role,
      //   password: formValues.password,
      // });

      setSuccessMessage('Mock account created successfully.');
      setFormValues({
        name: '',
        email: '',
        role: 'EMPLOYEE',
        password: '',
      });
      setTimeout(() => {
        router.push('/login');
      }, 800);
    } catch {
      setErrorMessage('Unable to create your account right now.');
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
          subtitle="Create account"
          title="Register"
          className="mb-0"
          titleClassName="text-3xl"
        />
        <form className="mt-5 flex flex-col gap-2" onSubmit={handleSubmit}>
          <label htmlFor="name" className="text-sm font-bold text-brand-blue">
            Full name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Your full name"
            value={formValues.name}
            onChange={(event) => updateField('name', event.target.value)}
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
            value={formValues.email}
            onChange={(event) => updateField('email', event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
          />

          <label
            htmlFor="role"
            className="mt-2 text-sm font-bold text-brand-blue"
          >
            Role
          </label>
          <select
            id="role"
            value={formValues.role}
            onChange={(event) => updateField('role', event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            <option value="WAREHOUSE">Warehouse</option>
            <option value="ADMIN">Admin</option>
          </select>

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
            value={formValues.password}
            onChange={(event) => updateField('password', event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
          />

          {errorMessage ? (
            <p className="mt-3 text-sm font-medium text-brand-red">
              {errorMessage}
            </p>
          ) : null}
          {successMessage ? (
            <p className="mt-3 text-sm font-medium text-emerald-700">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 rounded-lg bg-brand-red px-4 py-2.5 text-sm font-bold text-brand-white transition hover:bg-[#ad2d2d]"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
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
      </Card>
    </div>
  );
}
