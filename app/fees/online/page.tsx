"use client";

import React, { useEffect, useState } from "react";
import { Check, Loader2, RefreshCw, Settings2, X } from "lucide-react";
import { api } from "@/lib/apiClient";
import { FeeTransaction } from "@/lib/services/feeService";
import { FeeReceiptModal } from "@/components/fees/FeeReceiptModal";
import { useSchoolProfile } from "@/components/providers/SchoolProfileProvider";
import { useCurrentUser } from "@/components/layout/useCurrentUser";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/Toaster";

/**
 * Online payments: parents pay the school's UPI ID from the parent app and send the UTR.
 * Nothing is money until someone here finds that UTR in the bank statement and presses Verify,
 * which makes a normal receipt dated the day the parent paid.
 */

interface Split {
  fee: number;
  fine: number;
  waived: number;
  excess: number;
}
interface Claim {
  id: string;
  studentId: string;
  student: { name: string; srNo: string; classSec: string; fatherName: string } | null;
  parentPhone: string;
  amount: number;
  utr: string;
  paidOn: string;
  note: string;
  status: "pending" | "verified" | "rejected";
  decidedBy: string | null;
  decidedAt: string | null;
  rejectReason: string | null;
  sentAt: string;
  suggestion: Split | null;
}
interface Settings {
  setupNeeded: boolean;
  upiId?: string;
  upiName?: string;
  officePhone?: string;
  updatedBy?: string | null;
}
type Status = "pending" | "verified" | "rejected";

const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
const day = (s: string) => new Date(s.slice(0, 10) + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const when = (s: string) => new Date(s).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });

export default function OnlinePaymentsPage() {
  const { schoolProfile } = useSchoolProfile();
  const user = useCurrentUser();
  const isAdmin = user.role === "Administrator";
  const [status, setStatus] = useState<Status>("pending");
  const [rows, setRows] = useState<Claim[] | null>(null);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState<Claim | null>(null);
  const [rejecting, setRejecting] = useState<Claim | null>(null);
  const [printing, setPrinting] = useState<FeeTransaction | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);

  const load = async () => {
    setLoading(true);
    const r = await api.get<{ setupNeeded: boolean; data: Claim[] }>(`/api/fee-claims?status=${status}`);
    setLoading(false);
    if (!r.ok || !r.data) return setError(r.error || "Could not load.");
    setError(null);
    setSetupNeeded(r.data.setupNeeded);
    setRows(r.data.data);
  };
  const loadSettings = async () => {
    const r = await api.get<Settings>("/api/fee-claims/settings");
    if (r.ok && r.data) setSettings(r.data);
  };
  useEffect(() => {
    load();
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadSettings();
  }, []);

  const TABS: [Status, string][] = [
    ["pending", "To check"],
    ["verified", "Verified"],
    ["rejected", "Rejected"],
  ];

  return (
    <div className="space-y-5 pb-12">
      <header className="page-header">
        <div>
          <h1 className="page-title">Online payments</h1>
          <p className="page-subtitle">UPI payments parents reported in the parent app. Find the UTR in the bank statement, then verify.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={load} disabled={loading} className="btn btn-secondary" aria-label="Reload">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button type="button" onClick={() => setSettingsOpen(true)} className="btn btn-secondary px-3 sm:px-4" aria-label="UPI settings">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">UPI settings</span>
          </button>
        </div>
      </header>

      {settings && !settings.setupNeeded && !settings.upiId && (
        <div className="alert alert-amber">
          <span>
            Parents can&rsquo;t pay online yet: the school&rsquo;s UPI ID is not set.{" "}
            <button type="button" onClick={() => setSettingsOpen(true)} className="font-semibold underline">
              Set it now
            </button>
          </span>
        </div>
      )}
      {setupNeeded && (
        <div className="alert alert-amber">
          <span>Online payments need a one-time database update: run supabase/migrations/20261006_parent_app.sql in Supabase.</span>
        </div>
      )}

      <div className="scroll-row max-w-full gap-1 rounded-xl bg-slate-200/60 p-1 sm:w-fit" role="tablist" aria-label="Status">
        {TABS.map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={status === k} onClick={() => setStatus(k)} className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-semibold sm:py-1.5 ${status === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
            {l}
            {k === "pending" && status === "pending" && rows ? ` (${rows.length})` : ""}
          </button>
        ))}
      </div>

      {error && (
        <div className="alert alert-rose">
          <span>{error}</span>
        </div>
      )}

      <section className="card overflow-hidden">
        {!rows ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : rows.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">{status === "pending" ? "Nothing to check. New payments from parents will show here." : "None yet."}</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="table-head hidden md:table-header-group">
              <tr>
                <th className="px-4 py-2.5 text-left">Student</th>
                <th className="px-4 py-2.5 text-left">UTR</th>
                <th className="px-4 py-2.5 text-left">Paid on</th>
                <th className="px-4 py-2.5 text-right">Amount</th>
                <th className="px-4 py-2.5 text-right">{status === "pending" ? "" : "Checked by"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((c) => (
                <tr key={c.id} className="m-row align-top">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{c.student?.name || "—"}</p>
                    <p className="text-xs text-slate-500">
                      {c.student?.classSec} · {c.student?.srNo} · {c.parentPhone}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-[13px] font-semibold tracking-wide text-slate-900">{c.utr}</p>
                    <p className="text-xs text-slate-500">sent {when(c.sentAt)}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{day(c.paidOn)}</td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-base font-bold tabular-nums text-slate-900">{inr(c.amount)}</p>
                    {c.suggestion && c.suggestion.fine > 0 && <p className="text-xs tabular-nums text-slate-500">incl. fine {inr(c.suggestion.fine)}</p>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {c.status === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setRejecting(c)} className="btn btn-secondary btn-sm">
                          <X className="h-4 w-4" /> Reject
                        </button>
                        <button type="button" onClick={() => setVerifying(c)} className="btn btn-primary btn-sm">
                          <Check className="h-4 w-4" /> Verify
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">
                        <p>
                          <span className={`badge ${c.status === "verified" ? "badge-emerald" : "badge-rose"}`}>{c.status === "verified" ? "Verified" : "Rejected"}</span>
                        </p>
                        <p className="mt-1">
                          {c.decidedBy} · {c.decidedAt ? when(c.decidedAt) : ""}
                        </p>
                        {c.rejectReason && <p className="mt-0.5 text-slate-600">{c.rejectReason}</p>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <VerifyModal
        claim={verifying}
        onClose={() => setVerifying(null)}
        onDone={(tx) => {
          setVerifying(null);
          toast(`Receipt ${tx.receipt_no} made.`, "success");
          setPrinting(tx);
          load();
        }}
      />
      <RejectModal
        claim={rejecting}
        onClose={() => setRejecting(null)}
        onDone={() => {
          setRejecting(null);
          toast("Marked as not received. The parent will see the reason.", "success");
          load();
        }}
      />
      <SettingsModal open={settingsOpen} isAdmin={isAdmin} settings={settings} onClose={() => setSettingsOpen(false)} onSaved={(s) => setSettings(s)} />
      <FeeReceiptModal isOpen={!!printing} onClose={() => setPrinting(null)} transaction={printing} schoolName={schoolProfile.school_name || "School"} />
    </div>
  );
}

function VerifyModal({ claim, onClose, onDone }: { claim: Claim | null; onClose: () => void; onDone: (tx: FeeTransaction) => void }) {
  const [fee, setFee] = useState("");
  const [fine, setFine] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!claim) return;
    const s = claim.suggestion;
    setFee(String(s ? s.fee : claim.amount));
    setFine(String(s ? s.fine : 0));
    setReason(s && s.waived > 0 ? "Parent paid online without the full late fine" : "");
    setError(null);
  }, [claim]);

  if (!claim) return null;
  const s = claim.suggestion;
  const feeN = Math.round(Number(fee) || 0);
  const fineN = Math.round(Number(fine) || 0);
  const sumOk = feeN + fineN === claim.amount;
  // How much fine is let go is worked out again by the server; this only shows the office what it will see.
  const waived = s && feeN === s.fee ? Math.max(0, s.fine + s.waived - fineN) : 0;

  const go = async () => {
    setBusy(true);
    setError(null);
    const r = await api.post<{ transaction: FeeTransaction }>(`/api/fee-claims/${claim.id}/verify`, { fee: feeN, fine: fineN, waiveReason: reason.trim() || undefined });
    setBusy(false);
    if (!r.ok || !r.data) return setError(r.error || "Could not verify.");
    onDone(r.data.transaction);
  };

  return (
    <Modal isOpen={!!claim} onClose={() => !busy && onClose()} title={`Verify ${inr(claim.amount)} from ${claim.student?.name || "parent"}?`} maxWidth="max-w-md">
      <div className="space-y-4 text-sm">
        <dl className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
          <div>
            <dt className="text-xs text-slate-500">UTR</dt>
            <dd className="font-mono font-semibold text-slate-900">{claim.utr}</dd>
          </div>
          <div className="text-right">
            <dt className="text-xs text-slate-500">Paid on</dt>
            <dd className="font-semibold text-slate-900">{day(claim.paidOn)}</dd>
          </div>
        </dl>
        <p className="text-[13px] text-slate-600">
          First find <b>{inr(claim.amount)}</b> with this UTR in the school&rsquo;s bank statement. The receipt is dated {day(claim.paidOn)} and late fine is worked out for that day.
        </p>
        {s && s.excess > 0 && (
          <div className="alert alert-rose">
            <span>
              The parent paid {inr(s.excess)} more than the whole year&rsquo;s fee and fine. Reject this, and collect at the counter / refund the extra.
            </span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="field-label">Fee part</span>
            <input value={fee} onChange={(e) => setFee(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className="field w-full tabular-nums" />
          </label>
          <label className="block">
            <span className="field-label">Late fine part</span>
            <input value={fine} onChange={(e) => setFine(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className="field w-full tabular-nums" />
          </label>
        </div>
        {!sumOk && <p className="text-[13px] font-medium text-rose-700">Fee + fine must add up to {inr(claim.amount)}.</p>}
        <label className="block">
          <span className="field-label">{waived > 0 ? `Why is ${inr(waived)} of the late fine let go?` : "If any late fine is let go, why?"}</span>
          <input value={reason} onChange={(e) => setReason(e.target.value)} className="field w-full" />
        </label>
        {error && (
          <div className="alert alert-rose">
            <span>{error}</span>
          </div>
        )}
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary btn-sm">
            Not now
          </button>
          <button type="button" onClick={go} disabled={busy || !sumOk || !!(s && s.excess > 0)} className="btn btn-primary btn-sm">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Found in bank · make receipt
          </button>
        </div>
      </div>
    </Modal>
  );
}

const REJECT_REASONS = ["UTR not found in the bank statement", "Amount in bank is different", "This UTR was already used", "Paid to a different account"];

function RejectModal({ claim, onClose, onDone }: { claim: Claim | null; onClose: () => void; onDone: () => void }) {
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [other, setOther] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setReason(REJECT_REASONS[0]);
    setOther("");
    setError(null);
  }, [claim]);
  if (!claim) return null;

  const go = async () => {
    setBusy(true);
    const r = await api.post(`/api/fee-claims/${claim.id}/reject`, { reason: reason === "other" ? other : reason });
    setBusy(false);
    if (!r.ok) return setError(r.error || "Could not save.");
    onDone();
  };

  return (
    <Modal isOpen={!!claim} onClose={() => !busy && onClose()} title={`Not received: ${inr(claim.amount)}, UTR ${claim.utr}`} maxWidth="max-w-md">
      <div className="space-y-4 text-sm">
        <label className="block">
          <span className="field-label">Why? (the parent sees this)</span>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="field w-full">
            {REJECT_REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
            <option value="other">Something else…</option>
          </select>
          {reason === "other" && <input value={other} onChange={(e) => setOther(e.target.value)} placeholder="Write the reason" className="field mt-2 w-full" autoFocus />}
        </label>
        {error && (
          <div className="alert alert-rose">
            <span>{error}</span>
          </div>
        )}
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary btn-sm">
            Back
          </button>
          <button type="button" onClick={go} disabled={busy} className="btn btn-danger btn-sm">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Reject
          </button>
        </div>
      </div>
    </Modal>
  );
}

function SettingsModal({ open, isAdmin, settings, onClose, onSaved }: { open: boolean; isAdmin: boolean; settings: Settings | null; onClose: () => void; onSaved: (s: Settings) => void }) {
  const [upiId, setUpiId] = useState("");
  const [upiName, setUpiName] = useState("");
  const [officePhone, setOfficePhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setUpiId(settings?.upiId || "");
    setUpiName(settings?.upiName || "");
    setOfficePhone(settings?.officePhone || "");
    setError(null);
  }, [open, settings]);

  const save = async () => {
    setBusy(true);
    const r = await api.put<Settings>("/api/fee-claims/settings", { upiId, upiName, officePhone });
    setBusy(false);
    if (!r.ok || !r.data) return setError(r.error || "Could not save.");
    onSaved(r.data);
    toast("Saved. The parent app shows it at once.", "success");
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={() => !busy && onClose()} title="Parent app: payment & contact" maxWidth="max-w-md">
      <div className="space-y-4 text-sm">
        <label className="block">
          <span className="field-label">School&rsquo;s UPI ID</span>
          <input value={upiId} onChange={(e) => setUpiId(e.target.value.trim())} placeholder="schoolname@sbi" disabled={!isAdmin} className="field w-full" />
          <span className="mt-1 block text-xs text-slate-500">Use the school&rsquo;s own bank account. Parents pay this ID. Leave empty to switch online payment off.</span>
        </label>
        <label className="block">
          <span className="field-label">Name shown on UPI</span>
          <input value={upiName} onChange={(e) => setUpiName(e.target.value)} placeholder="As the bank shows it" disabled={!isAdmin} className="field w-full" />
        </label>
        <label className="block">
          <span className="field-label">Office phone for parents</span>
          <input value={officePhone} onChange={(e) => setOfficePhone(e.target.value)} placeholder="94600 62543" inputMode="tel" disabled={!isAdmin} className="field w-full" />
        </label>
        {!isAdmin && <p className="text-xs text-slate-500">Only the administrator can change these.</p>}
        {error && (
          <div className="alert alert-rose">
            <span>{error}</span>
          </div>
        )}
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary btn-sm">
            Close
          </button>
          {isAdmin && (
            <button type="button" onClick={save} disabled={busy} className="btn btn-primary btn-sm">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
