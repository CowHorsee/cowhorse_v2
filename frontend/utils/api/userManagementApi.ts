import { apiRequest } from './apiClient';
import { mapBackendRole, type UserRole } from './authApi';

type SearchUserRow = {
  user_id?: string;
  name?: string;
  email?: string;
  role_name?: string;
  role?: string;
};

export type UserRecord = {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
};

export function searchUsers(params: {
  email?: string;
  name?: string;
  role_name?: string;
} = {}) {
  const query = new URLSearchParams();

  if (params.email) {
    query.set('email', params.email);
  }
  if (params.name) {
    query.set('name', params.name);
  }
  if (params.role_name) {
    query.set('role_name', params.role_name);
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiRequest<SearchUserRow[]>(`/api/user/search_user${suffix}`);
}

export function modifyUserRole(payload: {
  admin_id: string;
  user_id: string;
  new_role_name: string;
}) {
  return apiRequest<string>('/api/user/modify_role', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function mapSearchUserRowToUserRecord(
  row: SearchUserRow,
  fallbackIndex: number
): UserRecord {
  return {
    user_id: row.user_id || `USR-${String(fallbackIndex + 1).padStart(3, '0')}`,
    name: row.name || 'Unknown User',
    email: row.email || 'unknown@cowhorse.local',
    role: mapBackendRole(row.role_name || row.role || 'EMPLOYEE'),
  };
}
