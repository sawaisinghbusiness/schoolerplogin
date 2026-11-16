"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, ChevronRight, Gift, IndianRupee, Landmark, Plus, RefreshCw, Users } from "lucide-react";
import { dashboardService, type Dashboard } from "@/lib/services/dashboardService";

const MODE_COLORS = { Cash: "#12665E", UPI: "#B18545", Cheque: "#798D9A", Other: "#5B6B7A" };
// "Other" is net banking and online payments; leaving it out made the split short of the session total (2026-11-16).
const MODE_LABEL = { Cash: "Cash", UPI: "UPI", Cheque: "Cheque", Other: "Net banking / online" };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmt = (n: number) => n.toLocaleString("en-IN");
function money(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const load = async () => {
    setLoading(true);
    const result = await dashboardService.get();
    setData(result.data);
    setError(result.error || (!result.data ? "The overview is unavailable." : null));
    setLoading(false);
  };
  useEffect(() => {
    load();
    setToday(new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }));
  }, []);
  const f = data?.fees;
  const paidPct = f && f.sessionTotal > 0 ? Math.round(f.sessionPaid / f.sessionTotal * 100) : 0;
  const change = f && f.lastMonth > 0 ? Math.round((f.thisMonth - f.lastMonth) / f.lastMonth * 100) : null;
  return <div className="space-y-5 pb-10">
    <header className="page-header">
      <div><h1 className="page-title">School overview</h1><p className="page-subtitle">{today || "Daily overview"} · Fees, enrolment and work that needs attention</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={load} disabled={loading} className="btn btn-secondary" aria-label="Refresh overview"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button>
        <Link href="/students?new=1" className="btn btn-secondary"><Plus className="h-4 w-4" />New admission</Link>
        <Link href="/fees/collect" className="btn btn-primary"><IndianRupee className="h-4 w-4" />Collect fee</Link>
      </div>
    </header>
    {error && <div role="alert" className="alert alert-rose"><span className="flex-1">Could not load the school overview: {error}</span><button type="button" onClick={load} className="btn btn-secondary btn-sm">Try again</button></div>}
    {loading && !data && <><div className="summary-strip">{Array.from({length:4},(_,i)=><div key={i}><div className="skeleton h-4 w-28"/><div className="skeleton mt-3 h-9 w-36"/></div>)}</div><div className="skeleton h-[320px] w-full" /></>}
    {data && f && <>
      <section className="summary-strip" aria-label="School figures">
        <Metric label="Collected this month" value={f.thisMonth} currency tone="collected" note={change === null ? "Current month" : `${change > 0 ? "+" : ""}${change}% vs last month`} href="/fees/reports" />
        <Metric label="Collected this session" value={f.sessionPaid} currency tone="collected" note={`${paidPct}% of ${money(f.sessionTotal)}`} href="/fees/reports" />
        <Metric label="Fees outstanding" value={f.sessionDue} currency tone="due" note={`${fmt(f.dueStudents)} students with dues`} href="/fees/dues" />
        <Metric label="Students enrolled" value={data.students.total} note={`${fmt(data.students.boys)} boys · ${fmt(data.students.girls)} girls`} href="/students" />
      </section>
      <div className="overview-grid">
        <section className="workspace-section overflow-hidden overview-chart" aria-labelledby="collection-heading">
          <header className="workspace-section-heading"><div><h2 id="collection-heading">Fee collection</h2><p>Session balance and monthly collections</p></div><Link href="/fees/reports" className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline">Open reports<ChevronRight className="h-3.5 w-3.5" /></Link></header>
          <div className="px-4 pb-5 pt-5 sm:px-6"><CollectionRing paid={f.sessionPaid} due={f.sessionDue} /><div className="mt-5 border-t border-slate-200 pt-5"><p className="mb-3 text-xs text-slate-500">Monthly collections · ₹ lakh</p>{f.byMonth.length ? <MonthChart data={f.byMonth} /> : <p className="py-8 text-center text-sm text-slate-500">No fee collections recorded for this period</p>}</div></div>
        </section>
        <section className="workspace-section overflow-hidden" aria-labelledby="daily-heading">
          <header className="workspace-section-heading"><div><h2 id="daily-heading">Today at the office</h2><p>Collection and pending work</p></div></header>
          <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-4">
            <div className="flex items-baseline justify-between gap-3"><p className="overview-amount" style={{color:'#15803D'}}>{money(data.today.amount)}</p><Link href="/fees/receipts" className="text-xs font-medium text-brand-700 hover:underline">{fmt(data.today.receipts)} receipts</Link></div>
            <p className="mt-1 text-xs text-slate-500">Collected today</p>
          </div>
          <ul className="attention-list px-5 py-4">
            <Attention icon={CalendarCheck} title={data.attention.sectionsMarkedToday < data.attention.sectionsTotal ? `${data.attention.sectionsTotal - data.attention.sectionsMarkedToday} sections need attendance` : "Attendance marked for all sections"} sub={`${data.attention.sectionsMarkedToday} of ${data.attention.sectionsTotal} sections marked`} href="/attendance/mark" action="Open" />
            <Attention icon={Landmark} title={`${data.attention.chequesThisWeek.count} cheques received this week`} sub={`${money(data.attention.chequesThisWeek.amount)} to review`} href="/fees/cheques" action="Review" />
            <Attention icon={Gift} title={data.attention.birthdaysToday.length ? `${data.attention.birthdaysToday.length} birthdays today` : "No birthdays today"} sub={data.attention.birthdaysToday.length ? data.attention.birthdaysToday.slice(0,2).map(b=>b.name).join(", ") : "From student records"} />
          </ul>
        </section>
      </div>
      <div className="overview-lower">
        <section className="workspace-section overflow-hidden" aria-labelledby="dues-heading">
          <header className="workspace-section-heading"><div><h2 id="dues-heading">Outstanding fees by class</h2><p>Classes with the highest remaining balance</p></div><Link href="/fees/dues" className="text-xs font-medium text-brand-700 hover:underline">View dues</Link></header>
          <div className="px-5 py-2">{f.topDueClasses.length ? f.topDueClasses.map((c,i)=><div key={c.class} className="flex items-center gap-4 border-b border-slate-100 py-4 last:border-b-0"><span className="w-12 shrink-0 text-sm font-medium text-slate-800">{c.class}</span><div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-sm bg-slate-100"><div className="h-full rounded-sm" style={{width:`${f.topDueClasses[0].due > 0 ? c.due/f.topDueClasses[0].due*100 : 0}%`,background:i===0?"#12665E":"#B4C4C7"}} /></div><span className="w-24 text-right text-sm font-medium tabular-nums text-slate-800">{money(c.due)}</span></div>) : <p className="py-7 text-sm text-slate-500">No outstanding class balances</p>}</div>
        </section>
        <section className="workspace-section overflow-hidden" aria-labelledby="modes-heading">
          <header className="workspace-section-heading"><div><h2 id="modes-heading">Payment methods</h2><p>Recorded collections this session</p></div><span className="text-sm font-medium tabular-nums text-slate-700">{money(f.sessionPaid)}</span></header>
          <div className="px-5 py-2">{(["Cash","UPI","Cheque","Other"] as const).filter(mode=>mode!=="Other"||f.byMode.Other>0).map(mode=><div key={mode} className="flex items-center gap-3 border-b border-slate-100 py-4 last:border-b-0"><span className="h-2 w-2 rounded-full" style={{background:MODE_COLORS[mode]}}/><span className="flex-1 text-sm text-slate-700">{MODE_LABEL[mode]}</span><span className="text-sm font-medium tabular-nums text-slate-800">{money(f.byMode[mode])}</span><span className="w-11 text-right text-xs tabular-nums text-slate-500">{f.sessionPaid>0?Math.round(f.byMode[mode]/f.sessionPaid*100):0}%</span></div>)}</div>
        </section>
      </div>
    </>}
  </div>;
}

function Metric({label,value,currency=false,tone,note,href}:{label:string;value:number;currency?:boolean;tone?:"collected"|"due";note:string;href:string}) {
  const [display,setDisplay]=useState(0);
  useEffect(()=>{
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){setDisplay(value);return;}
    let frame=0;const start=performance.now();
    const tick=(now:number)=>{const progress=Math.min(1,(now-start)/1050);setDisplay(value*(1-Math.pow(1-progress,3)));if(progress<1)frame=requestAnimationFrame(tick);};
    frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
  },[value]);
  const format=(n:number)=>currency?money(n):fmt(Math.round(n));
  return <Link href={href} className="group block hover:bg-slate-50"><p className="text-xs text-slate-600">{label}</p><p aria-label={format(value)} style={{color:tone==="collected"?"#15803D":tone==="due"?"#B42332":undefined}} className="mt-2 text-[28px] font-medium leading-tight tracking-tight tabular-nums text-slate-900"><span aria-hidden="true">{format(display)}</span></p><p className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-500">{note}<ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"/></p></Link>;
}

function CollectionRing({paid,due}:{paid:number;due:number}) {
  const collected=Math.max(0,paid),outstanding=Math.max(0,due),total=collected+outstanding;
  const fraction=total>0?collected/total:0;
  return <div className="flex flex-wrap items-center justify-center gap-6 sm:justify-start">
    <div className="relative h-40 w-40 shrink-0">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" role="img" aria-label={total>0?`Session fees: ${money(collected)} collected, ${money(outstanding)} outstanding`:'No session fee balance recorded'}>
        <circle cx="80" cy="80" r="65" fill="none" stroke={total>0?'#B42332':'#D8D5CD'} strokeWidth="14"/>
        {collected>0&&<circle cx="80" cy="80" r="65" fill="none" stroke="#15803D" strokeWidth="14" pathLength="100" strokeDasharray={`${fraction*100} 100`}/>}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><strong className="text-[28px] font-semibold tabular-nums text-slate-900">{total>0?`${Math.round(fraction*100)}%`:'—'}</strong><span className="text-xs text-slate-500">{total>0?'collected':'No balance'}</span></div>
    </div>
    <dl className="min-w-[150px] flex-1 space-y-4 text-sm"><div><dt className="flex items-center gap-2 text-slate-600"><span className="h-2 w-2 rounded-full bg-[#15803D]"/>Collected this session</dt><dd className="mt-1 text-lg font-semibold tabular-nums" style={{color:'#15803D'}}>{money(collected)}</dd></div><div><dt className="flex items-center gap-2 text-slate-600"><span className="h-2 w-2 rounded-full bg-[#B42332]"/>Outstanding</dt><dd className="mt-1 text-lg font-semibold tabular-nums" style={{color:'#B42332'}}>{money(outstanding)}</dd></div></dl>
  </div>;
}

function Attention({icon:Icon,title,sub,href,action}:{icon:typeof Users;title:string;sub:string;href?:string;action?:string}) {
  return <li><Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" strokeWidth={1.7}/><div className="min-w-0 flex-1"><p className="text-[13px] font-medium text-slate-800">{title}</p><p className="mt-1 text-xs text-slate-500">{sub}</p></div>{href&&<Link href={href} className="mt-0.5 text-xs font-medium text-brand-700 hover:underline">{action}</Link>}</li>;
}
/** Column chart, one series, drawn to scale with SVG. */
function MonthChart({ data }: { data: { month: string; amount: number }[] }) {
  const W = 620, H = 230, L = 40, R = 8, T = 20, B = 26;
  const lakhs = data.map((d) => d.amount / 1e5);
  const rawMax = Math.max(1, ...lakhs);
  const step = [0.25, 0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200].find((s) => rawMax / s <= 5) || 250;
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
          <line x1={L} x2={W - R} y1={y(t) + 0.5} y2={y(t) + 0.5} stroke="#EDF1F3" />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="11.5" fill="#647580">
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
                fill={hover === i ? "#0E554F" : i === data.length - 1 ? "#12665E" : "#B4C4C7"}
              />
            )}
            <text x={x + bw / 2} y={H - 8} textAnchor="middle" fontSize="11.5" fill="#647580">
              {MONTHS[Number(d.month.slice(5)) - 1]}
            </text>
            {label && v > 0 && (
              <text x={x + bw / 2} y={top - 7} textAnchor="middle" fontSize="12" fontWeight="700" fill="#18252F">
                {v.toFixed(1)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
