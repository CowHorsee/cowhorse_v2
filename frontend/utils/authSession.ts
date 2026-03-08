import type { AuthUser } from './authApi';

const USER_STORAGE_KEY = 'cowhorse.auth.user';

/** Persists the authenticated user returned by the API in localStorage. */
export function saveUserSession(user: AuthUser) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

/** Reads the persisted user session so pages can render authenticated state. */
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

/** Clears the persisted user session during sign-out or session reset. */
export function clearUserSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(USER_STORAGE_KEY);
}
