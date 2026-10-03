"use client";

import React, { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, X } from "lucide-react";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { Period, timetableService } from "@/lib/services/timetableService";

type Row = { id?: string; label: string; start: string; end: string; isBreak: boolean };

/** The school's periods and breaks, the same for every class. */
export function PeriodsDrawer({ open, periods, onClose, onSaved }: { open: boolean; periods: Period[]; onClose: () => void; onSaved: () => void }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setRows(periods.map((p) => ({ id: p.id, label: p.label, start: p.start, end: p.end, isBreak: p.isBreak })));
    setError(null);
  }, [open, periods]);

  const set = (i: number, patch: Partial<Row>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const move = (i: number, d: number) =>
    setRows((r) => {
      const j = i + d;
      if (j < 0 || j >= r.length) return r;
      const n = [...r];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  const lessons = rows.filter((r) => !r.isBreak).length;

  const save = async () => {
    setBusy(true);
    setError(null);
    const r = await timetableService.savePeriods(rows);
    setBusy(false);
    if (!r.success) return setError(r.error || "Could not save.");
    onSaved();
  };

  return (
    <SideDrawer
      isOpen={open}
      onClose={onClose}
      busy={busy}
      width="max-w-[560px]"
      title="Periods"
      footer={
        <>
          <span className="text-[13px] text-slate-600">{lessons} lessons a day</span>
          <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary ml-auto">
            Cancel
          </button>
          <button type="button" onClick={save} disabled={busy} className="btn btn-primary">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </button>
        </>
      }
    >
      <div className="space-y-3 p-5">
        {error && <p role="alert" className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-800 ring-1 ring-rose-300">{error}</p>}
        <ol className="space-y-2">
          {rows.map((r, i) => (
            <li key={r.id || i} className="card flex flex-wrap items-center gap-2 p-3">
              <input value={r.label} onChange={(e) => set(i, { label: e.target.value })} aria-label={`Name of row ${i + 1}`} maxLength={24} className="field field-sm w-32 min-w-0 flex-1" />
              <input type="time" value={r.start} onChange={(e) => set(i, { start: e.target.value })} aria-label={`${r.label} starts`} className="field field-sm w-[7.5rem] tabular-nums" />
              <span className="text-xs text-slate-400">to</span>
              <input type="time" value={r.end} onChange={(e) => set(i, { end: e.target.value })} aria-label={`${r.label} ends`} className="field field-sm w-[7.5rem] tabular-nums" />
              <label className="flex min-h-[36px] items-center gap-1.5 text-[13px] text-slate-700">
                <input type="checkbox" checked={r.isBreak} onChange={(e) => set(i, { isBreak: e.target.checked })} className="h-4 w-4 accent-brand-600" />
                Break
              </label>
              <span className="ml-auto flex">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30" aria-label="Move up">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30" aria-label="Move down">
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setRows((x) => x.filter((_, j) => j !== i))} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600" aria-label={`Remove ${r.label}`}>
                  <X className="h-4 w-4" />
                </button>
              </span>
            </li>
          ))}
        </ol>
        <button type="button" onClick={() => setRows((x) => [...x, { label: `Period ${x.filter((y) => !y.isBreak).length + 1}`, start: "", end: "", isBreak: false }])} className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700 hover:underline">
          <Plus className="h-3.5 w-3.5" />
          Add a period
        </button>
      </div>
    </SideDrawer>
  );
}
