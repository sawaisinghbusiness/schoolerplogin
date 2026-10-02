"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, ChevronRight, Gift, IndianRupee, Landmark, Plus, RefreshCw, Users } from "lucide-react";
import { useCurrentUser, greeting } from "@/components/layout/useCurrentUser";
import { dashboardService, type Dashboard } from "@/lib/services/dashboardService";

// Payment-mode colours: validated categorical trio (colour-blind safe; labels always shown).
const MODE_COLORS: Record<"Cash" | "UPI" | "Cheque", string> = { Cash: "#2a78d6", UPI: "#eb6834", Cheque: "#1baf7a" };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** ₹ in Indian units: ₹76.2 L, ₹3.65 Cr, ₹54,000 */
function money(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
const fmt = (n: number) => n.toLocaleString("en-IN");

export default function DashboardPage() {
  const user = useCurrentUser();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hello, setHello] = useState("Welcome");
  const [today, setToday] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await dashboardService.get();
    setData(res.data);
    setError(res.error || null);
    setLoading(false);
  };

  useEffect(() => {
    load();
    setHello(greeting());
    setToday(new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }));
  }, []);

  const f = data?.fees;
  const change = f && f.lastMonth > 0 ? ((f.thisMonth - f.lastMonth) / f.lastMonth) * 100 : null;
  const paidPct = f && f.sessionTotal > 0 ? Math.round((f.sessionPaid / f.sessionTotal) * 100) : 0;

  return (
    <div className="space-y-4 pb-12 sm:space-y-6">
      {/* Greeting + actions */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-[21px] font-bold tracking-tight text-slate-900 sm:text-[26px]">
            {hello}, {user.name.split(" ")[0]}
          </h1>
        </div>
        {/* Phones: three equal quick actions; desktop: a row of buttons. */}
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
          <Link href="/attendance/mark" className="btn btn-secondary h-auto flex-col gap-1 px-1 py-2.5 text-[12.5px] sm:flex-row sm:gap-2 sm:px-4 sm:text-sm">
            <CalendarCheck className="h-[18px] w-[18px] sm:h-4 sm:w-4" />
            <span className="sm:hidden">Attendance</span>
            <span className="hidden sm:inline">Mark attendance</span>
          </Link>
          <Link href="/students?new=1" className="btn btn-secondary h-auto flex-col gap-1 px-1 py-2.5 text-[12.5px] sm:flex-row sm:gap-2 sm:px-4 sm:text-sm">
            <Plus className="h-[18px] w-[18px] sm:h-4 sm:w-4" />
            <span className="sm:hidden">Admission</span>
            <span className="hidden sm:inline">New admission</span>
          </Link>
          <Link href="/fees/collect" className="btn btn-primary h-auto flex-col gap-1 px-1 py-2.5 text-[12.5px] sm:flex-row sm:gap-2 sm:px-4 sm:text-sm">
            <IndianRupee className="h-[18px] w-[18px] sm:h-4 sm:w-4" />
            Collect fee
          </Link>
        </div>
      </div>

      {error && !data && (
        <div className="alert alert-rose">
          <span className="flex-1">Could not load the dashboard: {error}</span>
          <button onClick={load} className="btn btn-secondary btn-sm">
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      )}

      {/* Phones: one summary card — the month figure, then three rows that open their lists. */}
      <section className="card overflow-hidden sm:hidden" aria-label="Fees and students at a glance">
        {!f || !data ? (
          <div className="space-y-3 p-4">
            <div className="skeleton h-14 w-full" />
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-full" />
          </div>
        ) : (
          <>
            <div className="px-4 pb-3.5 pt-4">
              <p className="text-[13px] font-semibold text-slate-600">Collected this month</p>
              <p className="mt-1 text-[26px] font-bold leading-tight tracking-tight tabular-nums text-slate-900">{money(f.thisMonth)}</p>
            </div>
            <ul className="divide-y divide-slate-100 border-t border-slate-100">
              {[
                { href: "/fees/reports", title: "Collected this session", meta: `${paidPct}% of ${money(f.sessionTotal)}`, value: money(f.sessionPaid), tone: "text-slate-900" },
                { href: "/fees/dues", title: "Fees pending", meta: `${fmt(f.dueStudents)} students`, value: money(f.sessionDue), tone: "text-rose-600" },
                { href: "/students", title: "Students", meta: `${fmt(data.students.boys)} boys · ${fmt(data.students.girls)} girls · ${fmt(data.students.bus)} by bus`, value: fmt(data.students.total), tone: "text-slate-900" },
              ].map((r) => (
                <li key={r.title}>
                  <Link href={r.href} className="m-row min-h-[56px] active:bg-slate-50">
                    <span className="m-row-main">
                      <span className="m-row-title text-[14px]">{r.title}</span>
                      <span className="m-row-meta">{r.meta}</span>
                    </span>
                    <span className={`m-row-value ${r.tone}`}>{r.value}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* KPIs */}
      <div className="hidden grid-cols-1 gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Collected this month" loading={loading}>
          {f && (
            <>
              <p className="whitespace-nowrap text-[28px] font-extrabold leading-tight tracking-tight text-slate-900">{money(f.thisMonth)}</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <span />
                <Sparkline values={f.byMonth.map((m) => m.amount)} />
              </div>
            </>
          )}
        </Kpi>
        <Kpi label="Collected this session" loading={loading}>
          {f && (
            <>
              <p className="text-[28px] font-extrabold leading-tight tracking-tight text-slate-900">{money(f.sessionPaid)}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-50" role="img" aria-label={`${paidPct}% of ${money(f.sessionTotal)} collected`}>
                <div className="h-full rounded-full bg-brand-600" style={{ width: `${paidPct}%` }} />
              </div>
              <p className="mt-2 text-[13px] text-slate-500">
                {paidPct}% of {money(f.sessionTotal)}
              </p>
            </>
          )}
        </Kpi>
        <Kpi label="Fees pending" loading={loading}>
          {f && (
            <>
              <p className="text-[28px] font-extrabold leading-tight tracking-tight text-slate-900">{money(f.sessionDue)}</p>
              <div className="mt-2 flex items-center justify-between text-[13px]">
                <span className="text-slate-500">{fmt(f.dueStudents)} students</span>
                <Link href="/fees/collect" className="inline-flex items-center gap-0.5 font-semibold text-brand-700 hover:underline">
                  Collect
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </>
          )}
        </Kpi>
        <Kpi label="Students" loading={loading}>
          {data && (
            <>
              <p className="text-[28px] font-extrabold leading-tight tracking-tight text-slate-900">{fmt(data.students.total)}</p>
              <div className="mt-2 flex items-center justify-between gap-2 text-[13px] text-slate-500">
                <span>
                  {fmt(data.students.boys)} boys · {fmt(data.students.girls)} girls
                </span>
                <span>{fmt(data.students.bus)} by bus</span>
              </div>
            </>
          )}
        </Kpi>
      </div>

      {/* Collection chart + payment split */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <section className="card p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">Fee collection by month</h2>
              <p className="text-[13px] text-slate-500">Session 2026-27 · ₹ in lakh</p>
            </div>
          </div>
          {f ? <MonthChart data={f.byMonth} /> : <div className="skeleton h-56 w-full" />}
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="text-[15px] font-bold text-slate-900">How parents paid</h2>
          <p className="text-[13px] text-slate-500">This session{f ? ` · ${money(f.sessionPaid)}` : ""}</p>
          {f ? (
            <>
              <div className="mb-5 mt-4 flex h-3.5 gap-[2px] overflow-hidden rounded" role="img" aria-label="Split by payment mode">
                {(["Cash", "UPI", "Cheque"] as const).map((m) =>
                  f.byMode[m] > 0 ? (
                    <span key={m} style={{ width: `${(f.byMode[m] / f.sessionPaid) * 100}%`, background: MODE_COLORS[m] }} title={`${m} ${money(f.byMode[m])}`} />
                  ) : null
                )}
              </div>
              <ul className="space-y-3">
                {(["Cash", "UPI", "Cheque"] as const).map((m) => (
                  <li key={m} className="flex items-center gap-3 text-sm">
                    <span className="h-3 w-3 rounded" style={{ background: MODE_COLORS[m] }} />
                    <span className="flex-1 text-slate-700">{m}</span>
                    <span className="font-bold tabular-nums text-slate-900">{money(f.byMode[m])}</span>
                    <span className="w-10 text-right text-[13px] tabular-nums text-slate-500">{f.sessionPaid ? Math.round((f.byMode[m] / f.sessionPaid) * 100) : 0}%</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="skeleton mt-4 h-32 w-full" />
          )}
        </section>
      </div>

      {/* Dues by class + needs attention */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="card p-5 sm:p-6">
          <h2 className="text-[15px] font-bold text-slate-900">Classes with most fees pending</h2>
          <p className="text-[13px] text-slate-500">₹ in lakh</p>
          {f ? (
            <ul className="mt-4 space-y-3">
              {f.topDueClasses.map((c) => (
                <li key={c.class} className="grid grid-cols-[48px_minmax(0,1fr)_64px] items-center gap-3 text-[13px]" title={`Class ${c.class}: ${money(c.due)} pending`}>
                  <span className="font-semibold text-slate-800">{c.class}</span>
                  <span className="h-3 rounded-r bg-slate-100">
                    <span className="block h-full rounded-r bg-brand-600" style={{ width: `${(c.due / f.topDueClasses[0].due) * 100}%` }} />
                  </span>
                  <span className="text-right font-bold tabular-nums text-slate-900">{(c.due / 1e5).toFixed(1)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="skeleton mt-4 h-40 w-full" />
          )}
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="text-[15px] font-bold text-slate-900">Needs attention today</h2>
          {data ? (
            <ul className="mt-2 divide-y divide-slate-100">
              <Attention
                icon={CalendarCheck}
                tone={data.attention.sectionsMarkedToday < data.attention.sectionsTotal ? "warn" : "good"}
                title={
                  data.attention.sectionsMarkedToday < data.attention.sectionsTotal
                    ? data.attention.sectionsMarkedToday === 0
                      ? `No section has marked attendance yet (${data.attention.sectionsTotal} sections)`
                      : `${data.attention.sectionsTotal - data.attention.sectionsMarkedToday} of ${data.attention.sectionsTotal} sections haven't marked attendance`
                    : "Attendance marked in every section"
                }
                sub={`${data.attention.sectionsMarkedToday} marked so far today`}
                href="/attendance/mark"
                action="Mark"
              />
              <Attention
                icon={Landmark}
                tone="brand"
                title={data.attention.chequesThisWeek.count ? `${data.attention.chequesThisWeek.count} cheques received this week` : "No cheques received this week"}
                sub={data.attention.chequesThisWeek.count ? `${money(data.attention.chequesThisWeek.amount)} to deposit in the bank` : "Nothing to deposit"}
              />
              <Attention
                icon={IndianRupee}
                tone="bad"
                title={`${fmt(data.fees.dueStudents)} students have fees pending`}
                sub={`${money(data.fees.sessionDue)} in total`}
                href="/fees/collect"
                action="Collect"
              />
              <Attention
                icon={Gift}
                tone="good"
                title={data.attention.birthdaysToday.length ? `${data.attention.birthdaysToday.length} birthdays today` : "No birthdays today"}
                sub={
                  data.attention.birthdaysToday.length
                    ? data.attention.birthdaysToday
                        .slice(0, 3)
                        .map((b) => `${b.name} (${b.classSec})`)
                        .join(", ") + (data.attention.birthdaysToday.length > 3 ? ` and ${data.attention.birthdaysToday.length - 3} more` : "")
                    : "From students' dates of birth"
                }
              />
            </ul>
          ) : (
            <div className="skeleton mt-4 h-40 w-full" />
          )}
        </section>
      </div>
    </div>
  );
}

function Kpi({ label, loading, children }: { label: string; loading: boolean; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <p className="text-[13px] font-semibold text-slate-600">{label}</p>
      <div className="mt-2">{loading && !children ? <div className="skeleton h-14 w-full" /> : children || <div className="skeleton h-14 w-full" />}</div>
    </section>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 96, h = 32, max = Math.max(...values), min = Math.min(...values);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (w - 4) + 1, h - 3 - ((v - min) / (max - min || 1)) * (h - 8)]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="shrink-0">
      <path d={`${line} L${last[0]} ${h} L1 ${h} Z`} fill="rgb(52 70 209 / 0.10)" />
      <path d={line} fill="none" stroke="#3446D1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="4" fill="#fff" />
      <circle cx={last[0]} cy={last[1]} r="3" fill="#3446D1" />
    </svg>
  );
}

/** Column chart, one series, drawn to scale with SVG. */
function MonthChart({ data }: { data: { month: string; amount: number }[] }) {
  const W = 620, H = 230, L = 40, R = 8, T = 20, B = 26;
  const lakhs = data.map((d) => d.amount / 1e5);
  const rawMax = Math.max(10, ...lakhs);
  const step = [5, 10, 20, 25, 50, 100, 200].find((s) => rawMax / s <= 5) || 250;
  const max = Math.ceil(rawMax / step) * step;
  const ticks = Array.from({ length: max / step + 1 }, (_, i) => i * step);
  const plotH = H - T - B, slot = (W - L - R) / data.length, bw = Math.min(28, slot * 0.4);
  const y = (v: number) => T + plotH - (v / max) * plotH;
  const peak = lakhs.indexOf(Math.max(...lakhs));
  const [hover, setHover] = useState<number | null>(null);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Fee collection by month: ${data.map((d, i) => `${MONTHS[Number(d.month.slice(5)) - 1]} ${lakhs[i].toFixed(1)} lakh`).join(", ")}`}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t) + 0.5} y2={y(t) + 0.5} stroke="#EEF0F6" />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="11.5" fill="#7B80A2">
            {t}
          </text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = L + i * slot + (slot - bw) / 2, v = lakhs[i], top = y(v), r = Math.min(4, (T + plotH - top) / 2);
        const label = i === peak || i === data.length - 1 || hover === i;
        return (
          <g key={d.month} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <rect x={L + i * slot} y={T} width={slot} height={plotH + B} fill="transparent" />
            {v > 0 && (
              <path
                d={`M${x} ${T + plotH} V${top + r} Q${x} ${top} ${x + r} ${top} H${x + bw - r} Q${x + bw} ${top} ${x + bw} ${top + r} V${T + plotH} Z`}
                fill={hover === i ? "#2B38AE" : "#3446D1"}
              />
            )}
            <text x={x + bw / 2} y={H - 8} textAnchor="middle" fontSize="11.5" fill="#7B80A2">
              {MONTHS[Number(d.month.slice(5)) - 1]}
            </text>
            {label && v > 0 && (
              <text x={x + bw / 2} y={top - 7} textAnchor="middle" fontSize="12" fontWeight="700" fill="#15183A">
                {v.toFixed(1)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Attention({
  icon: Icon,
  tone,
  title,
  sub,
  href,
  action,
}: {
  icon: typeof Users;
  tone: "warn" | "brand" | "bad" | "good";
  title: string;
  sub: string;
  href?: string;
  action?: string;
}) {
  const tint = { warn: "text-marigold-600", brand: "text-brand-600", bad: "text-rose-600", good: "text-emerald-600" }[tone];
  return (
    <li className="flex items-center gap-3 py-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-[0_1px_1px_rgba(16,24,40,0.04)] ${tint}`}>
        <Icon className="h-4 w-4" strokeWidth={2.2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-900">{title}</span>
        <span className="block truncate text-[13px] text-slate-500">{sub}</span>
      </span>
      {href && action && (
        <Link href={href} className="btn btn-secondary btn-sm">
          {action}
        </Link>
      )}
    </li>
  );
}
