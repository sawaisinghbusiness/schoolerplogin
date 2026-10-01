"use client";

import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/Toaster";
import { passwordProblem, userService } from "@/lib/services/userService";

/** Change your own password: needs the current one. */
export function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCurrent("");
      setNext("");
      setAgain("");
      setError(null);
      setShow(false);
    }
  }, [open]);

  const weak = next ? passwordProblem(next) : null;
  const mismatch = again.length > 0 && again !== next;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return setError("Enter your current password.");
    if (weak) return setError(weak);
    if (next !== again) return setError("The two new passwords don't match.");
    setBusy(true);
    setError(null);
    const r = await userService.changeOwnPassword(current, next);
    setBusy(false);
    if (r.error) return setError(r.error);
    toast("Password changed. Use the new one next time you sign in.", "success");
    onClose();
  };

  const type = show ? "text" : "password";
  return (
    <Modal isOpen={open} onClose={() => !busy && onClose()} title="Change password" subtitle="At least 8 characters, with letters and numbers" maxWidth="max-w-md">
      <form onSubmit={save} className="space-y-4 p-5" noValidate>
        {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100">{error}</p>}
        <div>
          <label htmlFor="cp-current" className="field-label">Current password</label>
          <input id="cp-current" type={type} autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className="field w-full" />
        </div>
        <div>
          <label htmlFor="cp-next" className="field-label">New password</label>
          <div className="relative">
            <input id="cp-next" type={type} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className="field w-full pr-10" />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide passwords" : "Show passwords"} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {weak && <p className="mt-1 text-xs text-marigold-800">{weak}</p>}
        </div>
        <div>
          <label htmlFor="cp-again" className="field-label">New password again</label>
          <input id="cp-again" type={type} autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} className="field w-full" />
          {mismatch && <p className="mt-1 text-xs text-rose-600">Doesn&apos;t match the new password.</p>}
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary">Cancel</button>
          <button type="submit" disabled={busy} className="btn btn-primary">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Change password
          </button>
        </div>
      </form>
    </Modal>
  );
}
