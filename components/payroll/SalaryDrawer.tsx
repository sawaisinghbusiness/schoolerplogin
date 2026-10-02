"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { PayrollRow, SalaryStructure, payrollService } from "@/lib/services/payrollService";

const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
const EMPTY: SalaryStructure = { basic: 0, hra: 0, da: 0, other_allowance: 0, pf: false, esi: false, tds: 0, other_deduction: 0, bank_name: "", account_no: "", ifsc: "", pan: "" };

type Form = Record<keyof SalaryStructure, string | boolean>;
const num = (v: string | boolean) => Math.max(0, Math.round(Number(v) || 0));

/** Monthly salary and bank details for one staff member. */
export function SalaryDrawer({ row, onClose, onSaved }: { row: PayrollRow | null; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<Form>(EMPTY as unknown as Form);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!row) return;
    const s = row.structure || EMPTY;
    setF(Object.fromEntries(Object.entries(s).map(([k, v]) => [k, typeof v === "number" ? (v ? String(v) : "") : v])) as Form);
    setError(null);
  }, [row]);

  const set = (k: keyof SalaryStructure, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));
  const gross = num(f.basic) + num(f.hra) + num(f.da) + num(f.other_allowance);
  const pf = f.pf ? Math.round(0.12 * Math.min(num(f.basic) + num(f.da), 15000)) : 0;
  const esi = f.esi && gross <= 21000 ? Math.ceil(0.0075 * gross) : 0;
  const net = gross - pf - esi - num(f.tds) - num(f.other_deduction);

  const save = async () => {
    if (!row) return;
    setBusy(true);
    setError(null);
    const body = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, typeof v === "boolean" ? v : ["bank_name", "account_no", "ifsc", "pan"].includes(k) ? v : num(v)])) as unknown as SalaryStructure;
    const r = await payrollService.saveStructure(row.staffId, body);
    setBusy(false);
    if (!r.success) return setError(r.error || "Could not save.");
    onSaved();
  };

  const money = (k: keyof SalaryStructure, label: string) => (
    <label className="block">
      <span className="field-label">{label}</span>
      <input type="number" inputMode="numeric" min={0} value={f[k] as string} onChange={(e) => set(k, e.target.value)} placeholder="0" className="field w-full text-right tabular-nums" />
    </label>
  );

  return (
    <SideDrawer
      isOpen={!!row}
      onClose={onClose}
      busy={busy}
      width="max-w-[520px]"
      title={row ? `Salary · ${row.name}` : "Salary"}
      subtitle={row ? row.designation : ""}
      footer={
        <>
          <span className="text-[13px] text-slate-600">
            Net a month <b className="tabular-nums text-slate-900">{inr(net)}</b>
          </span>
          <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary ml-auto">
            Cancel
          </button>
          <button type="button" onClick={save} disabled={busy} className="btn btn-primary">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </button>
        </>
      }
    >
      <div className="space-y-4 p-5">
        {error && <p role="alert" className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-800 ring-1 ring-rose-300">{error}</p>}

        <section className="card p-4">
          <h3 className="mb-3 text-sm font-bold text-slate-900">Earnings</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {money("basic", "Basic")}
            {money("hra", "HRA")}
            {money("da", "DA")}
            {money("other_allowance", "Other allowance")}
          </div>
        </section>

        <section className="card p-4">
          <h3 className="mb-3 text-sm font-bold text-slate-900">Deductions</h3>
          <div className="space-y-2">
            <Toggle on={!!f.pf} onChange={(v) => set("pf", v)} label="Provident fund" value={f.pf ? inr(pf) : ""} />
            <Toggle on={!!f.esi} onChange={(v) => set("esi", v)} label="ESI" value={f.esi ? (gross > 21000 ? "Not due above ₹21,000" : inr(esi)) : ""} />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {money("tds", "TDS a month")}
            {money("other_deduction", "Other deduction")}
          </div>
        </section>

        <section className="card p-4">
          <h3 className="mb-3 text-sm font-bold text-slate-900">Bank</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="field-label">Bank name</span>
              <input value={f.bank_name as string} onChange={(e) => set("bank_name", e.target.value)} className="field w-full" maxLength={80} />
            </label>
            <label className="block">
              <span className="field-label">Account no.</span>
              <input value={f.account_no as string} onChange={(e) => set("account_no", e.target.value.replace(/\D/g, ""))} inputMode="numeric" className="field w-full tabular-nums" maxLength={20} />
            </label>
            <label className="block">
              <span className="field-label">IFSC</span>
              <input value={f.ifsc as string} onChange={(e) => set("ifsc", e.target.value.toUpperCase())} className="field w-full uppercase" maxLength={11} />
            </label>
            <label className="block">
              <span className="field-label">PAN</span>
              <input value={f.pan as string} onChange={(e) => set("pan", e.target.value.toUpperCase())} className="field w-full uppercase" maxLength={10} />
            </label>
          </div>
        </section>
      </div>
    </SideDrawer>
  );
}

function Toggle({ on, onChange, label, value }: { on: boolean; onChange: (v: boolean) => void; label: string; value: string }) {
  return (
    <div className="flex min-h-[44px] items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => onChange(!on)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-brand-600" : "bg-slate-300"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </button>
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <span className="ml-auto text-sm tabular-nums text-slate-600">{value}</span>
    </div>
  );
}
