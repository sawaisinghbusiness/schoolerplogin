"use client";

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

  const load = useCallback(async () => {
    setLoading(true);
    const r = await attendanceService.day(date);
    setLoading(false);
    if (!r.data) return setError(r.error || "Could not load.");
    setError(null);
    setDay(r.data);
  }, [date]);
  useEffect(() => {
    setDay(null);
    load();
  }, [load]);

  const t = day?.totals;
  const isToday = date === todayIso();
  const byClass = useMemo(() => {
    const m = new Map<string, SectionDay[]>();
    for (const s of day?.sections || []) m.set(s.class, [...(m.get(s.class) || []), s]);
    return Array.from(m.entries());
  }, [day]);

  const nextUnmarked = (after: SectionDay) => {
    const list = day?.sections || [];
    const i = list.findIndex((s) => s.classSec === after.classSec);
    return list.slice(i + 1).concat(list.slice(0, i)).find((s) => s.marked === 0) || null;
  };

  return (
    <div className="space-y-5 pb-12">
      <header className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">
            {longDate(date)}
            {t ? ` · ${t.sectionsMarked} of ${t.sections} sections marked` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={() => setDate(shift(date, -1))} className="btn btn-secondary px-2.5" aria-label="Previous day">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <input type="date" value={date} max={todayIso()} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="Date" className="field field-sm h-10" />
          <button type="button" onClick={() => setDate(shift(date, 1))} disabled={isToday} className="btn btn-secondary px-2.5" aria-label="Next day">
            <ChevronRight className="h-4 w-4" />
          </button>
          {!isToday && (
            <button type="button" onClick={() => setDate(todayIso())} className="btn btn-soft btn-sm">
              Today
            </button>
          )}
          <button type="button" onClick={load} disabled={loading} className="btn btn-secondary px-2.5" aria-label="Reload">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {day && (day.sunday || day.holiday) && (
        <div className="alert alert-amber">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{day.holiday ? `${shortDate(date)} is a holiday (${day.holiday}).` : `${shortDate(date)} is a Sunday.`} You can still mark attendance if school was open.</span>
        </div>
      )}
      {error && (
        <div className="alert alert-rose">
          <span>{error}</span>
        </div>
      )}

      <div className="kpi-grid">
        <Figure label="Present" value={t ? t.present + t.half : null} note={t && t.marked ? `${pct(t.present + t.half * 0.5, t.marked)}% of those marked` : "Nobody marked yet"} dot="bg-emerald-500" />
        <Figure label="Absent" value={t ? t.absent : null} note={t && t.absent ? "Parents can be told on WhatsApp" : "—"} dot="bg-rose-500" />
        <Figure label="On leave" value={t ? t.leave : null} note={t && t.half ? `${t.half} half day` : "—"} dot="bg-marigold-400" />
        <Figure label="Sections left" value={t ? t.sections - t.sectionsMarked : null} note={t ? `${t.marked.toLocaleString("en-IN")} of ${t.students.toLocaleString("en-IN")} students marked` : ""} dot="bg-slate-400" />
      </div>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold text-slate-900">Sections</h2>
          <span className="flex items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <i className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Marked
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="h-2.5 w-2.5 rounded-sm border border-dashed border-slate-400" /> Not yet
            </span>
          </span>
        </div>
        {!day ? (
          <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton h-[74px]" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {byClass.map(([cls, secs]) => (
              <div key={cls} className="flex items-center gap-3 px-4 py-2.5 sm:items-start sm:px-5 sm:py-3">
                <span className="w-16 shrink-0 text-[13px] font-semibold text-slate-700 sm:w-20 sm:pt-2">{cls}</span>
                <div className="flex flex-1 flex-wrap gap-2 sm:grid sm:grid-cols-3 xl:grid-cols-4">
                  {secs.map((s) => (
                    <SectionTile key={s.classSec} s={s} onClick={() => setOpen(s)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <MarkDrawer
        date={date}
        section={open}
        onClose={() => setOpen(null)}
        onSaved={load}
        onNext={(s) => {
          const n = nextUnmarked(s);
          setOpen(n);
          if (!n) toast("Every section is marked for this day.", "success");
        }}
      />
    </div>
  );
}

function Figure({ label, value, note, dot }: { label: string; value: number | null; note: string; dot: string }) {
  return (
    <div className="kpi rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-5">
      <span className="kpi-label">
        <i className={`h-2 w-2 rounded-full ${dot}`} />
        {label}
      </span>
      <span className="kpi-value">{value === null ? "…" : value.toLocaleString("en-IN")}</span>
      <span className="kpi-note truncate">{note}</span>
    </div>
  );
}

function SectionTile({ s, onClick }: { s: SectionDay; onClick: () => void }) {
  const done = s.marked > 0;
  const present = s.present + s.half * 0.5;
  const p = pct(present, s.marked);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group min-h-[44px] min-w-[60px] rounded-xl px-2.5 py-1.5 text-left transition sm:min-w-0 sm:py-2.5 ${done ? "border border-slate-200 bg-white hover:border-slate-300 hover:shadow-card" : "border border-dashed border-slate-300 bg-slate-50/60 hover:border-brand-400 hover:bg-white"}`}
    >
      <span className="flex items-center justify-between gap-1">
        <span className="truncate text-[13.5px] font-semibold text-slate-900">{s.section}</span>
        {done ? <Check className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} /> : <span className="hidden text-[11.5px] font-semibold text-brand-700 opacity-0 transition group-hover:opacity-100 sm:inline">Mark →</span>}
      </span>
      {/* Phones: just the count */}
      <span className="block text-xs tabular-nums text-slate-500 sm:hidden">
        {done ? (
          <>
            {s.present + s.half}/{s.students}
            {s.absent ? <span className="ml-1 font-semibold text-rose-600">−{s.absent}</span> : null}
          </>
        ) : (
          String(s.students)
        )}
      </span>
      {done ? (
        <span className="hidden sm:block">
          <span className="mt-1 flex items-baseline justify-between text-xs">
            <span className="tabular-nums text-slate-600">
              {s.present + s.half}/{s.students}
              {s.absent ? <span className="ml-1.5 font-semibold text-rose-600">{s.absent} absent</span> : null}
            </span>
            <span className="tabular-nums text-slate-400">{p}%</span>
          </span>
          <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-slate-100">
            <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${p}%` }} />
          </span>
        </span>
      ) : (
        <span className="mt-1 hidden text-xs text-slate-500 sm:block">{s.students} students · not marked</span>
      )}
    </button>
  );
}

/** One section: everyone starts Present; change the few who are not, then save. */
function MarkDrawer({ date, section, onClose, onSaved, onNext }: { date: string; section: SectionDay | null; onClose: () => void; onSaved: () => void; onNext: (s: SectionDay) => void }) {
  const { schoolProfile } = useSchoolProfile();
  const [roster, setRoster] = useState<SectionRoster | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [marks, setMarks] = useState<Record<string, AttStatus>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [rolls, setRolls] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<{ absent: SectionRoster["students"] } | null>(null);

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
    if (!roster) return;
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
    if (!roster || !section) return;
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
    setDone({ absent: roster.students.filter((s) => marks[s.id] === "Absent") });
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
            <button type="button" onClick={save} disabled={saving || !roster} className="btn btn-primary ml-auto min-w-[170px]">
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
                <h3 className="text-sm font-semibold text-slate-900">Tell parents of absent students</h3>
                <p className="text-xs text-slate-500">Opens WhatsApp with a Hindi message; press send there.</p>
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
                      {link ? (
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
              <button type="button" onClick={applyRolls} disabled={!rolls.trim()} className="btn btn-soft btn-sm">
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
                          onClick={() => setMarks({ ...marks, [s.id]: o.key })}
                          className={`h-10 w-10 rounded-md text-sm font-bold transition sm:h-8 sm:w-8 sm:text-[13px] ${m === o.key ? o.on : "text-slate-500 hover:bg-white hover:text-slate-800"}`}
                        >
                          {o.short}
                        </button>
                      ))}
                    </div>
                  </div>
                  {(m === "Leave" || m === "Absent") && (
                    <input
                      value={remarks[s.id] || ""}
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
