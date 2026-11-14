"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, Lock, RefreshCw, Search } from "lucide-react";
import { Exam, SectionProgress, examService } from "@/lib/services/examService";
import { MarkSheetDrawer } from "@/components/exams/MarkSheetDrawer";

/** Remembers the chosen exam in the address, so a refresh keeps it. */
const examFromUrl = () => (typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("exam") || "");

export default function MarksEntryPage() {
  const [error, setError] = useState<string | null>(null);
  const [exams, setExams] = useState<Exam[] | null>(null);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [examId, setExamId] = useState("");
  const [sections, setSections] = useState<SectionProgress[] | null>(null);
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<{ examId: string; section: string; subject: string } | null>(null);

  const loadExams = useCallback(async () => {
    setError(null);
    const r = await examService.list();
    if (r.error) { setError(r.error); return; }
    setSetupNeeded(r.setupNeeded);
    setExams(r.data);
    const wanted = examFromUrl();
    const pick = r.data.find((e) => e.id === wanted) || r.data.find((e) => !e.locked) || r.data[0];
    if (pick) setExamId(pick.id);
  }, []);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  const loadGrid = useCallback(async (id: string) => {
    setLoadingGrid(true);
    const r = await examService.progress(id);
    setLoadingGrid(false);
    if (r.error) { setError(r.error); return; }
    setError(null);
    setSections(r.data?.sections || []);
  }, []);

  useEffect(() => {
    if (!examId) return;
    setSections(null);
    loadGrid(examId);
    window.history.replaceState(null, "", `/exams/marks?exam=${examId}`);
  }, [examId, loadGrid]);

  const exam = (exams || []).find((e) => e.id === examId) || null;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (sections || []).filter((s) => !q || s.classSec.toLowerCase().includes(q) || s.subjects.some((x) => x.name.toLowerCase().includes(q)));
  }, [sections, query]);

  const totals = useMemo(() => {
    let need = 0;
    let done = 0;
    for (const s of sections || []) for (const sub of s.subjects) {
      need += s.students;
      done += Math.min(sub.entered, s.students);
    }
    return { need, done, pct: need ? Math.round((done / need) * 100) : 0 };
  }, [sections]);

  const noSubjects = (sections || []).filter((s) => !s.subjects.length).length;

  return (
    <div className="space-y-5 pb-12">
      <header className="page-header">
        <div>
          <h1 className="page-title">Marks entry</h1>
          <p className="page-subtitle">Choose an exam, then open the class and subject register you need to complete</p>
        </div>
        {exams && exams.length > 0 && (
          <select value={examId} onChange={(e) => setExamId(e.target.value)} aria-label="Exam" className="field min-w-[14rem]">
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}{e.locked ? " (locked)" : ""} · out of {e.max}
              </option>
            ))}
          </select>
        )}
      </header>

      {error ? <div role="alert" className="alert alert-rose"><span className="flex-1">Could not load marks entry: {error}</span><button type="button" className="btn btn-secondary btn-sm" onClick={() => examId ? loadGrid(examId) : loadExams()}>Try again</button></div> : setupNeeded || (exams && exams.length === 0) ? (
        <div className="card p-8 text-center">
          <ClipboardCheck className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">{setupNeeded ? "Exams need a one-time database setup" : "No exam has been set up yet"}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            {setupNeeded ? "Ask your school administrator to enable exams, then check again." : "Add this session's exams first, with the subjects for each class."}
          </p>
          {setupNeeded ? (
            <button type="button" onClick={loadExams} className="btn btn-secondary btn-sm mt-4">
              <RefreshCw className="h-4 w-4" />
              Check again
            </button>
          ) : (
            <Link href="/exams/setup" className="btn btn-primary btn-sm mt-4">Go to exam setup</Link>
          )}
        </div>
      ) : (
        <section className="card workspace-section overflow-hidden" aria-label="Marks entered">
          <div className="workspace-toolbar flex flex-wrap items-center gap-x-5 gap-y-2 border-x-0 border-t-0 p-3 sm:px-5">
            {exam?.locked && (
              <span className="badge badge-slate"><Lock className="h-3 w-3" />Locked — marks can be viewed, not changed</span>
            )}
            <span className="text-[13px] text-slate-600">
              <b className="tabular-nums text-slate-900">{totals.pct}%</b> entered
              <span className="text-slate-400"> · {totals.done.toLocaleString("en-IN")} of {totals.need.toLocaleString("en-IN")} marks</span>
            </span>
            {noSubjects > 0 && (
              <Link href="/exams/setup" className="text-[13px] font-semibold text-marigold-800 hover:underline">
                {noSubjects} {noSubjects === 1 ? "section has" : "sections have"} no subjects — set them →
              </Link>
            )}
            <div className="relative ml-auto w-full sm:w-60">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Class or subject" aria-label="Find a class or subject" className="field field-sm w-full pl-9" />
            </div>
          </div>

          {sections === null || loadingGrid && !sections.length ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-12 w-full" />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <p className="px-6 py-14 text-center text-sm text-slate-500">{query ? "Nothing matches." : "No sections sit this exam."}</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="divide-y divide-slate-200 sm:hidden">{shown.map(s => <section key={s.classSec} className="p-4"><h3 className="text-sm font-semibold">{s.classSec}<span className="ml-2 text-xs font-normal text-slate-500">{s.students} students</span></h3>{s.subjects.length === 0 ? <Link href="/exams/setup" className="mt-3 block text-sm text-brand-700">Set up subjects</Link> : s.subjects.map(sub => <div key={sub.name} className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0"><div className="min-w-0"><p className="text-sm font-medium">{sub.name}</p><p className="mt-1 text-xs text-slate-500">{sub.entered} / {s.students} marks entered</p></div><button type="button" onClick={() => setOpen({examId,section:s.classSec,subject:sub.name})} className="btn btn-secondary btn-sm shrink-0">{exam?.locked ? 'View marks' : 'Enter marks'}</button></div>)}</section>)}</div>
              <table className="register-table hidden w-full min-w-[620px] text-sm sm:table">
                <caption className="sr-only">Marks entry by class, section and subject</caption>
                <thead className="table-head"><tr><th className="px-5 py-3 text-left">Class / section</th><th className="px-4 py-3 text-left">Subject</th><th className="px-4 py-3 text-right">Marks entered</th><th className="px-4 py-3 text-left">Status</th><th className="px-5 py-3 text-right">Register</th></tr></thead>
                {shown.map(s => <tbody key={s.classSec} className="divide-y divide-slate-100 border-b border-slate-200 last:border-b-0">
                  {s.subjects.length === 0 ? <tr><td className="px-5 py-4 font-semibold text-slate-900">{s.classSec}</td><td colSpan={4} className="px-4 py-4"><Link href="/exams/setup" className="text-brand-700 hover:underline">Set up subjects for this section</Link></td></tr> : s.subjects.map((sub,i) => {
                    const full = s.students > 0 && sub.entered >= s.students;
                    return <tr key={sub.name} className="hover:bg-slate-50/70">
                      {i === 0 && <td rowSpan={s.subjects.length} className="w-40 px-5 py-4 align-top"><p className="font-semibold text-slate-900">{s.classSec}</p><p className="mt-1 text-xs tabular-nums text-slate-500">{s.students} students</p></td>}
                      <td className="px-4 py-3 font-medium text-slate-800">{sub.name}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-700">{sub.entered} <span className="text-slate-400">/ {s.students}</span></td>
                      <td className="px-4 py-3"><span className={full ? 'badge badge-emerald' : 'text-xs text-slate-500'}>{full ? 'Complete' : sub.entered > 0 ? 'In progress' : 'Not started'}</span></td>
                      <td className="px-5 py-3 text-right"><button type="button" onClick={() => setOpen({ examId, section: s.classSec, subject: sub.name })} className="btn btn-secondary btn-sm">{exam?.locked ? 'View marks' : full ? 'Review marks' : 'Enter marks'}</button></td>
                    </tr>;
                  })}
                </tbody>)}
              </table>
            </div>
          )}
        </section>
      )}

      <MarkSheetDrawer
        target={open}
        onClose={() => setOpen(null)}
        onSaved={(section, subject, entered) =>
          setSections((prev) => (prev || []).map((s) => (s.classSec === section ? { ...s, subjects: s.subjects.map((x) => (x.name === subject ? { ...x, entered } : x)) } : s)))
        }
      />
    </div>
  );
}
