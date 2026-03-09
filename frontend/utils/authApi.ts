import { apiRequest } from './api/apiClient';

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

export type RegisterPayload = {
  admin_id: string;
  name: string;
  email: string;
  role_name: BackendRoleName;
  password?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  role: string;
  user_id: string;
  message: string;
};

export type ForgetPasswordPayload = {
  user_id: string;
};

export type ChangePasswordPayload = {
  user_id: string;
  old_password: string;
  new_password: string;
};

export function mapBackendRole(roleName: string): UserRole {
  const normalized = roleName.trim().toLowerCase();

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

/** Calls the backend registration endpoint and returns backend message text. */
export function registerUser(payload: RegisterPayload) {
  return apiRequest<string>('/api/user/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Calls backend login endpoint and returns user_id, role and message. */
export function loginUser(payload: LoginPayload) {
  return apiRequest<LoginResponse>('/api/user/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function requestPasswordReset(payload: ForgetPasswordPayload) {
  return apiRequest<string>('/api/user/forget_password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function changePassword(payload: ChangePasswordPayload) {
  return apiRequest<string>('/api/user/change_password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
