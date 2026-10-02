/**
 * Central client for the SMS Barmer backend (Express server).
 * All calls send the session cookie (credentials: "include").
 *
 * Base URL comes from NEXT_PUBLIC_API_URL. When it's empty, calls fall back to
 * same-origin ("/api/..."), which keeps the app working against the built-in
 * Next.js routes during the transition.
 */

const BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

function url(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return BASE ? `${BASE}${p}` : p;
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url(path), {
      ...init,
      credentials: "include",
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...(init?.headers || {}),
      },
    });

    let body: any = null;
    const text = await res.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }

    if (!res.ok) {
      return { ok: false, status: res.status, error: body?.error || body?.message || `HTTP ${res.status}` };
    }
    return { ok: true, status: res.status, data: body as T };
  } catch (err: any) {
    return { ok: false, status: 0, error: err?.message || "Network error" };
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body !== undefined ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

/**
 * Data always comes from the backend: straight to NEXT_PUBLIC_API_URL in development, or
 * through this site's /api pass-through (BACKEND_URL rewrite) in production, where
 * NEXT_PUBLIC_API_URL is left empty on purpose. Tying this to BASE sent the live site to
 * the browser Supabase / demo-data path (students with "STU-1001" ids the backend rejects).
 */
export const usingRemoteBackend = true;
