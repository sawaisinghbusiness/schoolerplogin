"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { DayMark, StaffAttStatus, StaffDay, clock, firstName, longDate, shiftDate, shortDate, staffAttendanceService, todayIST } from "@/lib/services/staffAttendanceService";
import { toast } from "@/components/ui/Toaster";
import { ErrorBox, Rows, STATUS, SetupNeeded } from "./shared";

interface Entry {
  status: StaffAttStatus;
  inTime: string;
  outTime: string;
  remark: string;
}

const TIMES_KEY = "staff.att.times";
const works = (s: StaffAttStatus) => s === "Present" || s === "Half Day";

/** What each row starts as: the saved mark, else "On Leave" for approved leave, else Present. */
function startingEntries(day: StaffDay): Record<string, Entry> {
  const out: Record<string, Entry> = {};
  for (const s of day.staff) {
    const onLeave = !s.status && s.leave?.status === "Approved";
    out[s.id] = {
      status: s.status || (onLeave ? "On Leave" : "Present"),
      inTime: s.inTime,
      outTime: s.outTime,
      remark: s.remark || (onLeave ? `${s.leave!.type} leave` : ""),
    };
  }
  return out;
}

export function DayTab({ canWrite }: { canWrite: boolean }) {
  const today = todayIST();
  const [date, setDate] = useState(today);
  const [day, setDay] = useState<StaffDay | null>(null);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [initial, setInitial] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showTimes, setShowTimes] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    try {
      setShowTimes(localStorage.getItem(TIMES_KEY) === "1");
    } catch {
      /* private window */
    }
  }, []);
  const toggleTimes = (on: boolean) => {
    setShowTimes(on);
    try {
      localStorage.setItem(TIMES_KEY, on ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const load = useCallback(async () => {
    const mine = ++seq.current;
    setLoading(true);
    const r = await staffAttendanceService.day(date);
    if (mine !== seq.current) return;
    setLoading(false);
    setSaveError(null);
    if (r.setupNeeded) return setSetupNeeded(true);
    setSetupNeeded(false);
    if (!r.data) {
      setDay(null);
      return setError(r.error || "Could not load.");
    }
    setError(null);
    setDay(r.data);
    const e = startingEntries(r.data);
    setEntries(e);
    setInitial(JSON.stringify(e));
  }, [date]);
  useEffect(() => {
    setDay(null);
    load();
  }, [load]);

  const dirty = !!day && JSON.stringify(entries) !== initial;
  const counts = useMemo(() => {
    const c: Record<StaffAttStatus, number> = { Present: 0, Absent: 0, "On Leave": 0, "Half Day": 0 };
    Object.keys(entries).forEach((id) => (c[entries[id].status] += 1));
    return c;
  }, [entries]);

  const set = (id: string, patch: Partial<Entry>) => setEntries((cur) => ({ ...cur, [id]: { ...cur[id], ...patch } }));
  const allPresent = () => {
    if (!day) return;
    setEntries((cur) => {
      const next: Record<string, Entry> = {};
      for (const s of day.staff) {
        const e = cur[s.id];
        // Approved leave stays as leave; everybody else becomes Present.
        next[s.id] = s.leave?.status === "Approved" && e.status === "On Leave" ? e : { ...e, status: "Present" };
      }
      return next;
    });
  };

  const save = async () => {
    if (!day) return;
    setSaving(true);
    setSaveError(null);
    const marks: DayMark[] = day.staff.map((s) => {
      const e = entries[s.id];
      return { staffId: s.id, status: e.status, inTime: works(e.status) ? e.inTime : "", outTime: works(e.status) ? e.outTime : "", remark: e.remark };
    });
    const r = await staffAttendanceService.saveDay(date, marks);
    setSaving(false);
    if (!r.success) return setSaveError(r.error);
    toast(`Staff attendance saved for ${shortDate(date)}: ${r.data.present + r.data.half} present, ${r.data.absent} absent, ${r.data.leave} on leave.`, "success");
    load();
  };

  const changeDate = (d: string) => {
    if (!d || d > today) return;
    if (dirty && !window.confirm("You have changes that are not saved. Leave them?")) return;
    setDate(d);
  };

  if (setupNeeded) return <SetupNeeded onRetry={load} />;

  const total = day?.staff.length || 0;
  const status = !day
    ? ""
    : day.marked === 0
    ? "Not marked yet"
    : day.marked < total
    ? `${day.marked} of ${total} marked${day.markedAt ? ` · last change ${clock(day.markedAt)}${day.markedBy ? ` by ${firstName(day.markedBy)}` : ""}` : ""}`
    : `Saved ${day.markedAt ? clock(day.markedAt) : ""}${day.markedBy ? ` by ${firstName(day.markedBy)}` : ""}`;

  return (
    <section className="card">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 p-3 sm:px-4">
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => changeDate(shiftDate(date, -1))} className="btn btn-secondary btn-sm px-2" aria-label="Previous day">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <input type="date" value={date} max={today} onChange={(e) => changeDate(e.target.value)} aria-label="Date" className="field field-sm" />
          <button type="button" onClick={() => changeDate(shiftDate(date, 1))} disabled={date >= today} className="btn btn-secondary btn-sm px-2" aria-label="Next day">
            <ChevronRight className="h-4 w-4" />
          </button>
          {date !== today && (
            <button type="button" onClick={() => changeDate(today)} className="px-1.5 text-[13px] font-semibold text-brand-700 hover:underline">
              Today
            </button>
          )}
        </div>
        <span className="min-w-0 truncate text-[13px] text-slate-500" title={day ? longDate(date) : undefined}>
          {status}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {canWrite && (
            <label className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap text-[13px] text-slate-600">
              <input type="checkbox" checked={showTimes} onChange={(e) => toggleTimes(e.target.checked)} />
              In/out time
            </label>
          )}
          {canWrite && (
            <button type="button" onClick={allPresent} disabled={!day || !total} className="btn btn-secondary btn-sm">
              <Check className="h-3.5 w-3.5" />
              Mark all present
            </button>
          )}
          <button type="button" onClick={load} disabled={loading} className="btn btn-secondary btn-sm px-2" aria-label="Reload">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {day && (day.sunday || day.holiday) && (
        <div className="alert alert-amber m-3 mb-0 sm:mx-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{day.holiday ? `${shortDate(date)} is a holiday (${day.holiday}).` : `${shortDate(date)} is a Sunday.`} Mark attendance only if staff were called in.</span>
        </div>
      )}

      {error && !loading ? (
        <ErrorBox message={error} onRetry={load} />
      ) : !day ? (
        <Rows />
      ) : total === 0 ? (
        <div className="px-6 py-14 text-center text-sm text-slate-500">
          <p>Nobody is on the staff rolls for {shortDate(date)}.</p>
          <p className="mt-1">
            Add staff from{" "}
            <Link href="/staff" className="font-semibold text-brand-700 hover:underline">
              Staff → Directory
            </Link>
            .
          </p>
        </div>
      ) : (
        <>
          <div className="hidden items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 sm:flex">
            <span className="w-16 shrink-0">Code</span>
            <span className="flex-1">Name</span>
            <span className="w-[138px] shrink-0 text-center">P · A · L · H</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {day.staff.map((s) => {
              const e = entries[s.id];
              if (!e) return null;
              const tint = e.status === "Absent" ? "bg-rose-50/50" : e.status === "On Leave" ? "bg-marigold-50/50" : "";
              const second = (showTimes && canWrite) || e.status !== "Present" || !!e.remark || !!e.inTime || !!e.outTime;
              return (
                <li key={s.id} className={`px-4 py-1.5 ${tint}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-16 shrink-0 truncate text-xs tabular-nums text-slate-500">{s.empCode}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900">{s.name}</span>
                      <span className="block truncate text-xs text-slate-500">
                        {s.designation}
                        {s.leave && (
                          <span className={s.leave.status === "Approved" ? "text-marigold-700" : "text-slate-500"}>
                            {" · "}
                            {s.leave.type} leave {s.leave.status === "Approved" ? "approved" : "pending"}
                            {s.leave.from !== s.leave.to ? ` (${shortDate(s.leave.from)}–${shortDate(s.leave.to)})` : ""}
                          </span>
                        )}
                      </span>
                    </span>
                    <div className="flex shrink-0 gap-0.5 rounded-lg bg-slate-100 p-0.5" role="radiogroup" aria-label={`Attendance for ${s.name}`}>
                      {STATUS.map((o) => (
                        <button
                          key={o.key}
                          type="button"
                          role="radio"
                          aria-checked={e.status === o.key}
                          title={o.label}
                          disabled={!canWrite}
                          onClick={() => set(s.id, { status: o.key })}
                          className={`h-8 w-8 rounded-md text-[13px] font-bold transition disabled:cursor-default ${e.status === o.key ? o.on : "text-slate-500 hover:bg-white hover:text-slate-800 disabled:hover:bg-transparent"}`}
                        >
                          {o.short}
                        </button>
                      ))}
                    </div>
                  </div>
                  {second && (
                    <div className="mb-0.5 mt-1.5 flex flex-wrap items-center gap-2 sm:pl-[76px]">
                      {((showTimes && canWrite) || e.inTime || e.outTime) && works(e.status) && (
                        <>
                          <label className="flex items-center gap-1.5 text-xs text-slate-500">
                            In
                            <input type="time" value={e.inTime} disabled={!canWrite} onChange={(ev) => set(s.id, { inTime: ev.target.value })} className="field field-sm w-[118px] py-1" aria-label={`In time for ${s.name}`} />
                          </label>
                          <label className="flex items-center gap-1.5 text-xs text-slate-500">
                            Out
                            <input type="time" value={e.outTime} disabled={!canWrite} onChange={(ev) => set(s.id, { outTime: ev.target.value })} className="field field-sm w-[118px] py-1" aria-label={`Out time for ${s.name}`} />
                          </label>
                        </>
                      )}
                      <input
                        value={e.remark}
                        disabled={!canWrite}
                        maxLength={200}
                        onChange={(ev) => set(s.id, { remark: ev.target.value })}
                        placeholder={e.status === "Absent" ? "Note (optional), e.g. not informed" : e.status === "On Leave" ? "Reason (optional)" : e.status === "Half Day" ? "Note (optional), e.g. left at 11" : "Remark (optional)"}
                        aria-label={`Remark for ${s.name}`}
                        className="field field-sm min-w-[160px] flex-1 py-1"
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-b-2xl border-t border-slate-200 bg-white px-4 py-3">
            <span className="text-[13px] text-slate-600">
              <b className="text-emerald-700">{counts.Present}</b> present · <b className="text-rose-600">{counts.Absent}</b> absent · <b className="text-marigold-700">{counts["On Leave"]}</b> on leave · <b className="text-sky-700">{counts["Half Day"]}</b> half day
              <span className="text-slate-400"> · {total} staff</span>
            </span>
            {saveError && <span className="text-[13px] font-medium text-rose-700">{saveError}</span>}
            {canWrite ? (
              <span className="ml-auto flex items-center gap-3">
                {dirty && <span className="text-xs text-slate-500">Not saved</span>}
                <button type="button" onClick={save} disabled={saving || loading} className="btn btn-primary btn-sm min-w-[140px]">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? "Saving…" : day.marked >= total ? "Save changes" : "Save attendance"}
                </button>
              </span>
            ) : (
              <span className="ml-auto text-xs text-slate-500">View only · the office marks staff attendance</span>
            )}
          </div>
        </>
      )}
    </section>
  );
}
