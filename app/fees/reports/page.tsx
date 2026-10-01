"use client";

import React, { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Download, RefreshCw } from "lucide-react";
import { reportService, CollectionReport, ClasswiseReport } from "@/lib/services/reportService";
import { ByCollector, ClassWise, DayBook, HeadWise, inr, lakh, pct, pctText } from "@/components/fees/reports/tables";

type Tab = "daybook" | "heads" | "collectors" | "classes";
type Preset = "today" | "week" | "month" | "session" | "custom";

const SESSION = { name: "2026-2027", short: "2026-27", start: "2026-04-01", end: "2027-03-31" };
const MAX_DAYS = 400;

const todayIST = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
const addDays = (iso: string, d: number) => {
  const t = new Date(iso + "T00:00:00Z");
  t.setUTCDate(t.getUTCDate() + d);
  return t.toISOString().slice(0, 10);
};
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86_400_000);
const long = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const short = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });

function rangeFor(p: Exclude<Preset, "custom">): { from: string; to: string } {
  const today = todayIST();
  if (p === "today") return { from: today, to: today };
  if (p === "week") {
    const dow = new Date(today + "T00:00:00Z").getUTCDay(); // 0 = Sunday
    return { from: addDays(today, -((dow + 6) % 7)), to: today }; // from Monday
  }
  if (p === "month") return { from: today.slice(0, 8) + "01", to: today };
  return { from: SESSION.start, to: today < SESSION.end ? today : SESSION.end };
}

function rangeLabel(from: string, to: string) {
  if (from === to) return from === todayIST() ? `Today, ${long(from)}` : long(from);
  if (from.slice(0, 7) === to.slice(0, 7)) return `${Number(from.slice(8))}–${long(to)}`;
  return from.slice(0, 4) === to.slice(0, 4) ? `${short(from)} – ${long(to)}` : `${long(from)} – ${long(to)}`;
}

const PRESETS: [Preset, string][] = [
  ["today", "Today"],
  ["week", "This week"],
  ["month", "This month"],
  ["session", "This session"],
  ["custom", "Custom"],
];
const TABS: [Tab, string][] = [
  ["daybook", "Day book"],
  ["heads", "Head-wise"],
  ["collectors", "By collector"],
  ["classes", "Class-wise"],
];

export default function FeeReportsPage() {
  const [preset, setPreset] = useState<Preset>("month");
  const [range, setRange] = useState(() => rangeFor("month"));
  const [draft, setDraft] = useState(range);
  const [tab, setTab] = useState<Tab>("daybook");

  const [report, setReport] = useState<CollectionReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [classes, setClasses] = useState<ClasswiseReport | null>(null);
  const [classError, setClassError] = useState<string | null>(null);
  const [classLoading, setClassLoading] = useState(false);
  const [open, setOpen] = useState<Set<string>>(new Set());

  const seq = useRef(0);

  const load = async (r = range) => {
    const mine = ++seq.current;
    setLoading(true);
    const res = await reportService.collection(r.from, r.to);
    if (mine !== seq.current) return; // a newer range was picked meanwhile
    setLoading(false);
    if (!res.data) {
      setReport(null); // never show another range's figures under this range's title
      return setError(res.error || "Could not load.");
    }
    setError(null);
    setReport(res.data);
  };
  const loadClasses = async () => {
    setClassLoading(true);
    const res = await reportService.classwise();
    setClassLoading(false);
    if (!res.data) return setClassError(res.error || "Could not load.");
    setClassError(null);
    setClasses(res.data);
  };

  useEffect(() => {
    load(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to]);
  useEffect(() => {
    loadClasses();
  }, []);

  const pickPreset = (p: Preset) => {
    setPreset(p);
    if (p === "custom") return setDraft(range);
    setRange(rangeFor(p));
  };

  const draftProblem = !draft.from || !draft.to ? "Pick both dates." : draft.from > draft.to ? "The start date is after the end date." : daysBetween(draft.from, draft.to) > MAX_DAYS ? `Pick ${MAX_DAYS} days or less.` : null;
  const setDraftDate = (k: "from" | "to", v: string) => {
    const next = { ...draft, [k]: v };
    setDraft(next);
    const ok = next.from && next.to && next.from <= next.to && daysBetween(next.from, next.to) <= MAX_DAYS;
    if (ok) setRange(next);
  };

  const refresh = () => (tab === "classes" ? loadClasses() : load(range));
  const toggleClass = (c: string) =>
    setOpen((p) => {
      const n = new Set(p);
      n.has(c) ? n.delete(c) : n.add(c);
      return n;
    });

  /* ── Excel ── */
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const span = `${range.from}_to_${range.to}`;
    if (tab === "classes") {
      if (!classes) return;
      const row = (label: string, section: string, m: ClasswiseReport["totals"]) => ({
        Class: label,
        Section: section,
        Students: m.students,
        "Fee (₹)": m.total,
        "Concession (₹)": m.discount,
        "Paid (₹)": m.paid,
        "Due (₹)": m.balance,
        "Collected %": Math.round(pct(m.paid, m.total - m.discount) * 10) / 10,
      });
      const byClass = classes.classes.map((c) => row(c.class, "All", c)).concat([row("All classes", "", classes.totals)]);
      const bySection = classes.classes.reduce((a, c) => a.concat(c.sections.map((s) => row(c.class, s.section, s))), [] as ReturnType<typeof row>[]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(byClass), `Class-wise ${SESSION.short}`);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(bySection), `Sections ${SESSION.short}`);
      return XLSX.writeFile(wb, `Fee_classwise_${SESSION.short}_as_on_${todayIST()}.xlsx`);
    }
    if (!report) return;
    const t = report.totals;
    if (tab === "daybook") {
      const data = report.days
        .slice()
        .reverse()
        .map((d) => ({ Date: d.date, Receipts: d.receipts, "Cash (₹)": d.byMode.Cash, "UPI (₹)": d.byMode.UPI, "Cheque (₹)": d.byMode.Cheque, "Other (₹)": d.byMode.Other, "Total (₹)": d.total }))
        .concat([{ Date: "Total", Receipts: t.receipts, "Cash (₹)": t.byMode.Cash, "UPI (₹)": t.byMode.UPI, "Cheque (₹)": t.byMode.Cheque, "Other (₹)": t.byMode.Other, "Total (₹)": t.total }]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Day book");
      return XLSX.writeFile(wb, `Fee_daybook_${span}.xlsx`);
    }
    if (tab === "heads") {
      const data = report.heads
        .map((h) => ({ "Fee head": h.label, "Amount (₹)": h.amount, "Share %": Math.round(pct(h.amount, t.total) * 10) / 10 }))
        .concat([{ "Fee head": "Total", "Amount (₹)": t.total, "Share %": 100 }]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Head-wise");
      return XLSX.writeFile(wb, `Fee_headwise_${span}.xlsx`);
    }
    const data = report.byCollector
      .map((c) => ({ "Collected by": c.name, Receipts: c.receipts, "Amount (₹)": c.total, "Share %": Math.round(pct(c.total, t.total) * 10) / 10 }))
      .concat([{ "Collected by": "Total", Receipts: t.receipts, "Amount (₹)": t.total, "Share %": 100 }]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "By collector");
    XLSX.writeFile(wb, `Fee_by_collector_${span}.xlsx`);
  };

  const t = report?.totals;
  const busy = tab === "classes" ? classLoading : loading;
  const canExport = tab === "classes" ? !!classes?.classes.length : !!report?.totals.receipts && !loading;
  const share = (v: number) => (t && t.total ? `${pctText(pct(v, t.total))} of collected` : "—");
  const fig = (v: number | undefined) => (loading ? "…" : v === undefined ? "—" : lakh(v));

  return (
    <div className="space-y-5 pb-24">
      <header className="page-header">
        <div>
          <h1 className="page-title">Fee reports</h1>
          <p className="page-subtitle">
            {rangeLabel(range.from, range.to)}
            {report && !loading ? ` · ${report.totals.receipts.toLocaleString("en-IN")} receipt${report.totals.receipts === 1 ? "" : "s"}` : ""}
            {" · cancelled receipts not counted"}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={refresh} disabled={busy} className="btn btn-secondary" aria-label="Reload">
            <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
          </button>
          <button type="button" onClick={exportExcel} disabled={!canExport} className="btn btn-secondary px-3 sm:px-4" aria-label="Export to Excel">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="scroll-row max-w-full gap-1 rounded-xl bg-slate-100 p-1" role="radiogroup" aria-label="Date range">
          {PRESETS.map(([k, l]) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={preset === k}
              onClick={() => pickPreset(k)}
              className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-semibold sm:py-1.5 ${preset === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              {l}
            </button>
          ))}
        </div>
        {preset === "custom" && (
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-slate-600">
            <input type="date" value={draft.from} max={draft.to || undefined} onChange={(e) => setDraftDate("from", e.target.value)} aria-label="From date" className="field field-sm" />
            <span>to</span>
            <input type="date" value={draft.to} min={draft.from || undefined} onChange={(e) => setDraftDate("to", e.target.value)} aria-label="To date" className="field field-sm" />
            {draftProblem && <span className="text-rose-600">{draftProblem}</span>}
          </div>
        )}
      </div>

      <div className="kpi-grid">
        <Figure label="Collected" value={fig(t?.total)} title={t ? inr(t.total) : undefined} note={t && !loading ? `${t.receipts.toLocaleString("en-IN")} receipt${t.receipts === 1 ? "" : "s"}${t.byMode.Other ? ` · ${inr(t.byMode.Other)} other` : ""}` : ""} dot="bg-emerald-500" />
        <Figure label="Cash" value={fig(t?.byMode.Cash)} title={t ? inr(t.byMode.Cash) : undefined} note={t && !loading ? share(t.byMode.Cash) : ""} dot="bg-marigold-400" />
        <Figure label="UPI" value={fig(t?.byMode.UPI)} title={t ? inr(t.byMode.UPI) : undefined} note={t && !loading ? share(t.byMode.UPI) : ""} dot="bg-brand-500" />
        <Figure label="Cheque / DD" value={fig(t?.byMode.Cheque)} title={t ? inr(t.byMode.Cheque) : undefined} note={t && !loading ? share(t.byMode.Cheque) : ""} dot="bg-slate-400" />
      </div>

      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-slate-200/80 p-3 sm:p-4">
          <div className="scroll-row max-w-full gap-1 rounded-xl bg-slate-100 p-1" role="tablist">
            {TABS.map(([k, l]) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-semibold sm:py-1.5 ${tab === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                {l}
              </button>
            ))}
          </div>
          {tab === "classes" ? (
            <div className="ml-auto flex items-center gap-3 text-[13px] text-slate-500">
              <span>
                Session {SESSION.short}
                <span className="hidden lg:inline"> · active students</span>
                {classes && classes.totals.discount === 0 ? " · no concessions" : ""} · dates above don’t apply
              </span>
              {classes && classes.classes.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOpen(open.size ? new Set() : new Set(classes.classes.map((c) => c.class)))}
                  className="whitespace-nowrap font-semibold text-brand-700 hover:underline"
                >
                  {open.size ? "Collapse all" : "Show sections"}
                </button>
              )}
            </div>
          ) : (
            report &&
            !loading &&
            report.days.length > 0 && (
              <span className="ml-auto text-[13px] text-slate-500">
                {report.days.length.toLocaleString("en-IN")} day{report.days.length === 1 ? "" : "s"} with receipts
              </span>
            )
          )}
        </div>

        {tab === "classes" ? (
          classError ? (
            <ErrorBox message={classError} onRetry={loadClasses} />
          ) : !classes ? (
            <Skeleton />
          ) : classes.classes.length === 0 ? (
            <Empty text="No active students have a fee ledger for this session yet." />
          ) : (
            <ClassWise report={classes} open={open} onToggle={toggleClass} />
          )
        ) : error && !loading ? (
          <ErrorBox message={error} onRetry={() => load(range)} />
        ) : !report || loading ? (
          <Skeleton />
        ) : report.totals.receipts === 0 ? (
          <Empty text={`No fee was collected ${range.from === range.to ? `on ${long(range.from)}` : `between ${short(range.from)} and ${long(range.to)}`}.`} />
        ) : tab === "daybook" ? (
          <DayBook report={report} />
        ) : tab === "heads" ? (
          <HeadWise report={report} />
        ) : (
          <ByCollector report={report} />
        )}
      </section>
    </div>
  );
}

function Figure({ label, value, note, dot, title }: { label: string; value: string; note: string; dot: string; title?: string }) {
  return (
    <div className="kpi rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-5" title={title}>
      <span className="kpi-label">
        <i className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
        <span className="truncate">{label}</span>
      </span>
      <span className="kpi-value">{value}</span>
      <span className="kpi-note sm:min-h-[1.25rem] sm:truncate">{note}</span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton h-9 w-full" />
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="px-6 py-14 text-center text-sm text-slate-500">{text}</p>;
}

function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="px-6 py-12 text-center text-sm">
      <p className="text-rose-700">{message}</p>
      <button type="button" onClick={onRetry} className="btn btn-secondary btn-sm mt-3">
        Try again
      </button>
    </div>
  );
}
