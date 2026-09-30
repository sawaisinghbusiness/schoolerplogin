"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { authService } from "@/lib/services/authService";

interface SignOutDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SignOutDialog({ open, onClose }: SignOutDialogProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  const signOut = async () => {
    setBusy(true);
    // Clear the httpOnly session cookie on the backend, then local display data.
    await authService.logout();
    try {
      localStorage.removeItem("schooldesk_user_role");
      localStorage.removeItem("schooldesk_user_id");
      localStorage.removeItem("schooldesk_user_name");
      sessionStorage.clear();
    } catch {
      // ignore
    }
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/50 animate-fadeIn" onClick={() => !busy && onClose()} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signout-title"
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-scaleUp"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
          <LogOut className="h-5 w-5" />
        </div>
        <h3 id="signout-title" className="mt-4 text-base font-bold text-slate-900">
          Sign out of SchoolDesk?
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
          You&apos;ll need your mobile number and password to sign back in. Unsaved changes on this page will be lost.
        </p>
        <div className="mt-6 flex gap-2.5">
          <button
            onClick={onClose}
            disabled={busy}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Stay signed in
          </button>
          <button
            onClick={signOut}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-70"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {busy ? "Signing out" : "Sign out"}
          </button>
        </div>
      </div>
    </div>
  );
}
