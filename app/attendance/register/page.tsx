"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { ChevronLeft, ChevronRight, Download, Printer, RefreshCw } from "lucide-react";
import { attendanceRegisterService, LowReport, MonthRegister, RegisterSection } from "@/lib/services/attendanceRegisterService";
import { RegisterGrid, Legend, isOff } from "@/components/attendance/register/RegisterGrid";
import { LowList } from "@/components/attendance/register/LowList";
import { PrintRegister } from "@/components/attendance/register/PrintRegister";

type Tab = "register" | "low";

const BELOW = 75;
const SESSION_START_MONTH = "2026-04";
const SEC_KEY = "att.register.sec";
const SCHOOL = "St. Paul School, Barmer";

const todayIST = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
const shiftMonth = (m: string, by: number) => {
  const [y, mo] = m.split("-").map(Number);
  const d = new Date(Date.UTC(y, mo - 1 + by, 1));
  return d.toISOString().slice(0, 7);
};
const monthLabel = (m: string) => new Date(m + "-01T00:00:00").toLocaleDateString("en-IN", { month: "long", year: "numeric" });
const secKey = (s: { class: string; section: string }) => `${s.class}|${s.section}`;
const num = (n: number) => n.toLocaleString("en-IN");

export default function AttendanceRegisterPage() {
  const today = todayIST();
  const thisMonth = today.slice(0, 7);

  const [sections, setSections] = useState<RegisterSection[] | null>(null);
  const [sectionsError, setSectionsError] = useState<string | null>(null);
  const [sec, setSec] = useState<string>("");
  const [month, setMonth] = useState(thisMonth);
  const [tab, setTab] = useState<Tab>("register");

  const [reg, setReg] = useState<MonthRegister | null>(null);
  const [regError, setRegError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  const [low, setLow] = useState<LowReport | null>(null);
  const [lowError, setLowError] = useState<string | null>(null);
  const [lowLoading, setLowLoading] = useState(false);

  const [printing, setPrinting] = useState(false);
  const regSeq = useRef(0);
  const lowSeq = useRef(0);

  const loadSections = async () => {
    const r = await attendanceRegisterService.sections();
    if (!r.data) return setSectionsError(r.error || "Could not load the classes.");
    setSectionsError(null);
    setSections(r.data);
    setSec((cur) => {
      if (cur && r.data!.some((s) => secKey(s) === cur)) return cur;
      let saved = "";
      try {
        saved = localStorage.getItem(SEC_KEY) || "";
      } catch {
        /* private window */
      }
      return r.data!.some((s) => secKey(s) === saved) ? saved : r.data![0] ? secKey(r.data![0]) : "";
    });
  };

  const loadRegister = async (key = sec, m = month) => {
    if (!key) return;
    const mine = ++regSeq.current;
    const [cls, section] = key.split("|");
    setRegLoading(true);
    const r = await attendanceRegisterService.month(cls, section, m);
    if (mine !== regSeq.current) return; // a newer pick meanwhile
    setRegLoading(false);
    if (!r.data) {
      setReg(null); // never show another section's grid under this title
      return setRegError(r.error || "Could not load the register.");
    }
    setRegError(null);
    setReg(r.data);
  };

  const loadLow = async (m = month) => {
    const mine = ++lowSeq.current;
    setLowLoading(true);
    const r = await attendanceRegisterService.low(m, BELOW);
    if (mine !== lowSeq.current) return;
    setLowLoading(false);
    if (!r.data) {
      setLow(null);
      return setLowError(r.error || "Could not load the list.");
    }
    setLowError(null);
    setLow(r.data);
  };

  useEffect(() => {
    loadSections();
  }, []);
  useEffect(() => {
    if (!sec) return;
    try {
      localStorage.setItem(SEC_KEY, sec);
    } catch {
      /* ignore */
    }
    loadRegister(sec, month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sec, month]);
  useEffect(() => {
    loadLow(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const current = sections?.find((s) => secKey(s) === sec) || null;
  const classSec = reg?.classSec || current?.classSec || "";
  const byClass = useMemo(() => {
    const groups: { cls: string; list: RegisterSection[] }[] = [];
    for (const s of sections || []) {
      const g = groups[groups.length - 1];
      if (g && g.cls === s.class) g.list.push(s);
      else groups.push({ cls: s.class, list: [s] });
    }
    return groups;
  }, [sections]);

  /* ── Figures ── */
  const ready = !!reg && !regLoading;
  const wd = reg?.totals.workingDays || 0;
  const schoolDaysSoFar = reg ? reg.days.filter((d) => !isOff(d) && d.date <= today).length : 0;
  const marked = reg ? reg.students.filter((s) => s.workingDays > 0) : [];
  const absentDays = marked.reduce((t, s) => t + s.absent, 0);
  const leaveDays = marked.reduce((t, s) => t + s.leave, 0);
  const halfDays = marked.reduce((t, s) => t + s.half, 0);
  const belowHere = marked.filter((s) => s.percent !== null && s.percent < BELOW).length;
  const avg = reg?.totals.averagePercent ?? null;

  /* ── Excel ── */
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    if (tab === "low") {
      if (!low) return;
      const data = low.students.map((s) => ({
        "SR no.": s.srNo,
        Student: s.name,
        Class: s.classSec,
        Roll: s.rollNo,
        Father: s.fatherName,
        Mobile: s.mobile,
        "Days marked": s.workingDays,
        Present: s.present,
        "Half day": s.half,
        Absent: s.absent,
        Leave: s.leave,
        "Attendance %": s.percent,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), `Below ${BELOW}%`);
      return XLSX.writeFile(wb, `Attendance_below_${BELOW}_${month}.xlsx`);
    }
    if (!reg) return;
    const dayCols = reg.days.map((d) => String(Number(d.date.slice(8))));
    const aoa: (string | number)[][] = [
      [`${SCHOOL} · Attendance register · ${reg.classSec} · ${monthLabel(month)}`],
      [],
      ["Roll", "Student", "SR no.", ...dayCols, "Present", "Half day", "Absent", "Leave", "Days marked", "Attendance %"],
      ["", "", "", ...reg.days.map((d) => (d.holiday ? "Holiday" : d.sunday ? "Sun" : d.weekday)), "", "", "", "", "", ""],
    ];
    for (const s of reg.students) {
      aoa.push([
        s.rollNo,
        s.name,
        s.srNo,
        ...reg.days.map((d) => s.marks[d.date] || (isOff(d) ? (d.holiday ? "H" : "S") : "")),
        s.present,
        s.half,
        s.absent,
        s.leave,
        s.workingDays,
        s.percent === null ? "" : s.percent,
      ]);
    }
    const sum = (k: "present" | "half" | "absent" | "leave") => reg.students.reduce((t, s) => t + s[k], 0);
    aoa.push(["", "Present each day", "", ...reg.days.map((d) => (d.marked ? d.present : "")), sum("present"), sum("half"), sum("absent"), sum("leave"), wd, avg === null ? "" : avg]);
    aoa.push([]);
    aoa.push(["", "P present · A absent · L leave · H half day (counts as ½) · S Sunday · H on a holiday column = holiday"]);
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 5 }, { wch: 24 }, { wch: 8 }, ...dayCols.map(() => ({ wch: 3.5 })), { wch: 8 }, { wch: 8 }, { wch: 7 }, { wch: 6 }, { wch: 11 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws, "Register");
    XLSX.writeFile(wb, `Attendance_${reg.classSec.replace(/[^A-Za-z0-9]+/g, "_")}_${month}.xlsx`);
  };

  const canExport = tab === "low" ? !!low?.students.length && !lowLoading : ready && wd > 0;
  const canPrint = ready && wd > 0 && tab === "register";
  const refresh = () => {
    loadRegister();
    loadLow();
  };

  return (
    <div className="space-y-5 pb-24">
      <header className="page-header">
        <div>
          <h1 className="page-title">Attendance register</h1>
          <p className="page-subtitle">
            {classSec ? `${classSec} · ` : ""}
            {monthLabel(month)}
            {reg && !regLoading ? ` · ${num(reg.students.length)} student${reg.students.length === 1 ? "" : "s"}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={refresh} disabled={regLoading || lowLoading} className="btn btn-secondary" aria-label="Reload">
            <RefreshCw className={`h-4 w-4 ${regLoading || lowLoading ? "animate-spin" : ""}`} />
          </button>
          <button type="button" onClick={() => setPrinting(true)} disabled={!canPrint} className="btn btn-secondary" title={tab === "register" ? "Print the register (A4 landscape)" : "Switch to the Register tab to print"}>
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button type="button" onClick={exportExcel} disabled={!canExport} className="btn btn-secondary">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <select value={sec} onChange={(e) => setSec(e.target.value)} disabled={!sections} aria-label="Class and section" className="field field-sm min-w-[190px] max-w-full font-semibold">
          {!sections && <option value="">{sectionsError ? "Classes not loaded" : "Loading classes…"}</option>}
          {byClass.map((g) => (
            <optgroup key={g.cls} label={g.cls}>
              {g.list.map((s) => (
                <option key={secKey(s)} value={secKey(s)}>
                  {s.classSec} ({s.students})
                </option>
              ))}
            </optgroup>
          ))}
        </select>
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
      </div>

      {sectionsError && (
        <div className="alert alert-rose">
          <span>{sectionsError}</span>
          <button type="button" onClick={loadSections} className="ml-auto font-semibold underline">
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Figure label="Days marked" title="Working days marked" value={ready ? num(wd) : "…"} note={ready ? `of ${schoolDaysSoFar} school day${schoolDaysSoFar === 1 ? "" : "s"}` : ""} dot="bg-brand-500" />
        <Figure label="Attendance" title="Average attendance" value={ready ? (avg === null ? "—" : `${avg}%`) : "…"} note={ready ? (wd ? `average of ${num(marked.length)}` : "Nothing marked yet") : ""} dot="bg-emerald-500" />
        <Figure label="Absent days" title="Absent-days total" value={ready ? num(absentDays) : "…"} note={ready ? `${num(leaveDays)} leave · ${num(halfDays)} half` : ""} dot="bg-rose-500" />
        <Figure label={`Below ${BELOW}%`} value={ready ? num(belowHere) : "…"} note={low && !lowLoading ? `${num(low.students.length)} across the school` : ""} dot="bg-marigold-400" />
      </div>

      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-slate-200/80 p-3 sm:p-4">
          <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1" role="tablist">
            {(
              [
                ["register", "Register"],
                ["low", `Below ${BELOW}%`],
              ] as [Tab, string][]
            ).map(([k, l]) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-semibold ${tab === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                {l}
                {k === "low" && low && !lowLoading && low.students.length > 0 ? <span className="ml-1.5 rounded-full bg-rose-50 px-1.5 text-xs text-rose-700">{num(low.students.length)}</span> : null}
              </button>
            ))}
          </div>
          <span className="ml-auto text-[13px] text-slate-500">
            {tab === "register"
              ? ready && wd > 0
                ? `${wd} working day${wd === 1 ? "" : "s"} · % = present ÷ days marked`
                : ""
              : `Whole school · ${monthLabel(month)} · lowest first`}
          </span>
        </div>

        {tab === "register" ? (
          regError && !regLoading ? (
            <ErrorBox message={regError} onRetry={() => loadRegister()} />
          ) : !reg || regLoading ? (
            <Skeleton />
          ) : wd === 0 ? (
            <div className="px-6 py-14 text-center text-sm text-slate-500">
              <p>
                No attendance marked for <b className="font-semibold text-slate-700">{reg.classSec}</b> in {monthLabel(month)} yet.
              </p>
              <p className="mt-1">
                Mark it from{" "}
                <Link href="/attendance/mark" className="font-semibold text-brand-700 hover:underline">
                  Attendance → Mark attendance
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              <RegisterGrid data={reg} today={today} />
              <Legend />
            </>
          )
        ) : lowError && !lowLoading ? (
          <ErrorBox message={lowError} onRetry={() => loadLow()} />
        ) : !low || lowLoading ? (
          <Skeleton />
        ) : low.students.length === 0 ? (
          <p className="px-6 py-14 text-center text-sm text-slate-500">Nobody marked in {monthLabel(month)} is below {BELOW}%.</p>
        ) : (
          <>
            <LowList report={low} highlight={classSec} />
            <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-[13px] text-slate-500">
              {num(low.students.length)} student{low.students.length === 1 ? "" : "s"} below {BELOW}% · the WhatsApp button opens a Hindi message to the parent
            </div>
          </>
        )}
      </section>

      {printing && reg && <PrintRegister data={reg} today={today} title={`${SCHOOL} · Attendance register · ${reg.classSec} · ${monthLabel(month)}`} onDone={() => setPrinting(false)} />}
    </div>
  );
}

function Figure({ label, value, note, dot, title }: { label: string; value: string; note: string; dot: string; title?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-5" title={title}>
      <span className="flex items-center gap-2 text-[13px] font-semibold text-slate-600">
        <i className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
        <span className="truncate">{label}</span>
      </span>
      <span className="mt-1.5 block text-[26px] font-bold leading-none tracking-tight tabular-nums text-slate-900">{value}</span>
      <span className="mt-2 block min-h-[1.25rem] truncate text-[13px] text-slate-500">{note}</span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton h-9 w-full" />
      ))}
    </div>
  );
}

function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="px-6 py-12 text-center text-sm">
      <p className="text-rose-700">{message}</p>
      <button type="button" onClick={onRetry} className="btn btn-secondary btn-sm mt-3">
        Try again
      </button>
    </div>
  );
}
