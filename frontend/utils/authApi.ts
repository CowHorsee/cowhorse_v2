import { apiRequest } from './apiClient';

export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'MANAGER';

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
  role_name: string;
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

export function mapBackendRole(roleName: string): UserRole {
  const normalized = roleName.trim().toLowerCase();

  if (normalized.includes('admin')) {
    return 'ADMIN';
  }

  if (normalized.includes('manager')) {
    return 'MANAGER';
  }

  return 'EMPLOYEE';
}

/** Calls the backend registration endpoint and returns backend message text. */
export function registerUser(payload: RegisterPayload) {
  return apiRequest<string>('/api/user/api_register', {
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
