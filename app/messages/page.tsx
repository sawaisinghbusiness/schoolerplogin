"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Globe, MessageSquareText, Plus, RefreshCw } from "lucide-react";
import { Message, messageService } from "@/lib/services/messageService";
import { ComposeDrawer } from "@/components/messages/ComposeDrawer";
import { SendDrawer } from "@/components/messages/SendDrawer";

const when = (iso: string) => {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }),
  };
};

function role(): string {
  try {
    return localStorage.getItem("schooldesk_user_role") || "";
  } catch {
    return "";
  }
}

export default function MessagesPage() {
  const [list, setList] = useState<Message[] | null>(null);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [me, setMe] = useState("");

  const load = useCallback(async () => {
    setRefreshing(true);
    const r = await messageService.list();
    setRefreshing(false);
    setSetupNeeded(r.setupNeeded);
    setLoadError(r.error || null);
    setList(r.data);
  }, []);

  useEffect(() => {
    load();
    setMe(role());
    // /messages?new=1 opens the composer straight away (old "Send circular" links land here).
    if (new URLSearchParams(window.location.search).get("new") === "1") {
      setComposeOpen(true);
      window.history.replaceState(null, "", "/messages");
    }
  }, [load]);

  const canWrite = me === "admin" || me === "accountant";

  return (
    <div className="space-y-5 pb-12">
      <header className="page-header">
        <div>
          <h1 className="page-title">Messages</h1>
          <p className="page-subtitle">Notices and reminders to parents on WhatsApp, and who has received them</p>
        </div>
        {canWrite && !setupNeeded && (
          <button type="button" onClick={() => setComposeOpen(true)} className="btn btn-primary">
            <Plus className="h-4 w-4" />
            New message
          </button>
        )}
      </header>

      {setupNeeded || loadError ? (
        <div className="card p-8 text-center">
          <MessageSquareText className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">{setupNeeded ? "Messages need a one-time database setup" : "Couldn't load messages"}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            {setupNeeded ? "Run sms backend/supabase/migrations/20261001_messages.sql in the Supabase SQL editor, then check again." : loadError}
          </p>
          <button type="button" onClick={load} className="btn btn-secondary btn-sm mt-4">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Check again
          </button>
        </div>
      ) : (
        <section className="card overflow-hidden" aria-label="Messages sent">
          {list === null ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton h-11 w-full" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <MessageSquareText className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-800">No message sent yet</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Holiday notices, meeting dates, exam reminders and fee reminders — written once, sent to every parent with their child&apos;s name.</p>
              {canWrite && (
                <button type="button" onClick={() => setComposeOpen(true)} className="btn btn-primary btn-sm mt-4">
                  <Plus className="h-4 w-4" />
                  Write the first message
                </button>
              )}
            </div>
          ) : (
            <>
            <ul className="divide-y divide-slate-100 sm:hidden">
              {list.map((m) => {
                const w = when(m.created_at);
                const done = m.total > 0 && m.sent >= m.total;
                return (
                  <li key={m.id}>
                    <button type="button" onClick={() => setOpenId(m.id)} className="m-row active:bg-slate-50">
                      <span className="m-row-main">
                        <span className="m-row-title">{m.title}</span>
                        <span className="m-row-meta">
                          {m.audience_label} · {w.day}
                        </span>
                      </span>
                      <span className={`m-row-value text-[14px] ${done ? "text-emerald-700" : ""}`}>
                        {m.sent.toLocaleString("en-IN")}/{m.total.toLocaleString("en-IN")}
                        <span className="block text-xs font-medium text-slate-400">sent</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead className="table-head">
                  <tr>
                    <th className="px-5 py-3 text-left">Message</th>
                    <th className="px-3 py-3 text-left">To</th>
                    <th className="px-3 py-3 text-left">Sent</th>
                    <th className="hidden px-5 py-3 text-left lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {list.map((m) => {
                    const w = when(m.created_at);
                    const done = m.total > 0 && m.sent >= m.total;
                    const pct = m.total ? Math.round((m.sent / m.total) * 100) : 0;
                    return (
                      <tr key={m.id} onClick={() => setOpenId(m.id)} className="group cursor-pointer">
                        <td className="max-w-[26rem] px-5 py-3">
                          <span className="flex items-center gap-1.5 font-semibold text-slate-900 group-hover:text-brand-700">
                            <span className="truncate">{m.title}</span>
                            {m.show_on_website && <Globe className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-label="On the website" />}
                          </span>
                          <span lang={m.lang} className="block truncate text-xs text-slate-500">{m.body.replace(/\s+/g, " ")}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-slate-700">{m.audience_label}</td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <span className={`text-[13px] font-semibold tabular-nums ${done ? "text-emerald-700" : "text-slate-800"}`}>
                            {m.sent.toLocaleString("en-IN")} / {m.total.toLocaleString("en-IN")}
                          </span>
                          <span className="mt-1 block h-1 w-24 overflow-hidden rounded-full bg-slate-100">
                            <span className={`block h-full rounded-full ${done ? "bg-emerald-500" : "bg-brand-500"}`} style={{ width: `${pct}%` }} />
                          </span>
                        </td>
                        <td className="hidden whitespace-nowrap px-5 py-3 lg:table-cell">
                          <span className="block text-slate-800">{w.day}</span>
                          <span className="block text-xs text-slate-500">{w.time}{m.created_by_name ? ` · ${m.created_by_name.split(" (")[0]}` : ""}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </>
          )}
        </section>
      )}

      <ComposeDrawer
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        onCreated={(m) => {
          setList((prev) => [m, ...(prev || [])]);
          setComposeOpen(false);
          setOpenId(m.id);
        }}
      />
      <SendDrawer
        messageId={openId}
        canDelete={me === "admin"}
        onClose={() => setOpenId(null)}
        onChanged={(id, sent) => setList((prev) => (prev || []).map((m) => (m.id === id ? { ...m, sent } : m)))}
        onDeleted={(id) => {
          setList((prev) => (prev || []).filter((m) => m.id !== id));
          setOpenId(null);
        }}
      />
    </div>
  );
}
