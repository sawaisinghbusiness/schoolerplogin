"use client";
import { useCallback } from 'react';
import { toast as notify } from '@/components/ui/Toaster';
export function toast(ok: boolean, text: string) { notify(text, ok ? 'success' : 'error'); }
export function useToastMsg() { return useCallback((m: {
    ok: boolean;
    text: string;
} | string | null) => { if (m)
    typeof m === 'string' ? toast(false, m) : toast(m.ok, m.text); }, []); }
