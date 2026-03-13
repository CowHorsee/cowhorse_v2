import { apiRequest, readApiEnvelope } from './apiClient';
import {
  mapBackendRole,
  mapUserRoleToBackendRoleName,
  normalizeAuthUser,
  type BackendRoleName,
  type RegisterPayload,
  type UserRole,
} from './authApi';
import type { ManagedUser } from '../mockdata/usersData';

type SearchUserRow = {
  user_id?: string;
  name?: string;
  email?: string;
  role_name?: string;
  role?: string;
};

export type SearchUsersFilters = {
  email?: string;
  name?: string;
  role_name?: string | BackendRoleName;
};

function normalizeManagedUser(value: unknown): ManagedUser {
  const user = normalizeAuthUser(value);

  return {
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function normalizeUsersResponse(value: unknown): ManagedUser[] {
  const envelope = readApiEnvelope<unknown>(value);
  const rows = Array.isArray(envelope?.data)
    ? envelope.data
    : Array.isArray(value)
      ? value
      : [];

  if (!rows.length) {
    return [];
  }

  return rows.map(normalizeManagedUser);
}

export async function listUsers(adminId: string) {
  const response = await apiRequest<unknown>('/api/user/list_users', {
    method: 'GET',
    query: { admin_id: adminId },
  });

  return normalizeUsersResponse(response);
}

export async function searchUsers(filters: SearchUsersFilters = {}) {
  const response = await apiRequest<unknown>('/api/user/search_user', {
    method: 'GET',
    query: filters,
  });

  return normalizeUsersResponse(response);
}

export async function createManagedUser(payload: RegisterPayload) {
  const response = await apiRequest<unknown>('/api/user/register', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      role_name: mapUserRoleToBackendRoleName(mapBackendRole(payload.role_name)),
    }),
  });

  const envelope = readApiEnvelope<unknown>(response);

  return {
    message:
      envelope?.message ||
      (typeof envelope?.data === 'string' ? envelope.data : '') ||
      'User created successfully.',
    user: normalizeManagedUser({
      user_id:
        String(payload.email || '')
          .trim()
          .toLowerCase() || 'unknown-user',
      name: payload.name,
      email: payload.email,
      role_name: payload.role_name,
    }),
  };
}

export async function modifyUserRole(payload: {
  admin_id: string;
  user_id: string;
  new_role_name: UserRole | BackendRoleName;
}) {
  const response = await apiRequest<unknown>('/api/user/modify_role', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      new_role_name: mapUserRoleToBackendRoleName(
        mapBackendRole(payload.new_role_name),
      ),
    }),
  });

  const envelope = readApiEnvelope<unknown>(response);

  return {
    message:
      envelope?.message ||
      (typeof envelope?.data === 'string' ? envelope.data : '') ||
      'User role updated successfully.',
    user: null,
  };
}

export function forgetPassword(userId: string) {
  return apiRequest<Record<string, unknown>>('/api/user/forget_password', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}

export function changePassword(payload: {
  user_id: string;
  old_password: string;
  new_password: string;
}) {
  return apiRequest<Record<string, unknown>>('/api/user/change_password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function mapSearchUserRowToUserRecord(
  row: SearchUserRow,
  fallbackIndex: number,
): ManagedUser {
  return {
    user_id: row.user_id || `USR-${String(fallbackIndex + 1).padStart(3, '0')}`,
    name: row.name || 'Unknown User',
    email: row.email || 'unknown@cowhorse.local',
    role: mapBackendRole(row.role_name || row.role || 'Procurement Officer'),
  };
}
