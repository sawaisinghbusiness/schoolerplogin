"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { Homework, PostOption, homeworkService } from "@/lib/services/homeworkService";

const OTHER = "__other__";
const todayStr = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

/** Post or change one piece of homework. The class can't be changed once posted. */
export function HomeworkDrawer({ open, options, sectionId, editing, onClose, onSaved }: {
  open: boolean;
  options: PostOption[];
  /** The section being looked at, used as the starting choice. */
  sectionId: string;
  editing: Homework | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [sec, setSec] = useState("");
  const [subject, setSubject] = useState("");
  const [other, setOther] = useState("");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [due, setDue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const opt = options.find((o) => o.sectionId === sec);

  useEffect(() => {
    if (!open) return;
    const start = options.find((o) => o.sectionId === sectionId) || options[0];
    setSec(start?.sectionId || "");
    const known = editing ? start?.subjects.includes(editing.subject) : true;
    setSubject(editing ? (known ? editing.subject : OTHER) : start?.subjects[0] || (start?.anySubject ? OTHER : ""));
    setOther(editing && !known ? editing.subject : "");
    setTitle(editing?.title || "");
    setDetails(editing?.details || "");
    setDue(editing?.dueDate || "");
    setError(null);
  }, [open, editing, options, sectionId]);

  const pickSection = (id: string) => {
    setSec(id);
    const o = options.find((x) => x.sectionId === id);
    setSubject(o?.subjects[0] || (o?.anySubject ? OTHER : ""));
    setOther("");
  };

  const name = subject === OTHER ? other.trim() : subject;

  const save = async () => {
    setBusy(true);
    setError(null);
    const body = { sectionId: sec, subject: name, title, details, dueDate: due };
    const r = editing ? await homeworkService.update(editing.id, body) : await homeworkService.create(body);
    setBusy(false);
    if (!r.success) return setError(r.error || "Could not save.");
    onSaved();
  };

  return (
    <SideDrawer
      isOpen={open}
      onClose={onClose}
      busy={busy}
      width="max-w-[520px]"
      title={editing ? "Change homework" : "New homework"}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary ml-auto">
            Cancel
          </button>
          <button type="button" onClick={save} disabled={busy || !sec || name.length < 2 || title.trim().length < 2} className="btn btn-primary">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {editing ? "Save" : "Post homework"}
          </button>
        </>
      }
    >
      <div className="space-y-4 p-5">
        {error && <p role="alert" className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-800 ring-1 ring-rose-300">{error}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">Class</span>
            <select value={sec} onChange={(e) => pickSection(e.target.value)} disabled={!!editing} className="field w-full">
              {options.map((o) => (
                <option key={o.sectionId} value={o.sectionId}>
                  {o.classSec}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">Subject</span>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="field w-full">
              {(opt?.subjects || []).map((s) => (
                <option key={s}>{s}</option>
              ))}
              {opt?.anySubject && <option value={OTHER}>Other…</option>}
            </select>
          </label>
        </div>
        {subject === OTHER && <input value={other} onChange={(e) => setOther(e.target.value)} placeholder="Subject name" maxLength={40} aria-label="Subject name" className="field w-full" autoFocus />}

        <label className="block">
          <span className="field-label">Homework</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Exercise 4.2, questions 1 to 10" maxLength={120} className="field w-full" />
        </label>

        <label className="block">
          <span className="field-label">
            More details <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={5} maxLength={2000} className="field w-full" />
        </label>

        <label className="block sm:w-1/2">
          <span className="field-label">
            Due date <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <input type="date" value={due} min={todayStr()} onChange={(e) => setDue(e.target.value)} className="field w-full" />
        </label>
      </div>
    </SideDrawer>
  );
}
