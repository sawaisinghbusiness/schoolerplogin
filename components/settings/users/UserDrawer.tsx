"use client";

import React, { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { AppUser, ROLE_INFO, ROLE_ORDER, UserRole, passwordProblem, suggestPassword, userService } from "@/lib/services/userService";

export interface IssuedLogin {
  name: string;
  loginId: string;
  password: string;
  isNew: boolean;
}

/** Add a new login, or edit someone's name, role, login IDs and on/off switch. */
export function UserDrawer({
  isOpen,
  onClose,
  user,
  meId,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: AppUser | null;
  meId: string | null;
  onSaved: (u: AppUser, issued?: IssuedLogin) => void;
}) {
  const isNew = !user;
  const isMe = !!user && user.id === meId;
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("teacher");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [adm, setAdm] = useState("");
  const [active, setActive] = useState(true);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(user?.full_name.replace(/\s*\(.*?\)\s*$/, "") || "");
    setRole(user?.role || "teacher");
    setPhone(user?.phone_number || "");
    setCode(user?.employee_code || "");
    setAdm(user?.admission_no || "");
    setActive(user ? user.is_active : true);
    setPassword(user ? "" : suggestPassword());
    setError(null);
  }, [isOpen, user]);

  const family = !ROLE_INFO[role].staff;

  const save = async () => {
    if (name.trim().length < 2) return setError("Enter the person's full name.");
    if (phone && !/^[6-9]\d{9}$/.test(phone.trim())) return setError("Enter a 10-digit mobile number.");
    if (!phone.trim() && !code.trim() && !adm.trim()) return setError(family ? "Give the admission no. or a mobile number to sign in with." : "Give a mobile number or staff code to sign in with.");
    if (isNew) {
      const weak = passwordProblem(password);
      if (weak) return setError(`Password: ${weak}`);
    }
    setBusy(true);
    setError(null);
    // Keep the full name's old "(Designation)" suffix if the name itself was not changed.
    const keepSuffix = user && user.full_name.replace(/\s*\(.*?\)\s*$/, "") === name.trim() ? user.full_name : name.trim();
    const body = {
      full_name: keepSuffix,
      role,
      phone_number: phone.trim(),
      employee_code: family ? (user?.employee_code || "") : code.trim(),
      admission_no: family ? adm.trim() : (user?.admission_no || ""),
      ...(isNew ? { password } : { is_active: active }),
    };
    const r = isNew ? await userService.create(body) : await userService.update(user!.id, body);
    setBusy(false);
    if (r.error || !r.data) return setError(r.error || "Could not save.");
    const loginId = r.data.phone_number || r.data.employee_code || r.data.admission_no || "";
    onSaved(r.data, isNew ? { name: name.trim(), loginId, password, isNew: true } : undefined);
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      busy={busy}
      title={isNew ? "Add a user" : name || "Edit user"}
      subtitle={isNew ? "Gives someone their own login" : `${ROLE_INFO[user!.role].label} · ${user!.is_active ? "Active" : "Switched off"}`}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary ml-auto">Cancel</button>
          <button type="button" onClick={save} disabled={busy} className="btn btn-primary">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {isNew ? "Create login" : "Save changes"}
          </button>
        </>
      }
    >
      <div className="space-y-5 p-5">
        {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100">{error}</p>}

        <section className="card space-y-4 p-4">
          <div>
            <label htmlFor="u-name" className="field-label">Full name</label>
            <input id="u-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sunita Sharma" className="field w-full" />
          </div>
        </section>

        <section className="card p-4">
          <h3 className="text-sm font-bold text-slate-900">Role</h3>
          <p className="mb-3 text-xs text-slate-500">{isMe ? "You can't change your own role. Another admin can." : "Decides which screens they can open."}</p>
          <div className="space-y-2" role="radiogroup" aria-label="Role">
            {ROLE_ORDER.map((r) => {
              const on = role === r;
              return (
                <label
                  key={r}
                  className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-2.5 transition ${on ? "border-brand-500 bg-brand-50/60 ring-1 ring-brand-500" : "border-slate-200 hover:border-slate-300"} ${isMe && !on ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <input type="radio" name="u-role" className="mt-0.5 accent-brand-600" checked={on} disabled={isMe} onChange={() => setRole(r)} />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-slate-900">
                      {ROLE_INFO[r].label}
                      {!ROLE_INFO[r].staff && <span className="ml-1.5 font-normal text-slate-400">· family</span>}
                    </span>
                    <span className="block text-xs text-slate-500">{ROLE_INFO[r].can}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <section className="card space-y-4 p-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Sign-in ID</h3>
            <p className="text-xs text-slate-500">They can sign in with any one of these.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="u-phone" className="field-label">Mobile number</label>
              <input id="u-phone" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="10 digits" className="field w-full" />
            </div>
            {family ? (
              <div>
                <label htmlFor="u-adm" className="field-label">Admission no.</label>
                <input id="u-adm" value={adm} onChange={(e) => setAdm(e.target.value.toUpperCase())} placeholder="e.g. ADM-9102" className="field w-full" />
              </div>
            ) : (
              <div>
                <label htmlFor="u-code" className="field-label">Staff code</label>
                <input id="u-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. EMP-014" className="field w-full" />
              </div>
            )}
          </div>
        </section>

        {isNew ? (
          <section className="card p-4">
            <label htmlFor="u-pass" className="field-label">First password</label>
            <div className="flex gap-2">
              <input id="u-pass" value={password} onChange={(e) => setPassword(e.target.value)} className="field w-full font-mono" autoComplete="off" />
              <button type="button" onClick={() => setPassword(suggestPassword())} className="btn btn-secondary shrink-0" title="Suggest another">
                <RefreshCw className="h-4 w-4" />
                New
              </button>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">Tell them this password; they can change it from their profile menu.</p>
          </section>
        ) : (
          <section className="card flex items-start gap-3 p-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-slate-900">Can sign in</h3>
              <p className="text-xs text-slate-500">
                {isMe ? "You can't switch off your own account." : active ? "Switch off when someone leaves; their records stay." : "Switched off: they cannot sign in, and any open session stops."}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={active}
              aria-label="Can sign in"
              disabled={isMe}
              onClick={() => setActive((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${active ? "bg-emerald-600" : "bg-slate-300"} disabled:opacity-50`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${active ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </section>
        )}
      </div>
    </SideDrawer>
  );
}
