"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Printer } from "lucide-react";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { toast } from "@/components/ui/Toaster";
import { PrintSheet } from "@/components/certificates/SheetPreview";
import { PayrollRow, payrollService } from "@/lib/services/payrollService";
import { PayslipDocument, monthLabel } from "./PayslipDocument";

const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
export const PAY_MODES = ["Bank transfer", "Cash", "Cheque", "UPI"];

/** One month's slip: the breakdown, changes while it is a draft, printing and payment. */
export function SlipDrawer({ row, school, place, isAdmin, onClose, onChanged }: { row: PayrollRow | null; school: string; place: string; isAdmin: boolean; onClose: () => void; onChanged: () => void }) {
  const slip = row?.slip || null;
  const [lop, setLop] = useState("");
  const [bonus, setBonus] = useState("");
  const [advance, setAdvance] = useState("");
  const [paidOn, setPaidOn] = useState(today());
  const [mode, setMode] = useState(PAY_MODES[0]);
  const [ref, setRef] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (!slip) return;
    setLop(slip.lop_manual ? String(slip.lop_days) : "");
    setBonus(slip.bonus ? String(slip.bonus) : "");
    setAdvance(slip.advance ? String(slip.advance) : "");
    setPaidOn(today());
    setMode(PAY_MODES[0]);
    setRef("");
    setError(null);
  }, [slip]);

  if (!row || !slip) return null;
  const draft = slip.status === "draft";
  const changed = draft && (lop !== (slip.lop_manual ? String(slip.lop_days) : "") || bonus !== (slip.bonus ? String(slip.bonus) : "") || advance !== (slip.advance ? String(slip.advance) : ""));

  const run = async (job: () => Promise<{ success: boolean; error?: string }>, ok: string) => {
    setBusy(true);
    setError(null);
    const r = await job();
    setBusy(false);
    if (!r.success) return setError(r.error || "Could not save.");
    toast(ok, "success");
    onChanged();
  };

  const lines = (items: [string, number][]) =>
    items
      .filter(([, v]) => v > 0)
      .map(([k, v]) => (
        <div key={k} className="flex justify-between py-1 text-sm">
          <span className="text-slate-600">{k}</span>
          <span className="tabular-nums text-slate-900">{inr(v)}</span>
        </div>
      ));

  return (
    <>
      <SideDrawer
        isOpen
        onClose={onClose}
        busy={busy}
        width="max-w-[520px]"
        title={row.name}
        subtitle={monthLabel(slip.month)}
        footer={
          draft ? (
            changed ? (
              <>
                <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary ml-auto">
                  Cancel
                </button>
                <button type="button" onClick={() => run(() => payrollService.updateSlip(slip.id, { lopDays: lop, bonus, advance }), "Salary updated.")} disabled={busy} className="btn btn-primary">
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save changes
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => setPrinting(true)} className="btn btn-secondary">
                  <Printer className="h-4 w-4" />
                  Print
                </button>
                <button type="button" onClick={() => run(() => payrollService.pay([slip.id], paidOn, mode, ref), `${row.name}'s salary marked paid.`)} disabled={busy} className="btn btn-primary ml-auto">
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Mark paid · {inr(slip.net)}
                </button>
              </>
            )
          ) : (
            <>
              {isAdmin && (
                <button type="button" onClick={() => run(() => payrollService.undoPay(slip.id), "Payment undone. The slip is a draft again.")} disabled={busy} className="btn btn-secondary">
                  Undo payment
                </button>
              )}
              <button type="button" onClick={() => setPrinting(true)} className="btn btn-primary ml-auto">
                <Printer className="h-4 w-4" />
                Print slip
              </button>
            </>
          )
        }
      >
        <div className="space-y-4 p-5">
          {error && <p role="alert" className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-800 ring-1 ring-rose-300">{error}</p>}

          <section className="card p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-slate-600">Net pay</span>
              <span className="text-2xl font-bold tabular-nums text-slate-900">{inr(slip.net)}</span>
            </div>
            <p className="mt-1 text-[13px] text-slate-600">
              {slip.paid_days} of {slip.days_in_month} days paid
              {slip.lop_days > 0 && ` · ${slip.lop_days} LOP`}
              {!draft && slip.paid_on && ` · paid ${new Date(slip.paid_on + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${slip.pay_mode}`}
            </p>
          </section>

          <section className="card grid gap-5 p-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-1 text-xs font-semibold text-slate-500">Earnings</h3>
              {lines([
                ["Basic", slip.earnings.basic],
                ["HRA", slip.earnings.hra],
                ["DA", slip.earnings.da],
                ["Other allowance", slip.earnings.other],
                ["Bonus", slip.earnings.bonus],
              ])}
              <div className="mt-1 flex justify-between border-t border-slate-100 pt-1.5 text-sm font-semibold">
                <span>Gross</span>
                <span className="tabular-nums">{inr(slip.gross)}</span>
              </div>
            </div>
            <div>
              <h3 className="mb-1 text-xs font-semibold text-slate-500">Deductions</h3>
              {lines([
                ["Provident fund", slip.deductions.pf],
                ["ESI", slip.deductions.esi],
                ["TDS", slip.deductions.tds],
                ["Other", slip.deductions.other],
                ["Advance", slip.deductions.advance],
              ])}
              {slip.total_deductions === 0 && <p className="py-1 text-sm text-slate-500">None</p>}
              <div className="mt-1 flex justify-between border-t border-slate-100 pt-1.5 text-sm font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{inr(slip.total_deductions)}</span>
              </div>
            </div>
          </section>

          {draft && (
            <section className="card p-4">
              <h3 className="mb-3 text-sm font-bold text-slate-900">This month</h3>
              <div className="grid grid-cols-3 gap-3">
                <label className="block">
                  <span className="field-label">LOP days</span>
                  <input type="number" inputMode="decimal" step={0.5} min={0} max={slip.days_in_month} value={lop} onChange={(e) => setLop(e.target.value)} placeholder={String(slip.lop_manual ? "" : slip.lop_days)} className="field w-full text-right tabular-nums" />
                </label>
                <label className="block">
                  <span className="field-label">Bonus</span>
                  <input type="number" inputMode="numeric" min={0} value={bonus} onChange={(e) => setBonus(e.target.value)} placeholder="0" className="field w-full text-right tabular-nums" />
                </label>
                <label className="block">
                  <span className="field-label">Advance</span>
                  <input type="number" inputMode="numeric" min={0} value={advance} onChange={(e) => setAdvance(e.target.value)} placeholder="0" className="field w-full text-right tabular-nums" />
                </label>
              </div>
              <p className="mt-2 text-xs text-slate-500">Leave LOP blank to take it from attendance.</p>
            </section>
          )}

          {draft && !changed && (
            <section className="card p-4">
              <h3 className="mb-3 text-sm font-bold text-slate-900">Payment</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="field-label">Paid on</span>
                  <input type="date" value={paidOn} max={today()} onChange={(e) => setPaidOn(e.target.value)} className="field w-full" />
                </label>
                <label className="block">
                  <span className="field-label">Mode</span>
                  <select value={mode} onChange={(e) => setMode(e.target.value)} className="field w-full">
                    {PAY_MODES.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="field-label">Reference</span>
                  <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="UTR / cheque no." maxLength={60} className="field w-full" />
                </label>
              </div>
            </section>
          )}
        </div>
      </SideDrawer>

      {printing && (
        <PrintSheet onDone={() => setPrinting(false)}>
          <PayslipDocument
            slip={slip}
            school={school}
            place={place}
            account={row.structure ? { bank: row.structure.bank_name, no: row.structure.account_no, ifsc: row.structure.ifsc, pan: row.structure.pan } : undefined}
          />
        </PrintSheet>
      )}
    </>
  );
}
