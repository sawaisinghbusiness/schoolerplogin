"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { KeyRound, Loader2, Pencil, Phone, UserX } from "lucide-react";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { Avatar } from "@/components/ui/Avatar";
import { toast } from "@/components/ui/Toaster";
import { ClassItem } from "@/lib/services/classService";
import { Assignment, StaffMember, staffService } from "@/lib/services/staffService";
import { ROLE_INFO, passwordProblem, suggestPassword } from "@/lib/services/userService";
import { IssuedLogin } from "@/components/settings/users/UserDrawer";

const day = (iso: string) => (iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");
const today = () => new Date().toISOString().slice(0, 10);
function yearsSince(iso: string) {
  if (!iso) return "";
  const y = (Date.now() - new Date(iso + "T00:00:00").getTime()) / (365.25 * 86400000);
  return y < 1 ? "less than a year" : `${Math.floor(y)} year${Math.floor(y) === 1 ? "" : "s"}`;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-3 py-2 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-900">{children}</dd>
    </div>
  );
}

/** One staff member: details, what they teach, their login, and leaving. */
export function StaffProfileDrawer({ staff, classes, all, me, focus = null, onClose, onEdit, onChanged, onRemoved, onIssued }: {
  staff: StaffMember | null;
  /** Open straight on "create login" or "classes and subjects". */
  focus?: "login" | "work" | null;
  classes: ClassItem[];
  all: StaffMember[];
  me: string;
  onClose: () => void;
  onEdit: (s: StaffMember) => void;
  onChanged: (s: StaffMember) => void;
  onRemoved: (id: string) => void;
  onIssued: (i: IssuedLogin) => void;
}) {
  const [editingWork, setEditingWork] = useState(false);
  const [ct, setCt] = useState<string>("");
  const [subs, setSubs] = useState<Assignment[]>([]);
  const [pickClass, setPickClass] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [role, setRole] = useState("teacher");
  const [password, setPassword] = useState("");
  const [leaving, setLeaving] = useState(false);
  const [leftOn, setLeftOn] = useState(today());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!staff) return;
    setEditingWork(focus === "work" && (me === "admin" || me === "exam_cell"));
    setCt(staff.classTeacherOf || "");
    setSubs(staff.subjects);
    setPickClass("");
    setLoginOpen(focus === "login" && me === "admin");
    setRole(staff.staffType === "teaching" ? "teacher" : "accountant");
    setPassword(suggestPassword());
    setLeaving(false);
    setLeftOn(today());
    setConfirmDelete(false);
  }, [staff, focus]); // eslint-disable-line react-hooks/exhaustive-deps

  const isAdmin = me === "admin";
  const canAssign = isAdmin || me === "exam_cell";
  const sections = useMemo(() => classes.flatMap((c) => c.sections.map((s) => ({ cls: c.name, classSec: `${c.name} - ${s.name}`, subjects: s.subjects }))), [classes]);
  const ctHolder = (cs: string) => all.find((x) => x.id !== staff?.id && x.classTeacherOf === cs);

  if (!staff) return <SideDrawer isOpen={false} onClose={onClose} title=""><div /></SideDrawer>;
  const left = staff.status === "Relieved";

  const run = async (fn: () => Promise<{ data?: any; error?: string }>, ok: string, after?: (d: any) => void) => {
    setBusy(true);
    const r = await fn();
    setBusy(false);
    if (r.error) return toast(r.error, "error");
    toast(ok, "success");
    after?.(r.data);
  };

  const saveWork = () =>
    run(() => staffService.setAssignments(staff.id, ct || null, subs), "Classes and subjects saved.", (d) => {
      onChanged(d.staff);
      setEditingWork(false);
      if (d.movedFrom) toast(`${ct} was ${d.movedFrom}'s class; it is now ${staff.name}'s.`, "info");
    });

  const makeLogin = () => {
    const weak = passwordProblem(password);
    if (weak) return toast(`Password: ${weak}`, "error");
    run(() => staffService.createLogin(staff.id, role, password), "Login created.", (d) => {
      onChanged(d);
      setLoginOpen(false);
      onIssued({ name: staff.name, loginId: staff.empCode, password, isNew: true });
    });
  };

  const toggleSub = (classSec: string, subject: string) =>
    setSubs((xs) => (xs.some((x) => x.classSec === classSec && x.subject === subject) ? xs.filter((x) => !(x.classSec === classSec && x.subject === subject)) : [...xs, { classSec, subject }]));

  const byClass = subs.reduce<Record<string, string[]>>((m, a) => {
    (m[a.classSec] ||= []).push(a.subject);
    return m;
  }, {});

  return (
    <SideDrawer
      isOpen={!!staff}
      onClose={onClose}
      busy={busy}
      width="max-w-[620px]"
      title={staff.name}
      subtitle={`${staff.empCode} · ${staff.designation}${staff.department ? ` · ${staff.department}` : ""}`}
      footer={
        isAdmin && (
          <>
            {left ? (
              <button type="button" onClick={() => run(() => staffService.rejoin(staff.id), `${staff.name} is back on the staff list.`, onChanged)} disabled={busy} className="btn btn-secondary">
                Rejoined
              </button>
            ) : leaving ? (
              <span className="flex flex-wrap items-center gap-2 text-[13px] text-slate-600">
                Left on
                <input type="date" value={leftOn} max={today()} onChange={(e) => setLeftOn(e.target.value)} className="field field-sm" />
                <button type="button" onClick={() => run(() => staffService.relieve(staff.id, leftOn), `${staff.name} marked as left.`, (d) => { onChanged(d); setLeaving(false); })} disabled={busy} className="btn btn-sm btn-danger">
                  Confirm
                </button>
                <button type="button" onClick={() => setLeaving(false)} className="btn btn-secondary btn-sm">Cancel</button>
              </span>
            ) : (
              <button type="button" onClick={() => setLeaving(true)} className="btn btn-secondary btn-sm text-rose-600">
                <UserX className="h-4 w-4" />
                Mark as left
              </button>
            )}
            {!leaving && (
              <button type="button" onClick={() => onEdit(staff)} className="btn btn-primary ml-auto">
                <Pencil className="h-4 w-4" />
                Edit details
              </button>
            )}
          </>
        )
      }
    >
      <div className="space-y-4 p-5">
        <section className="card flex items-center gap-4 p-4">
          <Avatar name={staff.name} id={staff.id} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold text-slate-900">{staff.name}</p>
            <p className="text-sm text-slate-600">{staff.designation}{staff.staffType === "non_teaching" ? " · non-teaching" : ""}</p>
            <a href={`tel:${staff.mobile}`} className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums text-brand-700 hover:underline">
              <Phone className="h-3.5 w-3.5" />
              {staff.mobile}
            </a>
          </div>
          {left ? <span className="badge badge-slate">Left {day(staff.relievedOn)}</span> : <span className="badge badge-emerald">On staff</span>}
        </section>

        <section className="card px-4 py-2">
          <dl className="divide-y divide-slate-100">
            <Row label="Joined">{staff.joiningDate ? `${day(staff.joiningDate)} · ${yearsSince(staff.joiningDate)}` : ""}</Row>
            <Row label="Qualification">{staff.qualification}</Row>
            <Row label="Experience before">{staff.experienceYears !== null ? `${staff.experienceYears} years` : ""}</Row>
            <Row label="Gender">{staff.gender}</Row>
            <Row label="Date of birth">{day(staff.dob)}</Row>
            <Row label="Other mobile">{staff.altMobile}</Row>
            <Row label="Email">{staff.email}</Row>
            <Row label="Address">{staff.address}</Row>
            <Row label="Notes">{staff.notes}</Row>
          </dl>
        </section>

        {staff.staffType === "teaching" && !left && (
          <section className="card p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900">Classes and subjects</h3>
              {canAssign && !editingWork && (
                <button type="button" onClick={() => setEditingWork(true)} className="text-[13px] font-semibold text-brand-700 hover:underline">Change</button>
              )}
            </div>
            {!editingWork ? (
              staff.classTeacherOf || staff.subjects.length ? (
                <div className="mt-3 space-y-1.5 text-sm">
                  {staff.classTeacherOf && (
                    <p><span className="text-slate-500">Class teacher of</span> <b className="font-semibold text-slate-900">{staff.classTeacherOf}</b></p>
                  )}
                  {Object.keys(byClass).map((cs) => (
                    <p key={cs}><span className="text-slate-500">{cs}:</span> <span className="text-slate-900">{byClass[cs].join(", ")}</span></p>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">Not a class teacher, and no subjects assigned yet.</p>
              )
            ) : (
              <div className="mt-3 space-y-4">
                <div>
                  <label htmlFor="ct" className="field-label">Class teacher of</label>
                  <select id="ct" value={ct} onChange={(e) => setCt(e.target.value)} className="field w-full">
                    <option value="">Not a class teacher</option>
                    {sections.map((s) => {
                      const holder = ctHolder(s.classSec);
                      return (
                        <option key={s.classSec} value={s.classSec}>
                          {s.classSec}{holder ? ` (now ${holder.name})` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <p className="field-label">Subjects taught</p>
                  <select value={pickClass} onChange={(e) => setPickClass(e.target.value)} aria-label="Class" className="field field-sm">
                    <option value="">Choose a class…</option>
                    {classes.filter((c) => c.sections.some((s) => s.subjects.length)).map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  {classes.every((c) => c.sections.every((s) => !s.subjects.length)) && (
                    <p className="mt-2 text-xs text-marigold-800">
                      No class has subjects yet. <Link href="/exams/setup" className="font-semibold underline">Set them in Exam setup</Link>.
                    </p>
                  )}
                  {pickClass && (
                    <div className="mt-3 space-y-2">
                      {sections.filter((s) => s.cls === pickClass).map((s) => (
                        <div key={s.classSec} className="flex flex-wrap items-center gap-1.5">
                          <span className="w-28 shrink-0 text-[13px] font-semibold text-slate-500">{s.classSec}</span>
                          {s.subjects.length === 0 && <span className="text-xs text-slate-400">no subjects</span>}
                          {s.subjects.map((sub) => {
                            const on = subs.some((x) => x.classSec === s.classSec && x.subject === sub);
                            return (
                              <button key={sub} type="button" aria-pressed={on} onClick={() => toggleSub(s.classSec, sub)} className={`rounded-md px-2 py-1 text-xs font-semibold ring-1 ${on ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-slate-700 ring-slate-200 hover:ring-slate-300"}`}>
                                {sub}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                  {subs.length > 0 && <p className="mt-3 text-xs text-slate-500">{subs.length} subject{subs.length === 1 ? "" : "s"} chosen across {Object.keys(byClass).length} section{Object.keys(byClass).length === 1 ? "" : "s"}.</p>}
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => { setEditingWork(false); setCt(staff.classTeacherOf || ""); setSubs(staff.subjects); }} className="btn btn-secondary btn-sm">Cancel</button>
                  <button type="button" onClick={saveWork} disabled={busy} className="btn btn-primary btn-sm">
                    {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Save
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        <section className="card p-4">
          <h3 className="text-sm font-bold text-slate-900">Login</h3>
          {staff.login ? (
            <p className="mt-2 text-sm text-slate-700">
              Signs in with <b className="font-mono">{staff.empCode}</b> or <b className="tabular-nums">{staff.mobile}</b> as <b>{ROLE_INFO[staff.login.role as keyof typeof ROLE_INFO]?.label || staff.login.role}</b>
              {!staff.login.active && <span className="text-rose-600"> · switched off</span>}.{" "}
              {isAdmin && <Link href="/settings/users" className="font-semibold text-brand-700 hover:underline">Manage in Users &amp; roles</Link>}
            </p>
          ) : left ? (
            <p className="mt-2 text-sm text-slate-500">No login.</p>
          ) : !loginOpen ? (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-slate-500">No login yet.{staff.staffType === "teaching" ? " A login lets them mark attendance and enter marks." : ""}</p>
              {isAdmin && (
                <button type="button" onClick={() => setLoginOpen(true)} className="btn btn-secondary btn-sm">
                  <KeyRound className="h-4 w-4" />
                  Create login
                </button>
              )}
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="lg-role" className="field-label">Role</label>
                  <select id="lg-role" value={role} onChange={(e) => setRole(e.target.value)} className="field w-full">
                    {(["teacher", "exam_cell", "accountant", "admin"] as const).map((r) => (
                      <option key={r} value={r}>{ROLE_INFO[r].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="lg-pass" className="field-label">First password</label>
                  <input id="lg-pass" value={password} onChange={(e) => setPassword(e.target.value)} className="field w-full font-mono" autoComplete="off" />
                </div>
              </div>
              <p className="text-xs text-slate-500">{ROLE_INFO[role as keyof typeof ROLE_INFO].can} They sign in with {staff.empCode} or {staff.mobile}.</p>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setLoginOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="button" onClick={makeLogin} disabled={busy} className="btn btn-primary btn-sm">
                  {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Create login
                </button>
              </div>
            </div>
          )}
        </section>

        {isAdmin && !staff.login && (
          <p className="text-center text-xs text-slate-400">
            Added by mistake?{" "}
            {confirmDelete ? (
              <>
                <button type="button" onClick={() => run(() => staffService.remove(staff.id), "Removed.", () => onRemoved(staff.id))} className="font-semibold text-rose-600 hover:underline">Yes, remove {staff.name}</button>
                {" · "}
                <button type="button" onClick={() => setConfirmDelete(false)} className="hover:underline">keep</button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="hover:underline">Remove this entry</button>
            )}
          </p>
        )}
      </div>
    </SideDrawer>
  );
}
