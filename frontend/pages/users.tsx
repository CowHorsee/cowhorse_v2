import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Card, { CardHeader } from '../components/atoms/Card';
import type { UserRole } from '../utils/authApi';
import {
  managedUsers as initialManagedUsers,
  type ManagedUser,
} from '../utils/mockdata/usersData';
// import { ApiError } from '../utils/apiClient';
// import { registerUser } from '../utils/authApi';
// import { getUserSession } from '../utils/localStorage';
// import {
//   mapSearchUserRowToUserRecord,
//   modifyUserRole,
//   searchUsers,
// } from '../utils/userManagementApi';

const roleOptions: UserRole[] = ['ADMIN', 'MANAGER', 'EMPLOYEE'];

type RoleDropdownProps = {
  value: UserRole;
  onChange: (role: UserRole) => void;
  compact?: boolean;
};

function RoleDropdown({ value, onChange, compact = false }: RoleDropdownProps) {
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
        className={`flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-700 shadow-sm transition hover:border-brand-blue focus:border-brand-blue focus:outline-none`}
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

export default function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>(initialManagedUsers);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('EMPLOYEE');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    name: string;
    email: string;
    role: UserRole;
  } | null>(null);

  const filteredUsers = useMemo(() => {
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
  }, [users, searchTerm]);

  useEffect(() => {
    // async function loadUsers() {
    //   setIsLoadingUsers(true);
    //   try {
    //     const response = await searchUsers();
    //     const mapped = response.map((row, index) =>
    //       mapSearchUserRowToUserRecord(row, index)
    //     );
    //     if (mapped.length) {
    //       setUsers(mapped);
    //     }
    //   } catch {
    //     setFeedbackMessage(
    //       'Live user API is unavailable. Showing cached prototype users.'
    //     );
    //   } finally {
    //     setIsLoadingUsers(false);
    //   }
    // }
    // loadUsers();
    setIsLoadingUsers(false);
  }, []);

  function startEditingRow(user: ManagedUser) {
    setEditingUserId(user.user_id);
    setEditDraft({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }

  function confirmEditingRow() {
    if (!editingUserId || !editDraft) {
      return;
    }

    const normalizedName = editDraft.name.trim();
    const normalizedEmail = editDraft.email.trim();

    if (!normalizedName) {
      setFeedbackMessage('Name is required before confirming edits.');
      return;
    }

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setFeedbackMessage('Enter a valid email before confirming edits.');
      return;
    }

    // const sessionUser = getUserSession();
    // if (!sessionUser?.user_id) {
    //   setFeedbackMessage('Admin session is required to update roles.');
    //   return;
    // }
    // try {
    //   await modifyUserRole({
    //     admin_id: sessionUser.user_id,
    //     user_id: editingUserId,
    //     new_role_name: editDraft.role,
    //   });
    // } catch (error) {
    //   const message =
    //     error instanceof ApiError
    //       ? error.message
    //       : 'Unable to update user role right now.';
    //   setFeedbackMessage(message);
    //   return;
    // }

    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.user_id === editingUserId
          ? {
              ...user,
              name: normalizedName,
              email: normalizedEmail,
              role: editDraft.role,
            }
          : user
      )
    );

    setFeedbackMessage(`User ${editingUserId} updated (mock mode).`);
    setEditingUserId(null);
    setEditDraft(null);
  }

  function handleAddUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedbackMessage('');

    const normalizedName = newUserName.trim();
    const normalizedEmail = newUserEmail.trim();

    if (!normalizedName) {
      setFeedbackMessage('User name is required.');
      return;
    }

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setFeedbackMessage('A valid email is required.');
      return;
    }

    // const sessionUser = getUserSession();
    // if (!sessionUser?.user_id) {
    //   setFeedbackMessage('Admin session is required to add users.');
    //   return;
    // }
    // try {
    //   const response = await registerUser({
    //     admin_id: sessionUser.user_id,
    //     email: normalizedEmail,
    //     name: normalizedName,
    //     role_name: newUserRole,
    //   });
    //   setFeedbackMessage(response || `User ${normalizedName} added.`);
    // } catch (error) {
    //   const message =
    //     error instanceof ApiError
    //       ? error.message
    //       : 'Unable to add user right now.';
    //   setFeedbackMessage(message);
    //   return;
    // }

    const nextId = `USR-${String(users.length + 1).padStart(3, '0')}`;
    const nextUser: ManagedUser = {
      user_id: nextId,
      name: normalizedName,
      email: normalizedEmail,
      role: newUserRole,
    };

    setUsers((currentUsers) => [nextUser, ...currentUsers]);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('EMPLOYEE');
    setFeedbackMessage(`User ${normalizedName} added (mock mode).`);
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
              {isLoadingUsers ? '...' : users.length}
            </p>
          </Card>

          <Card variant="soft" padding="md">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Add New User
            </p>
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
              <button
                type="submit"
                className="rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-brand-white transition hover:bg-[#ad2d2d]"
              >
                Add User
              </button>
            </form>
            {feedbackMessage ? (
              <p className="mt-2 text-xs font-semibold text-brand-blue">
                {feedbackMessage}
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
              {filteredUsers.length ? (
                filteredUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td className="px-4 py-3 font-semibold text-brand-blue">
                      {user.user_id}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {editingUserId === user.user_id ? (
                        <input
                          type="text"
                          value={editDraft?.name || ''}
                          onChange={(event) =>
                            setEditDraft((current) =>
                              current
                                ? { ...current, name: event.target.value }
                                : current
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
                        />
                      ) : (
                        user.name
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {editingUserId === user.user_id ? (
                        <input
                          type="email"
                          value={editDraft?.email || ''}
                          onChange={(event) =>
                            setEditDraft((current) =>
                              current
                                ? { ...current, email: event.target.value }
                                : current
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
                        />
                      ) : (
                        user.email
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {editingUserId === user.user_id && editDraft ? (
                        <RoleDropdown
                          value={editDraft.role}
                          onChange={(role) =>
                            setEditDraft((current) =>
                              current ? { ...current, role } : current
                            )
                          }
                          compact
                        />
                      ) : (
                        user.role
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingUserId === user.user_id ? (
                        <button
                          type="button"
                          onClick={confirmEditingRow}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
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
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditingRow(user)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-brand-blue transition hover:border-brand-blue hover:bg-slate-50"
                          aria-label={`Edit ${user.name}`}
                          title="Edit"
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
                        </button>
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
