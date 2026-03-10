import { apiRequest } from './apiClient';

export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'MANAGER';

export type AuthUser = {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
};

type AuthResponse = {
  message: string;
  user: AuthUser;
};

export type RegisterPayload = {
  admin_id: string;
  name: string;
  email: string;
  role_name: UserRole;
  password?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

function readRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function normalizeRole(value: unknown): UserRole {
  const normalized = String(value || 'EMPLOYEE').toUpperCase();

  if (normalized === 'ADMIN' || normalized === 'MANAGER') {
    return normalized;
  }

  return 'EMPLOYEE';
}

export function normalizeAuthUser(value: unknown): AuthUser {
  const record = readRecord(value);

  return {
    user_id:
      String(record?.user_id || record?.id || record?.admin_id || '').trim() ||
      'unknown-user',
    name: String(record?.name || record?.full_name || 'Unknown User').trim(),
    email: String(record?.email || '').trim(),
    role: normalizeRole(record?.role || record?.role_name),
    created_at:
      typeof record?.created_at === 'string' ? record.created_at : undefined,
  };
}

/** Calls the backend registration endpoint and returns the created user payload. */
export async function registerUser(payload: RegisterPayload) {
  const response = await apiRequest<{ message?: string; user?: unknown }>(
    '/api/user/register',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  return {
    message: response.message || 'User created successfully.',
    user: normalizeAuthUser(response.user),
  } as AuthResponse;
}

/** Calls the backend login endpoint and returns the authenticated user payload. */
export async function loginUser(payload: LoginPayload) {
  const response = await apiRequest<{ message?: string; user?: unknown }>(
    '/api/user/login',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  return {
    message: response.message || 'Login successful.',
    user: normalizeAuthUser(response.user),
  } as AuthResponse;
}
