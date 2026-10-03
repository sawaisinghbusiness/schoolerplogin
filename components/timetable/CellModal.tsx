"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Busy, DAYS_LONG, Entry, Period, TTTeacher, timetableService } from "@/lib/services/timetableService";

const OTHER = "__other__";

/** One lesson: the subject, and the teacher if known. Teachers already teaching elsewhere then are greyed out. */
export function CellModal({ open, sectionId, classSec, subjects, day, period, entry, teachers, busy, onClose, onChanged }: {
  open: boolean;
  sectionId: string;
  classSec: string;
  subjects: string[];
  day: number;
  period: Period | null;
  entry: Entry | null;
  teachers: TTTeacher[];
  busy: Busy[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [other, setOther] = useState("");
  const [staffId, setStaffId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const known = entry && subjects.includes(entry.subject);
    setSubject(entry ? (known ? entry.subject : OTHER) : subjects[0] || OTHER);
    setOther(entry && !known ? entry.subject : "");
    setStaffId(entry?.staffId || "");
    setError(null);
  }, [open, entry, subjects]);

  const name = subject === OTHER ? other.trim() : subject;
  const taken = useMemo(() => new Map(busy.filter((b) => period && b.day === day && b.periodId === period.id).map((b) => [b.staffId, b.classSec])), [busy, day, period]);

  // Teachers of this class and subject first, then the rest.
  const { suggested, rest } = useMemo(() => {
    const mine = (t: TTTeacher) => t.assigned.some((a) => a.classSec === classSec && a.subject === name);
    const list = teachers.filter((t) => t.teaching);
    return { suggested: list.filter(mine), rest: list.filter((t) => !mine(t)) };
  }, [teachers, classSec, name]);

  // Picking a subject that has exactly one free teacher fills the teacher in.
  const pickSubject = (v: string) => {
    setSubject(v);
    if (v !== OTHER) {
      const free = teachers.filter((t) => t.assigned.some((a) => a.classSec === classSec && a.subject === v) && !taken.has(t.id));
      setStaffId(free.length === 1 ? free[0].id : "");
    } else setStaffId("");
  };

  if (!period) return null;

  const option = (t: TTTeacher) => (
    <option key={t.id} value={t.id} disabled={taken.has(t.id) && t.id !== entry?.staffId}>
      {t.name}
      {taken.has(t.id) ? ` · busy in ${taken.get(t.id)}` : ""}
    </option>
  );

  const run = async (job: () => Promise<{ success: boolean; error?: string }>) => {
    setSaving(true);
    setError(null);
    const r = await job();
    setSaving(false);
    if (!r.success) return setError(r.error || "Could not save.");
    onChanged();
  };

  return (
    <Modal isOpen={open} onClose={() => !saving && onClose()} title={`${DAYS_LONG[day - 1]} · ${period.label}`} subtitle={classSec} maxWidth="max-w-md">
      <div className="space-y-4">
        {error && <p role="alert" className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-800 ring-1 ring-rose-300">{error}</p>}

        <label className="block">
          <span className="field-label">Subject</span>
          <select value={subject} onChange={(e) => pickSubject(e.target.value)} className="field w-full">
            {subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
            <option value={OTHER}>Other…</option>
          </select>
        </label>
        {subject === OTHER && (
          <input value={other} onChange={(e) => setOther(e.target.value)} placeholder="e.g. Games" maxLength={40} aria-label="Subject name" className="field w-full" autoFocus />
        )}

        <label className="block">
          <span className="field-label">Teacher</span>
          <select value={staffId} onChange={(e) => setStaffId(e.target.value)} className="field w-full">
            <option value="">Not chosen</option>
            {suggested.length > 0 && <optgroup label={`Teaches ${name || "this"} here`}>{suggested.map(option)}</optgroup>}
            {rest.length > 0 && <optgroup label={suggested.length ? "Other teachers" : "Teachers"}>{rest.map(option)}</optgroup>}
          </select>
        </label>

        <div className="flex items-center gap-2 border-t border-slate-200 pt-4">
          {entry && (
            <button type="button" disabled={saving} onClick={() => run(() => timetableService.clearCell({ sectionId, day, periodId: period.id }))} className="btn btn-secondary">
              Clear
            </button>
          )}
          <button type="button" onClick={onClose} disabled={saving} className="btn btn-secondary ml-auto">
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || name.length < 2}
            onClick={() => run(() => timetableService.setCell({ sectionId, day, periodId: period.id, subject: name, staffId: staffId || null }))}
            className="btn btn-primary"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
