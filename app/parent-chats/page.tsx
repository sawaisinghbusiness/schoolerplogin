"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Lock, MessagesSquare, RefreshCw, Search } from "lucide-react";
import { api } from "@/lib/apiClient";
import { toast } from "@/components/ui/Toaster";

/**
 * Parent–teacher chats (Ask Teacher in the parent app). The principal can read every conversation
 * here but not write in it: only the teacher (staff app) and the family (parent app) write.
 */

interface Row {
  id: string;
  student: string;
  classSec: string;
  teacher: string;
  last: { from: "parent" | "teacher"; text: string; at: string } | null;
}
interface Msg {
  id: string;
  from: "parent" | "teacher";
  text: string;
  at: string;
  meeting: { date: string; time: string; minutes: number; placeText: string; status: "waiting" | "yes" | "other" } | null;
}
interface Thread {
  id: string;
  student: string;
  classSec: string;
  teacher: string;
  messages: Msg[];
}

const ampm = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
const stamp = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const STATUS = { waiting: "Waiting for the parent", yes: "Parent said Okay", other: "Parent asked for another time" } as const;

export default function ParentChatsPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [setup, setSetup] = useState(false);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Thread | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setRows(null);
    const r = await api.get<{ setupNeeded: boolean; data: Row[]; error?: string }>("/api/teacher-chats");
    if (!r.ok) toast(r.error || "Could not load chats.", "error");
    setSetup(!!r.data?.setupNeeded);
    setRows(Array.isArray(r.data?.data) ? r.data!.data : []);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const show = async (id: string) => {
    setLoadingId(id);
    const r = await api.get<Thread & { error?: string }>(`/api/teacher-chats/${id}`);
    setLoadingId(null);
    if (!r.ok || !r.data) return toast(r.error || "Could not open this chat.", "error");
    setOpen(r.data);
  };

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (rows || []).filter((r) => !s || `${r.student} ${r.classSec} ${r.teacher}`.toLowerCase().includes(s));
  }, [rows, q]);

  if (setup)
    return (
      <div className="card mx-auto mt-6 max-w-lg p-8 text-center">
        <MessagesSquare className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-3 font-semibold text-slate-900">Parent–teacher chats need a one-time database setup</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Run sms backend/supabase/migrations/20261013_teacher_chat.sql in the Supabase SQL editor.</p>
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
          <h1 className="page-title">Parent–teacher chats</h1>
          <p className="page-subtitle">What parents ask teachers in the app. You can read every chat; only the teacher and the family can write.</p>
        </div>
        <button type="button" onClick={load} className="btn btn-secondary min-h-[44px]">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <section className="card overflow-hidden">
          <div className="border-b border-slate-100 p-3">
            <label className="relative block">
              <span className="sr-only">Search chats</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="field pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Student, class or teacher" />
            </label>
          </div>
          {rows === null ? (
            <p className="p-5 text-sm text-slate-500">Loading…</p>
          ) : shown.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">{rows.length ? "No chat matches this search." : "No parent has written to a teacher yet."}</p>
          ) : (
            <ul className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto">
              {shown.map((r) => (
                <li key={r.id}>
                  <button type="button" onClick={() => show(r.id)} className={`w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 ${open?.id === r.id ? "bg-slate-50" : ""}`}>
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[14px] font-semibold text-slate-900">
                        {r.student} <span className="font-normal text-slate-500">· {r.classSec}</span>
                      </span>
                      {r.last && <span className="shrink-0 text-[12px] text-slate-400">{stamp(r.last.at)}</span>}
                    </span>
                    <span className="block text-[12.5px] text-slate-500">with {r.teacher}</span>
                    {r.last && (
                      <span className="mt-0.5 block truncate text-[13px] text-slate-600">
                        {r.last.from === "teacher" ? "Teacher: " : "Parent: "}
                        {r.last.text}
                      </span>
                    )}
                    {loadingId === r.id && <span className="text-[12px] text-slate-400">Opening…</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card flex min-h-[420px] flex-col overflow-hidden">
          {!open ? (
            <div className="m-auto p-8 text-center">
              <MessagesSquare className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">Pick a chat on the left to read it.</p>
            </div>
          ) : (
            <>
              <div className="border-b border-slate-100 px-5 py-3">
                <p className="text-[15px] font-bold text-slate-900">
                  {open.student} <span className="font-normal text-slate-500">· {open.classSec}</span>
                </p>
                <p className="text-[13px] text-slate-500">Parent and {open.teacher}</p>
              </div>
              <div className="flex max-h-[62vh] flex-1 flex-col gap-2 overflow-y-auto bg-slate-50 px-5 py-4">
                {open.messages.map((m) => {
                  const teacher = m.from === "teacher";
                  return (
                    <div key={m.id} className={`max-w-[75%] rounded-xl border px-3 py-2 text-[14px] ${teacher ? "self-end border-emerald-100 bg-emerald-50" : "self-start border-slate-200 bg-white"}`}>
                      <p className="text-[11.5px] font-semibold text-slate-500">{teacher ? open.teacher : "Parent"}</p>
                      {m.meeting ? (
                        <p className="text-slate-800">
                          Meeting time: {new Date(m.meeting.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}, {ampm(m.meeting.time)} · {m.meeting.placeText}
                          <span className="block text-[12.5px] text-slate-500">{STATUS[m.meeting.status]}</span>
                        </p>
                      ) : (
                        <p className="whitespace-pre-wrap break-words text-slate-800">{m.text}</p>
                      )}
                      <p className="mt-0.5 text-right text-[11px] text-slate-400">{stamp(m.at)}</p>
                    </div>
                  );
                })}
              </div>
              <p className="flex items-center gap-2 border-t border-slate-100 px-5 py-2.5 text-[12.5px] text-slate-500">
                <Lock className="h-3.5 w-3.5" />
                Read only. Replies come from the teacher&apos;s staff app.
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
