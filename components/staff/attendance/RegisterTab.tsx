"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Printer, RefreshCw } from "lucide-react";
import { StaffRegister, monthLabel, shiftMonth, staffAttendanceService, todayIST } from "@/lib/services/staffAttendanceService";
import { useSchoolProfile } from "@/components/providers/SchoolProfileProvider";
import { ErrorBox, Rows, SetupNeeded } from "./shared";
import { Legend, StaffRegisterGrid, isOff } from "./StaffRegisterGrid";
import { PrintStaffRegister } from "./PrintStaffRegister";

const SESSION_START_MONTH = "2026-04";

const csvCell = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function RegisterTab() {
  const { schoolProfile } = useSchoolProfile();
  const today = todayIST();
  const thisMonth = today.slice(0, 7);
  const [month, setMonth] = useState(thisMonth);
  const [reg, setReg] = useState<StaffRegister | null>(null);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const seq = useRef(0);

  const load = useCallback(async () => {
    const mine = ++seq.current;
    setLoading(true);
    const r = await staffAttendanceService.month(month);
    if (mine !== seq.current) return;
    setLoading(false);
    if (r.setupNeeded) return setSetupNeeded(true);
    setSetupNeeded(false);
    if (!r.data) {
      setReg(null);
      return setError(r.error || "Could not load the register.");
    }
    setError(null);
    setReg(r.data);
  }, [month]);
  useEffect(() => {
    load();
  }, [load]);

  const school = [schoolProfile.school_name, schoolProfile.city].filter(Boolean).join(", ") || "School";
  const title = `${school} · Staff attendance register · ${monthLabel(month)}`;
  const ready = !!reg && !loading && reg.month === month;
  const wd = reg?.totals.workingDays || 0;

  const downloadCsv = () => {
    if (!reg) return;
    const lines: (string | number)[][] = [
      [title],
      [],
      ["Emp code", "Name", "Designation", ...reg.days.map((d) => Number(d.date.slice(8))), "Present", "Absent", "On leave", "Half day", "Days marked"],
      ["", "", "", ...reg.days.map((d) => (d.holiday ? "Holiday" : d.weekday)), "", "", "", "", ""],
    ];
    for (const s of reg.staff) {
      lines.push([s.empCode, s.name, s.designation, ...reg.days.map((d) => s.marks[d.date] || (isOff(d) ? (d.holiday ? "Hol" : "S") : "")), s.present, s.absent, s.leave, s.half, s.days]);
    }
    lines.push([]);
    lines.push(["P present · A absent · L on leave · H half day · S Sunday · Hol holiday"]);
    const csv = "﻿" + lines.map((l) => l.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `Staff_attendance_${month}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (setupNeeded) return <SetupNeeded onRetry={load} />;

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 p-3 sm:px-4">
        <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-2xs">
          <button type="button" onClick={() => setMonth(shiftMonth(month, -1))} disabled={month <= SESSION_START_MONTH} className="rounded-l-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40" aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[124px] border-x border-slate-200 px-3 py-1.5 text-center text-[13px] font-semibold tabular-nums text-slate-900" aria-live="polite">
            {monthLabel(month)}
          </span>
          <button type="button" onClick={() => setMonth(shiftMonth(month, 1))} disabled={month >= thisMonth} className="rounded-r-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40" aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        {month !== thisMonth && (
          <button type="button" onClick={() => setMonth(thisMonth)} className="px-1 text-[13px] font-semibold text-brand-700 hover:underline">
            This month
          </button>
        )}
        <span className="min-w-0 truncate text-[13px] text-slate-500">
          {ready ? `${reg!.staff.length} staff · ${wd} day${wd === 1 ? "" : "s"} marked of ${reg!.totals.schoolDays} school day${reg!.totals.schoolDays === 1 ? "" : "s"}` : ""}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={load} disabled={loading} className="btn btn-secondary btn-sm px-2" aria-label="Reload">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button type="button" onClick={() => setPrinting(true)} disabled={!ready || !reg!.staff.length} className="btn btn-secondary btn-sm" title="Print the register (A4 landscape)">
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>
          <button type="button" onClick={downloadCsv} disabled={!ready || !reg!.staff.length} className="btn btn-secondary btn-sm">
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>
        </div>
      </div>

      {error && !loading ? (
        <ErrorBox message={error} onRetry={load} />
      ) : !ready ? (
        <Rows n={6} h="h-9" />
      ) : reg!.staff.length === 0 ? (
        <p className="px-6 py-14 text-center text-sm text-slate-500">Nobody was on the staff rolls in {monthLabel(month)}.</p>
      ) : (
        <>
          {wd === 0 && <p className="border-b border-slate-100 bg-slate-50/60 px-4 py-2 text-[13px] text-slate-500">No staff attendance marked in {monthLabel(month)} yet.</p>}
          <StaffRegisterGrid data={reg!} today={today} />
          <Legend />
        </>
      )}

      {printing && reg && <PrintStaffRegister data={reg} today={today} title={title} onDone={() => setPrinting(false)} />}
    </section>
  );
}
