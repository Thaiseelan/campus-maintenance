// ─── Central HTTP Client ──────────────────────────────────────────────────────
// All communication with the Spring Boot backend goes through this module.
// JWT is stored in localStorage under JWT_KEY and attached to every request
// that requires authentication.
// DO NOT import or use Supabase anywhere in this file.

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8080';
const JWT_KEY = 'bit_maint_jwt';

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  try {
    return localStorage.getItem(JWT_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(JWT_KEY, token);
  } catch {
    // ignore storage errors
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(JWT_KEY);
  } catch {
    // ignore
  }
}

// ─── Base URL export ─────────────────────────────────────────────────────────

export { BASE_URL };

// ─── Error parsing ────────────────────────────────────────────────────────────

async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.message === 'string' && body.message) return body.message;
    if (typeof body?.error === 'string') return body.error;
  } catch {
    // body was not JSON — fall through
  }
  return `HTTP ${res.status} ${res.statusText}`;
}

// ─── Core request ─────────────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {};

  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearToken();
    const msg = await parseError(res);
    throw new Error(msg || 'Session expired. Please sign in again.');
  }

  if (res.status === 403) {
    const msg = await parseError(res);
    throw new Error(msg || 'You do not have permission to perform this action.');
  }

  if (!res.ok) {
    const msg = await parseError(res);
    throw new Error(msg || `Request failed with status ${res.status}`);
  }

  // 204 No Content or 200 with empty body
  const text = await res.text();
  if (!text) return undefined as unknown as T;

  return JSON.parse(text) as T;
}

// ─── Multipart/form-data request ──────────────────────────────────────────────
// Do NOT set Content-Type manually — browser sets it automatically including
// the required boundary parameter.

async function requestFormData<T>(
  method: string,
  path: string,
  formData: FormData,
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {};

  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: formData,
  });

  if (res.status === 401) {
    clearToken();
    const msg = await parseError(res);
    throw new Error(msg || 'Session expired. Please sign in again.');
  }

  if (res.status === 403) {
    const msg = await parseError(res);
    throw new Error(msg || 'You do not have permission to perform this action.');
  }

  if (!res.ok) {
    const msg = await parseError(res);
    throw new Error(msg || `Request failed with status ${res.status}`);
  }

  const text = await res.text();
  if (!text) return undefined as unknown as T;

  return JSON.parse(text) as T;
}

// ─── Public HTTP methods ──────────────────────────────────────────────────────

export const http = {
  get: <T>(path: string, auth = true): Promise<T> =>
    request<T>('GET', path, undefined, auth),

  post: <T>(path: string, body: unknown, auth = true): Promise<T> =>
    request<T>('POST', path, body, auth),

  put: <T>(path: string, body?: unknown, auth = true): Promise<T> =>
    request<T>('PUT', path, body, auth),

  patch: <T>(path: string, body: unknown, auth = true): Promise<T> =>
    request<T>('PATCH', path, body, auth),

  del: <T>(path: string, auth = true): Promise<T> =>
    request<T>('DELETE', path, undefined, auth),

  postForm: <T>(path: string, formData: FormData, auth = true): Promise<T> =>
    requestFormData<T>('POST', path, formData, auth),

  patchForm: <T>(path: string, formData: FormData, auth = true): Promise<T> =>
    requestFormData<T>('PATCH', path, formData, auth),
};
