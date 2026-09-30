"use client";

import React from "react";
import { AlertTriangle, Check, ChevronRight } from "lucide-react";
import type { ClassMoney, ClasswiseReport, CollectionReport } from "@/lib/services/reportService";

export const inr = (n: number) => (n < 0 ? "−" : "") + "₹" + Math.abs(Math.round(n || 0)).toLocaleString("en-IN");
export const lakh = (n: number) => (n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)} L` : inr(n));
export const pct = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);
export const pctText = (p: number) => (p > 0 && p < 1 ? "<1%" : `${Math.round(p)}%`);
export const dayLabel = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
const n = (x: number) => x.toLocaleString("en-IN");

const TH = "whitespace-nowrap px-3 py-2.5";
const TD_NUM = "whitespace-nowrap px-3 py-2.5 text-right tabular-nums";
const FOOT = "border-t border-slate-200 bg-slate-50/70 font-semibold text-slate-900";

function Bar({ value, tone = "bg-brand-500" }: { value: number; tone?: string }) {
  return (
    <div className="h-2 min-w-[60px] overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

/* ── Day book ── */

export function DayBook({ report }: { report: CollectionReport }) {
  const t = report.totals;
  const showOther = t.byMode.Other !== 0;
  const cell = (v: number) => (v ? inr(v) : <span className="text-slate-300">—</span>);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead className="table-head">
          <tr>
            <th className={`${TH} pl-5 text-left`}>Date</th>
            <th className={`${TH} text-right`}>Receipts</th>
            <th className={`${TH} text-right`}>Cash</th>
            <th className={`${TH} text-right`}>UPI</th>
            <th className={`${TH} text-right`}>Cheque</th>
            {showOther && <th className={`${TH} text-right`}>Other</th>}
            <th className={`${TH} pr-5 text-right`}>Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {report.days.map((d) => (
            <tr key={d.date} className="hover:bg-slate-50/60">
              <td className="whitespace-nowrap px-3 py-2.5 pl-5 font-medium text-slate-800">{dayLabel(d.date)}</td>
              <td className={`${TD_NUM} text-slate-600`}>{n(d.receipts)}</td>
              <td className={`${TD_NUM} text-slate-700`}>{cell(d.byMode.Cash)}</td>
              <td className={`${TD_NUM} text-slate-700`}>{cell(d.byMode.UPI)}</td>
              <td className={`${TD_NUM} text-slate-700`}>{cell(d.byMode.Cheque)}</td>
              {showOther && <td className={`${TD_NUM} text-slate-700`}>{cell(d.byMode.Other)}</td>}
              <td className={`${TD_NUM} pr-5 font-semibold text-slate-900`}>{inr(d.total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={FOOT}>
            <td className="whitespace-nowrap px-3 py-3 pl-5">
              Total <span className="font-normal text-slate-500">· {n(report.days.length)} {report.days.length === 1 ? "day" : "days"}</span>
            </td>
            <td className={`${TD_NUM} py-3`}>{n(t.receipts)}</td>
            <td className={`${TD_NUM} py-3`}>{inr(t.byMode.Cash)}</td>
            <td className={`${TD_NUM} py-3`}>{inr(t.byMode.UPI)}</td>
            <td className={`${TD_NUM} py-3`}>{inr(t.byMode.Cheque)}</td>
            {showOther && <td className={`${TD_NUM} py-3`}>{inr(t.byMode.Other)}</td>}
            <td className={`${TD_NUM} py-3 pr-5 text-emerald-700`}>{inr(t.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ── Head-wise ── */

export function HeadWise({ report }: { report: CollectionReport }) {
  const total = report.totals.total;
  const headSum = Math.round(report.heads.reduce((a, h) => a + h.amount, 0) * 100) / 100;
  const gap = Math.round((total - headSum) * 100) / 100;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead className="table-head">
          <tr>
            <th className={`${TH} pl-5 text-left`}>Fee head</th>
            <th className={`${TH} w-[45%] text-left`}>
              <span className="sr-only">Share bar</span>
            </th>
            <th className={`${TH} text-right`}>Amount</th>
            <th className={`${TH} pr-5 text-right`}>Share</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {report.heads.map((h) => {
            const p = pct(h.amount, total);
            return (
              <tr key={h.key}>
                <td className="whitespace-nowrap px-3 py-2.5 pl-5 font-medium text-slate-800">
                  {h.label}
                  {h.key === "unsplit" && <span className="ml-1.5 text-xs font-normal text-slate-500">receipts whose split did not add up</span>}
                </td>
                <td className="px-3 py-2.5">
                  <Bar value={p} tone={h.key === "unsplit" ? "bg-slate-400" : "bg-brand-500"} />
                </td>
                <td className={`${TD_NUM} font-semibold ${h.amount < 0 ? "text-rose-700" : "text-slate-900"}`}>{inr(h.amount)}</td>
                <td className={`${TD_NUM} pr-5 text-slate-600`}>{pctText(p)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className={FOOT}>
            <td className="px-3 py-3 pl-5" colSpan={2}>
              Total
            </td>
            <td className={`${TD_NUM} py-3 text-emerald-700`}>{inr(headSum)}</td>
            <td className={`${TD_NUM} py-3 pr-5 text-slate-600`}>100%</td>
          </tr>
        </tfoot>
      </table>
      <p className="flex items-center justify-end gap-1.5 border-t border-slate-100 px-5 py-2.5 text-xs text-slate-500">
        {gap === 0 ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} />
            Matches day book total
          </>
        ) : (
          <>
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            <span className="text-rose-700">Differs from the day book by {inr(gap)}</span>
          </>
        )}
      </p>
    </div>
  );
}

/* ── By collector ── */

export function ByCollector({ report }: { report: CollectionReport }) {
  const total = report.totals.total;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead className="table-head">
          <tr>
            <th className={`${TH} pl-5 text-left`}>Collected by</th>
            <th className={`${TH} text-right`}>Receipts</th>
            <th className={`${TH} w-[40%] text-left`}>
              <span className="sr-only">Share bar</span>
            </th>
            <th className={`${TH} text-right`}>Amount</th>
            <th className={`${TH} pr-5 text-right`}>Share</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {report.byCollector.map((c) => {
            const p = pct(c.total, total);
            return (
              <tr key={c.name}>
                <td className={`whitespace-nowrap px-3 py-2.5 pl-5 font-medium ${c.name === "Not recorded" ? "italic text-slate-500" : "text-slate-800"}`}>{c.name}</td>
                <td className={`${TD_NUM} text-slate-600`}>{n(c.receipts)}</td>
                <td className="px-3 py-2.5">
                  <Bar value={p} />
                </td>
                <td className={`${TD_NUM} font-semibold text-slate-900`}>{inr(c.total)}</td>
                <td className={`${TD_NUM} pr-5 text-slate-600`}>{pctText(p)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className={FOOT}>
            <td className="px-3 py-3 pl-5">Total</td>
            <td className={`${TD_NUM} py-3`}>{n(report.totals.receipts)}</td>
            <td />
            <td className={`${TD_NUM} py-3 text-emerald-700`}>{inr(total)}</td>
            <td className={`${TD_NUM} py-3 pr-5 text-slate-600`}>100%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ── Class-wise ── */

function Meter({ m }: { m: ClassMoney }) {
  const net = m.total - m.discount;
  const p = pct(m.paid, net);
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="hidden h-1.5 w-12 shrink-0 overflow-hidden rounded-full bg-slate-100 lg:block">
        <div className={`h-full rounded-full ${p >= 75 ? "bg-emerald-500" : p >= 50 ? "bg-marigold-400" : "bg-rose-500"}`} style={{ width: `${Math.min(100, p)}%` }} />
      </div>
      <span className="w-9 text-right tabular-nums text-slate-700">{net > 0 ? pctText(p) : "—"}</span>
    </div>
  );
}

/** With a Concession column the table is too wide for a ~900px window, so Students gives way below lg. */
function MoneyCells({ m, strong, concession }: { m: ClassMoney; strong?: boolean; concession: boolean }) {
  return (
    <>
      <td className={`${TD_NUM} text-slate-600 ${concession ? "hidden lg:table-cell" : ""}`}>{n(m.students)}</td>
      <td className={`${TD_NUM} ${strong ? "text-slate-900" : "text-slate-700"}`}>{inr(m.total)}</td>
      {concession && <td className={`${TD_NUM} text-slate-500`}>{m.discount ? inr(m.discount) : <span className="text-slate-300">—</span>}</td>}
      <td className={`${TD_NUM} ${strong ? "font-semibold" : ""} text-emerald-700`}>{inr(m.paid)}</td>
      <td className={`${TD_NUM} ${strong ? "font-semibold" : ""} ${m.balance > 0 ? "text-rose-700" : "text-slate-500"}`}>{inr(m.balance)}</td>
      <td className="whitespace-nowrap px-3 py-2.5 pr-5">
        <Meter m={m} />
      </td>
    </>
  );
}

export function ClassWise({ report, open, onToggle }: { report: ClasswiseReport; open: Set<string>; onToggle: (cls: string) => void }) {
  const concession = report.totals.discount !== 0;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead className="table-head">
          <tr>
            <th className={`${TH} pl-5 text-left`}>Class</th>
            <th className={`${TH} text-right ${concession ? "hidden lg:table-cell" : ""}`}>Students</th>
            <th className={`${TH} text-right`}>Fee</th>
            {concession && <th className={`${TH} text-right`}>Concession</th>}
            <th className={`${TH} text-right`}>Paid</th>
            <th className={`${TH} text-right`}>Due</th>
            <th className={`${TH} pr-5 text-right`}>Collected</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {report.classes.map((c) => {
            const isOpen = open.has(c.class);
            return (
              <React.Fragment key={c.class}>
                <tr onClick={() => onToggle(c.class)} className="group cursor-pointer hover:bg-slate-50/60">
                  <td className="whitespace-nowrap px-3 py-2.5 pl-4">
                    <button type="button" aria-expanded={isOpen} aria-label={`${isOpen ? "Hide" : "Show"} sections of ${c.class}`} className="inline-flex items-center gap-1.5 font-semibold text-slate-900 group-hover:text-brand-700">
                      <ChevronRight className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                      {c.class}
                    </button>
                  </td>
                  <MoneyCells m={c} strong concession={concession} />
                </tr>
                {isOpen &&
                  c.sections.map((s) => (
                    <tr key={s.section} className="bg-slate-50/60">
                      <td className="whitespace-nowrap px-3 py-2 pl-10 text-slate-600">
                        {c.class} {s.section}
                      </td>
                      <MoneyCells m={s} concession={concession} />
                    </tr>
                  ))}
              </React.Fragment>
            );
          })}
        </tbody>
        <tfoot>
          <tr className={FOOT}>
            <td className="px-3 py-3 pl-5">All classes</td>
            <MoneyCells m={report.totals} strong concession={concession} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
