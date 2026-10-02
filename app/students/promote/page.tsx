"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Loader2, Users } from "lucide-react";
import { Student } from "@/data/mockData";
import { studentService } from "@/lib/services/studentService";
import { nextClass } from "@/lib/words";
import { toast } from "@/components/ui/Toaster";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/modal";

type Tab = "promote" | "section";
type Decision = "promote" | "detain" | "left";

const CLASS_ORDER = ["Pre Nursery", "Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
const rank = (c: string) => (CLASS_ORDER.indexOf(c) === -1 ? 99 : CLASS_ORDER.indexOf(c));
const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
const byRoll = (a: Student, b: Student) => (a.rollNo || "").localeCompare(b.rollNo || "", undefined, { numeric: true }) || a.name.localeCompare(b.name);

export default function PromotePage() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [tab, setTab] = useState<Tab>("promote");

  const load = async () => {
    const res = await studentService.fetchStudents();
    setStudents(res.data.filter((s) => s.status !== "Inactive"));
  };
  useEffect(() => {
    load();
  }, []);

  /** class -> its sections, from the students actually enrolled */
  const structure = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const s of students || []) {
      if (!m.has(s.class)) m.set(s.class, new Set());
      m.get(s.class)!.add(s.section);
    }
    return Array.from(m.entries())
      .sort((a, b) => rank(a[0]) - rank(b[0]))
      .map(([cls, secs]) => ({ cls, sections: Array.from(secs).sort() }));
  }, [students]);

  return (
    <div className="space-y-5 pb-44 md:pb-28">
      <header className="page-header">
        <div>
          <h1 className="page-title">Promote &amp; transfer</h1>
          <p className="page-subtitle">Move a whole section to the next class at the end of the session, or shift students between sections</p>
        </div>
      </header>

      <div className="flex w-fit gap-1 rounded-xl bg-slate-200/60 p-1" role="tablist">
        {[
          { key: "promote" as Tab, label: "Promote to next class" },
          { key: "section" as Tab, label: "Change section" },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-2 text-[13.5px] font-semibold transition ${tab === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {students === null ? (
        <div className="card space-y-3 p-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-11 w-full" />
          ))}
        </div>
      ) : tab === "promote" ? (
        <PromoteTab students={students} structure={structure} onDone={load} />
      ) : (
        <SectionTab students={students} structure={structure} onDone={load} />
      )}
    </div>
  );
}

type Structure = { cls: string; sections: string[] }[];

/* ───────────────────────────── Promote ───────────────────────────── */

function PromoteTab({ students, structure, onDone }: { students: Student[]; structure: Structure; onDone: () => void }) {
  // Nothing is pre-selected: promotion moves a whole section, so the office must pick it on purpose.
  const [from, setFrom] = useState("");
  const [fromCls, fromSec] = from ? from.split("|") : ["", ""];
  const toCls = fromCls ? nextClass(fromCls) : "";
  const toSections = structure.find((x) => x.cls === toCls)?.sections || (toCls ? ["A"] : []);
  const [toSec, setToSec] = useState("");
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [confirm, setConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const list = useMemo(() => students.filter((s) => s.class === fromCls && s.section === fromSec).sort(byRoll), [students, fromCls, fromSec]);

  // New source: everyone defaults to Promote, and the target section mirrors the current one when it exists.
  useEffect(() => {
    setDecisions(Object.fromEntries(list.map((s) => [s.id, "promote" as Decision])));
    setToSec(toSections.includes(fromSec) ? fromSec : toSections[0] || "");
  }, [from, students]); // eslint-disable-line react-hooks/exhaustive-deps

  const count = (d: Decision) => list.filter((s) => (decisions[s.id] || "promote") === d).length;
  const passOut = !!fromCls && !toCls; // 12th: promotion means passing out of school
  const setAll = (d: Decision) => setDecisions(Object.fromEntries(list.map((s) => [s.id, d])));
  const dueCount = list.filter((s) => s.balanceFee > 0 && (decisions[s.id] || "promote") !== "detain").length;

  const apply = async () => {
    const moves = list
      .map((s) => {
        const d = decisions[s.id] || "promote";
        if (d === "detain") return null;
        if (d === "left" || passOut) return { id: s.id, status: "Inactive" as const };
        return { id: s.id, class: toCls, section: toSec };
      })
      .filter(Boolean) as { id: string; class?: string; section?: string; status?: "Inactive" }[];
    if (!moves.length) {
      setConfirm(false);
      return toast("Nobody to move: everyone is marked Detain.", "info");
    }
    setSaving(true);
    const res = await studentService.moveStudents(moves);
    setSaving(false);
    setConfirm(false);
    if (!res.success) return toast(res.error || "Could not promote.", "error");
    toast(
      passOut ? `${res.moved} students of ${fromCls} - ${fromSec} marked as passed out.` : `${count("promote")} students moved to ${toCls} - ${toSec}.${res.failed?.length ? ` ${res.failed.length} could not be moved.` : ""}`,
      res.failed?.length ? "error" : "success"
    );
    onDone();
  };

  return (
    <>
      {/* From → To */}
      <section className="card p-5">
        <div className="flex flex-wrap items-end gap-4">
          <label className="min-w-[180px] flex-1">
            <span className="field-label">From</span>
            <select value={from} onChange={(e) => setFrom(e.target.value)} className="field w-full">
              <option value="" disabled>
                Choose class and section
              </option>
              {structure.map((c) => (
                <optgroup key={c.cls} label={c.cls}>
                  {c.sections.map((s) => (
                    <option key={s} value={`${c.cls}|${s}`}>
                      {c.cls} - {s}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <ArrowRight className="mb-3 h-5 w-5 shrink-0 text-slate-400" />
          {passOut ? (
            <div className="min-w-[180px] flex-1">
              <span className="field-label">To</span>
              <div className="field flex w-full items-center bg-slate-50 text-slate-700">Passed out of school</div>
            </div>
          ) : (
            <label className="min-w-[180px] flex-1">
              <span className="field-label">To (session 2027-28)</span>
              <select value={toSec} onChange={(e) => setToSec(e.target.value)} disabled={!from} className="field w-full">
                {!from && <option value="">—</option>}
                {toSections.map((s) => (
                  <option key={s} value={s}>
                    {toCls} - {s}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </section>

      {!from ? (
        <div className="card px-5 py-14 text-center text-sm text-slate-500">Choose the class and section to promote. Nothing moves until you confirm.</div>
      ) : (
      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-900">
            {fromCls} - {fromSec} <span className="font-normal text-slate-500">· {list.length} students</span>
          </h2>
          <div className="flex items-center gap-2 text-[13px] text-slate-500">
            Set everyone to
            <button type="button" onClick={() => setAll("promote")} className="btn btn-secondary btn-sm">
              {passOut ? "Pass out" : "Promote"}
            </button>
            <button type="button" onClick={() => setAll("detain")} className="btn btn-secondary btn-sm">
              Detain
            </button>
          </div>
        </div>
        {list.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-slate-500">No active students in this section.</p>
        ) : (
          <ul className="grid gap-2.5 bg-slate-50/60 p-3 sm:p-4">
            {list.map((s) => {
              const d = decisions[s.id] || "promote";
              return (
                <li key={s.id} className="grid grid-cols-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="w-6 shrink-0 text-right text-[13px] tabular-nums text-slate-400">{s.rollNo || "—"}</span>
                    <Avatar name={s.name} id={s.id} photoUrl={s.photoUrl} size="sm" neutral />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2">
                        <span className="truncate text-sm font-semibold text-slate-900">{s.name}</span>
                        {s.balanceFee > 0 && <span className="ml-auto shrink-0 text-xs font-semibold tabular-nums text-rose-600 sm:hidden">{inr(s.balanceFee)} due</span>}
                      </span>
                      <span className="block truncate text-xs text-slate-500">{s.fatherName || "—"}</span>
                    </span>
                  </span>
                  <span className="flex justify-center">
                  <Segmented
                    value={d}
                    onChange={(v) => setDecisions({ ...decisions, [s.id]: v })}
                    options={[
                      { v: "promote", label: passOut ? "Pass out" : "Promote", on: "bg-brand-600 text-white" },
                      { v: "detain", label: "Detain", on: "bg-marigold-400 text-night-950" },
                      { v: "left", label: "Left", on: "bg-slate-700 text-white" },
                    ]}
                    name={s.name}
                  />
                  </span>
                  <span className="hidden text-right text-xs font-semibold tabular-nums text-rose-600 sm:block">{s.balanceFee > 0 ? `${inr(s.balanceFee)} due` : ""}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      )}

      {list.length > 0 && (
        <ActionBar>
          <span className="text-sm text-night-300">
            {passOut ? (
              <>
                <b className="text-white">{count("promote") + count("left")}</b> leave school, <b className="text-white">{count("detain")}</b> stay in {fromCls}
              </>
            ) : (
              <>
                <b className="text-white">{count("promote")}</b> to {toCls} - {toSec} · <b className="text-white">{count("detain")}</b> stay · <b className="text-white">{count("left")}</b> left
              </>
            )}
          </span>
          <button type="button" onClick={() => setConfirm(true)} className="btn btn-sm ml-auto bg-marigold-400 font-bold text-night-950 hover:bg-marigold-300">
            {passOut ? "Mark passed out" : "Promote"}
          </button>
        </ActionBar>
      )}

      <Modal isOpen={confirm} onClose={() => !saving && setConfirm(false)} title={passOut ? "Mark as passed out?" : `Promote ${fromCls} - ${fromSec}?`} maxWidth="max-w-md">
        <div className="space-y-4 text-sm">
          <ul className="space-y-2 rounded-lg bg-slate-50 p-3">
            {passOut ? (
              <li>
                <b>{count("promote")}</b> students pass out and leave the active list
              </li>
            ) : (
              <li>
                <b>{count("promote")}</b> students move to <b>{toCls} - {toSec}</b>
              </li>
            )}
            <li>
              <b>{count("detain")}</b> stay in {fromCls} - {fromSec}
            </li>
            <li>
              <b>{count("left")}</b> are marked as left
            </li>
          </ul>
          {dueCount > 0 && <p className="text-marigold-800">{dueCount} of them still have fees due. Their dues stay on record.</p>}
          <p className="text-slate-500">Records and fee history are kept. A student moved by mistake can be put back from &ldquo;Change section&rdquo; or their profile.</p>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" onClick={() => setConfirm(false)} disabled={saving} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="button" onClick={apply} disabled={saving} className="btn btn-primary btn-sm">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Moving…" : "Yes, go ahead"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

/* ─────────────────────────── Change section ─────────────────────────── */

function SectionTab({ students, structure, onDone }: { students: Student[]; structure: Structure; onDone: () => void }) {
  const multi = structure.filter((c) => c.sections.length > 1);
  const [cls, setCls] = useState(multi[0]?.cls || "");
  const sections = multi.find((c) => c.cls === cls)?.sections || [];
  const [fromSec, setFromSec] = useState(sections[0] || "");
  const [toSec, setToSec] = useState(sections[1] || "");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFromSec(sections[0] || "");
    setToSec(sections[1] || "");
  }, [cls]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setPicked(new Set()), [cls, fromSec, students]);

  const list = useMemo(() => students.filter((s) => s.class === cls && s.section === fromSec).sort(byRoll), [students, cls, fromSec]);
  const size = (sec: string) => students.filter((s) => s.class === cls && s.section === sec).length;

  const move = async () => {
    if (!picked.size || !toSec || toSec === fromSec) return;
    setSaving(true);
    const res = await studentService.moveStudents(Array.from(picked).map((id) => ({ id, class: cls, section: toSec })));
    setSaving(false);
    if (!res.success) return toast(res.error || "Could not move.", "error");
    toast(`${res.moved} moved from ${cls} - ${fromSec} to ${cls} - ${toSec}.`, "success");
    onDone();
  };

  if (!multi.length) return <div className="card px-5 py-12 text-center text-sm text-slate-500">Every class has a single section, so there is nothing to shift.</div>;

  const toggle = (id: string) =>
    setPicked((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <>
      <section className="card p-5">
        <div className="flex flex-wrap items-end gap-4">
          <label className="min-w-[140px]">
            <span className="field-label">Class</span>
            <select value={cls} onChange={(e) => setCls(e.target.value)} className="field w-full">
              {multi.map((c) => (
                <option key={c.cls}>{c.cls}</option>
              ))}
            </select>
          </label>
          <label className="min-w-[160px] flex-1">
            <span className="field-label">From section</span>
            <select value={fromSec} onChange={(e) => setFromSec(e.target.value)} className="field w-full">
              {sections.map((s) => (
                <option key={s} value={s}>
                  {s} ({size(s)} students)
                </option>
              ))}
            </select>
          </label>
          <ArrowRight className="mb-3 h-5 w-5 shrink-0 text-slate-400" />
          <label className="min-w-[160px] flex-1">
            <span className="field-label">To section</span>
            <select value={toSec} onChange={(e) => setToSec(e.target.value)} className="field w-full">
              {sections
                .filter((s) => s !== fromSec)
                .map((s) => (
                  <option key={s} value={s}>
                    {s} ({size(s)} students)
                  </option>
                ))}
            </select>
          </label>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-900">
            {cls} - {fromSec} <span className="font-normal text-slate-500">· tick the students to shift</span>
          </h2>
          <button type="button" onClick={() => setPicked(picked.size === list.length ? new Set() : new Set(list.map((s) => s.id)))} className="text-[13px] font-semibold text-brand-700 hover:underline">
            {picked.size === list.length ? "Clear" : "Select all"}
          </button>
        </div>
        <ul className="divide-y divide-slate-100">
          {list.map((s) => {
            const on = picked.has(s.id);
            return (
              <li key={s.id}>
                <button type="button" onClick={() => toggle(s.id)} className={`flex w-full items-center gap-3 px-5 py-2.5 text-left ${on ? "bg-brand-50/70" : "hover:bg-slate-50"}`}>
                  <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] ${on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white"}`}>
                    {on && <Check className="h-3 w-3" strokeWidth={3.5} />}
                  </span>
                  <span className="w-8 shrink-0 text-right text-[13px] tabular-nums text-slate-400">{s.rollNo || "—"}</span>
                  <Avatar name={s.name} id={s.id} photoUrl={s.photoUrl} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">{s.name}</span>
                    <span className="block text-xs text-slate-500">{s.fatherName || "—"}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {picked.size > 0 && (
        <ActionBar>
          <span className="text-sm text-night-300">
            <b className="text-white">{picked.size}</b> selected
          </span>
          <button type="button" onClick={move} disabled={saving} className="btn btn-sm ml-auto bg-marigold-400 font-bold text-night-950 hover:bg-marigold-300">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Move to {cls} - {toSec}
          </button>
        </ActionBar>
      )}
    </>
  );
}

/* ───────────────────────────── Bits ───────────────────────────── */

function Segmented<T extends string>({ value, onChange, options, name }: { value: T; onChange: (v: T) => void; options: { v: T; label: string; on: string }[]; name: string }) {
  return (
    <div className="flex shrink-0 gap-0.5 rounded-lg bg-slate-100 p-0.5" role="radiogroup" aria-label={`Decision for ${name}`}>
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={value === o.v}
          onClick={() => onChange(o.v)}
          className={`rounded-md px-2.5 py-1 text-[12.5px] font-semibold transition ${value === o.v ? o.on : "text-slate-500 hover:text-slate-800"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-4 md:bottom-5 md:pl-[272px]">
      <div className="flex w-full max-w-2xl items-center gap-3 rounded-2xl bg-night-900 px-4 py-3 shadow-2xl ring-1 ring-white/5 animate-scaleUp">
        <Users className="h-4 w-4 shrink-0 text-marigold-400" />
        {children}
      </div>
    </div>
  );
}
