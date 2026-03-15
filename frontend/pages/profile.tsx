import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Card, { CardHeader } from '../components/atoms/Card';
import Button from '../components/atoms/Button';
import { useToast } from '../components/ToastProvider';
import { ApiError } from '../utils/api/apiClient';
import { changePassword, type AuthUser } from '../utils/api/authApi';
import { clearUserSession, getUserSession } from '../utils/localStorage';

function formatRoleLabel(role?: string) {
  if (!role) {
    return 'Not available';
  }

  return role
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    setUser(getUserSession());
  }, []);

  function handleSignOut() {
    clearUserSession();
    setUser(null);
    router.push('/login');
  }

  function updatePasswordField(
    field: 'oldPassword' | 'newPassword' | 'confirmPassword',
    value: string
  ) {
    setPasswordForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleChangePassword() {
    if (!user?.user_id) {
      showToast({
        title: 'Change password failed',
        description: 'User session is required.',
        variant: 'error',
      });
      return;
    }

    const oldPassword = passwordForm.oldPassword.trim();
    const newPassword = passwordForm.newPassword.trim();
    const confirmPassword = passwordForm.confirmPassword.trim();

    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast({
        title: 'Change password failed',
        description: 'All password fields are required.',
        variant: 'error',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast({
        title: 'Change password failed',
        description: 'New password and confirmation do not match.',
        variant: 'error',
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await changePassword({
        user_id: user.user_id,
        old_password: oldPassword,
        new_password: newPassword,
      });

      showToast({
        title: 'Password changed',
        description: response.message,
        variant: 'success',
      });
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Unable to change password right now.';
      showToast({
        title: 'Change password failed',
        description: message,
        variant: 'error',
      });
    } finally {
      setIsChangingPassword(false);
    }
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

      <section className="grid gap-4 md:grid-cols-2">
        <Card as="article" variant="base" padding="lg" className="h-full">
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
            Role: {formatRoleLabel(user?.role)}
          </p>

          <div className="mt-6 flex justify-center align-items-end">
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </Card>

        <Card as="article" variant="base" padding="lg" className="h-full">
          <CardHeader
            title="Change Password"
            className="mb-0"
            titleClassName="text-lg"
          />

          <div className="mt-4 grid gap-3 md:max-w-xl">
            <input
              type="password"
              value={passwordForm.oldPassword}
              onChange={(event) =>
                updatePasswordField('oldPassword', event.target.value)
              }
              placeholder="Current password"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) =>
                updatePasswordField('newPassword', event.target.value)
              }
              placeholder="New password"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                updatePasswordField('confirmPassword', event.target.value)
              }
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />

            <div className="mt-1 justify-center flex">
              <Button
                variant="secondary"
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
