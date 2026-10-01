"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Briefcase, ChevronRight, KeyRound, Plus, RefreshCw, Search } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { toast } from "@/components/ui/Toaster";
import { StaffMember, staffService } from "@/lib/services/staffService";
import { ClassItem, classService } from "@/lib/services/classService";
import { ROLE_INFO } from "@/lib/services/userService";
import { StaffFormDrawer } from "@/components/staff/StaffFormDrawer";
import { StaffProfileDrawer } from "@/components/staff/StaffProfileDrawer";
import { ClassTeachersDrawer } from "@/components/staff/ClassTeachersDrawer";
import { IssuedLoginModal } from "@/components/settings/users/PasswordModals";
import { IssuedLogin } from "@/components/settings/users/UserDrawer";

type View = "all" | "teaching" | "non_teaching" | "left";

/** 9000000201 → "90000 00201" */
const phone = (m: string) => (/^\d{10}$/.test(m) ? `${m.slice(0, 5)} ${m.slice(5)}` : m);
const roleLabel = (r: string) => ROLE_INFO[r as keyof typeof ROLE_INFO]?.label || r;

function role(): string {
  try {
    return localStorage.getItem("schooldesk_user_role") || "";
  } catch {
    return "";
  }
}

export default function StaffPage() {
  const [list, setList] = useState<StaffMember[] | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState<View>("all");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<{ staff: StaffMember | null } | null>(null);
  const [open, setOpen] = useState<{ id: string; focus: "login" | "work" | null } | null>(null);
  const [ctOpen, setCtOpen] = useState(false);
  const [issued, setIssued] = useState<IssuedLogin | null>(null);
  const [me, setMe] = useState("");

  const load = useCallback(async () => {
    setRefreshing(true);
    const [r, c] = await Promise.all([staffService.list(), classService.fetchClasses()]);
    setRefreshing(false);
    setSetupNeeded(r.setupNeeded);
    setLoadError(r.error || null);
    setList(r.data);
    setClasses(c.data || []);
  }, []);

  useEffect(() => {
    load();
    setMe(role());
    // /staff?new=1 (old "Add staff" links) opens the form straight away.
    if (new URLSearchParams(window.location.search).get("new") === "1") {
      setForm({ staff: null });
      window.history.replaceState(null, "", "/staff");
    }
  }, [load]);

  const current = (list || []).filter((s) => s.status !== "Relieved");
  const teachers = current.filter((s) => s.staffType === "teaching");
  const counts: Record<View, number> = {
    all: current.length,
    teaching: teachers.length,
    non_teaching: current.length - teachers.length,
    left: (list || []).length - current.length,
  };
  const withLogin = current.filter((s) => s.login).length;
  const sectionTotal = classes.reduce((n, c) => n + c.sections.length, 0);
  const sectionsWithoutCT = useMemo(() => {
    const taken = new Set(teachers.map((s) => s.classTeacherOf).filter(Boolean) as string[]);
    return classes.reduce((n, c) => n + c.sections.filter((s) => !taken.has(`${c.name} - ${s.name}`)).length, 0);
  }, [classes, teachers]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (list || []).filter((s) => {
      if (view === "left" ? s.status !== "Relieved" : s.status === "Relieved") return false;
      if (view === "teaching" && s.staffType !== "teaching") return false;
      if (view === "non_teaching" && s.staffType !== "non_teaching") return false;
      if (!q) return true;
      return [s.name, s.empCode, s.mobile, s.designation, s.department, s.classTeacherOf || ""].some((v) => v.toLowerCase().includes(q));
    });
  }, [list, view, query]);

  const replace = (s: StaffMember) => setList((prev) => (prev?.some((x) => x.id === s.id) ? prev.map((x) => (x.id === s.id ? s : x)) : [...(prev || []), s]));
  const openStaff = (list || []).find((s) => s.id === open?.id) || null;
  const isAdmin = me === "admin";
  const canAssign = isAdmin || me === "exam_cell";
  const showCtColumn = view !== "non_teaching" && view !== "left";

  const TABS: { key: View; label: string }[] = [
    { key: "all", label: "All" },
    { key: "teaching", label: "Teaching" },
    { key: "non_teaching", label: "Non-teaching" },
    { key: "left", label: "Left" },
  ];

  return (
    <div className="space-y-5 pb-12">
      <header className="page-header sm:items-center">
        <div>
          <h1 className="page-title">Staff directory</h1>
          <p className="page-subtitle">{list ? `${counts.all} on staff · ${withLogin} with a login` : "Loading…"}</p>
        </div>
        {isAdmin && !setupNeeded && (
          <button type="button" onClick={() => setForm({ staff: null })} className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Add staff
          </button>
        )}
      </header>

      {setupNeeded || loadError ? (
        <div className="card p-8 text-center">
          <Briefcase className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">{setupNeeded ? "Staff needs a one-time database setup" : "Couldn't load staff"}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">{setupNeeded ? "Run sms backend/supabase/migrations/20261002_staff.sql in the Supabase SQL editor, then check again." : loadError}</p>
          <button type="button" onClick={load} className="btn btn-secondary btn-sm mt-4">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Check again
          </button>
        </div>
      ) : (
        <>
          {/* The one thing to act on, when there is something */}
          {list && teachers.length > 0 && sectionsWithoutCT > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-marigold-200 bg-marigold-50 px-4 py-3 sm:gap-4">
              <AlertTriangle className="h-4 w-4 shrink-0 text-marigold-700" />
              <p className="min-w-0 flex-1 text-sm font-semibold text-marigold-900">
                {sectionsWithoutCT}<span className="hidden sm:inline"> of {sectionTotal}</span> sections have no class teacher
              </p>
              {canAssign && (
                <button type="button" onClick={() => setCtOpen(true)} className="btn btn-sm shrink-0 bg-marigold-800 text-white hover:bg-marigold-900">
                  Assign<span className="hidden sm:inline"> class teachers</span>
                </button>
              )}
            </div>
          )}

          <section className="card overflow-hidden" aria-label="Staff list">
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-200/80 px-4 py-3 sm:px-5">
              <div className="scroll-row max-w-full gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Show">
                {TABS.map((t) => {
                  const on = view === t.key;
                  const n = counts[t.key];
                  return (
                    <button
                      key={t.key}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => setView(t.key)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:py-1.5 ${on ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                    >
                      {t.label}
                      <span className={`tabular-nums ${n === 0 ? "text-slate-300" : on ? "text-slate-500" : "text-slate-400"}`}>{list ? n : "…"}</span>
                    </button>
                  );
                })}
              </div>
              <div className="relative w-full sm:w-auto sm:max-w-[420px] sm:flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, code, mobile or class" aria-label="Search staff" className="field field-sm w-full pl-9 placeholder:text-slate-500" />
              </div>
            </div>

            {list === null ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton h-11 w-full" />
                ))}
              </div>
            ) : shown.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <Briefcase className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 font-semibold text-slate-800">{list.length === 0 ? "No staff added yet" : query ? "Nobody matches" : view === "left" ? "Nobody has left" : "Nobody here yet"}</p>
                <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
                  {list.length === 0 ? "Add each teacher and office staff member once. Then make class teachers, assign subjects and give logins." : "Try another tab or search."}
                </p>
                {list.length === 0 && isAdmin && (
                  <button type="button" onClick={() => setForm({ staff: null })} className="btn btn-primary btn-sm mt-4">
                    <Plus className="h-4 w-4" />
                    Add the first staff member
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Phones */}
                <ul className="divide-y divide-slate-100 sm:hidden">
                  {shown.map((s) => (
                    <li key={s.id}>
                      <button type="button" onClick={() => setOpen({ id: s.id, focus: null })} className="m-row active:bg-slate-50">
                        <Avatar name={s.name} id={s.id} size="sm" neutral />
                        <span className="m-row-main">
                          <span className="m-row-title">{s.name}</span>
                          <span className="m-row-meta">
                            {s.empCode} · {s.designation}
                          </span>
                        </span>
                        <span className="shrink-0 text-right text-[13px]">
                          {s.status === "Relieved" ? (
                            <span className="font-semibold text-slate-600">Left</span>
                          ) : s.classTeacherOf ? (
                            <span className="font-semibold text-slate-800">{s.classTeacherOf}</span>
                          ) : null}
                          <span className={`block text-xs ${s.login ? "text-slate-600" : "font-semibold text-brand-700"}`}>{s.login ? roleLabel(s.login.role) : s.status === "Relieved" ? "" : "No login"}</span>
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Desktop */}
                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full text-sm">
                    <thead className="table-head">
                      <tr>
                        <th className="px-5 py-3 text-left">Staff</th>
                        <th className="px-3 py-3 text-left">Mobile</th>
                        <th className="px-3 py-3 text-left">{showCtColumn ? "Class teacher" : view === "left" ? "Left on" : "Department"}</th>
                        <th className="px-3 py-3 text-left">Login</th>
                        <th className="w-10 py-3 pr-5" aria-hidden />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {shown.map((s) => {
                        const left = s.status === "Relieved";
                        return (
                          <tr
                            key={s.id}
                            tabIndex={0}
                            onClick={() => setOpen({ id: s.id, focus: null })}
                            onKeyDown={(e) => e.key === "Enter" && setOpen({ id: s.id, focus: null })}
                            className="group cursor-pointer transition-colors hover:bg-[#F7F8FB] focus-visible:bg-[#F7F8FB] focus-visible:outline-none"
                          >
                            <td className="px-5 py-3">
                              <span className="flex items-center gap-3">
                                <Avatar name={s.name} id={s.id} size="sm" neutral />
                                <span className="min-w-0">
                                  <span className="block truncate font-semibold text-slate-900 group-hover:text-brand-700">{s.name}</span>
                                  <span className="block text-xs tabular-nums text-slate-500">
                                    {s.empCode} · {s.designation}
                                  </span>
                                </span>
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-3">
                              <a href={`tel:${s.mobile}`} onClick={(e) => e.stopPropagation()} className="tabular-nums text-slate-700 hover:text-brand-700 hover:underline">
                                {phone(s.mobile)}
                              </a>
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                              {left ? (
                                s.relievedOn ? new Date(s.relievedOn + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"
                              ) : !showCtColumn || s.staffType === "non_teaching" ? (
                                <span className="text-slate-600">{s.staffType === "non_teaching" ? s.department || "—" : "—"}</span>
                              ) : s.classTeacherOf ? (
                                <span className="font-medium text-slate-800">{s.classTeacherOf}</span>
                              ) : canAssign ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen({ id: s.id, focus: "work" });
                                  }}
                                  className="rounded-md px-1.5 py-1 text-[13px] font-semibold text-brand-700 hover:bg-brand-50"
                                >
                                  Assign
                                </button>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3">
                              {s.login ? (
                                <span className={`badge ${s.login.active ? "badge-emerald" : "badge-slate"}`}>
                                  {roleLabel(s.login.role)}
                                  {!s.login.active && " · off"}
                                </span>
                              ) : left ? (
                                <span className="text-slate-500">—</span>
                              ) : isAdmin ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen({ id: s.id, focus: "login" });
                                  }}
                                  className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
                                >
                                  <KeyRound className="h-3.5 w-3.5" />
                                  Create login
                                </button>
                              ) : (
                                <span className="text-slate-600">No login</span>
                              )}
                            </td>
                            <td className="py-3 pr-5 text-right">
                              <ChevronRight className="ml-auto h-4 w-4 text-slate-300 group-hover:text-brand-600" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="border-t border-slate-100 px-5 py-2.5 text-[13px] tabular-nums text-slate-600">
                  {shown.length} {shown.length === 1 ? "person" : "people"}
                  {query ? ` match “${query}”` : ""}
                </p>
              </>
            )}
          </section>
        </>
      )}

      <StaffFormDrawer
        isOpen={!!form}
        staff={form?.staff || null}
        onClose={() => setForm(null)}
        onSaved={(s) => {
          replace(s);
          setForm(null);
          setOpen({ id: s.id, focus: null });
        }}
      />
      <StaffProfileDrawer
        staff={form ? null : openStaff}
        focus={open?.focus || null}
        classes={classes}
        all={list || []}
        me={me}
        onClose={() => setOpen(null)}
        onEdit={(s) => setForm({ staff: s })}
        onChanged={(s) => {
          replace(s);
          // A class-teacher change can move a section away from someone else.
          if (s.classTeacherOf) setList((prev) => (prev || []).map((x) => (x.id !== s.id && x.classTeacherOf === s.classTeacherOf ? { ...x, classTeacherOf: null } : x)));
        }}
        onRemoved={(id) => {
          setList((prev) => (prev || []).filter((x) => x.id !== id));
          setOpen(null);
        }}
        onIssued={setIssued}
      />
      <ClassTeachersDrawer
        isOpen={ctOpen}
        onClose={() => setCtOpen(false)}
        classes={classes}
        staff={list || []}
        onSaved={(n) => {
          setCtOpen(false);
          toast(`Class teachers saved (${n} changed).`, "success");
          load();
        }}
      />
      <IssuedLoginModal issued={issued} onClose={() => setIssued(null)} />
    </div>
  );
}
