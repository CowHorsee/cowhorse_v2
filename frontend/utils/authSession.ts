import type { AuthUser } from './authApi';

const USER_STORAGE_KEY = 'cowhorse.auth.user';

export function saveUserSession(user: AuthUser) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function getUserSession(): AuthUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawUser = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
}

export function clearUserSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(USER_STORAGE_KEY);
}
