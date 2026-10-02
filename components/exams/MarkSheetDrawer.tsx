"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { toast } from "@/components/ui/Toaster";
import { gradeFor, markProblem, totalOf } from "@/lib/grading";
import { Sheet, examService } from "@/lib/services/examService";

interface Row {
  studentId: string;
  rollNo: string;
  name: string;
  values: Record<string, string>;
  absent: boolean;
}

const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const toRows = (s: Sheet): Row[] =>
  s.rows.map((r) => ({
    studentId: r.studentId,
    rollNo: r.rollNo,
    name: r.name,
    absent: r.absent,
    values: Object.fromEntries(s.exam.components.map((p) => [p.key, typeof r.marks[p.key] === "number" ? String(r.marks[p.key]) : ""])),
  }));

/** One subject's marks for one section, entered like a spreadsheet. */
export function MarkSheetDrawer({ target, onClose, onSaved }: {
  target: { examId: string; section: string; subject: string } | null;
  onClose: () => void;
  onSaved: (section: string, subject: string, entered: number) => void;
}) {
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [saved, setSaved] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const grid = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    if (!target) return;
    setSheet(null);
    setRows([]);
    setError(null);
    setConfirmClose(false);
    examService.sheet(target.examId, target.section, target.subject).then((r) => {
      if (r.error || !r.data) return setError(r.error || "Could not open the mark sheet.");
      const rs = toRows(r.data);
      setSheet(r.data);
      setRows(rs);
      setSaved(JSON.stringify(rs));
    });
  }, [target]);

  const parts = sheet?.exam.components || [];
  const max = sheet?.exam.max || 100;
  const locked = !!sheet?.exam.locked;
  const dirty = !!sheet && JSON.stringify(rows) !== saved;

  const problems = useMemo(() => {
    const out: Record<string, string> = {};
    for (const r of rows) {
      if (r.absent) continue;
      for (const p of parts) {
        const v = r.values[p.key];
        if (v === "") continue;
        const msg = markProblem(p, Number(v));
        if (msg) out[`${r.studentId}|${p.key}`] = msg;
      }
    }
    return out;
  }, [rows, parts]);

  const badCount = Object.keys(problems).length;
  const filled = rows.filter((r) => r.absent || parts.some((p) => r.values[p.key] !== "")).length;
  const partial = rows.filter((r) => !r.absent && parts.some((p) => r.values[p.key] !== "") && parts.some((p) => r.values[p.key] === "")).length;

  const setValue = (i: number, key: string, raw: string) => {
    // Typing "a" (or "ab") marks the child absent.
    if (/^a/i.test(raw.trim())) {
      setRows((rs) => rs.map((r, j) => (j === i ? { ...r, absent: true, values: Object.fromEntries(parts.map((p) => [p.key, ""])) } : r)));
      return;
    }
    const clean = raw.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1").slice(0, 6);
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, absent: false, values: { ...r.values, [key]: clean } } : r)));
  };

  const toggleAbsent = (i: number) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, absent: !r.absent, values: r.absent ? r.values : Object.fromEntries(parts.map((p) => [p.key, ""])) } : r)));

  const focusCell = (row: number, col: number) => {
    const el = grid.current?.querySelector<HTMLInputElement>(`input[data-cell="${row}-${col}"]`);
    if (el) {
      el.focus();
      el.select();
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      focusCell(row + 1, col);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusCell(row - 1, col);
    } else if (e.key === "ArrowRight" && e.currentTarget.selectionStart === e.currentTarget.value.length) {
      focusCell(row, col + 1);
    } else if (e.key === "ArrowLeft" && e.currentTarget.selectionStart === 0) {
      focusCell(row, col - 1);
    }
  };

  // Start typing straight away: the cursor waits in the first row with no marks yet.
  useEffect(() => {
    if (!sheet || locked) return;
    const first = rows.findIndex((r) => !r.absent && parts.every((p) => r.values[p.key] === ""));
    const t = setTimeout(() => focusCell(first < 0 ? 0 : first, 0), 80);
    return () => clearTimeout(t);
  }, [sheet]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = useCallback(async () => {
    if (!target || !sheet || locked) return;
    if (Object.keys(problems).length) return setError("Fix the marks shown in red first.");
    setBusy(true);
    setError(null);
    const payload = rows.map((r) => ({
      studentId: r.studentId,
      absent: r.absent,
      marks: Object.fromEntries(parts.map((p) => [p.key, r.values[p.key] === "" ? null : Number(r.values[p.key])])),
    }));
    const res = await examService.saveSheet(target.examId, target.section, target.subject, payload);
    setBusy(false);
    if (res.error) return setError(res.error);
    setSaved(JSON.stringify(rows));
    setConfirmClose(false);
    toast(`${target.subject}, ${target.section}: marks saved.`, "success");
    onSaved(target.section, target.subject, filled);
  }, [target, sheet, locked, problems, rows, parts, filled, onSaved]);

  // Ctrl+S saves.
  useEffect(() => {
    if (!target) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [target, save]);

  const tryClose = () => {
    if (dirty && !locked) return setConfirmClose(true);
    onClose();
  };

  return (
    <SideDrawer
      isOpen={!!target}
      onClose={tryClose}
      busy={busy}
      width="max-w-[780px]"
      title={target ? `${target.subject} · ${target.section}` : "Marks"}
      subtitle={sheet ? `${sheet.exam.title} · out of ${max}${(() => {
        const u = target && sheet.exam.scope?.[target.section.split(" - ")[0]]?.units?.[target.subject];
        return u ? ` · ${u}` : "";
      })()}${sheet.lastSaved ? ` · last saved ${when(sheet.lastSaved.at)}${sheet.lastSaved.by ? ` by ${sheet.lastSaved.by.split(" (")[0]}` : ""}` : ""}` : ""}
      footer={
        sheet &&
        (confirmClose ? (
          <>
            <span className="text-[13px] font-semibold text-marigold-800">These marks are not saved.</span>
            <button type="button" onClick={onClose} className="btn btn-secondary ml-auto">Discard</button>
            <button type="button" onClick={save} disabled={busy} className="btn btn-primary">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Save marks
            </button>
          </>
        ) : (
          <>
            <span className="text-[13px] tabular-nums text-slate-500">
              {filled} of {rows.length} entered
              {partial > 0 && <span className="text-marigold-800"> · {partial} incomplete</span>}
              {badCount > 0 && <span className="font-semibold text-rose-600"> · {badCount} {badCount === 1 ? "mark needs" : "marks need"} fixing</span>}
            </span>
            {locked ? (
              <span className="badge badge-slate ml-auto"><Lock className="h-3 w-3" />Locked by the admin</span>
            ) : (
              <>
                <button type="button" onClick={tryClose} disabled={busy} className="btn btn-secondary ml-auto">Close</button>
                <button type="button" onClick={save} disabled={busy || !dirty || badCount > 0} className="btn btn-primary" title={badCount ? "Fix the marks in red first" : "Ctrl + S"}>
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {dirty ? "Save marks" : "Saved"}
                </button>
              </>
            )}
          </>
        ))
      }
    >
      {error && <p role="alert" className="mx-5 mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100">{error}</p>}
      {!sheet ? (
        !error && (
          <div className="space-y-2 p-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-9 w-full" />
            ))}
          </div>
        )
      ) : rows.length === 0 ? (
        <p className="p-8 text-center text-sm text-slate-500">No students in {sheet.classSec}.</p>
      ) : (
        <div className="p-5">
          <p className="mb-3 text-xs text-slate-500">Enter or ↓ moves down · type <b className="font-semibold">a</b> for absent · Ctrl + S saves</p>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="table-head">
                <tr>
                  <th className="w-12 px-3 py-2.5 text-left">Roll</th>
                  <th className="px-3 py-2.5 text-left">Student</th>
                  {parts.map((p) => (
                    <th key={p.key} className="w-24 px-2 py-2.5 text-right">
                      {parts.length > 1 ? p.name : "Marks"}
                      <span className="block text-[11px] font-normal normal-case text-slate-400">out of {p.max}</span>
                    </th>
                  ))}
                  {parts.length > 1 && <th className="w-16 px-2 py-2.5 text-right">Total</th>}
                  <th className="w-14 px-2 py-2.5 text-center">Grade</th>
                  <th className="w-14 px-3 py-2.5 text-center">AB</th>
                </tr>
              </thead>
              <tbody ref={grid} className="divide-y divide-slate-100">
                {rows.map((r, i) => {
                  const nums = Object.fromEntries(parts.map((p) => [p.key, r.values[p.key] === "" ? null : Number(r.values[p.key])]));
                  const total = r.absent ? null : totalOf(parts, nums);
                  const bad = parts.some((p) => problems[`${r.studentId}|${p.key}`]);
                  return (
                    <tr key={r.studentId} className={r.absent ? "bg-slate-50" : bad ? "bg-rose-50/40" : ""}>
                      <td className="px-3 py-1.5 tabular-nums text-slate-500">{r.rollNo || i + 1}</td>
                      <td className="max-w-[14rem] truncate px-3 py-1.5 font-medium text-slate-900">{r.name}</td>
                      {parts.map((p, c) => {
                        const msg = problems[`${r.studentId}|${p.key}`];
                        return (
                          <td key={p.key} className="px-2 py-1">
                            <input
                              data-cell={`${i}-${c}`}
                              value={r.absent ? "AB" : r.values[p.key]}
                              onChange={(e) => setValue(i, p.key, e.target.value)}
                              onKeyDown={(e) => onKey(e, i, c)}
                              onFocus={(e) => e.currentTarget.select()}
                              disabled={locked}
                              inputMode="decimal"
                              aria-label={`${r.name}, ${p.name}`}
                              aria-invalid={!!msg}
                              title={msg || undefined}
                              className={`h-8 w-full rounded-md border bg-white px-2 text-right tabular-nums outline-none transition focus:ring-2 disabled:bg-transparent ${msg ? "border-rose-400 text-rose-700 focus:ring-rose-200" : r.absent ? "border-transparent bg-transparent font-semibold text-slate-400" : "border-slate-200 focus:border-brand-500 focus:ring-brand-100"}`}
                            />
                          </td>
                        );
                      })}
                      {parts.length > 1 && <td className="px-2 py-1.5 text-right font-semibold tabular-nums text-slate-900">{bad ? "" : total ?? ""}</td>}
                      <td className="px-2 py-1.5 text-center text-[13px] font-semibold text-slate-600">{total !== null && !bad ? gradeFor((total / max) * 100) : ""}</td>
                      <td className="px-3 py-1.5 text-center">
                        <input type="checkbox" checked={r.absent} onChange={() => toggleAbsent(i)} disabled={locked} aria-label={`${r.name} absent`} className="h-4 w-4 accent-slate-600" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </SideDrawer>
  );
}
