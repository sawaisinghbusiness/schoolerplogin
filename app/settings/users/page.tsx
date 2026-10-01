"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { KeyRound, Lock, Pencil, Plus, Search, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { AppUser, ROLE_INFO, UserRole, userService } from "@/lib/services/userService";
import { IssuedLogin, UserDrawer } from "@/components/settings/users/UserDrawer";
import { IssuedLoginModal, ResetPasswordModal } from "@/components/settings/users/PasswordModals";
import { ChangePasswordModal } from "@/components/layout/ChangePasswordModal";

type Tab = "staff" | "family";
const STAFF_ROLES: UserRole[] = ["admin", "accountant", "teacher", "exam_cell"];

const plainName = (n: string) => n.replace(/\s*\(.*?\)\s*$/, "");
const designation = (n: string) => n.match(/\((.*?)\)\s*$/)?.[1] || "";

function lastSeen(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return `Today, ${d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`;
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[] | null>(null);
  const [denied, setDenied] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [meId, setMeId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("staff");
  const [query, setQuery] = useState("");
  const [drawer, setDrawer] = useState<{ user: AppUser | null } | null>(null);
  const [resetting, setResetting] = useState<AppUser | null>(null);
  const [issued, setIssued] = useState<IssuedLogin | null>(null);
  const [ownOpen, setOwnOpen] = useState(false);

  const load = useCallback(async () => {
    const r = await userService.list();
    if (r.status === 403) return setDenied(true);
    if (r.error) return setLoadError(r.error);
    setLoadError(null);
    setUsers(r.data);
  }, []);

  useEffect(() => {
    load();
    userService.me().then((m) => setMeId(m?.id || null));
  }, [load]);

  const counts = useMemo(() => {
    const c = {} as Record<UserRole, number>;
    for (const u of users || []) if (u.is_active) c[u.role] = (c[u.role] || 0) + 1;
    return c;
  }, [users]);

  const staff = (users || []).filter((u) => ROLE_INFO[u.role]?.staff);
  const family = (users || []).filter((u) => !ROLE_INFO[u.role]?.staff);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (tab === "staff" ? staff : family).filter(
      (u) => !q || u.full_name.toLowerCase().includes(q) || [u.phone_number, u.employee_code, u.admission_no].some((v) => (v || "").toLowerCase().includes(q))
    );
  }, [tab, staff, family, query]);

  const upsert = (u: AppUser) => setUsers((prev) => (prev?.some((x) => x.id === u.id) ? prev.map((x) => (x.id === u.id ? u : x)) : [...(prev || []), u]));

  if (denied) {
    return (
      <div className="space-y-5 pb-12">
        <header className="page-header">
          <div>
            <h1 className="page-title">Users & roles</h1>
            <p className="page-subtitle">Who can sign in, and what they can open</p>
          </div>
        </header>
        <div className="card p-8 text-center">
          <Lock className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">Only an admin can manage user accounts</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">You can still change your own password.</p>
          <button type="button" onClick={() => setOwnOpen(true)} className="btn btn-primary btn-sm mt-4">
            <KeyRound className="h-4 w-4" />
            Change my password
          </button>
        </div>
        <ChangePasswordModal open={ownOpen} onClose={() => setOwnOpen(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-12">
      <header className="page-header">
        <div>
          <h1 className="page-title">Users & roles</h1>
          <p className="page-subtitle">Who can sign in, and what they can open</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setOwnOpen(true)} className="btn btn-secondary">
            <KeyRound className="h-4 w-4" />
            My password
          </button>
          <button type="button" onClick={() => setDrawer({ user: null })} className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Add user
          </button>
        </div>
      </header>

      {/* What each staff role can do, with how many people have it */}
      {/* Phones: the role guide folds away so the list of people comes first */}
      <details className="card group sm:hidden">
        <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-semibold text-slate-900">
          What each role can open
          <span className="text-xs font-medium text-slate-500 group-open:hidden">Show</span>
          <span className="hidden text-xs font-medium text-slate-500 group-open:inline">Hide</span>
        </summary>
        <ul className="divide-y divide-slate-100 border-t border-slate-100">
          {STAFF_ROLES.map((r) => (
            <li key={r} className="px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className={`badge ${ROLE_INFO[r].badge}`}>{ROLE_INFO[r].label}</span>
                <span className="text-xs tabular-nums text-slate-500">{users ? `${counts[r] || 0} active` : "…"}</span>
              </div>
              <p className="mt-1.5 text-[13px] leading-snug text-slate-600">{ROLE_INFO[r].can}</p>
            </li>
          ))}
        </ul>
      </details>

      <section className="hidden gap-3 sm:grid sm:grid-cols-2 xl:grid-cols-4" aria-label="Roles">
        {STAFF_ROLES.map((r) => (
          <div key={r} className="card p-4">
            <div className="flex items-center justify-between gap-2">
              <span className={`badge ${ROLE_INFO[r].badge}`}>{ROLE_INFO[r].label}</span>
              <span className="text-xs tabular-nums text-slate-500">{users ? `${counts[r] || 0} active` : "…"}</span>
            </div>
            <p className="mt-2.5 text-[13px] leading-snug text-slate-600">{ROLE_INFO[r].can}</p>
          </div>
        ))}
      </section>

      {loadError ? (
        <div className="card p-8 text-center">
          <p className="font-semibold text-slate-900">Couldn&apos;t load users</p>
          <p className="mt-1 text-sm text-slate-500">{loadError}</p>
          <button type="button" onClick={load} className="btn btn-secondary btn-sm mt-4">Try again</button>
        </div>
      ) : (
        <section className="card overflow-hidden" aria-label="User accounts">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 p-3 sm:p-4">
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Accounts">
              {([
                { key: "staff", label: "Staff", n: staff.length },
                { key: "family", label: "Parents & students", n: family.length },
              ] as const).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${tab === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {t.label}
                  <span className="tabular-nums text-slate-400">{users ? t.n : "…"}</span>
                </button>
              ))}
            </div>
            <div className="relative ml-auto w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, mobile or ID" aria-label="Search users" className="field field-sm w-full pl-9" />
            </div>
          </div>

          {users === null ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-10 w-full" />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <UserRound className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-800">{query ? "Nothing matches" : tab === "staff" ? "No staff logins yet" : "No parent or student logins yet"}</p>
              <p className="mt-1 text-sm text-slate-500">{query ? "Try another name or number." : tab === "family" ? "Parent logins will be used by the parent app." : "Add one for each person who uses the software."}</p>
            </div>
          ) : (
            <>
            <ul className="divide-y divide-slate-100 sm:hidden">
              {shown.map((u) => (
                <li key={u.id} className={`flex items-center ${u.is_active ? "" : "bg-slate-50/60"}`}>
                  <button type="button" onClick={() => setDrawer({ user: u })} className="m-row flex-1 active:bg-slate-50">
                    <span className="m-row-main">
                      <span className={`m-row-title ${u.is_active ? "" : "text-slate-500"}`}>
                        {plainName(u.full_name)}
                        {u.id === meId && <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">You</span>}
                      </span>
                      <span className="m-row-meta font-mono">{[u.phone_number, u.employee_code, u.admission_no].filter(Boolean).join(" · ")}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className={`badge ${ROLE_INFO[u.role]?.badge || "badge-slate"}`}>{ROLE_INFO[u.role]?.label || u.role}</span>
                      {!u.is_active && <span className="mt-1 block text-xs text-slate-500">Switched off</span>}
                    </span>
                  </button>
                  <button type="button" onClick={() => setResetting(u)} aria-label={`Set a new password for ${plainName(u.full_name)}`} className="flex h-11 w-11 shrink-0 items-center justify-center text-slate-400 active:bg-slate-100">
                    <KeyRound className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead className="table-head">
                  <tr>
                    <th className="px-5 py-3 text-left">Name</th>
                    <th className="px-3 py-3 text-left">Role</th>
                    <th className="px-3 py-3 text-left">Signs in with</th>
                    <th className="hidden px-3 py-3 text-left lg:table-cell">Last sign-in</th>
                    <th className="px-3 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shown.map((u) => {
                    const ids = [u.phone_number, u.employee_code, u.admission_no].filter(Boolean) as string[];
                    return (
                      <tr key={u.id} className={u.is_active ? "" : "bg-slate-50/60"}>
                        <td className="whitespace-nowrap px-5 py-3">
                          <span className={`block font-semibold ${u.is_active ? "text-slate-900" : "text-slate-500"}`}>
                            {plainName(u.full_name)}
                            {u.id === meId && <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">You</span>}
                          </span>
                          {designation(u.full_name) && <span className="block text-xs text-slate-500">{designation(u.full_name)}</span>}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`badge ${ROLE_INFO[u.role]?.badge || "badge-slate"}`}>
                            {u.role === "admin" && <ShieldCheck className="h-3 w-3" />}
                            {ROLE_INFO[u.role]?.label || u.role}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 font-mono text-[13px] text-slate-700">
                          {ids.map((id) => (
                            <span key={id} className="block">{id}</span>
                          ))}
                        </td>
                        <td className="hidden whitespace-nowrap px-3 py-3 text-slate-600 lg:table-cell">{lastSeen(u.last_login)}</td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {u.is_active ? <span className="badge badge-emerald">Active</span> : <span className="badge badge-slate">Switched off</span>}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-right">
                          <button type="button" onClick={() => setResetting(u)} title="Set a new password" aria-label={`Set a new password for ${plainName(u.full_name)}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800">
                            <KeyRound className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => setDrawer({ user: u })} title="Edit" aria-label={`Edit ${plainName(u.full_name)}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800">
                            <Pencil className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </>
          )}
        </section>
      )}

      <UserDrawer
        isOpen={!!drawer}
        user={drawer?.user || null}
        meId={meId}
        onClose={() => setDrawer(null)}
        onSaved={(u, iss) => {
          upsert(u);
          setDrawer(null);
          if (iss) setIssued(iss);
          else toast("Changes saved.", "success");
          if (!ROLE_INFO[u.role].staff) setTab("family");
          else setTab("staff");
        }}
      />
      <ResetPasswordModal
        user={resetting}
        onClose={() => setResetting(null)}
        onDone={(iss) => {
          setResetting(null);
          setIssued(iss);
        }}
      />
      <IssuedLoginModal issued={issued} onClose={() => setIssued(null)} />
      <ChangePasswordModal open={ownOpen} onClose={() => setOwnOpen(false)} />
    </div>
  );
}
