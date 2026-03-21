import { ApiError, apiRequest, readApiEnvelope } from './apiClient';
import { USER_ROLES, type UserRole } from '../constants';

export type { UserRole } from '../constants';

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

type MessageResponse = {
  message: string;
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

export type ForgotPasswordPayload = {
  email: string;
};

export type ChangePasswordPayload = {
  user_id: string;
  old_password: string;
  new_password: string;
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
    return USER_ROLES.ADMIN;
  }

  if (normalized.includes('warehouse')) {
    return USER_ROLES.WAREHOUSE;
  }

  if (normalized.includes('manager')) {
    return USER_ROLES.MANAGER;
  }

  return USER_ROLES.EMPLOYEE;
}

export function normalizeRole(value: unknown): UserRole {
  return mapBackendRole(value || USER_ROLES.EMPLOYEE);
}

export function mapUserRoleToBackendRoleName(role: UserRole): BackendRoleName {
  if (role === USER_ROLES.ADMIN) {
    return 'Admin';
  }

  if (role === USER_ROLES.MANAGER) {
    return 'Procurement Manager';
  }

  if (role === USER_ROLES.WAREHOUSE) {
    return 'Warehouse Personnel';
  }

  return 'Procurement Officer';
}

function normalizeRegisterRoleName(
  roleName: BackendRoleName | UserRole
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

  const envelope = readApiEnvelope<unknown>(response);
  const dataRecord = readRecord(envelope?.data);
  const rawUser = dataRecord || {
    user_id:
      String(payload.email || '')
        .trim()
        .toLowerCase() || 'unknown-user',
    name: payload.name,
    email: payload.email,
    role_name: payload.role_name,
    created_at: undefined,
  };

  return {
    message:
      envelope?.message ||
      (typeof envelope?.data === 'string' && envelope.data) ||
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

  const envelope = readApiEnvelope<unknown>(response);
  const normalizedStatus = envelope?.status?.trim().toLowerCase();

  if (
    normalizedStatus &&
    normalizedStatus !== 'success' &&
    normalizedStatus !== 'ok'
  ) {
    throw new ApiError(envelope?.message || 'Login failed.', 400, null);
  }

  const rawUser = readRecord(envelope?.data) || readRecord(response);
  const normalizedUser = normalizeAuthUser({
    ...rawUser,
    email: payload.email,
  });

  if (!normalizedUser.user_id || normalizedUser.user_id === 'unknown-user') {
    throw new ApiError(envelope?.message || 'Login failed.', 400, null);
  }

  return {
    message: envelope?.message || 'Login successful.',
    user: normalizedUser,
  } as AuthResponse;
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
  const response = await apiRequest<unknown>('/api/user/forget_password', {
    method: 'POST',
    body: JSON.stringify({
      email: payload.email.trim().toLowerCase(),
    }),
  });

  const envelope = readApiEnvelope<unknown>(response);
  const normalizedStatus = envelope?.status?.trim().toLowerCase();
  if (
    normalizedStatus &&
    normalizedStatus !== 'success' &&
    normalizedStatus !== 'ok'
  ) {
    throw new ApiError(
      envelope?.message || 'Unable to reset password.',
      400,
      null
    );
  }

  return {
    message:
      envelope?.message ||
      (typeof envelope?.data === 'string' ? envelope.data : '') ||
      'Password reset successful.',
  } as MessageResponse;
}

export async function changePassword(payload: ChangePasswordPayload) {
  const response = await apiRequest<unknown>('/api/user/change_password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const envelope = readApiEnvelope<unknown>(response);
  const normalizedStatus = envelope?.status?.trim().toLowerCase();
  if (
    normalizedStatus &&
    normalizedStatus !== 'success' &&
    normalizedStatus !== 'ok'
  ) {
    throw new ApiError(
      envelope?.message || 'Unable to change password.',
      400,
      null
    );
  }

  return {
    message:
      envelope?.message ||
      (typeof envelope?.data === 'string' ? envelope.data : '') ||
      'Password changed successfully.',
  } as MessageResponse;
}
