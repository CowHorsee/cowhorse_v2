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
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([key, nestedValue]) => {
        if (sensitiveKeys.has(key.toLowerCase())) {
          return [key, '[REDACTED]'];
        }

        return [key, sanitizeValue(nestedValue)];
      }
    );

    return Object.fromEntries(entries);
  }

  return value;
}

function sanitizeBody(body?: string) {
  if (!body) {
    return null;
  }

  try {
    const parsed = JSON.parse(body) as unknown;
    return sanitizeValue(parsed);
  } catch {
    return body;
  }
}

function logApiEvent(
  level: LogLevel,
  message: string,
  details: Record<string, unknown>
) {
  const timestamp = new Date().toISOString();
  const payload = {
    timestamp,
    ...details,
  };

  if (level === 'error') {
    console.error(message, payload);
    return;
  }

  console.info(message, payload);
}

/** Returns the configured API host and leaves same-origin calls relative by default. */
function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
}

/** Builds an absolute or same-origin URL for a frontend API request. */
function buildUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
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
  const method = options.method || 'GET';
  const url = buildUrl(path);
  const startTime = Date.now();

  logApiEvent('info', '[API] Request started', {
    method,
    path,
    url,
    requestBody: sanitizeBody(options.body),
  });

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
