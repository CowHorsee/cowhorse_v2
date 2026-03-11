import type { AuthUser } from './authApi';
import type { PurchaseRequest } from './mockdata/purchaseRequestsData';

const USER_STORAGE_KEY = 'cowhorse.auth.user';
const CREATED_PR_STORAGE_KEY = 'cowhorse.pr.created';

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

/** Persists mock-created PR rows so they appear back on the PR board. */
export function saveCreatedPurchaseRequest(request: PurchaseRequest) {
  if (typeof window === 'undefined') {
    return;
  }

  const current = getCreatedPurchaseRequests();
  const withoutDuplicate = current.filter((item) => item.id !== request.id);
  const next = [request, ...withoutDuplicate];
  window.localStorage.setItem(CREATED_PR_STORAGE_KEY, JSON.stringify(next));
}

/** Reads mock-created PR rows created from the PR create page. */
export function getCreatedPurchaseRequests(): PurchaseRequest[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(CREATED_PR_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is PurchaseRequest => {
      return (
        item &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.department === 'string' &&
        typeof item.requester === 'string' &&
        typeof item.vendor === 'string' &&
        typeof item.amount === 'number' &&
        typeof item.status === 'string' &&
        typeof item.updatedAt === 'string' &&
        typeof item.description === 'string'
      );
    });
  } catch {
    return [];
  }
}
