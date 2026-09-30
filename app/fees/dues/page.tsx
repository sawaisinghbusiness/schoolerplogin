"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { AlertTriangle, Check, Download, IndianRupee, MessageCircle, RefreshCw, Search, Send, X } from "lucide-react";
import { duesService, DuesReport, StudentDues, DEFAULT_TEMPLATES, fillTemplate, whatsappLink, ReminderLang } from "@/lib/services/duesService";
import { useSchoolProfile } from "@/components/providers/SchoolProfileProvider";
import { Modal } from "@/components/ui/modal";

type Tab = "students" | "classes";
type Filter = "all" | "one" | "two";
type Sort = "amount" | "oldest" | "class";

const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
const lakh = (n: number) => (n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)} L` : inr(n));
const day = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const CLASS_ORDER = ["Pre Nursery", "Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
const rank = (c: string) => (CLASS_ORDER.indexOf(c) === -1 ? 99 : CLASS_ORDER.indexOf(c));
const TPL_KEY = "sd.reminder.tpl";

export default function DuesPage() {
  const { schoolProfile } = useSchoolProfile();
  const school = `${schoolProfile.school_name || "School"}, ${schoolProfile.city || "Barmer"}`;
  const [report, setReport] = useState<DuesReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("students");
  const [query, setQuery] = useState("");
  const [cls, setCls] = useState("all");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("amount");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [remindOpen, setRemindOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await duesService.report();
    setLoading(false);
    if (!r.data) return setError(r.error || "Could not load.");
    setError(null);
    setReport(r.data);
  };
  useEffect(() => {
    load();
  }, []);

  const rows = report?.students || [];
  const classes = useMemo(() => Array.from(new Set(rows.map((r) => r.class))).sort((a, b) => rank(a) - rank(b)), [rows]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => {
        if (cls !== "all" && r.class !== cls) return false;
        if (filter === "one" && r.overdue.length !== 1) return false;
        if (filter === "two" && r.overdue.length < 2) return false;
        return !q || r.name.toLowerCase().includes(q) || r.srNo.toLowerCase().includes(q) || r.fatherName.toLowerCase().includes(q) || r.mobile.includes(q);
      })
      .sort((a, b) =>
        sort === "amount"
          ? b.dueNow + b.fine - (a.dueNow + a.fine)
          : sort === "oldest"
            ? (b.overdue[0]?.daysLate || 0) - (a.overdue[0]?.daysLate || 0) || b.dueNow - a.dueNow
            : rank(a.class) - rank(b.class) || a.section.localeCompare(b.section) || a.name.localeCompare(b.name)
      );
  }, [rows, query, cls, filter, sort]);

  const byClass = useMemo(() => {
    const m = new Map<string, { cls: string; students: number; due: number; fine: number }>();
    for (const r of rows) {
      const x = m.get(r.class) || { cls: r.class, students: 0, due: 0, fine: 0 };
      x.students++;
      x.due += r.dueNow;
      x.fine += r.fine;
      m.set(r.class, x);
    }
    return Array.from(m.values()).sort((a, b) => rank(a.cls) - rank(b.cls));
  }, [rows]);

  const picked = rows.filter((r) => selected.has(r.studentId));
  const allShown = shown.length > 0 && shown.every((r) => selected.has(r.studentId));
  const toggle = (id: string) =>
    setSelected((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const exportExcel = (list: StudentDues[]) => {
    const data = list.map((r) => ({
      "SR no.": r.srNo,
      Student: r.name,
      Class: r.classSec,
      Father: r.fatherName,
      Mobile: r.mobile,
      Overdue: r.overdue.map((o) => o.name).join(", "),
      "Due now (₹)": r.dueNow,
      "Late fine (₹)": r.fine,
      "Total (₹)": r.dueNow + r.fine,
      "Last paid": r.lastPaid || "Never",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dues");
    XLSX.writeFile(wb, `Fee_dues_${report?.asOf || "today"}.xlsx`);
  };

  const s = report?.summary;
  const dueNames = report ? report.instalments.filter((i) => i.due <= report.asOf).map((i) => i.name) : [];

  return (
    <div className="space-y-5 pb-24">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dues &amp; reminders</h1>
          <p className="page-subtitle">
            {report ? (
              <>
                As on {day(report.asOf)} · {dueNames.length ? `${dueNames.join(" and ")} ${dueNames.length > 1 ? "are" : "is"} due` : "no instalment is due yet"}
              </>
            ) : (
              "Working out every student's dues…"
            )}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={load} disabled={loading} className="btn btn-secondary" aria-label="Recalculate">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button type="button" onClick={() => exportExcel(shown)} disabled={!shown.length} className="btn btn-secondary">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </header>

      {error && (
        <div className="alert alert-rose">
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Figure label="Overdue now" value={s ? lakh(s.dueNow) : "…"} note={s ? `${s.withDues.toLocaleString("en-IN")} students` : ""} dot="bg-rose-500" />
        <Figure label="Late fine so far" value={s ? lakh(s.fine) : "…"} note="As per fee setup" dot="bg-marigold-400" />
        <Figure
          label={s?.next ? `${s.next.name} · ${day(s.next.due)}` : "Next instalment"}
          value={s?.next ? lakh(s.next.amount) : "—"}
          note={s?.next ? `from ${s.next.students.toLocaleString("en-IN")} students` : "All instalments are due"}
          dot="bg-brand-500"
        />
        <Figure label="Up to date" value={s ? s.upToDate.toLocaleString("en-IN") : "…"} note={s ? `of ${s.active.toLocaleString("en-IN")} students` : ""} dot="bg-emerald-500" />
      </div>

      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 p-3 sm:p-4 lg:flex-nowrap">
          <div className="flex shrink-0 gap-1 rounded-xl bg-slate-100 p-1" role="tablist">
            {(
              [
                ["students", "Students"],
                ["classes", "By class"],
              ] as [Tab, string][]
            ).map(([k, l]) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold ${tab === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                {l}
              </button>
            ))}
          </div>
          {tab === "students" && (
            <>
              <div className="relative min-w-[160px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, SR no., father or mobile" aria-label="Search" className="field field-sm w-full pl-9" />
              </div>
              <select value={cls} onChange={(e) => setCls(e.target.value)} aria-label="Class" className="field field-sm">
                <option value="all">All classes</option>
                {classes.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} aria-label="Overdue" className="field field-sm">
                <option value="all">Any overdue</option>
                <option value="one">1 instalment</option>
                <option value="two">2 or more</option>
              </select>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort" className="field field-sm">
                <option value="amount">Most due first</option>
                <option value="oldest">Longest overdue</option>
                <option value="class">Class order</option>
              </select>
            </>
          )}
        </div>

        {!report ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-11 w-full" />
            ))}
          </div>
        ) : tab === "classes" ? (
          <ClassTable rows={byClass} onPick={(c) => { setCls(c); setTab("students"); }} />
        ) : shown.length === 0 ? (
          <p className="px-6 py-14 text-center text-sm text-slate-500">{rows.length ? "Nobody matches these filters." : "Nobody has an overdue instalment. 🎉"}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="table-head">
                <tr className="[&>th]:whitespace-nowrap">
                  <th className="w-10 py-2.5 pl-4 pr-1 text-left">
                    <Box on={allShown} onClick={() => setSelected(allShown ? new Set() : new Set(shown.map((r) => r.studentId)))} label="Select all shown" />
                  </th>
                  <th className="px-3 py-2.5 text-left">Student</th>
                  <th className="px-3 py-2.5 text-left">Overdue</th>
                  <th className="px-3 py-2.5 text-right">Due now</th>
                  <th className="px-3 py-2.5 text-right">Fine</th>
                  <th className="hidden px-3 py-2.5 text-left xl:table-cell">Last paid</th>
                  <th className="px-4 py-2.5 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shown.slice(0, 300).map((r) => {
                  const on = selected.has(r.studentId);
                  const msg = fillTemplate(DEFAULT_TEMPLATES.hi, r, school, "hi");
                  const wa = whatsappLink(r.mobile, msg);
                  return (
                    <tr key={r.studentId} className={on ? "bg-brand-50/60" : ""}>
                      <td className="py-2.5 pl-4 pr-1">
                        <Box on={on} onClick={() => toggle(r.studentId)} label={`Select ${r.name}`} />
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="block font-semibold text-slate-900">{r.name}</span>
                        <span className="block text-xs text-slate-500">
                          <span className="whitespace-nowrap">{r.classSec}</span> · <span className="whitespace-nowrap">{r.fatherName}</span>
                        </span>
                        <a href={`tel:${r.mobile}`} className="text-xs tabular-nums text-slate-500 hover:text-brand-700 hover:underline">
                          {r.mobile}
                        </a>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-nowrap gap-1">
                          {r.overdue.map((o) => (
                            <span key={o.name} className="badge badge-rose whitespace-nowrap" title={`${o.name}: ${inr(o.outstanding)} due since ${day(o.due)}`}>
                              {o.name.replace(/^Quarter\s*/i, "Q")} · {o.daysLate}d
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right font-bold tabular-nums text-slate-900">{inr(r.dueNow)}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-marigold-700">{r.fine ? inr(r.fine) : "—"}</td>
                      <td className="hidden whitespace-nowrap px-3 py-2.5 text-[13px] xl:table-cell">{r.lastPaid ? <span className="text-slate-600">{day(r.lastPaid)}</span> : <span className="font-semibold text-rose-600">Never</span>}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right">
                        <div className="inline-flex gap-1">
                          {wa ? (
                            <a href={wa} target="_blank" rel="noreferrer" title="Send reminder on WhatsApp" aria-label={`WhatsApp reminder to ${r.name}'s parent`} className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700">
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          ) : (
                            <span className="p-2 text-slate-200" title="No valid mobile number">
                              <MessageCircle className="h-4 w-4" />
                            </span>
                          )}
                          <Link href={`/fees/collect?student=${r.studentId}`} title="Collect fee" aria-label={`Collect fee from ${r.name}`} className="rounded-lg p-2 text-slate-400 hover:bg-brand-50 hover:text-brand-700">
                            <IndianRupee className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-[13px] text-slate-500">
              <span>
                {shown.length > 300 ? `Showing 300 of ${shown.length.toLocaleString("en-IN")}. Filter by class to see the rest.` : `${shown.length.toLocaleString("en-IN")} students`}
              </span>
              <span className="tabular-nums">
                Total <b className="text-slate-900">{inr(shown.reduce((a, r) => a + r.dueNow, 0))}</b> + fine {inr(shown.reduce((a, r) => a + r.fine, 0))}
              </span>
            </div>
          </div>
        )}
      </section>

      {picked.length > 0 && (
        <div className="fixed inset-x-0 bottom-5 z-30 flex justify-center px-4 md:pl-[272px]">
          <div className="flex w-full max-w-2xl flex-wrap items-center gap-3 rounded-2xl bg-night-900 px-4 py-3 text-sm text-white shadow-2xl ring-1 ring-white/5 animate-scaleUp">
            <span className="flex h-7 min-w-[28px] items-center justify-center rounded-lg bg-marigold-400 px-2 text-[13px] font-bold text-night-950">{picked.length}</span>
            <span className="text-night-300">
              selected · <b className="text-white">{inr(picked.reduce((a, r) => a + r.dueNow, 0))}</b> due
            </span>
            <span className="ml-auto flex gap-2">
              <button type="button" onClick={() => exportExcel(picked)} className="btn btn-sm bg-white/10 text-white hover:bg-white/20">
                <Download className="h-3.5 w-3.5" />
                Excel
              </button>
              <button type="button" onClick={() => setRemindOpen(true)} className="btn btn-sm bg-marigold-400 font-bold text-night-950 hover:bg-marigold-300">
                <Send className="h-3.5 w-3.5" />
                Send reminders
              </button>
              <button type="button" onClick={() => setSelected(new Set())} className="rounded-md p-1.5 text-night-400 hover:text-white" aria-label="Clear selection">
                <X className="h-4 w-4" />
              </button>
            </span>
          </div>
        </div>
      )}

      <ReminderModal isOpen={remindOpen} onClose={() => setRemindOpen(false)} students={picked} school={school} />
    </div>
  );
}

function Figure({ label, value, note, dot }: { label: string; value: string; note: string; dot: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-5">
      <span className="flex items-center gap-2 text-[13px] font-semibold text-slate-600">
        <i className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
        <span className="truncate">{label}</span>
      </span>
      <span className="mt-1.5 block text-[26px] font-bold leading-none tracking-tight tabular-nums text-slate-900">{value}</span>
      <span className="mt-2 block text-[13px] text-slate-500">{note}</span>
    </div>
  );
}

function ClassTable({ rows, onPick }: { rows: { cls: string; students: number; due: number; fine: number }[]; onPick: (c: string) => void }) {
  const max = Math.max(1, ...rows.map((r) => r.due));
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="table-head">
          <tr>
            <th className="px-5 py-2.5 text-left">Class</th>
            <th className="px-3 py-2.5 text-right">Students</th>
            <th className="w-[40%] px-3 py-2.5 text-left">
              <span className="sr-only">Share</span>
            </th>
            <th className="px-3 py-2.5 text-right">Due now</th>
            <th className="px-5 py-2.5 text-right">Fine</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.cls} onClick={() => onPick(r.cls)} className="group cursor-pointer">
              <td className="px-5 py-2.5 font-semibold text-slate-900 group-hover:text-brand-700">{r.cls}</td>
              <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{r.students}</td>
              <td className="px-3 py-2.5">
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-rose-500" style={{ width: `${(r.due / max) * 100}%` }} />
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold tabular-nums text-slate-900">{inr(r.due)}</td>
              <td className="whitespace-nowrap px-5 py-2.5 text-right tabular-nums text-marigold-700">{inr(r.fine)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Box({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={`flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border-[1.5px] ${on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white hover:border-slate-400"}`}
    >
      {on && <Check className="h-3 w-3" strokeWidth={3.5} />}
    </button>
  );
}

/**
 * Reminders today go through WhatsApp on the office phone (wa.me links: free, no setup),
 * one tap per parent. Bulk SMS needs DLT registration + an SMS provider (a later step).
 */
function ReminderModal({ isOpen, onClose, students, school }: { isOpen: boolean; onClose: () => void; students: StudentDues[]; school: string }) {
  const [lang, setLang] = useState<ReminderLang>("hi");
  const [tpl, setTpl] = useState(DEFAULT_TEMPLATES.hi);
  const [opened, setOpened] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen) return;
    setOpened(new Set());
    try {
      const saved = JSON.parse(localStorage.getItem(TPL_KEY) || "null");
      if (saved?.lang && saved?.tpl) {
        setLang(saved.lang);
        setTpl(saved.tpl);
      }
    } catch {
      /* private window: keep the default */
    }
  }, [isOpen]);

  const remember = (l: ReminderLang, t: string) => {
    try {
      localStorage.setItem(TPL_KEY, JSON.stringify({ lang: l, tpl: t }));
    } catch {
      /* ignore */
    }
  };
  const switchLang = (l: ReminderLang) => {
    setLang(l);
    setTpl(DEFAULT_TEMPLATES[l]);
    remember(l, DEFAULT_TEMPLATES[l]);
  };

  const first = students[0];
  const noPhone = students.filter((s) => !whatsappLink(s.mobile, "x")).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Remind ${students.length} parent${students.length === 1 ? "" : "s"}`} maxWidth="max-w-2xl">
      <div className="space-y-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {(
              [
                ["hi", "हिंदी"],
                ["en", "English"],
              ] as [ReminderLang, string][]
            ).map(([k, l]) => (
              <button key={k} type="button" onClick={() => switchLang(k)} className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold ${lang === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                {l}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => switchLang(lang)} className="text-[13px] font-semibold text-brand-700 hover:underline">
            Reset message
          </button>
        </div>
        <label className="block">
          <span className="field-label">Message</span>
          <textarea
            value={tpl}
            onChange={(e) => {
              setTpl(e.target.value);
              remember(lang, e.target.value);
            }}
            rows={4}
            className="field w-full"
          />
          <span className="mt-1 block text-xs text-slate-500">Filled in for each student: {"{name} {class} {due} {fine} {total} {quarters} {fine_line} {school}"}</span>
        </label>
        {first && (
          <div className="rounded-xl bg-emerald-50 p-3 text-[13px] leading-relaxed text-emerald-950 ring-1 ring-emerald-100">
            <div className="mb-1 text-xs font-semibold text-emerald-800">Preview for {first.name}</div>
            {fillTemplate(tpl, first, school, lang)}
          </div>
        )}

        <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200">
          <ul className="divide-y divide-slate-100">
            {students.map((s) => {
              const link = whatsappLink(s.mobile, fillTemplate(tpl, s, school, lang));
              const done = opened.has(s.studentId);
              return (
                <li key={s.studentId} className="flex items-center gap-3 px-3 py-2">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-slate-900">{s.name}</span>
                    <span className="block text-xs text-slate-500">
                      {s.classSec} · {s.mobile || "no mobile"} · {inr(s.dueNow)}
                    </span>
                  </span>
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setOpened((p) => new Set(p).add(s.studentId))}
                      className={`btn btn-sm ${done ? "btn-secondary" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : <MessageCircle className="h-3.5 w-3.5" />}
                      {done ? "Opened" : "WhatsApp"}
                    </a>
                  ) : (
                    <span className="text-xs text-rose-600">Mobile not valid</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <p className="flex gap-2 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-marigold-600" />
          <span>
            Each button opens WhatsApp on this computer or phone with the message typed in; press send there. Send a few at a time, spread over the day, so WhatsApp does not flag the number.
            {noPhone ? ` ${noPhone} parent${noPhone > 1 ? "s have" : " has"} no valid mobile.` : ""} Bulk SMS will be added once the school is registered on DLT.
          </span>
        </p>
        <div className="flex justify-end border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Done ({opened.size} of {students.length} opened)
          </button>
        </div>
      </div>
    </Modal>
  );
}
