"use client";

import React from "react";
import { FeeBand, FeeConfig } from "@/lib/feeEngine";
import { SideDrawer } from "@/components/ui/SideDrawer";

export const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
export const sum = (a: number[]) => a.reduce((s, x) => s + (x || 0), 0);
export const ALL_CLASSES = ["Pre Nursery", "Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
export const shortDate = (iso: string) => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—");

/** Whole-rupee input: digits only, right-aligned, shows 0 as empty. */
export function Money({ value, onChange, label, className = "" }: { value: number; onChange: (n: number) => void; label: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-slate-400">₹</span>
      <input
        inputMode="numeric"
        aria-label={label}
        value={value ? String(value) : ""}
        placeholder="0"
        onChange={(e) => onChange(Math.min(1_000_000, parseInt(e.target.value.replace(/\D/g, "") || "0", 10)))}
        className="field field-sm w-full pl-6 text-right tabular-nums"
      />
    </div>
  );
}

/** Edits one class group: its name, which classes it covers, and every head × instalment amount. */
export function BandDrawer({
  cfg,
  index,
  onClose,
  onChange,
}: {
  cfg: FeeConfig;
  index: number | null;
  onClose: () => void;
  onChange: (band: FeeBand) => void;
}) {
  const band = index === null ? null : cfg.bands[index];
  if (!band) return null;
  const n = cfg.instalments.length;
  const takenElsewhere = new Map<string, string>();
  cfg.bands.forEach((b, i) => i !== index && b.classes.forEach((c) => takenElsewhere.set(c, b.name)));

  const setAmount = (head: string, i: number, v: number) => {
    const row = [...(band.amounts[head] || Array(n).fill(0))];
    row[i] = v;
    onChange({ ...band, amounts: { ...band.amounts, [head]: row } });
  };
  const toggleClass = (c: string) =>
    onChange({ ...band, classes: band.classes.includes(c) ? band.classes.filter((x) => x !== c) : ALL_CLASSES.filter((x) => x === c || band.classes.includes(x)) });

  const colTotals = cfg.instalments.map((_, i) => sum(cfg.heads.map((h) => band.amounts[h.key]?.[i] || 0)));

  return (
    <SideDrawer
      isOpen={index !== null}
      onClose={onClose}
      title={band.name || "Class group"}
      subtitle="Changes here are kept on the page until you press Save"
      width="max-w-[760px]"
      footer={
        <button type="button" onClick={onClose} className="btn btn-primary ml-auto">
          Done
        </button>
      }
    >
      <div className="space-y-4 p-5">
        <section className="card space-y-4 p-5">
          <label className="block">
            <span className="field-label">Group name</span>
            <input value={band.name} onChange={(e) => onChange({ ...band, name: e.target.value })} className="field w-full" />
          </label>
          <div>
            <span className="field-label">Classes in this group</span>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CLASSES.map((c) => {
                const on = band.classes.includes(c);
                const other = takenElsewhere.get(c);
                return (
                  <button
                    key={c}
                    type="button"
                    disabled={!!other}
                    title={other ? `Already in ${other}` : undefined}
                    onClick={() => toggleClass(c)}
                    className={`rounded-lg px-2.5 py-1 text-[13px] font-semibold transition ${
                      on ? "bg-brand-600 text-white" : other ? "cursor-not-allowed bg-slate-50 text-slate-300" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3">
            <h3 className="text-sm font-semibold text-slate-900">Fee in each instalment</h3>
            <p className="text-xs text-slate-500">Put a one-time charge (like annual charges) in the instalment it is collected in.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-2.5 text-left">Head</th>
                  {cfg.instalments.map((ins) => (
                    <th key={ins.name} className="px-2 py-2.5 text-right">
                      <span className="block">{ins.name}</span>
                      <span className="block font-normal text-slate-400">{shortDate(ins.due)}</span>
                    </th>
                  ))}
                  <th className="px-4 py-2.5 text-right">Year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cfg.heads.map((h) => (
                  <tr key={h.key} className="hover:bg-transparent">
                    <td className="whitespace-nowrap px-4 py-2 font-medium text-slate-800">{h.name}</td>
                    {cfg.instalments.map((ins, i) => (
                      <td key={ins.name} className="px-2 py-2">
                        <Money value={band.amounts[h.key]?.[i] || 0} onChange={(v) => setAmount(h.key, i, v)} label={`${h.name}, ${ins.name}`} className="min-w-[88px]" />
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-4 py-2 text-right font-semibold tabular-nums text-slate-900">{inr(sum(band.amounts[h.key] || []))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 bg-brand-50/60">
                  <td className="px-4 py-2.5 font-semibold text-slate-900">Total</td>
                  {colTotals.map((t, i) => (
                    <td key={i} className="px-2 py-2.5 text-right font-semibold tabular-nums text-slate-900">
                      {inr(t)}
                    </td>
                  ))}
                  <td className="px-4 py-2.5 text-right text-base font-bold tabular-nums text-brand-700">{inr(sum(colTotals))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {n > 0 && <p className="px-5 py-3 text-xs text-slate-500">Bus fee and the one-time admission fee are added on top, from their own sections.</p>}
        </section>
      </div>
    </SideDrawer>
  );
}
