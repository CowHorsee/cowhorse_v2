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

type LogLevel = 'info' | 'error';

const sensitiveKeys = new Set([
  'password',
  'old_password',
  'new_password',
  'password_hash',
  'raw_password',
]);

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => {
        if (sensitiveKeys.has(key.toLowerCase())) {
          return [key, '[REDACTED]'];
        }

        return [key, sanitizeValue(nestedValue)];
      })
    );
  }

  return value;
}

function sanitizeBody(body?: string) {
  if (!body) {
    return null;
  }

  try {
    return sanitizeValue(JSON.parse(body) as unknown);
  } catch {
    return body;
  }
}

function logApiEvent(
  level: LogLevel,
  message: string,
  details: Record<string, unknown>
) {
  const payload = {
    timestamp: new Date().toISOString(),
    ...details,
  };

  if (level === 'error') {
    console.error(message, payload);
    return;
  }

  console.info(message, payload);
}

/** Returns configured API host and defaults to deployed API. */
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
        throw new ApiError('API server is not healthy.', response.status, payload);
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

/** Sends JSON request and throws ApiError on non-2xx. */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const method = options.method || 'GET';
  const url = buildUrl(path, options.query);
  const startTime = Date.now();

  logApiEvent('info', '[API] Request started', {
    method,
    path,
    url,
    requestBody: sanitizeBody(options.body),
  });

  await ensureApiServerHealthy(path);

  const response = await fetch(url, {
    method,
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
  const durationMs = Date.now() - startTime;

  if (!response.ok) {
    logApiEvent('error', '[API] Request failed', {
      method,
      path,
      url,
      status: response.status,
      durationMs,
      errorMessage,
      responsePayload: payload,
    });

    throw new ApiError(errorMessage, response.status, payload);
  }

  logApiEvent('info', '[API] Request succeeded', {
    method,
    path,
    url,
    status: response.status,
    durationMs,
    responsePayload: payload ?? text ?? null,
  });

  if (payload !== null) {
    return payload as T;
  }

  if (text) {
    return text as unknown as T;
  }

  return {} as T;
}
