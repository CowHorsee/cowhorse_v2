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
  name: string;
  email: string;
  role: UserRole;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

/** Calls backend register endpoint and returns the created user payload. */
export function registerUser(payload: RegisterPayload) {
  return apiRequest<AuthResponse>('/api/user/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Calls backend login endpoint and returns authenticated user payload. */
export function loginUser(payload: LoginPayload) {
  return apiRequest<AuthResponse>('/api/user/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
