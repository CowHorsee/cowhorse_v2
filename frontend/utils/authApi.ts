import { apiRequest } from './apiClient';

export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'MANAGER' | 'WAREHOUSE';

export type BackendRoleName =
  | 'Procurement Officer'
  | 'Procurement Manager'
  | 'Warehouse Personnel'
  | 'Supplier'
  | 'Admin';

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
  role_name: BackendRoleName | UserRole;
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

export function mapBackendRole(roleName: unknown): UserRole {
  const normalized = String(roleName || '')
    .trim()
    .toLowerCase();

  if (normalized.includes('admin')) {
    return 'ADMIN';
  }

  if (normalized.includes('warehouse')) {
    return 'WAREHOUSE';
  }

  if (normalized.includes('manager')) {
    return 'MANAGER';
  }

  return 'EMPLOYEE';
}

export function normalizeRole(value: unknown): UserRole {
  return mapBackendRole(value || 'EMPLOYEE');
}

export function mapUserRoleToBackendRoleName(role: UserRole): BackendRoleName {
  if (role === 'ADMIN') {
    return 'Admin';
  }

  if (role === 'MANAGER') {
    return 'Procurement Manager';
  }

  if (role === 'WAREHOUSE') {
    return 'Warehouse Personnel';
  }

  return 'Procurement Officer';
}

function normalizeRegisterRoleName(
  roleName: BackendRoleName | UserRole,
): BackendRoleName {
  if (
    roleName === 'Admin' ||
    roleName === 'Procurement Manager' ||
    roleName === 'Warehouse Personnel' ||
    roleName === 'Procurement Officer' ||
    roleName === 'Supplier'
  ) {
    return roleName;
  }

  return mapUserRoleToBackendRoleName(roleName);
}

export function normalizeAuthUser(value: unknown): AuthUser {
  const record = readRecord(value);
  const email = String(record?.email || '').trim();
  const userId =
    String(record?.user_id || record?.id || record?.admin_id || '').trim() ||
    'unknown-user';

  return {
    user_id: userId,
    name:
      String(record?.name || record?.full_name || '').trim() ||
      email.split('@')[0] ||
      userId,
    email,
    role: normalizeRole(record?.role || record?.role_name),
    created_at:
      typeof record?.created_at === 'string' ? record.created_at : undefined,
  };
}

/** Calls the backend registration endpoint and returns the created user payload. */
export async function registerUser(payload: RegisterPayload) {
  const response = await apiRequest<unknown>('/api/user/register', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      role_name: normalizeRegisterRoleName(payload.role_name),
    }),
  });

  const responseRecord = readRecord(response);
  const rawUser = readRecord(responseRecord?.user) || {
    user_id: responseRecord?.user_id,
    name: payload.name,
    email: payload.email,
    role_name: payload.role_name,
    created_at: responseRecord?.created_at,
  };

  return {
    message:
      (typeof responseRecord?.message === 'string' && responseRecord.message) ||
      (typeof response === 'string' && response) ||
      'User created successfully.',
    user: normalizeAuthUser(rawUser),
  } as AuthResponse;
}

/** Calls the backend login endpoint and returns the authenticated user payload. */
export async function loginUser(payload: LoginPayload) {
  const response = await apiRequest<unknown>('/api/user/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const responseRecord = readRecord(response);
  const rawUser = readRecord(responseRecord?.user) || responseRecord;

  return {
    message:
      (typeof responseRecord?.message === 'string' && responseRecord.message) ||
      'Login successful.',
    user: normalizeAuthUser({
      ...rawUser,
      email: payload.email,
    }),
  } as AuthResponse;
}
