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

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
}

function buildUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
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

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
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

  return (payload as T) ?? ({} as T);
}
