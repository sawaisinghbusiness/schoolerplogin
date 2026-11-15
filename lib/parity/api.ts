"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api as backend } from "@/lib/apiClient";
export class ApiError extends Error {
    constructor(public status: number, message: string) { super(message); }
}
export function erpApiPath(path: string) { if (path.startsWith('/erp/'))
    return '/api' + path.slice(4); if (path.startsWith('/api/'))
    return path; throw new ApiError(400, 'An ERP API route is required.'); }
export async function api<T>(path: string, init?: {
    method?: string;
    body?: unknown;
    timeoutMs?: number;
}): Promise<T> { const route = erpApiPath(path), method = init?.method || (init?.body ? 'POST' : 'GET'); const options = { timeoutMs: init?.timeoutMs }; let r; switch (method) {
    case 'GET':
        r = await backend.get<T>(route, options);
        break;
    case 'POST':
        r = await backend.post<T>(route, init?.body, options);
        break;
    case 'PUT':
        r = await backend.put<T>(route, init?.body, options);
        break;
    case 'PATCH':
        r = await backend.patch<T>(route, init?.body, options);
        break;
    case 'DELETE':
        r = await backend.del<T>(route, undefined, options);
        break;
    default: throw new ApiError(400, 'Unsupported ERP request.');
} if (!r.ok)
    throw new ApiError(r.status, r.error || 'The request could not be completed.'); return r.data as T; }
export function useApi<T>(path: string | null) { const [data, setData] = useState<T>(); const [error, setError] = useState<ApiError | null>(null); const [loading, setLoading] = useState(!!path); const version = useRef(0); const load = useCallback(async () => { if (!path)
    return; const v = ++version.current; setLoading(true); try {
    const next = await api<T>(path);
    if (version.current === v) {
        setData(next);
        setError(null);
    }
}
catch (e) {
    if (version.current === v)
        setError(e instanceof ApiError ? e : new ApiError(0, 'Could not load this information.'));
}
finally {
    if (version.current === v)
        setLoading(false);
} }, [path]); useEffect(() => { setData(undefined); setError(null); void load(); return () => { version.current++; }; }, [load]); return { data, error, loading, stale: false, reload: load }; }
