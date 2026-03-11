import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Button from '../components/atoms/Button';
import Card, { CardHeader } from '../components/atoms/Card';
import {
  mapUserRoleToBackendRoleName,
  registerUser,
  type UserRole,
} from '../utils/authApi';
import { ApiError } from '../utils/api/apiClient';
import { getUserSession } from '../utils/localStorage';

export default function RegisterPage() {
  const router = useRouter();
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    role: 'ADMIN' as UserRole,
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

    const sessionUser = getUserSession();
    if (!sessionUser?.user_id) {
      setErrorMessage('Admin session required before creating a user.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await registerUser({
        admin_id: sessionUser.user_id,
        email: formValues.email.trim(),
        name: formValues.name.trim(),
        role_name: mapUserRoleToBackendRoleName(formValues.role),
        password: formValues.password.trim() || undefined,
      });

      setSuccessMessage(response.message);
      setFormValues({
        name: '',
        email: '',
        role: 'ADMIN',
        password: '',
      });
      setTimeout(() => {
        void router.push('/users');
      }, 800);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Unable to create the user right now.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center p-6">
      <Card
        variant="surface"
        padding="lg"
        className="w-full max-w-md bg-brand-white shadow-surface"
      >
        <CardHeader
          subtitle="Admin tools"
          title="Create User"
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
            placeholder="User full name"
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
            placeholder="user@company.com"
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
            <option value="ADMIN">Admin</option>
          </select>

          <label
            htmlFor="password"
            className="mt-2 text-sm font-bold text-brand-blue"
          >
            Temporary Password (Optional)
          </label>
          <input
            id="password"
            type="password"
            placeholder="Leave blank if backend handles this"
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

          <Button type="submit" disabled={isSubmitting} className="mt-4">
            {isSubmitting ? 'Creating User...' : 'Create User'}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Back to{' '}
          <Link href="/users">
            <a className="font-bold text-brand-blue hover:text-brand-red">
              User Management
            </a>
          </Link>
        </p>
      </Card>
    </div>
  );
}
