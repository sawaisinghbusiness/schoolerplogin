"use client";

import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { AlertTriangle, Ban, Download, Loader2, Printer, RefreshCw, Search } from "lucide-react";
import { receiptService, ReceiptList, Receipt, toTransaction } from "@/lib/services/receiptService";
import { FeeReceiptModal } from "@/components/fees/FeeReceiptModal";
import { useSchoolProfile } from "@/components/providers/SchoolProfileProvider";
import { useCurrentUser } from "@/components/layout/useCurrentUser";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/Toaster";

type Range = "today" | "week" | "month" | "session" | "custom";
type ModeFilter = "all" | "Cash" | "UPI" | "Cheque" | "Other";

const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
const lakh = (n: number) => (n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)} L` : inr(n));
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const day = (s: string) => new Date(s + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const time = (s: string) => new Date(s).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
const modeKey = (m: string): Exclude<ModeFilter, "all"> => (/upi|qr/i.test(m) ? "UPI" : /cheque|dd/i.test(m) ? "Cheque" : /cash/i.test(m) ? "Cash" : "Other");
const PAGE = 100;

/** Start and end dates (inclusive) for a preset. The session runs April to March. */
function rangeDates(r: Exclude<Range, "custom">): [string, string] {
  const now = new Date();
  const today = iso(now);
  if (r === "today") return [today, today];
  if (r === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 6);
    return [iso(d), today];
  }
  if (r === "month") return [iso(new Date(now.getFullYear(), now.getMonth(), 1)), today];
  return ["2026-04-01", "2027-03-31"];
}

const CANCEL_REASONS = ["Wrong amount entered", "Wrong student selected", "Cheque bounced", "Entered twice", "Refunded to parent"];

export default function ReceiptsPage() {
  const { schoolProfile } = useSchoolProfile();
  const user = useCurrentUser();
  const isAdmin = user.role === "Administrator";
  const [range, setRange] = useState<Range>("month");
  const [custom, setCustom] = useState<[string, string]>(rangeDates("month"));
  const [list, setList] = useState<ReceiptList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<ModeFilter>("all");
  const [showCancelled, setShowCancelled] = useState(true);
  const [limit, setLimit] = useState(PAGE);
  const [printing, setPrinting] = useState<Receipt | null>(null);
  const [cancelling, setCancelling] = useState<Receipt | null>(null);

  const [from, to] = range === "custom" ? custom : rangeDates(range);

  const load = async () => {
    setLoading(true);
    const r = await receiptService.list(from, to);
    setLoading(false);
    if (!r.data) return setError(r.error || "Could not load.");
    setError(null);
    setList(r.data);
  };
  useEffect(() => {
    setLimit(PAGE);
    load();
  }, [from, to]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (list?.receipts || []).filter((r) => {
      if (!showCancelled && r.cancelled) return false;
      if (mode !== "all" && modeKey(r.mode) !== mode) return false;
      if (!q) return true;
      return [r.receiptNo, r.student?.name, r.student?.srNo, r.student?.fatherName, r.ref, r.student?.mobile].some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [list, query, mode, showCancelled]);

  const shownLive = shown.filter((r) => !r.cancelled);
  const t = list?.totals;
  const split = t ? (["Cash", "UPI", "Cheque"] as const).map((k) => ({ k, v: t.byMode[k], pct: t.total ? (t.byMode[k] / t.total) * 100 : 0 })) : [];

  const exportExcel = () => {
    const rows = shown.map((r) => ({
      "Receipt no.": r.receiptNo,
      Date: r.date,
      Student: r.student?.name || "",
      Class: r.student?.classSec || "",
      "SR no.": r.student?.srNo || "",
      Mode: r.mode,
      Reference: r.ref || "",
      "Amount (₹)": r.amount,
      "Received by": r.collectedBy,
      Status: r.cancelled ? `Cancelled: ${r.cancelReason || ""}` : "Paid",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Receipts");
    XLSX.writeFile(wb, `Receipts_${from}_to_${to}.xlsx`);
  };

  const RANGES: [Range, string][] = [
    ["today", "Today"],
    ["week", "This week"],
    ["month", "This month"],
    ["session", "This session"],
    ["custom", "Custom"],
  ];

  return (
    <div className="space-y-5 pb-12">
      <header className="page-header">
        <div>
          <h1 className="page-title">Receipts</h1>
          <p className="page-subtitle">Every receipt issued, by number. A cancelled receipt stays in the register, marked cancelled.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={load} disabled={loading} className="btn btn-secondary" aria-label="Reload">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button type="button" onClick={exportExcel} disabled={!shown.length} className="btn btn-secondary px-3 sm:px-4" aria-label="Export to Excel">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="scroll-row max-w-full gap-1 rounded-xl bg-slate-200/60 p-1" role="tablist" aria-label="Date range">
          {RANGES.map(([k, l]) => (
            <button key={k} type="button" role="tab" aria-selected={range === k} onClick={() => setRange(k)} className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-semibold sm:py-1.5 ${range === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
              {l}
            </button>
          ))}
        </div>
        {range === "custom" ? (
          <span className="flex items-center gap-2 text-[13px] text-slate-500">
            <input type="date" value={custom[0]} max={custom[1]} onChange={(e) => e.target.value && setCustom([e.target.value, custom[1]])} aria-label="From" className="field field-sm" />
            to
            <input type="date" value={custom[1]} min={custom[0]} onChange={(e) => e.target.value && setCustom([custom[0], e.target.value])} aria-label="To" className="field field-sm" />
          </span>
        ) : (
          <span className="text-[13px] text-slate-500">
            {from === to ? day(from) : `${day(from)} – ${day(to)}`}
          </span>
        )}
      </div>

      {error && (
        <div className="alert alert-rose">
          <span>{error}</span>
        </div>
      )}

      <div className="kpi-grid">
        <Tile label="Collected" value={t ? lakh(t.total) : "…"} note={t ? `${t.count.toLocaleString("en-IN")} receipts` : ""} dot="bg-emerald-500" />
        <div className="kpi col-span-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-5">
          <span className="kpi-label">How parents paid</span>
          <span className="kpi-note sm:hidden">{split.map((s) => `${s.k} ${inr(s.v)}`).join(" · ")}</span>
          <div className="kpi-desktop mt-3 flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-slate-100">
            {split.map((s) => (
              <span key={s.k} style={{ width: `${s.pct}%`, background: s.k === "Cash" ? "#2a78d6" : s.k === "UPI" ? "#eb6834" : "#1baf7a" }} />
            ))}
          </div>
          <div className="kpi-desktop mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px]">
            {split.map((s) => (
              <span key={s.k} className="inline-flex items-center gap-1.5 text-slate-600">
                <i className="h-2 w-2 rounded-full" style={{ background: s.k === "Cash" ? "#2a78d6" : s.k === "UPI" ? "#eb6834" : "#1baf7a" }} />
                {s.k} <b className="tabular-nums text-slate-900">{inr(s.v)}</b>
                <span className="tabular-nums text-slate-400">{Math.round(s.pct)}%</span>
              </span>
            ))}
          </div>
        </div>
        <Tile label="Cancelled" value={t ? String(t.cancelledCount) : "…"} note={t ? `${inr(t.cancelledAmount)} not counted` : ""} dot="bg-rose-500" />
      </div>

      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 p-3 sm:p-4 lg:flex-nowrap">
          <div className="relative w-full sm:w-auto sm:min-w-[180px] sm:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Receipt no., student, SR no. or UTR" aria-label="Search receipts" className="field field-sm w-full pl-9" />
          </div>
          <select value={mode} onChange={(e) => setMode(e.target.value as ModeFilter)} aria-label="Payment mode" className="field field-sm">
            <option value="all">All modes</option>
            <option>Cash</option>
            <option>UPI</option>
            <option>Cheque</option>
            <option>Other</option>
          </select>
          <label className="flex min-h-[40px] shrink-0 cursor-pointer items-center gap-2 text-[13px] text-slate-600">
            <input type="checkbox" checked={showCancelled} onChange={(e) => setShowCancelled(e.target.checked)} className="h-4 w-4 accent-brand-600" />
            Show cancelled
          </label>
        </div>

        {!list ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-11 w-full" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <p className="px-6 py-14 text-center text-sm text-slate-500">{list.receipts.length ? "No receipt matches." : "No receipt in these dates."}</p>
        ) : (
          <>
          {/* Phones: one row per receipt — tap to print */}
          <ul className="divide-y divide-slate-100 sm:hidden">
            {shown.slice(0, limit).map((r) => (
              <li key={r.id} className={`flex items-center ${r.cancelled ? "bg-rose-50/40" : ""}`}>
                <button type="button" onClick={() => setPrinting(r)} className="m-row min-h-[64px] flex-1 active:bg-slate-50" aria-label={`Print ${r.receiptNo}`}>
                  <span className="m-row-main">
                    <span className="m-row-title">{r.student?.name || "—"}</span>
                    <span className="m-row-meta">
                      <span className={`font-mono ${r.cancelled ? "line-through" : ""}`}>{r.receiptNo}</span> · {r.student?.classSec} · {modeKey(r.mode)}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-400">
                      {day(r.date)}
                      {r.createdAt && r.createdAt.slice(0, 10) === r.date ? ` · ${time(r.createdAt)}` : ""}
                    </span>
                  </span>
                  <span className="m-row-value">
                    <span className={r.cancelled ? "text-slate-400 line-through" : ""}>{inr(r.amount)}</span>
                    {r.cancelled && <span className="block text-xs font-semibold text-rose-600">Cancelled</span>}
                  </span>
                </button>
                {isAdmin && !r.cancelled && list.canCancel && (
                  <button type="button" onClick={() => setCancelling(r)} aria-label={`Cancel ${r.receiptNo}`} className="flex h-11 w-11 shrink-0 items-center justify-center text-slate-400 active:bg-rose-50 active:text-rose-600">
                    <Ban className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead className="table-head">
                <tr className="[&>th]:whitespace-nowrap">
                  <th className="px-5 py-2.5 text-left">Receipt</th>
                  <th className="px-3 py-2.5 text-left">Student</th>
                  <th className="px-3 py-2.5 text-left">Mode</th>
                  <th className="px-3 py-2.5 text-right">Amount</th>
                  <th className="hidden px-3 py-2.5 text-left xl:table-cell">Received by</th>
                  <th className="px-4 py-2.5 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shown.slice(0, limit).map((r) => (
                  <tr key={r.id} className={r.cancelled ? "bg-rose-50/40" : ""}>
                    <td className="whitespace-nowrap px-5 py-2.5">
                      <span className={`block font-mono text-[13px] font-semibold ${r.cancelled ? "text-slate-400 line-through" : "text-slate-800"}`}>{r.receiptNo}</span>
                      <span className="block text-xs text-slate-500">
                        {day(r.date)}
                        {r.createdAt && r.createdAt.slice(0, 10) === r.date ? ` · ${time(r.createdAt)}` : ""}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="block font-semibold text-slate-900">{r.student?.name || "—"}</span>
                      <span className="block text-xs text-slate-500">
                        <span className="whitespace-nowrap">{r.student?.classSec}</span> · <span className="whitespace-nowrap">{r.student?.srNo}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="block whitespace-nowrap text-slate-700">{modeKey(r.mode)}</span>
                      {r.ref && <span className="block max-w-[10rem] truncate font-mono text-[11.5px] text-slate-400">{r.ref}</span>}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right">
                      <span className={`block font-bold tabular-nums ${r.cancelled ? "text-slate-400 line-through" : "text-slate-900"}`}>{inr(r.amount)}</span>
                      {r.cancelled && (
                        <span className="badge badge-rose mt-0.5 py-0 text-[11px]" title={`${r.cancelReason || ""} · by ${r.cancelledBy || ""}`}>
                          Cancelled
                        </span>
                      )}
                    </td>
                    <td className="hidden px-3 py-2.5 text-[13px] text-slate-600 xl:table-cell">{r.collectedBy.split(" (")[0]}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right">
                      <div className="inline-flex gap-1">
                        <button type="button" onClick={() => setPrinting(r)} title="Print" aria-label={`Print ${r.receiptNo}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800">
                          <Printer className="h-4 w-4" />
                        </button>
                        {isAdmin && !r.cancelled && list.canCancel && (
                          <button type="button" onClick={() => setCancelling(r)} title="Cancel receipt" aria-label={`Cancel ${r.receiptNo}`} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-[13px] text-slate-500 sm:px-5">
              <span>
                {Math.min(limit, shown.length).toLocaleString("en-IN")} of {shown.length.toLocaleString("en-IN")} shown
                {shown.length > limit && (
                  <button type="button" onClick={() => setLimit(limit + PAGE)} className="ml-3 font-semibold text-brand-700 hover:underline">
                    Show {Math.min(PAGE, shown.length - limit)} more
                  </button>
                )}
              </span>
              <span className="tabular-nums">
                Total of these <b className="text-slate-900">{inr(shownLive.reduce((a, r) => a + r.amount, 0))}</b>
                {shown.length !== shownLive.length && " (cancelled not counted)"}
              </span>
            </div>
          </>
        )}
        {list && !list.canCancel && isAdmin && (
          <p className="flex items-center gap-2 border-t border-slate-100 bg-marigold-50 px-5 py-2.5 text-[13px] text-marigold-900">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Cancelling receipts needs a one-time database update (receipt cancel SQL).
          </p>
        )}
      </section>

      <FeeReceiptModal isOpen={!!printing} onClose={() => setPrinting(null)} transaction={printing ? toTransaction(printing) : null} schoolName={schoolProfile.school_name || "School"} />
      <CancelModal
        receipt={cancelling}
        onClose={() => setCancelling(null)}
        onDone={() => {
          setCancelling(null);
          load();
        }}
      />
    </div>
  );
}

function Tile({ label, value, note, dot }: { label: string; value: string; note: string; dot: string }) {
  return (
    <div className="kpi rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-5">
      <span className="kpi-label">
        <i className={`h-2 w-2 rounded-full ${dot}`} />
        {label}
      </span>
      <span className="kpi-value">{value}</span>
      <span className="kpi-note">{note}</span>
    </div>
  );
}

/** Cancelling takes the money back off the student's paid fee, so it asks for a reason and a clear yes. */
function CancelModal({ receipt, onClose, onDone }: { receipt: Receipt | null; onClose: () => void; onDone: () => void }) {
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  const [other, setOther] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setReason(CANCEL_REASONS[0]);
    setOther("");
    setError(null);
  }, [receipt?.id]);

  if (!receipt) return null;
  const text = reason === "other" ? other.trim() : reason;

  const go = async () => {
    if (text.length < 3) return setError("Write why this receipt is being cancelled.");
    setBusy(true);
    const res = await receiptService.cancel(receipt.id, text);
    setBusy(false);
    if (!res.success) return setError(res.error || "Could not cancel.");
    toast(`Receipt ${receipt.receiptNo} cancelled. ${inr(receipt.amount)} taken off ${receipt.student?.name || "the student"}'s paid fee.`, "success");
    onDone();
  };

  return (
    <Modal isOpen={!!receipt} onClose={() => !busy && onClose()} title={`Cancel receipt ${receipt.receiptNo}?`} maxWidth="max-w-md">
      <div className="space-y-4 text-sm">
        <dl className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
          <div>
            <dt className="text-xs text-slate-500">Student</dt>
            <dd className="font-semibold text-slate-900">{receipt.student?.name}</dd>
            <dd className="text-xs text-slate-500">{receipt.student?.classSec}</dd>
          </div>
          <div className="text-right">
            <dt className="text-xs text-slate-500">Amount</dt>
            <dd className="text-lg font-bold tabular-nums text-slate-900">{inr(receipt.amount)}</dd>
            <dd className="text-xs text-slate-500">
              {modeKey(receipt.mode)} · {day(receipt.date)}
            </dd>
          </div>
        </dl>
        <label className="block">
          <span className="field-label">Why?</span>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="field w-full">
            {CANCEL_REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
            <option value="other">Something else…</option>
          </select>
          {reason === "other" && <input value={other} onChange={(e) => setOther(e.target.value)} placeholder="Write the reason" className="field mt-2 w-full" autoFocus />}
        </label>
        <p className="rounded-lg bg-rose-50 p-3 text-[13px] leading-relaxed text-rose-900 ring-1 ring-rose-100">
          <b>{inr(receipt.amount)}</b> will be taken off {receipt.student?.name || "the student"}&rsquo;s paid fee, so it shows as due again. The receipt number stays in the register, marked cancelled. This cannot be undone; collect again with a new receipt if needed.
        </p>
        {error && (
          <div className="alert alert-rose">
            <span>{error}</span>
          </div>
        )}
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary btn-sm">
            Keep receipt
          </button>
          <button type="button" onClick={go} disabled={busy} className="btn btn-danger btn-sm">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Cancel receipt
          </button>
        </div>
      </div>
    </Modal>
  );
}
