"use client";

import React, { useEffect, useState } from "react";
import { Check, Copy, Loader2, RefreshCw } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { AppUser, passwordProblem, suggestPassword, userService } from "@/lib/services/userService";
import { IssuedLogin } from "./UserDrawer";

/** Set a new password for someone who forgot theirs. */
export function ResetPasswordModal({ user, onClose, onDone }: { user: AppUser | null; onClose: () => void; onDone: (issued: IssuedLogin) => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setPassword(suggestPassword());
      setError(null);
    }
  }, [user]);

  const save = async () => {
    if (!user) return;
    const weak = passwordProblem(password);
    if (weak) return setError(weak);
    setBusy(true);
    const r = await userService.resetPassword(user.id, password);
    setBusy(false);
    if (r.error) return setError(r.error);
    onDone({ name: user.full_name.replace(/\s*\(.*?\)\s*$/, ""), loginId: user.phone_number || user.employee_code || user.admission_no || "", password, isNew: false });
  };

  return (
    <Modal isOpen={!!user} onClose={() => !busy && onClose()} title="Set a new password" subtitle={user ? user.full_name.replace(/\s*\(.*?\)\s*$/, "") : ""} maxWidth="max-w-md">
      <div className="space-y-4 p-5">
        {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100">{error}</p>}
        <div>
          <label htmlFor="rp-pass" className="field-label">New password</label>
          <div className="flex gap-2">
            <input id="rp-pass" value={password} onChange={(e) => setPassword(e.target.value)} className="field w-full font-mono" autoComplete="off" />
            <button type="button" onClick={() => setPassword(suggestPassword())} className="btn btn-secondary shrink-0" title="Suggest another">
              <RefreshCw className="h-4 w-4" />
              New
            </button>
          </div>
          <p className="mt-1.5 text-xs text-slate-500">Their old password stops working at once.</p>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary">Cancel</button>
          <button type="button" onClick={save} disabled={busy} className="btn btn-primary">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Set password
          </button>
        </div>
      </div>
    </Modal>
  );
}

/** Shown once after creating a login or resetting a password, so the office can hand it over. */
export function IssuedLoginModal({ issued, onClose }: { issued: IssuedLogin | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => setCopied(false), [issued]);
  if (!issued) return null;
  const text = `St. Paul School login\nID: ${issued.loginId}\nPassword: ${issued.password}\nPlease change the password after signing in.`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <Modal isOpen onClose={onClose} title={issued.isNew ? "Login created" : "Password changed"} subtitle={`Give these to ${issued.name}`} maxWidth="max-w-sm">
      <div className="space-y-4 p-5">
        <dl className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-slate-50 text-sm">
          <div className="flex justify-between gap-3 px-4 py-2.5">
            <dt className="text-slate-500">Login ID</dt>
            <dd className="font-mono font-semibold text-slate-900">{issued.loginId}</dd>
          </div>
          <div className="flex justify-between gap-3 px-4 py-2.5">
            <dt className="text-slate-500">Password</dt>
            <dd className="font-mono font-semibold text-slate-900">{issued.password}</dd>
          </div>
        </dl>
        <p className="text-xs text-slate-500">This password is not shown again. If it is lost, set a new one.</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={copy} className="btn btn-secondary">
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button type="button" onClick={onClose} className="btn btn-primary">Done</button>
        </div>
      </div>
    </Modal>
  );
}
