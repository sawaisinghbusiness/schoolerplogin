"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Check, Copy, Loader2, MessageCircle, Search, Trash2, Undo2 } from "lucide-react";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { toast } from "@/components/ui/Toaster";
import { Message, Recipient, messageService, whatsappUrl } from "@/lib/services/messageService";

type View = "pending" | "sent" | "skipped";

const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/** One message's parents: send each on WhatsApp in turn, and keep track of who got it. */
export function SendDrawer({ messageId, canDelete, onClose, onChanged, onDeleted }: {
  messageId: string | null;
  canDelete: boolean;
  onClose: () => void;
  onChanged: (id: string, sent: number) => void;
  onDeleted: (id: string) => void;
}) {
  const [message, setMessage] = useState<Message | null>(null);
  const [rows, setRows] = useState<Recipient[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("pending");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!messageId) return;
    setMessage(null);
    setRows(null);
    setError(null);
    setView("pending");
    setQuery("");
    setConfirmDelete(false);
    messageService.get(messageId).then((r) => {
      if (r.error || !r.data) return setError(r.error || "Could not open this message.");
      setMessage(r.data.message);
      setRows(r.data.recipients);
    });
  }, [messageId]);

  const counts = useMemo(() => {
    const c = { pending: 0, sent: 0, skipped: 0 };
    for (const r of rows || []) c[r.status]++;
    return c;
  }, [rows]);
  const total = counts.pending + counts.sent;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (rows || []).filter((r) => r.status === view && (!q || [r.student_name, r.parent_name, r.phone, r.class_sec].some((v) => v.toLowerCase().includes(q))));
  }, [rows, view, query]);

  const setStatus = async (r: Recipient, status: "sent" | "pending") => {
    if (!message) return;
    setRows((prev) => (prev || []).map((x) => (x.id === r.id ? { ...x, status, sent_at: status === "sent" ? new Date().toISOString() : null } : x)));
    const res = await messageService.mark(message.id, r.id, status);
    if (res.error) {
      setRows((prev) => (prev || []).map((x) => (x.id === r.id ? r : x)));
      toast(res.error, "error");
      return;
    }
    if (typeof res.sent === "number") onChanged(message.id, res.sent);
  };

  const send = (r: Recipient) => {
    window.open(whatsappUrl(r.phone, r.text), "_blank", "noopener");
    setStatus(r, "sent");
  };

  const next = (rows || []).find((r) => r.status === "pending");

  const copyNumbers = async () => {
    const list = (rows || []).filter((r) => r.status === "pending").map((r) => r.phone).join("\n");
    try {
      await navigator.clipboard.writeText(list);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast("Could not copy. Select the numbers by hand.", "error");
    }
  };

  const remove = async () => {
    if (!message) return;
    setDeleting(true);
    const r = await messageService.remove(message.id);
    setDeleting(false);
    if (r.error) return toast(r.error, "error");
    toast("Message deleted.", "success");
    onDeleted(message.id);
  };

  const pct = total ? Math.round((counts.sent / total) * 100) : 0;

  return (
    <SideDrawer
      isOpen={!!messageId}
      onClose={onClose}
      width="max-w-[720px]"
      title={message?.title || "Message"}
      subtitle={message ? `${message.audience_label} · ${when(message.created_at)}${message.created_by_name ? ` · by ${message.created_by_name.split(" (")[0]}` : ""}` : ""}
      footer={
        message && (
          <>
            {canDelete &&
              (confirmDelete ? (
                <span className="flex items-center gap-2 text-[13px] text-slate-600">
                  Delete for good?
                  <button type="button" onClick={remove} disabled={deleting} className="btn btn-sm bg-rose-600 text-white hover:bg-rose-700">
                    {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Delete
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="btn btn-secondary btn-sm">Keep</button>
                </span>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)} className="btn btn-secondary btn-sm text-rose-600">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              ))}
            <button type="button" onClick={onClose} className="btn btn-secondary ml-auto">Close</button>
          </>
        )
      }
    >
      {error ? (
        <p className="m-5 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100">{error}</p>
      ) : !message || !rows ? (
        <div className="space-y-3 p-5">
          <div className="skeleton h-28 w-full" />
          <div className="skeleton h-64 w-full" />
        </div>
      ) : (
        <div className="space-y-4 p-5">
          <section className="card p-4">
            <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
              <div>
                <p className="text-[13px] text-slate-500">Sent</p>
                <p className="text-2xl font-bold tabular-nums text-slate-900">
                  {counts.sent.toLocaleString("en-IN")} <span className="text-base font-semibold text-slate-400">of {total.toLocaleString("en-IN")}</span>
                </p>
              </div>
              {next ? (
                <button type="button" onClick={() => send(next)} className="btn ml-auto bg-[#1FA855] text-white hover:bg-[#178C46]">
                  <MessageCircle className="h-4 w-4" />
                  Send next: {next.student_name.split(/,| और | and /)[0]}
                </button>
              ) : (
                <span className="badge badge-emerald ml-auto">
                  <Check className="h-3.5 w-3.5" />
                  Everyone has it
                </span>
              )}
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Sent">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              WhatsApp opens with the message typed in. Press send there, then come back for the next parent. Each one is ticked off here as you go.
            </p>
          </section>

          <details className="card group p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900">Message text</summary>
            <p lang={message.lang} className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-slate-700">{message.body}</p>
          </details>

          <section className="card overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 p-3">
              <div className="flex gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Parents">
                {([
                  { v: "pending", label: "To send" },
                  { v: "sent", label: "Sent" },
                  { v: "skipped", label: "No number" },
                ] as { v: View; label: string }[]).map((t) => (
                  <button key={t.v} type="button" role="tab" aria-selected={view === t.v} onClick={() => setView(t.v)} className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[13px] font-semibold ${view === t.v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                    {t.label}
                    <span className="tabular-nums text-slate-400">{counts[t.v]}</span>
                  </button>
                ))}
              </div>
              <div className="relative ml-auto w-full sm:w-56">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, class or mobile" aria-label="Search parents" className="field field-sm w-full pl-9" />
              </div>
              {view === "pending" && counts.pending > 0 && (
                <button type="button" onClick={copyNumbers} className="btn btn-secondary btn-sm" title="Copy the mobile numbers still to send">
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy numbers"}
                </button>
              )}
            </div>
            {shown.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-500">
                {query ? "Nobody matches." : view === "pending" ? "Nobody left to send to." : view === "sent" ? "None sent yet." : "Every child in this group has a mobile number."}
              </p>
            ) : (
              <ul className="max-h-[52vh] divide-y divide-slate-100 overflow-y-auto">
                {shown.slice(0, 400).map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-slate-900">{r.student_name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {r.class_sec}
                        {r.parent_name && ` · ${r.parent_name}`}
                        {r.phone && <span className="tabular-nums"> · {r.phone}</span>}
                        {r.status === "sent" && r.sent_at && <span> · sent {when(r.sent_at)}</span>}
                      </p>
                    </div>
                    {r.status === "pending" && (
                      <button type="button" onClick={() => send(r)} className="btn btn-secondary btn-sm shrink-0">
                        <MessageCircle className="h-4 w-4 text-[#1FA855]" />
                        WhatsApp
                      </button>
                    )}
                    {r.status === "sent" && (
                      <button type="button" onClick={() => setStatus(r, "pending")} className="btn btn-secondary btn-sm shrink-0" title="Not sent after all">
                        <Undo2 className="h-4 w-4" />
                        Undo
                      </button>
                    )}
                  </li>
                ))}
                {shown.length > 400 && <li className="px-4 py-3 text-center text-xs text-slate-500">Showing 400 of {shown.length}. Search to find someone.</li>}
              </ul>
            )}
          </section>
        </div>
      )}
    </SideDrawer>
  );
}
