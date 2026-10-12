"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CalendarClock, Plus, RefreshCw, Trash2, Video, X } from "lucide-react";
import { api } from "@/lib/apiClient";
import { toast } from "@/components/ui/Toaster";
import { classService, type ClassItem } from "@/lib/services/classService";

/**
 * Meetings and PTMs for parents. A PTM is cut into time slots that parents pick in the parent app;
 * a general meeting just asks "I'll come / Can't come". Parents of the chosen class see it at once.
 */

interface Booked {
  time: string;
  student: string;
}
interface Meeting {
  id: string;
  title: string;
  kind: "general" | "ptm";
  host: string | null;
  date: string;
  start: string;
  end: string;
  place: string | null;
  onlineUrl: string | null;
  agenda: string | null;
  slotMinutes: number | null;
  audience: string;
  yes: number;
  no: number;
  booked: Booked[];
  slotCount: number;
}

const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
const ampm = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
const dayLong = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

const EMPTY = { title: "", kind: "ptm" as "ptm" | "general", className: "", section: "", host: "", date: "", start: "10:00", end: "12:00", slotMinutes: "10", place: "", onlineUrl: "", agenda: "" };

export default function MeetingsPage() {
  const [rows, setRows] = useState<Meeting[] | null>(null);
  const [setup, setSetup] = useState(false);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [form, setForm] = useState<typeof EMPTY | null>(null);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    setRows(null);
    const r = await api.get<{ setupNeeded: boolean; data: Meeting[]; error?: string }>("/api/meetings");
    if (!r.ok) toast(r.error || "Could not load meetings.", "error");
    setSetup(!!r.data?.setupNeeded);
    setRows(Array.isArray(r.data?.data) ? r.data!.data : []);
  }, []);
  useEffect(() => {
    load();
    classService.fetchClasses().then((r) => setClasses(r.data));
  }, [load]);

  const set = (k: keyof typeof EMPTY, v: string) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    const r = await api.post<{ success: boolean; error?: string }>("/api/meetings", { ...form, slotMinutes: Number(form.slotMinutes) });
    setSaving(false);
    if (!r.ok || !r.data?.success) return toast(r.data?.error || r.error || "Could not save.", "error");
    toast("Meeting sent to parents' app.", "success");
    setForm(null);
    load();
  };

  const cancel = async (m: Meeting) => {
    if (!window.confirm(`Cancel "${m.title}"? Parents will stop seeing it.`)) return;
    const r = await api.del<{ success: boolean; error?: string }>(`/api/meetings/${m.id}`);
    if (!r.ok) return toast(r.error || "Could not cancel.", "error");
    toast("Meeting cancelled.", "success");
    load();
  };

  const sections = classes.find((c) => c.name === form?.className)?.sections || [];
  const t = today();

  if (setup)
    return (
      <div className="card mx-auto mt-6 max-w-lg p-8 text-center">
        <CalendarClock className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-3 font-semibold text-slate-900">Meetings need a one-time database setup</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Run sms backend/supabase/migrations/20261012_meetings.sql in the Supabase SQL editor.</p>
        <button type="button" onClick={load} className="btn btn-secondary btn-sm mt-4">
          <RefreshCw className="h-4 w-4" />
          Check again
        </button>
      </div>
    );

  return (
    <div className="space-y-5 pb-12">
      <header className="page-header">
        <div>
          <h1 className="page-title">Meetings &amp; PTM</h1>
          <p className="page-subtitle">Parents see these in the parent app. For a PTM they pick a free time; for other meetings they answer if they will come.</p>
        </div>
        {!form && (
          <button type="button" onClick={() => setForm({ ...EMPTY, date: t })} className="btn btn-primary min-h-[44px]">
            <Plus className="h-4 w-4" />
            New meeting
          </button>
        )}
      </header>

      {form && (
        <form onSubmit={save} className="card space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-slate-900">New meeting</h2>
            <button type="button" onClick={() => setForm(null)} aria-label="Close" className="btn btn-secondary btn-sm min-h-[36px]">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex w-fit gap-1 rounded-xl bg-slate-100 p-1" role="radiogroup" aria-label="Type">
            {(
              [
                ["ptm", "PTM · parents pick a time"],
                ["general", "Meeting · yes / no"],
              ] as const
            ).map(([k, label]) => (
              <button key={k} type="button" role="radio" aria-checked={form.kind === k} onClick={() => set("kind", k)} className={`min-h-[40px] rounded-lg px-4 text-[13px] font-semibold ${form.kind === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="field-label">Title</span>
              <input className="field" required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder={form.kind === "ptm" ? "Parent-Teacher Meeting" : "Annual Day planning"} />
            </label>
            <label>
              <span className="field-label">Class</span>
              <select className="field" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value, section: "" })}>
                <option value="">All parents</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">Section</span>
              <select className="field" value={form.section} disabled={!form.className} onChange={(e) => set("section", e.target.value)}>
                <option value="">All sections</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">Date</span>
              <input type="date" className="field" required min={t} value={form.date} onChange={(e) => set("date", e.target.value)} />
            </label>
            <label>
              <span className="field-label">With (teacher / principal)</span>
              <input className="field" value={form.host} onChange={(e) => set("host", e.target.value)} placeholder="Neha Sharma" />
            </label>
            <label>
              <span className="field-label">From</span>
              <input type="time" className="field" required value={form.start} onChange={(e) => set("start", e.target.value)} />
            </label>
            <label>
              <span className="field-label">To</span>
              <input type="time" className="field" required value={form.end} onChange={(e) => set("end", e.target.value)} />
            </label>
            {form.kind === "ptm" && (
              <label>
                <span className="field-label">Minutes per family</span>
                <select className="field" value={form.slotMinutes} onChange={(e) => set("slotMinutes", e.target.value)}>
                  {[5, 10, 15, 20, 30].map((n) => (
                    <option key={n} value={n}>
                      {n} minutes
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              <span className="field-label">Place</span>
              <input className="field" value={form.place} onChange={(e) => set("place", e.target.value)} placeholder="Room 4" />
            </label>
            <label className="sm:col-span-2">
              <span className="field-label">Online link (optional)</span>
              <input className="field" value={form.onlineUrl} onChange={(e) => set("onlineUrl", e.target.value)} placeholder="https://meet.google.com/…" />
            </label>
            <label className="sm:col-span-2">
              <span className="field-label">Agenda (optional)</span>
              <textarea className="field" rows={3} value={form.agenda} onChange={(e) => set("agenda", e.target.value)} />
            </label>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn btn-primary min-h-[44px]">
              {saving ? "Sending…" : "Send to parents"}
            </button>
          </div>
        </form>
      )}

      {!rows ? (
        <div className="card space-y-3 p-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-14 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <CalendarClock className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-800">No meetings yet</p>
          <p className="mt-1 text-sm text-slate-500">Make a PTM or a meeting; parents see it in their app.</p>
        </div>
      ) : (
        <div className="card divide-y divide-slate-100 overflow-hidden">
          {rows.map((m) => (
            <div key={m.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">
                    {m.title}
                    {m.date < t && <span className="ml-2 text-[12px] font-medium text-slate-400">Over</span>}
                  </p>
                  <p className="mt-0.5 text-[13px] text-slate-500">
                    {dayLong(m.date)} · {ampm(m.start)} – {ampm(m.end)} · {m.audience}
                    {m.host ? ` · ${m.host}` : ""}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-[13px] text-slate-600">
                    {m.onlineUrl && <Video className="h-3.5 w-3.5" />}
                    {m.kind === "ptm" ? `${m.booked.length} of ${m.slotCount} times booked` : `${m.yes} coming · ${m.no} can't`}
                  </p>
                </div>
                <div className="flex gap-2">
                  {m.kind === "ptm" && m.booked.length > 0 && (
                    <button type="button" onClick={() => setOpen(open === m.id ? null : m.id)} className="btn btn-secondary btn-sm min-h-[38px]">
                      {open === m.id ? "Hide list" : "Who booked"}
                    </button>
                  )}
                  {m.date >= t && (
                    <button type="button" onClick={() => cancel(m)} aria-label={`Cancel ${m.title}`} className="btn btn-secondary btn-sm min-h-[38px]">
                      <Trash2 className="h-4 w-4 text-rose-600" />
                    </button>
                  )}
                </div>
              </div>
              {open === m.id && (
                <ul className="mt-3 grid gap-1.5 rounded-xl bg-slate-50 p-3 text-[13px] sm:grid-cols-2">
                  {m.booked.map((b) => (
                    <li key={b.time} className="flex gap-3">
                      <span className="w-[70px] shrink-0 font-semibold tabular-nums text-slate-900">{ampm(b.time)}</span>
                      <span className="text-slate-600">{b.student}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
