"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Loader2, LogOut, Moon, RefreshCw, RotateCcw, Send, Smartphone } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { Modal } from "@/components/ui/modal";
import { useSchoolProfile } from "@/components/providers/SchoolProfileProvider";
import { OutboxRow, OutboxStatus, WaSettings, WaStatus, whatsappService } from "@/lib/services/whatsappService";

type Filter = "all" | OutboxStatus;

const KIND_LABEL: Record<OutboxRow["kind"], string> = { absent: "Absent", receipt: "Fee receipt", dues: "Fee reminder", notice: "Notice", test: "Test" };
const STATUS_BADGE: Record<OutboxStatus, { cls: string; label: string }> = {
  pending: { cls: "badge-amber", label: "Waiting" },
  sent: { cls: "badge-emerald", label: "Sent" },
  failed: { cls: "badge-rose", label: "Failed" },
  skipped: { cls: "badge-slate", label: "Not on WhatsApp" },
};
const when = (iso: string) => {
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  return today
    ? d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + ", " + d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
};

export default function WhatsAppSettingsPage() {
  const { schoolProfile } = useSchoolProfile();
  const school = schoolProfile.school_name || "School";
  const [status, setStatus] = useState<WaStatus | null>(null);
  const [unreachable, setUnreachable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmOff, setConfirmOff] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [rows, setRows] = useState<OutboxRow[] | null>(null);

  const loadStatus = useCallback(async () => {
    const s = await whatsappService.status();
    setUnreachable(!s);
    if (s) setStatus(s);
    return s;
  }, []);
  const loadOutbox = useCallback(async () => {
    const r = await whatsappService.outbox(filter === "all" ? undefined : filter);
    setRows(r.data);
  }, [filter]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);
  useEffect(() => {
    setRows(null);
    loadOutbox();
  }, [loadOutbox]);

  // Fast while a QR is on screen (codes change every ~20s), slow otherwise.
  const linking = status?.state === "qr" || status?.state === "connecting";
  useEffect(() => {
    const t = setInterval(() => {
      loadStatus();
      if (!linking) loadOutbox();
    }, linking ? 2000 : 15000);
    return () => clearInterval(t);
  }, [linking, loadStatus, loadOutbox]);

  const connect = async () => {
    setBusy(true);
    const r = await whatsappService.connect();
    setBusy(false);
    if (!r.success) toast(r.error || "Could not start.", "error");
    loadStatus();
  };
  const disconnect = async () => {
    setBusy(true);
    const r = await whatsappService.logout();
    setBusy(false);
    setConfirmOff(false);
    if (r.success) toast("WhatsApp disconnected.", "success");
    else toast(r.error || "Could not disconnect.", "error");
    loadStatus();
  };
  const setSwitch = async (key: keyof Pick<WaSettings, "auto_absent" | "auto_receipt">, on: boolean) => {
    if (!status?.settings) return;
    setStatus({ ...status, settings: { ...status.settings, [key]: on } });
    const r = await whatsappService.saveSettings({ [key]: on });
    if (!r.success) {
      toast(r.error || "Could not save.", "error");
      loadStatus();
    }
  };
  const retry = async () => {
    const r = await whatsappService.retry();
    if (r.success) toast(`${r.count} message${r.count === 1 ? "" : "s"} back in the queue.`, "success");
    else toast(r.error || "Could not retry.", "error");
    loadStatus();
    loadOutbox();
  };

  const s = status;
  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Waiting" },
    { key: "sent", label: "Sent" },
    { key: "failed", label: "Failed" },
    { key: "skipped", label: "Not on WhatsApp" },
  ];

  return (
    <div className="space-y-5 pb-12">
      <header className="page-header">
        <div>
          <h1 className="page-title">WhatsApp</h1>
          <p className="page-subtitle">Absent alerts, fee receipts and reminders go to parents from the school&apos;s own WhatsApp number</p>
        </div>
      </header>

      {!s ? (
        unreachable ? (
          <div className="card p-8 text-center">
            <p className="font-semibold text-slate-900">Could not reach the server</p>
            <button type="button" onClick={loadStatus} className="btn btn-secondary btn-sm mt-4">
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="card skeleton h-72" />
            <div className="card skeleton h-72" />
          </div>
        )
      ) : s.setupNeeded ? (
        <div className="card p-8 text-center">
          <Smartphone className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">WhatsApp needs a one-time database setup</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Run <span className="font-mono text-[13px]">supabase/migrations/20261002_whatsapp.sql</span> (in the backend folder) in the Supabase SQL editor, then check again.
          </p>
          <button type="button" onClick={loadStatus} className="btn btn-secondary btn-sm mt-4">
            <RefreshCw className="h-4 w-4" />
            Check again
          </button>
        </div>
      ) : (
        <>
          <div className="grid items-start gap-5 lg:grid-cols-2">
            {/* ── The school's phone ── */}
            <section className="card p-5" aria-label="Connection">
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-semibold text-slate-900">School&apos;s WhatsApp</h2>
                <StateTag state={s.state} />
              </div>

              {s.state === "open" && s.me ? (
                <>
                  <p className="mt-3 text-[22px] font-bold tabular-nums tracking-tight text-slate-900">+{s.me.number.replace(/^91(\d{5})(\d{5})$/, "91 $1 $2")}</p>
                  {s.me.name && <p className="text-sm text-slate-500">{s.me.name}</p>}
                  <TestForm school={school} />
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <button type="button" onClick={() => setConfirmOff(true)} className="btn btn-secondary btn-sm">
                      <LogOut className="h-4 w-4" />
                      Disconnect
                    </button>
                  </div>
                </>
              ) : s.state === "qr" && s.qr ? (
                <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                  <img src={s.qr} alt="QR code to link WhatsApp" className="h-[220px] w-[220px] shrink-0 rounded-lg ring-1 ring-slate-200" />
                  <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
                    <li>Open WhatsApp on the school&apos;s phone.</li>
                    <li>
                      Tap <b>⋮</b> (Android) or <b>Settings</b> (iPhone), then <b>Linked devices</b>.
                    </li>
                    <li>
                      Tap <b>Link a device</b> and point the phone at this code.
                    </li>
                    <li className="list-none pt-1 text-xs text-slate-500">The code changes every few seconds; this page keeps up.</li>
                  </ol>
                </div>
              ) : s.state === "connecting" || s.state === "qr" ? (
                <p className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting to WhatsApp…
                </p>
              ) : (
                <>
                  <p className="mt-2 text-sm text-slate-600">Link the school&apos;s phone once by scanning a QR code, like WhatsApp Web. It stays linked after that.</p>
                  {s.lastError && <p className="alert alert-amber mt-3 text-sm">{s.lastError}</p>}
                  <button type="button" onClick={connect} disabled={busy} className="btn btn-primary mt-4">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
                    Connect WhatsApp
                  </button>
                  <p className="mt-3 text-xs text-slate-500">Use a separate number for the school, not someone&apos;s personal WhatsApp.</p>
                </>
              )}
            </section>

            {/* ── What goes out on its own ── */}
            <section className="card divide-y divide-slate-100" aria-label="Automatic messages">
              <div className="p-5 pb-3">
                <h2 className="text-[15px] font-semibold text-slate-900">Send on their own</h2>
                <p className="text-[13px] text-slate-500">Each message is queued and leaves a few seconds apart{s.state !== "open" ? ", once WhatsApp is connected" : ""}.</p>
              </div>
              <Toggle
                title="Absent today"
                note="When attendance is saved, the parents of absent students get this. Changing someone to present before it goes takes it back."
                sample={`प्रिय अभिभावक, आज (2 Oct) Laxman Garg (कक्षा Nursery-A) स्कूल में अनुपस्थित है। कृपया कारण बताएं। – ${school}`}
                on={!!s.settings?.auto_absent}
                onChange={(v) => setSwitch("auto_absent", v)}
              />
              <Toggle
                title="Fee received"
                note="After each payment at the counter, the parent gets the amount, receipt number and what is still due."
                sample={`प्रिय अभिभावक, Laxman Garg (कक्षा Nursery-A) की फीस ₹5,000 प्राप्त हुई। रसीद नं. 1042, दिनांक 2 Oct। शेष बकाया: ₹7,500। धन्यवाद – ${school}`}
                on={!!s.settings?.auto_receipt}
                onChange={(v) => setSwitch("auto_receipt", v)}
              />
            </section>
          </div>

          {/* ── Outbox ── */}
          <section className="card overflow-hidden" aria-label="Outbox">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-slate-200/80 px-4 py-3 sm:px-5">
              <h2 className="text-[15px] font-semibold text-slate-900">Outbox</h2>
              <span className="text-[13px] tabular-nums text-slate-600">
                <b className="font-semibold text-slate-900">{s.counts.pending}</b> waiting · <b className="font-semibold text-slate-900">{s.counts.sentToday}</b> sent today
                {s.counts.failed > 0 && (
                  <>
                    {" "}
                    · <b className="font-semibold text-rose-600">{s.counts.failed}</b> failed
                  </>
                )}
              </span>
              {s.quietHours && s.counts.pending > 0 && (
                <span className="flex items-center gap-1.5 text-[13px] text-slate-500">
                  <Moon className="h-3.5 w-3.5" />
                  Nothing goes out 9 pm – 7 am; these leave in the morning
                </span>
              )}
              {s.counts.failed > 0 && (
                <button type="button" onClick={retry} className="btn btn-secondary btn-sm ml-auto">
                  <RotateCcw className="h-4 w-4" />
                  Retry failed
                </button>
              )}
            </div>
            <div className="scroll-row border-b border-slate-100 px-4 py-2 sm:px-5">
              <div className="flex w-max gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Status">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    role="tab"
                    aria-selected={filter === f.key}
                    onClick={() => setFilter(f.key)}
                    className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${filter === f.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {rows === null ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-10 w-full" />
                ))}
              </div>
            ) : !rows.length ? (
              <p className="px-6 py-14 text-center text-sm text-slate-500">{filter === "all" ? "No message yet. Switch on a message above, or send a test." : "Nothing here."}</p>
            ) : (
              <>
                <ul className="divide-y divide-slate-100 sm:hidden">
                  {rows.map((r) => (
                    <li key={r.id} className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-semibold text-slate-900">{r.student_name || `+91 ${r.phone}`}</span>
                          <span className="block truncate text-[13px] text-slate-500">
                            {KIND_LABEL[r.kind]} · {when(r.sent_at || r.created_at)}
                          </span>
                        </span>
                        <span className={`badge ${STATUS_BADGE[r.status].cls} shrink-0`}>{STATUS_BADGE[r.status].label}</span>
                      </div>
                      {r.error && r.status !== "sent" && <p className="mt-1 text-xs text-rose-600">{r.error}</p>}
                    </li>
                  ))}
                </ul>
                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full text-sm">
                    <thead className="table-head">
                      <tr>
                        <th className="px-5 py-3 text-left">Time</th>
                        <th className="px-3 py-3 text-left">To</th>
                        <th className="px-3 py-3 text-left">Type</th>
                        <th className="px-3 py-3 text-left">Message</th>
                        <th className="px-5 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((r) => (
                        <tr key={r.id} className="align-top">
                          <td className="whitespace-nowrap px-5 py-3 tabular-nums text-slate-600">{when(r.sent_at || r.created_at)}</td>
                          <td className="whitespace-nowrap px-3 py-3">
                            <span className="block font-semibold text-slate-900">{r.student_name || "—"}</span>
                            <span className="block text-xs tabular-nums text-slate-500">
                              {r.class_sec ? `${r.class_sec} · ` : ""}
                              {r.phone}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-slate-700">{KIND_LABEL[r.kind]}</td>
                          <td className="max-w-[22rem] px-3 py-3">
                            <span className="line-clamp-2 text-slate-600" title={r.body}>
                              {r.body}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-5 py-3">
                            <span className={`badge ${STATUS_BADGE[r.status].cls}`}>{STATUS_BADGE[r.status].label}</span>
                            {r.error && r.status !== "sent" && (
                              <span className="mt-1 block max-w-[12rem] truncate text-xs text-rose-600" title={r.error}>
                                {r.error}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </>
      )}

      <Modal isOpen={confirmOff} onClose={() => setConfirmOff(false)} title="Disconnect WhatsApp?" maxWidth="max-w-md">
        <p className="text-sm text-slate-600">Messages stop going out until someone scans a new QR code. Messages already waiting stay in the outbox.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={() => setConfirmOff(false)} className="btn btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={disconnect} disabled={busy} className="btn btn-danger">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Disconnect
          </button>
        </div>
      </Modal>
    </div>
  );
}

function StateTag({ state }: { state: WaStatus["state"] }) {
  const map = {
    open: { cls: "badge-emerald", label: "Connected" },
    qr: { cls: "badge-amber", label: "Waiting for scan" },
    connecting: { cls: "badge-amber", label: "Connecting" },
    off: { cls: "badge-slate", label: "Not connected" },
  }[state];
  return <span className={`badge ${map.cls}`}>{map.label}</span>;
}

function Toggle({ title, note, sample, on, onChange }: { title: string; note: string; sample: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-4 p-5">
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="mt-0.5 text-[13px] text-slate-500">{note}</p>
        <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-[13px] leading-relaxed text-slate-700 ring-1 ring-slate-200/70">{sample}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={title}
        onClick={() => onChange(!on)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-emerald-600" : "bg-slate-300"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function TestForm({ school }: { school: string }) {
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const r = await whatsappService.test(phone, `${school}: WhatsApp से संदेश भेजने की जाँच। यह एक टेस्ट संदेश है।`);
    setSending(false);
    if (r.success) toast(`Test message sent to ${phone}.`, "success");
    else toast(r.error || "Could not send.", "error");
  };
  return (
    <form onSubmit={send} className="mt-4 flex gap-2">
      <label className="min-w-0 flex-1">
        <span className="sr-only">Mobile number for a test message</span>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="Mobile no. for a test message" className="field field-sm w-full" />
      </label>
      <button type="submit" disabled={sending || phone.replace(/\D/g, "").length < 10} className="btn btn-secondary btn-sm shrink-0">
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Send test
      </button>
    </form>
  );
}
