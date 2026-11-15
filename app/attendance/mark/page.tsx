"use client";

import { useCurrentUser } from "@/components/layout/useCurrentUser";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Check, ChevronLeft, ChevronRight, Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { attendanceService, AttendanceDay, AttStatus, SectionDay, SectionRoster, absenceWhatsApp } from "@/lib/services/attendanceService";
import { useSchoolProfile } from "@/components/providers/SchoolProfileProvider";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { Avatar } from "@/components/ui/Avatar";
import { toast } from "@/components/ui/Toaster";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const todayIso = () => iso(new Date());
const shift = (date: string, days: number) => {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() + days);
  return iso(d);
};
const longDate = (date: string) => new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
const shortDate = (date: string) => new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const clock = (at: string) => new Date(at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

const STATUS: { key: AttStatus; short: string; label: string; on: string }[] = [
  { key: "Present", short: "P", label: "Present", on: "bg-emerald-600 text-white" },
  { key: "Absent", short: "A", label: "Absent", on: "bg-rose-600 text-white" },
  { key: "Leave", short: "L", label: "Leave", on: "bg-marigold-400 text-night-950" },
  { key: "HalfDay", short: "H", label: "Half day", on: "bg-sky-600 text-white" },
];

export default function MarkAttendancePage() {
  const [date, setDate] = useState(todayIso());
  const [day, setDay] = useState<AttendanceDay | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<SectionDay | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "marked">("all");
  const load = useCallback(async () => {
    setLoading(true);
    const r = await attendanceService.day(date);
    setLoading(false);
    if (!r.data) return setError(r.error || "Could not load attendance.");
    setError(null); setDay(r.data);
  }, [date]);
  useEffect(() => { setDay(null); setError(null); load(); }, [load]);
  const t = day?.totals;
  const isToday = date === todayIso();
  const byClass = useMemo(() => {
    const groups = new Map<string, SectionDay[]>();
    for (const section of day?.sections || []) {
      if (filter === "pending" && section.marked > 0 || filter === "marked" && section.marked === 0) continue;
      groups.set(section.class, [...(groups.get(section.class) || []), section]);
    }
    return Array.from(groups.entries());
  }, [day, filter]);
  const nextUnmarked = (after: SectionDay) => {
    const list = day?.sections || [], index = list.findIndex(s => s.classSec === after.classSec);
    return list.slice(index + 1).concat(list.slice(0, index)).find(s => s.marked === 0) || null;
  };
  const nextSection = day?.sections.find(s => s.marked === 0);
  return <div className="space-y-5 pb-12">
    <header className="page-header">
      <div><h1 className="page-title">Daily attendance</h1><p className="page-subtitle">{longDate(date)}{t ? ' · ' + t.sectionsMarked + ' of ' + t.sections + ' sections marked' : ''}</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setDate(shift(date, -1))} className="btn btn-secondary px-2.5" aria-label="Previous day"><ChevronLeft className="h-4 w-4" /></button>
        <input type="date" value={date} max={todayIso()} onChange={e => e.target.value && setDate(e.target.value)} aria-label="Date" className="field field-sm h-10" />
        <button type="button" onClick={() => setDate(shift(date, 1))} disabled={isToday} className="btn btn-secondary px-2.5" aria-label="Next day"><ChevronRight className="h-4 w-4" /></button>
        {!isToday && <button type="button" onClick={() => setDate(todayIso())} className="btn btn-secondary btn-sm">Today</button>}
        <button type="button" onClick={load} disabled={loading} className="btn btn-secondary px-2.5" aria-label="Reload"><RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} /></button>
      </div>
    </header>
    {day && (day.sunday || day.holiday) && <div className="alert alert-amber"><AlertTriangle className="h-4 w-4 shrink-0" /><span>{day.holiday ? shortDate(date) + ' is a holiday (' + day.holiday + ').' : shortDate(date) + ' is a Sunday.'} You can still mark attendance if school was open.</span></div>}
    {error && <div role="alert" className="alert alert-rose"><span className="flex-1">Could not load attendance: {error}</span><button type="button" onClick={load} className="btn btn-secondary btn-sm">Try again</button></div>}
    {(!error || day) && <div className="summary-strip">
      <Figure label="Present" value={t ? t.present + t.half : null} note={t && t.marked ? pct(t.present + t.half * .5, t.marked) + '% of those marked' : 'No attendance marked'} dot="bg-emerald-500" />
      <Figure label="Absent" value={t ? t.absent : null} note="Students marked absent" dot="bg-rose-500" />
      <Figure label="On leave" value={t ? t.leave : null} note={t?.half ? t.half + ' half day' : 'Approved and recorded leave'} dot="bg-marigold-400" />
      <Figure label="Sections left" value={t ? t.sections - t.sectionsMarked : null} note={t ? t.marked.toLocaleString('en-IN') + ' of ' + t.students.toLocaleString('en-IN') + ' students marked' : ''} dot="bg-slate-400" />
    </div>}
    <section className="card workspace-section overflow-hidden">
      <div className="workspace-toolbar flex flex-wrap items-center justify-between gap-3 border-x-0 border-t-0 px-4 py-3 sm:px-5">
        <div className="module-tabs flex flex-wrap gap-1" aria-label="Section status">{([['all','All sections'],['pending','Not marked'],['marked','Marked']] as const).map(([key,label]) => <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)} className={filter === key ? 'is-active' : ''}>{label}</button>)}</div>
        <div className="flex items-center gap-3"><Link href="/attendance/register" className="text-[13px] font-medium text-slate-600 hover:text-brand-700">Open register</Link>{nextSection && <button type="button" onClick={() => setOpen(nextSection)} className="btn btn-primary btn-sm">Mark next section <ArrowRight className="h-3.5 w-3.5" /></button>}</div>
      </div>
      <div className="hidden grid-cols-[1fr_100px_120px_120px_100px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-2.5 text-xs font-medium text-slate-500 xl:grid"><span>Class / section</span><span className="text-right">Students</span><span className="text-right">Present</span><span className="text-right">Absent</span><span className="text-right">Register</span></div>
      {error && !day ? <div className="p-8 text-sm text-slate-600">Attendance is unavailable. Retry to load the section register.</div> : !day ? <div className="space-y-3 p-5">{Array.from({length:6},(_,i) => <div key={i} className="skeleton h-12 w-full" />)}</div> : <div className="divide-y divide-slate-200">
        {byClass.length === 0 ? <p className="px-5 py-10 text-sm text-slate-500">No sections match this status.</p> : byClass.map(([cls, sections]) => <div key={cls}><div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-2 text-xs font-semibold text-slate-600"><span>Class {cls}</span><span>{sections.length} {sections.length === 1 ? 'section' : 'sections'}</span></div><div className="divide-y divide-slate-100">{sections.map(s => <SectionTile key={s.classSec} s={s} onClick={() => setOpen(s)} />)}</div></div>)}
      </div>}
    </section>
    <MarkDrawer date={date} section={open} onClose={() => setOpen(null)} onSaved={load} onNext={s => { const next = nextUnmarked(s); setOpen(next); if (!next) toast('Every section is marked for this day.', 'success'); }} />
  </div>;
}
function Figure({label,value,note,dot}:{label:string;value:number|null;note:string;dot:string}) {
  return <div className="min-w-0 p-4 sm:px-5"><span className="kpi-label"><i className={'h-2 w-2 rounded-full ' + dot}/>{label}</span><span className="kpi-value">{value === null ? '...' : value.toLocaleString('en-IN')}</span><span className="kpi-note">{note}</span></div>;
}
function SectionTile({s,onClick}:{s:SectionDay;onClick:()=>void}) {
  const done=s.marked>0;
  return <button type="button" onClick={onClick} className="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:bg-brand-50 xl:grid-cols-[1fr_100px_120px_120px_100px] sm:px-5">
    <span className="min-w-0"><span className="block text-sm font-semibold text-slate-900">{s.classSec}</span><span className="mt-0.5 block text-xs text-slate-500">{done ? s.markedBy ? 'Marked by ' + s.markedBy : 'Attendance recorded' : 'Awaiting attendance'}<span className="xl:hidden"> &middot; {s.students} students</span></span></span>
    <span className="hidden text-right text-sm tabular-nums text-slate-600 xl:block">{s.students}</span><span className="hidden text-right text-sm tabular-nums text-slate-800 xl:block">{done ? s.present+s.half : '-'}</span><span className="hidden text-right text-sm tabular-nums xl:block">{done ? <span className={s.absent ? 'text-rose-700' : 'text-slate-500'}>{s.absent}</span> : '-'}</span>
    <span className="inline-flex items-center justify-end gap-1.5 text-[13px] font-semibold text-brand-700">{done ? 'Review' : 'Mark'}<ChevronRight className="h-4 w-4" /></span>
  </button>;
}

/** One section: everyone starts Present; change the few who are not, then save. */
function MarkDrawer({ date, section, onClose, onSaved, onNext }: { date: string; section: SectionDay | null; onClose: () => void; onSaved: () => void; onNext: (s: SectionDay) => void }) {
  const { schoolProfile } = useSchoolProfile();
  const canMark = ["admin", "teacher"].includes(useCurrentUser().roleKey);
  const [roster, setRoster] = useState<SectionRoster | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [marks, setMarks] = useState<Record<string, AttStatus>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [rolls, setRolls] = useState("");
  const [saving, setSaving] = useState(false);
  // auto: null when the school sends absent alerts by hand, else how many were just queued
  const [done, setDone] = useState<{ absent: SectionRoster["students"]; auto: number | null } | null>(null);

  useEffect(() => {
    if (!section) return;
    setRoster(null);
    setError(null);
    setDone(null);
    setRolls("");
    attendanceService.section(date, section.class, section.section).then((r) => {
      if (!r.data) return setError(r.error || "Could not load.");
      setRoster(r.data);
      setMarks(Object.fromEntries(r.data.students.map((s) => [s.id, s.status || "Present"])));
      setRemarks(Object.fromEntries(r.data.students.map((s) => [s.id, s.remark || ""])));
    });
  }, [date, section]);

  const counts = useMemo(() => {
    const c: Record<AttStatus, number> = { Present: 0, Absent: 0, Leave: 0, HalfDay: 0 };
    Object.values(marks).forEach((m) => (c[m] += 1));
    return c;
  }, [marks]);

  const applyRolls = () => {
    if (!roster || !canMark) return;
    const wanted = new Set(
      rolls
        .split(/[\s,]+/)
        .map((x) => x.trim().replace(/^0+/, ""))
        .filter(Boolean)
    );
    const hit = roster.students.filter((s) => wanted.has(String(s.rollNo).replace(/^0+/, "")));
    if (!hit.length) return toast("No student has those roll numbers.", "error");
    setMarks((m) => ({ ...m, ...Object.fromEntries(hit.map((s) => [s.id, "Absent" as AttStatus])) }));
    const missing = Array.from(wanted).filter((r) => !roster.students.some((s) => String(s.rollNo).replace(/^0+/, "") === r));
    toast(`${hit.length} marked absent${missing.length ? `; no roll no. ${missing.join(", ")}` : ""}.`, missing.length ? "info" : "success");
    setRolls("");
  };

  const save = async () => {
    if (!roster || !section || !canMark) return;
    setSaving(true);
    const res = await attendanceService.save(
      date,
      roster.class,
      roster.section,
      roster.students.map((s) => ({ studentId: s.id, status: marks[s.id] || "Present", remark: marks[s.id] === "Leave" || marks[s.id] === "Absent" ? remarks[s.id] : "" }))
    );
    setSaving(false);
    if (!res.success) return setError(res.error || "Could not save.");
    onSaved();
    setDone({ absent: roster.students.filter((s) => marks[s.id] === "Absent"), auto: res.data.whatsappQueued ?? null });
    toast(`${section.classSec}: ${res.data.present + res.data.half} present, ${res.data.absent} absent.`, "success");
  };

  if (!section) return null;
  const school = `${schoolProfile.school_name || "School"}, ${schoolProfile.city || "Barmer"}`;

  return (
    <SideDrawer
      isOpen={!!section}
      onClose={onClose}
      busy={saving}
      width="max-w-[640px]"
      title={`${section.classSec} · ${shortDate(date)}`}
      subtitle={roster ? (roster.saved ? `Saved ${roster.markedAt ? clock(roster.markedAt) : ""}${roster.markedBy ? ` by ${roster.markedBy.split(" (")[0]}` : ""} · you can change it` : `${roster.students.length} students · not marked yet`) : "Loading…"}
      footer={
        done ? (
          <>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Close
            </button>
            <button type="button" onClick={() => onNext(section)} className="btn btn-primary ml-auto">
              Next section
              <ArrowRight className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <span className="hidden text-[13px] text-slate-500 sm:block">
              <b className="text-emerald-700">{counts.Present + counts.HalfDay}</b> present · <b className="text-rose-600">{counts.Absent}</b> absent · <b className="text-marigold-700">{counts.Leave}</b> leave
            </span>
            <button type="button" onClick={save} disabled={saving || !roster || !canMark} className="btn btn-primary ml-auto min-w-[170px]">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving…" : roster?.saved ? "Save changes" : "Save attendance"}
            </button>
          </>
        )
      }
    >
      {error && (
        <div className="alert alert-rose m-5">
          <span>{error}</span>
        </div>
      )}
      {done ? (
        <div className="space-y-4 p-5">
          <div className="card p-5 text-center">
            <Check className="mx-auto h-8 w-8 text-emerald-600" strokeWidth={3} />
            <p className="mt-2 font-semibold text-slate-900">Attendance saved for {section.classSec}</p>
            <p className="mt-1 text-sm text-slate-500">
              {counts.Present + counts.HalfDay} present · {counts.Absent} absent · {counts.Leave} on leave
            </p>
          </div>
          {done.absent.length > 0 && (
            <section className="card overflow-hidden">
              <div className="border-b border-slate-100 px-4 py-3">
                {done.auto === null ? (
                  <>
                    <h3 className="text-sm font-semibold text-slate-900">Tell parents of absent students</h3>
                    <p className="text-xs text-slate-500">Opens WhatsApp with a Hindi message; press send there.</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-semibold text-slate-900">Parents are being told on WhatsApp</h3>
                    <p className="text-xs text-slate-500">
                      {done.auto > 0 ? `${done.auto} new message${done.auto === 1 ? "" : "s"} queued` : "Already queued earlier"} from the school&apos;s number.{" "}
                      <Link href="/settings/messaging" className="font-semibold text-brand-700 hover:underline">
                        See the outbox
                      </Link>
                    </p>
                  </>
                )}
              </div>
              <ul className="divide-y divide-slate-100">
                {done.absent.map((s) => {
                  const link = absenceWhatsApp(s.mobile, s.name, section.classSec, shortDate(date), school);
                  return (
                    <li key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-900">{s.name}</span>
                        <span className="block text-xs text-slate-500">
                          Roll {s.rollNo} · {s.fatherName} · {s.mobile}
                        </span>
                      </span>
                      {done.auto !== null ? null : link ? (
                        <a href={link} target="_blank" rel="noreferrer" className="btn btn-sm bg-emerald-600 text-white hover:bg-emerald-700">
                          <MessageCircle className="h-3.5 w-3.5" />
                          WhatsApp
                        </a>
                      ) : (
                        <span className="text-xs text-rose-600">No valid mobile</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      ) : !roster ? (
        <div className="space-y-2 p-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setMarks(Object.fromEntries(roster.students.map((s) => [s.id, "Present" as AttStatus])))} className="btn btn-secondary btn-sm">
              <Check className="h-3.5 w-3.5" />
              All present
            </button>
            <div className="flex min-w-[220px] flex-1 gap-2">
              <input
                value={rolls}
                onChange={(e) => setRolls(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyRolls())}
                placeholder="Absent roll nos., e.g. 3, 7, 12"
                aria-label="Absent roll numbers"
                className="field field-sm min-w-0 flex-1"
              />
              <button type="button" onClick={applyRolls} disabled={!rolls.trim() || !canMark} className="btn btn-soft btn-sm">
                Mark absent
              </button>
            </div>
          </div>

          <ul className="card divide-y divide-slate-100 overflow-hidden">
            {roster.students.map((s) => {
              const m = marks[s.id] || "Present";
              return (
                <li key={s.id} className={`px-4 py-2 ${m === "Absent" ? "bg-rose-50/50" : m === "Leave" ? "bg-marigold-50/50" : ""}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-7 shrink-0 text-right text-[13px] font-semibold tabular-nums text-slate-400">{s.rollNo || "—"}</span>
                    <Avatar name={s.name} id={s.id} photoUrl={s.photoUrl} size="sm" className="hidden sm:flex" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold text-slate-900 sm:text-sm">{s.name}</span>
                      <span className="block truncate text-xs text-slate-500">{s.fatherName}</span>
                    </span>
                    <div className="flex shrink-0 gap-1 rounded-lg bg-slate-100 p-0.5 sm:gap-0.5" role="radiogroup" aria-label={`Attendance for ${s.name}`}>
                      {STATUS.map((o) => (
                        <button
                          key={o.key}
                          type="button"
                          role="radio"
                          aria-checked={m === o.key}
                          title={o.label}
                          disabled={!canMark || saving} onClick={() => setMarks({ ...marks, [s.id]: o.key })}
                          className={`h-10 w-10 rounded-md text-sm font-bold transition sm:h-8 sm:w-8 sm:text-[13px] ${m === o.key ? o.on : "text-slate-500 hover:bg-white hover:text-slate-800"}`}
                        >
                          {o.short}
                        </button>
                      ))}
                    </div>
                  </div>
                  {(m === "Leave" || m === "Absent") && (
                    <input
                      disabled={!canMark || saving} value={remarks[s.id] || ""}
                      onChange={(e) => setRemarks({ ...remarks, [s.id]: e.target.value })}
                      placeholder={m === "Leave" ? "Reason for leave (optional)" : "Note (optional), e.g. fever"}
                      aria-label={`Note for ${s.name}`}
                      className="field field-sm ml-10 mt-1.5 w-[calc(100%-2.5rem)] sm:ml-[4.75rem] sm:w-[calc(100%-4.75rem)]"
                    />
                  )}
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-slate-500">P present · A absent · L leave · H half day (counts as half present)</p>
        </div>
      )}
    </SideDrawer>
  );
}
