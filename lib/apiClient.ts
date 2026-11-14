/**
 * Central client for the SMS Barmer backend (Express server).
 * All calls send the session cookie (credentials: "include").
 *
 * Base URL comes from NEXT_PUBLIC_API_URL. When it's empty, calls fall back to
 * same-origin ("/api/..."), forwarded to Express by the configured rewrite.
 */

const BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

export interface RequestOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
}

function url(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return BASE ? `${BASE}${p}` : p;
}

async function request<T>(path: string, init?: RequestInit & RequestOptions): Promise<ApiResult<T>> {
  const { timeoutMs = 30_000, signal, ...fetchInit } = init || {};
  const controller = new AbortController();
  let timedOut = false;
  const cancel = () => controller.abort();
  if (signal?.aborted) cancel();
  signal?.addEventListener("abort", cancel, { once: true });
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  try {
    const res = await fetch(url(path), {
      ...fetchInit,
      signal: controller.signal,
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
      if (res.status === 401 && typeof window !== "undefined" && !path.startsWith("/api/auth/") && !path.startsWith("/api/public/")) {
        window.dispatchEvent(new CustomEvent("schooldesk:session-expired"));
      }
      return { ok: false, status: res.status, error: body?.error || body?.message || `HTTP ${res.status}` };
    }
    return { ok: true, status: res.status, data: body as T };
  } catch (err: any) {
    return { ok: false, status: 0, error: timedOut ? "The request timed out. Check the latest record before retrying a payment or submission." : controller.signal.aborted ? "Request cancelled." : err?.message || "Network error" };
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", cancel);
  }
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body !== undefined ? JSON.stringify(body) : undefined }),
  del: <T>(path: string, body?: unknown) => request<T>(path, { method: "DELETE", body: body !== undefined ? JSON.stringify(body) : undefined }),
};

/**
 * Data always comes from the backend: straight to NEXT_PUBLIC_API_URL in development, or
 * through this site's /api pass-through (BACKEND_URL rewrite) in production, where
 * NEXT_PUBLIC_API_URL is left empty on purpose. Tying this to BASE sent the live site to
 * the browser Supabase / demo-data path (students with "STU-1001" ids the backend rejects).
 */
export const usingRemoteBackend = true;
