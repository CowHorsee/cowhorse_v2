import Link from 'next/link';
import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Button from '../components/atoms/Button';
import Card, { CardHeader } from '../components/atoms/Card';
import { ApiError } from '../utils/api/apiClient';
import type { UserRole } from '../utils/api/authApi';
import { USER_ROLES } from '../utils/constants';
import { getUserSession } from '../utils/localStorage';
import {
  createManagedUser,
  listUsers,
  modifyUserRole,
  searchUsers,
} from '../utils/userManagementApi';
import {
  managedUsers as fallbackUsers,
  type ManagedUser,
} from '../utils/mockdata/usersData';

const roleOptions: UserRole[] = [USER_ROLES.ADMIN];

type RoleDropdownProps = {
  value: UserRole;
  onChange: (role: UserRole) => void;
};

function RoleDropdown({ value, onChange }: RoleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current) {
        return;
      }

      const target = event.target;
      if (target instanceof Node && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-700 shadow-sm transition hover:border-brand-blue focus:border-brand-blue focus:outline-none"
      >
        <span className="font-semibold tracking-[0.02em] text-brand-blue">
          {value}
        </span>
        <span
          className={`text-xs text-slate-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          v
        </span>
      </button>

      {isOpen ? (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.12)]">
          {roleOptions.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => {
                onChange(role);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm transition ${
                role === value
                  ? 'bg-brand-blue/10 font-semibold text-brand-blue'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function buildSearchFilters(searchTerm: string) {
  const trimmed = searchTerm.trim();
  if (!trimmed) {
    return {};
  }

  const uppercase = trimmed.toUpperCase();
  if (roleOptions.includes(uppercase as UserRole)) {
    return { role_name: uppercase };
  }

  if (trimmed.includes('@')) {
    return { email: trimmed };
  }

  return { name: trimmed };
}

export default function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>(fallbackUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>(USER_ROLES.ADMIN);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ role: UserRole } | null>(null);

  const sessionUser = getUserSession();
  const adminId = sessionUser?.user_id || '';

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      if (!adminId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        const nextUsers = searchTerm.trim()
          ? await searchUsers(buildSearchFilters(searchTerm))
          : await listUsers(adminId);

        if (isMounted) {
          setUsers(nextUsers.length ? nextUsers : []);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof ApiError
              ? error.message
              : 'Unable to load users from the API.'
          );
          setUsers(fallbackUsers);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      isMounted = false;
    };
  }, [adminId, searchTerm]);

  const filteredUsers = useMemo(() => {
    if (!errorMessage) {
      return users;
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      if (!normalizedSearch) {
        return true;
      }

      return (
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        user.role.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [errorMessage, searchTerm, users]);

  function startEditingRow(user: ManagedUser) {
    setEditingUserId(user.user_id);
    setEditDraft({ role: user.role });
    setFeedbackMessage('');
    setErrorMessage('');
  }

  async function confirmEditingRow() {
    if (!editingUserId || !editDraft || !adminId) {
      return;
    }

    const existingUser = users.find((user) => user.user_id === editingUserId);
    if (!existingUser) {
      return;
    }

    if (existingUser.role === editDraft.role) {
      setFeedbackMessage('No role change to save.');
      setEditingUserId(null);
      setEditDraft(null);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setFeedbackMessage('');

    try {
      await modifyUserRole({
        admin_id: adminId,
        user_id: editingUserId,
        new_role_name: editDraft.role,
      });

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.user_id === editingUserId
            ? { ...user, role: editDraft.role }
            : user
        )
      );
      setFeedbackMessage(`User ${editingUserId} role updated.`);
      setEditingUserId(null);
      setEditDraft(null);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Unable to update the selected role.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedbackMessage('');
    setErrorMessage('');

    const normalizedName = newUserName.trim();
    const normalizedEmail = newUserEmail.trim();

    if (!adminId) {
      setErrorMessage('Admin session required before creating users.');
      return;
    }

    if (!normalizedName) {
      setErrorMessage('User name is required.');
      return;
    }

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setErrorMessage('A valid email is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createManagedUser({
        admin_id: adminId,
        name: normalizedName,
        email: normalizedEmail,
        role_name: newUserRole,
      });

      setUsers((currentUsers) => [response.user, ...currentUsers]);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole(USER_ROLES.ADMIN);
      setFeedbackMessage(response.message);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Unable to create the user right now.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <Card variant="surface" padding="lg">
        <CardHeader
          subtitle="Admin tools"
          title="User Management"
          subtitleClassName="text-brand-red"
          titleClassName="text-brand-blue"
        />

        <div className="grid gap-3 md:grid-cols-2">
          <Card variant="soft" padding="md">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Total Users
            </p>
            <p className="mt-2 text-3xl font-semibold text-brand-blue">
              {isLoading ? '...' : users.length}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Creating users calls the live admin registration API.
            </p>
          </Card>

          <Card variant="soft" padding="md">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Add New User
              </p>
              <Link href="/register">
                <a className="text-xs font-bold text-brand-blue transition hover:text-brand-red">
                  Open full form
                </a>
              </Link>
            </div>
            <form
              className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px_120px]"
              onSubmit={handleAddUser}
            >
              <input
                type="text"
                value={newUserName}
                onChange={(event) => setNewUserName(event.target.value)}
                placeholder="User full name"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
              />
              <input
                type="email"
                value={newUserEmail}
                onChange={(event) => setNewUserEmail(event.target.value)}
                placeholder="user@company.com"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
              />
              <RoleDropdown value={newUserRole} onChange={setNewUserRole} />
              <Button type="submit" disabled={isSubmitting}>
                Add User
              </Button>
            </form>
            {feedbackMessage ? (
              <p className="mt-2 text-xs font-semibold text-brand-blue">
                {feedbackMessage}
              </p>
            ) : null}
            {errorMessage ? (
              <p className="mt-2 text-xs font-semibold text-brand-red">
                {errorMessage}
              </p>
            ) : null}
          </Card>
        </div>
      </Card>

      <Card variant="surface" padding="lg">
        <div>
          <label
            htmlFor="user-search"
            className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500"
          >
            Search user by email / name / role
          </label>
          <input
            id="user-search"
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Type email, name, or role"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-blue"
          />
        </div>

        <p className="mt-3 text-xs text-slate-500">
          The current API supports role changes. Name and email edits are not
          wired because the OpenAPI contract does not expose an endpoint for
          them.
        </p>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length ? (
                filteredUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td className="px-4 py-3 font-semibold text-brand-blue">
                      {user.user_id}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{user.name}</td>
                    <td className="px-4 py-3 text-slate-700">{user.email}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {editingUserId === user.user_id && editDraft ? (
                        <RoleDropdown
                          value={editDraft.role}
                          onChange={(role) => setEditDraft({ role })}
                        />
                      ) : (
                        user.role
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingUserId === user.user_id ? (
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={isSubmitting}
                          onClick={() => void confirmEditingRow()}
                          className="h-9 w-9 rounded-lg border border-emerald-300 bg-emerald-50 p-0 text-emerald-700 hover:bg-emerald-100"
                          aria-label={`Confirm edits for ${user.name}`}
                          title="Confirm"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => startEditingRow(user)}
                          className="h-9 w-9 rounded-lg border-slate-300 p-0 text-brand-blue hover:border-brand-blue hover:bg-slate-50"
                          aria-label={`Edit ${user.name}`}
                          title="Edit role"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                          </svg>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No users match the current search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
