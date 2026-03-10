import fetch from 'isomorphic-unfetch';

type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type QueryValue = string | number | boolean | null | undefined;

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const HEALTH_PATH = '/health';
const HEALTH_CACHE_TTL_MS = 10000;
let lastHealthCheckAt = 0;
let healthCheckPromise: Promise<void> | null = null;

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
  query?: Record<string, QueryValue>;
};

/** Returns the configured API host and defaults to the deployed procurement API. */
function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://web-app-procurement-hba8fbheeea3h6ge.southeastasia-01.azurewebsites.net'
  ).replace(/\/$/, '');
}

/** Builds an absolute URL and serializes supported query parameters. */
function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${getApiBaseUrl()}${normalizedPath}`);

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
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

async function ensureApiServerHealthy(path: string) {
  if (path === HEALTH_PATH) {
    return;
  }

  const now = Date.now();
  if (lastHealthCheckAt && now - lastHealthCheckAt < HEALTH_CACHE_TTL_MS) {
    return;
  }

  if (!healthCheckPromise) {
    healthCheckPromise = (async () => {
      const response = await fetch(buildUrl(HEALTH_PATH), {
        method: 'GET',
      });

      const text = await response.text();
      const payload = tryParseJson(text);
      const status =
        payload &&
        typeof payload === 'object' &&
        !Array.isArray(payload) &&
        'status' in payload &&
        typeof payload.status === 'string'
          ? payload.status.toLowerCase()
          : '';

      if (!response.ok || status !== 'healthy') {
        throw new ApiError(
          'API server is not healthy.',
          response.status,
          payload
        );
      }

      lastHealthCheckAt = Date.now();
    })();
  }

  try {
    await healthCheckPromise;
  } finally {
    healthCheckPromise = null;
  }
}

/** Sends a JSON request to the backend API and throws ApiError on non-2xx responses. */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  await ensureApiServerHealthy(path);

  const response = await fetch(buildUrl(path, options.query), {
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

  return (payload as T) ?? ({} as T);
}
