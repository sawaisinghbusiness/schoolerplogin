"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { Check, ChevronLeft, ChevronRight, Download, Loader2, Lock, Play, RefreshCw, Wallet } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { Modal } from "@/components/ui/modal";
import { Avatar } from "@/components/ui/Avatar";
import { useSchoolProfile } from "@/components/providers/SchoolProfileProvider";
import { PayrollRow, payrollService } from "@/lib/services/payrollService";
import { SalaryDrawer } from "@/components/payroll/SalaryDrawer";
import { PAY_MODES, SlipDrawer } from "@/components/payroll/SlipDrawer";
import { monthLabel } from "@/components/payroll/PayslipDocument";

const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
const nowMonth = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }).slice(0, 7);
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const shift = (m: string, by: number) => {
  const [y, mo] = m.split("-").map(Number);
  const d = new Date(Date.UTC(y, mo - 1 + by, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};
const role = () => {
  try {
    return localStorage.getItem("schooldesk_user_role") || "";
  } catch {
    return "";
  }
};

export default function PayrollPage() {
  const { schoolProfile } = useSchoolProfile();
  const [month, setMonth] = useState(nowMonth());
  const [rows, setRows] = useState<PayrollRow[] | null>(null);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [denied, setDenied] = useState(false);
  const [running, setRunning] = useState(false);
  const [salaryFor, setSalaryFor] = useState<PayrollRow | null>(null);
  const [slipFor, setSlipFor] = useState<string | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [payOpen, setPayOpen] = useState(false);
  const [me, setMe] = useState("");

  const load = useCallback(async () => {
    const r = await payrollService.month(month);
    setDenied(!!r.denied);
    setSetupNeeded(r.setupNeeded);
    if (r.error) toast(r.error, "error");
    setRows(r.rows);
  }, [month]);

  useEffect(() => {
    setRows(null);
    setPicked(new Set());
    load();
  }, [load]);
  useEffect(() => setMe(role()), []);

  const stats = useMemo(() => {
    const list = rows || [];
    const slips = list.map((r) => r.slip).filter(Boolean) as NonNullable<PayrollRow["slip"]>[];
    return {
      net: slips.reduce((t, s) => t + Number(s.net), 0),
      paid: slips.filter((s) => s.status === "paid").reduce((t, s) => t + Number(s.net), 0),
      due: slips.filter((s) => s.status === "draft").reduce((t, s) => t + Number(s.net), 0),
      noSalary: list.filter((r) => !r.structure).length,
      made: slips.length,
      drafts: slips.filter((s) => s.status === "draft"),
    };
  }, [rows]);

  const run = async () => {
    setRunning(true);
    const r = await payrollService.generate(month);
    setRunning(false);
    if (!r.success) return toast(r.error || "Could not make salaries.", "error");
    toast(`Salaries for ${monthLabel(month)} worked out for ${r.made} staff.${r.noSalary ? ` ${r.noSalary} without a salary set.` : ""}`, "success");
    load();
  };

  const bankSheet = () => {
    const out = (rows || [])
      .filter((r) => r.slip)
      .map((r) => ({
        "Emp. code": r.empCode,
        Name: r.name,
        Bank: r.structure?.bank_name || "",
        "Account no.": r.structure?.account_no || "",
        IFSC: r.structure?.ifsc || "",
        "Net pay": Number(r.slip!.net),
        Status: r.slip!.status === "paid" ? "Paid" : "Not paid",
      }));
    const ws = XLSX.utils.json_to_sheet(out);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Salary");
    XLSX.writeFile(wb, `Salary ${monthLabel(month)}.xlsx`);
  };

  const active = (rows || []).find((r) => r.staffId === slipFor) || null;
  const draftsShown = (rows || []).filter((r) => r.slip?.status === "draft");
  const allPicked = draftsShown.length > 0 && draftsShown.every((r) => picked.has(r.slip!.id));
  const toggle = (id: string) =>
    setPicked((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const pickedNet = (rows || []).filter((r) => r.slip && picked.has(r.slip.id)).reduce((t, r) => t + Number(r.slip!.net), 0);
  const place = [schoolProfile.address, schoolProfile.city, schoolProfile.state].filter(Boolean).join(", ");

  if (denied) {
    return (
      <div className="card mx-auto mt-6 max-w-lg p-8 text-center">
        <Lock className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-3 font-semibold text-slate-900">Only the admin and the accountant can see salaries</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-28">
      <header className="page-header">
        <h1 className="page-title">Payroll</h1>
        {!setupNeeded && (
          <div className="flex gap-2">
            <button type="button" onClick={bankSheet} disabled={!stats.made} className="btn btn-secondary px-3 sm:px-4" aria-label="Download bank sheet">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Bank sheet</span>
            </button>
            <button type="button" onClick={run} disabled={running || !rows?.length || month > nowMonth()} className="btn btn-primary flex-1 sm:flex-none">
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : stats.made ? <RefreshCw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {stats.made ? "Recalculate" : "Run payroll"}
            </button>
          </div>
        )}
      </header>

      {setupNeeded ? (
        <div className="card p-8 text-center">
          <Wallet className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">Payroll needs a one-time database setup</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Run sms backend/supabase/migrations/20261002_payroll_transport.sql in the Supabase SQL editor.</p>
          <button type="button" onClick={load} className="btn btn-secondary btn-sm mt-4">
            <RefreshCw className="h-4 w-4" />
            Check again
          </button>
        </div>
      ) : (
        <>
          {/* Month */}
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setMonth((m) => shift(m, -1))} className="btn btn-secondary h-10 w-10 p-0" aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[9.5rem] text-center text-[15px] font-semibold text-slate-900">{monthLabel(month)}</span>
            <button type="button" onClick={() => setMonth((m) => shift(m, 1))} disabled={month >= nowMonth()} className="btn btn-secondary h-10 w-10 p-0" aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Figures */}
          <div className="kpi-grid">
            <Figure label="Net salary" value={rows ? inr(stats.net) : "…"} dot="bg-slate-400" />
            <Figure label="Paid" value={rows ? inr(stats.paid) : "…"} dot="bg-emerald-500" />
            <Figure label="To pay" value={rows ? inr(stats.due) : "…"} dot="bg-marigold-500" />
            <Figure label="Salary not set" value={rows ? String(stats.noSalary) : "…"} dot="bg-rose-500" />
          </div>

          {/* Staff */}
          <section className="card overflow-hidden" aria-label="Staff salaries">
            {rows === null ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-11 w-full" />
                ))}
              </div>
            ) : rows.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <p className="font-semibold text-slate-800">No staff on the rolls in {monthLabel(month)}</p>
                <Link href="/staff" className="btn btn-secondary btn-sm mt-4">
                  Add staff
                </Link>
              </div>
            ) : (
              <>
                {/* Phones */}
                <ul className="divide-y divide-slate-100 md:hidden">
                  {rows.map((r) => (
                    <li key={r.staffId}>
                      <button type="button" onClick={() => (r.slip ? setSlipFor(r.staffId) : setSalaryFor(r))} className="m-row active:bg-slate-50">
                        <Avatar name={r.name} id={r.staffId} size="sm" neutral />
                        <span className="m-row-main">
                          <span className="m-row-title">{r.name}</span>
                          <span className="m-row-meta">{r.designation}</span>
                        </span>
                        <span className="shrink-0 text-right">
                          {r.slip ? (
                            <>
                              <span className="block text-[15px] font-semibold tabular-nums text-slate-900">{inr(r.slip.net)}</span>
                              <SlipState paid={r.slip.status === "paid"} />
                            </>
                          ) : r.structure ? (
                            <span className="text-xs text-slate-500">Not run</span>
                          ) : (
                            <span className="text-xs font-semibold text-brand-700">Set salary</span>
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Desktop */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-sm">
                    <thead className="table-head">
                      <tr>
                        <th className="w-12 py-3 pl-5 pr-2 text-left">
                          <input type="checkbox" checked={allPicked} disabled={!draftsShown.length} onChange={(e) => setPicked(e.target.checked ? new Set(draftsShown.map((r) => r.slip!.id)) : new Set())} aria-label="Select all unpaid" className="h-4 w-4 accent-brand-600" />
                        </th>
                        <th className="px-3 py-3 text-left">Staff</th>
                        <th className="px-3 py-3 text-right">Days paid</th>
                        <th className="px-3 py-3 text-right">Gross</th>
                        <th className="px-3 py-3 text-right">Deductions</th>
                        <th className="px-3 py-3 text-right">Net</th>
                        <th className="px-3 py-3 text-left">Status</th>
                        <th className="py-3 pl-2 pr-5 text-right">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((r) => {
                        const s = r.slip;
                        return (
                          <tr key={r.staffId} className={s ? "cursor-pointer hover:bg-slate-50/70" : ""} onClick={() => s && setSlipFor(r.staffId)}>
                            <td className="py-3 pl-5 pr-2" onClick={(e) => e.stopPropagation()}>
                              {s?.status === "draft" && <input type="checkbox" checked={picked.has(s.id)} onChange={() => toggle(s.id)} aria-label={`Select ${r.name}`} className="h-4 w-4 accent-brand-600" />}
                            </td>
                            <td className="px-3 py-3">
                              <span className="block font-semibold text-slate-900">{r.name}</span>
                              <span className="block text-xs text-slate-500">{r.designation}</span>
                            </td>
                            {s ? (
                              <>
                                <td className="px-3 py-3 text-right tabular-nums text-slate-700">
                                  {s.paid_days}
                                  <span className="text-slate-400">/{s.days_in_month}</span>
                                </td>
                                <td className="px-3 py-3 text-right tabular-nums text-slate-700">{inr(s.gross)}</td>
                                <td className="px-3 py-3 text-right tabular-nums text-slate-700">{s.total_deductions ? inr(s.total_deductions) : "—"}</td>
                                <td className="px-3 py-3 text-right font-semibold tabular-nums text-slate-900">{inr(s.net)}</td>
                                <td className="px-3 py-3">
                                  <SlipState paid={s.status === "paid"} />
                                </td>
                              </>
                            ) : (
                              <td colSpan={5} className="px-3 py-3 text-[13px] text-slate-500">
                                {r.structure ? "Not worked out yet" : "Salary not set"}
                              </td>
                            )}
                            <td className="whitespace-nowrap py-3 pl-2 pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                              <button type="button" onClick={() => setSalaryFor(r)} className={`btn btn-sm ${r.structure ? "btn-secondary" : "btn-primary"}`}>
                                {r.structure ? "Salary" : "Set salary"}
                              </button>
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
        </>
      )}

      {picked.size > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-4 md:bottom-5 md:pl-[272px]">
          <div className="flex w-full max-w-2xl items-center gap-3 rounded-2xl bg-night-900 px-4 py-3 text-sm text-white shadow-2xl ring-1 ring-white/5 animate-scaleUp">
            <span className="text-night-300">
              <b className="text-white">{picked.size}</b> selected · <b className="tabular-nums text-white">{inr(pickedNet)}</b>
            </span>
            <button type="button" onClick={() => setPicked(new Set())} className="btn btn-sm ml-auto text-night-300 hover:text-white">
              Clear
            </button>
            <button type="button" onClick={() => setPayOpen(true)} className="btn btn-sm bg-marigold-400 font-bold text-night-950 hover:bg-marigold-300">
              Mark paid
            </button>
          </div>
        </div>
      )}

      <PayModal
        open={payOpen}
        count={picked.size}
        total={pickedNet}
        onClose={() => setPayOpen(false)}
        onPay={async (paidOn, mode, ref) => {
          const r = await payrollService.pay(Array.from(picked), paidOn, mode, ref);
          if (!r.success) return toast(r.error || "Could not save.", "error");
          toast(`${r.paid} salaries marked paid.`, "success");
          setPayOpen(false);
          setPicked(new Set());
          load();
        }}
      />
      <SalaryDrawer
        row={salaryFor}
        onClose={() => setSalaryFor(null)}
        onSaved={() => {
          toast(`${salaryFor?.name}'s salary saved.`, "success");
          setSalaryFor(null);
          load();
        }}
      />
      <SlipDrawer row={active} school={schoolProfile.school_name || "School"} place={place} isAdmin={me === "admin"} onClose={() => setSlipFor(null)} onChanged={load} />
    </div>
  );
}

function Figure({ label, value, dot }: { label: string; value: string; dot: string }) {
  return (
    <div className="kpi rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-5">
      <span className="kpi-label">
        <i className={`h-2 w-2 rounded-full ${dot}`} />
        {label}
      </span>
      <span className="kpi-value">{value}</span>
    </div>
  );
}

function SlipState({ paid }: { paid: boolean }) {
  return paid ? (
    <span className="badge badge-emerald">
      <Check className="h-3 w-3" strokeWidth={3} />
      Paid
    </span>
  ) : (
    <span className="badge badge-amber">Not paid</span>
  );
}

function PayModal({ open, count, total, onClose, onPay }: { open: boolean; count: number; total: number; onClose: () => void; onPay: (paidOn: string, mode: string, ref: string) => Promise<void> }) {
  const [paidOn, setPaidOn] = useState(today());
  const [mode, setMode] = useState(PAY_MODES[0]);
  const [ref, setRef] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) {
      setPaidOn(today());
      setRef("");
    }
  }, [open]);
  return (
    <Modal isOpen={open} onClose={() => !busy && onClose()} title={`Mark ${count} salaries paid`} maxWidth="max-w-md">
      <div className="space-y-4">
        <p className="text-2xl font-bold tabular-nums text-slate-900">{inr(total)}</p>
        <div className="grid gap-3 sm:grid-cols-2">
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
          <label className="block sm:col-span-2">
            <span className="field-label">Reference</span>
            <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="UTR / cheque no." maxLength={60} className="field w-full" />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onPay(paidOn, mode, ref);
              setBusy(false);
            }}
            className="btn btn-primary"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Mark paid
          </button>
        </div>
      </div>
    </Modal>
  );
}
