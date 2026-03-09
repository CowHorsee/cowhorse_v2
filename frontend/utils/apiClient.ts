import fetch from 'isomorphic-unfetch';

type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export class ApiError extends Error {
  status: number;
  payload: JsonValue | null;

  /** Carries API status and parsed response payload for failed requests. */
  constructor(message: string, status: number, payload: JsonValue | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

type ApiRequestOptions = {
  method?: ApiMethod;
  body?: string;
  headers?: Record<string, string>;
};

/** Returns the configured API host and leaves same-origin calls relative by default. */
function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
}

/** Builds an absolute or same-origin URL for a frontend API request. */
function buildUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}

function isLiveApiEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_API_CALLS === 'true';
}

/** Parses JSON responses safely and falls back to null for non-JSON bodies. */
function tryParseJson(text: string): JsonValue | null {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as JsonValue;
  } catch {
    return null;
  }
}

/**
 * Sends a JSON request to the backend API and throws ApiError on non-2xx responses.
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  if (!isLiveApiEnabled()) {
    throw new ApiError(
      'Live API calls are disabled. Set NEXT_PUBLIC_ENABLE_API_CALLS=true after backend endpoints are available.',
      503,
      null
    );
  }

  const response = await fetch(buildUrl(path), {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body,
  });

  const text = await response.text();
  const payload = tryParseJson(text);
  const errorMessage =
    (payload &&
      typeof payload === 'object' &&
      !Array.isArray(payload) &&
      'message' in payload &&
      typeof payload.message === 'string' &&
      payload.message) ||
    text ||
    'Request failed';

  if (!response.ok) {
    throw new ApiError(errorMessage, response.status, payload);
  }

  if (payload !== null) {
    return payload as T;
  }

  if (text) {
    return text as unknown as T;
  }

  return {} as T;
}
