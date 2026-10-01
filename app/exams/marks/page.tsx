"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, Lock, RefreshCw, Search } from "lucide-react";
import { Exam, SectionProgress, examService } from "@/lib/services/examService";
import { MarkSheetDrawer } from "@/components/exams/MarkSheetDrawer";

/** Remembers the chosen exam in the address, so a refresh keeps it. */
const examFromUrl = () => (typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("exam") || "");

export default function MarksEntryPage() {
  const [exams, setExams] = useState<Exam[] | null>(null);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [examId, setExamId] = useState("");
  const [sections, setSections] = useState<SectionProgress[] | null>(null);
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<{ examId: string; section: string; subject: string } | null>(null);

  const loadExams = useCallback(async () => {
    const r = await examService.list();
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
          <p className="page-subtitle">Pick a section and subject, then type the marks down the list</p>
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

      {setupNeeded || (exams && exams.length === 0) ? (
        <div className="card p-8 text-center">
          <ClipboardCheck className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">{setupNeeded ? "Exams need a one-time database setup" : "No exam has been set up yet"}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            {setupNeeded ? "Run sms backend/supabase/migrations/20261001_exams.sql in the Supabase SQL editor." : "Add this session's exams first, with the subjects for each class."}
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
        <section className="card overflow-hidden" aria-label="Marks entered">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-slate-200/80 p-3 sm:px-5">
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
            <ul className="divide-y divide-slate-100">
              {shown.map((s) => (
                <li key={s.classSec} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="w-32 shrink-0">
                    <p className="font-semibold text-slate-900">{s.classSec}</p>
                    <p className="text-xs tabular-nums text-slate-500">{s.students} students</p>
                  </div>
                  {s.subjects.length === 0 ? (
                    <span className="text-[13px] text-marigold-800">No subjects set</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {s.subjects.map((sub) => {
                        const full = s.students > 0 && sub.entered >= s.students;
                        const some = sub.entered > 0 && !full;
                        return (
                          <button
                            key={sub.name}
                            type="button"
                            onClick={() => setOpen({ examId, section: s.classSec, subject: sub.name })}
                            className={`group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold ring-1 transition hover:shadow-sm ${
                              full ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : some ? "bg-marigold-50 text-marigold-900 ring-marigold-200" : "bg-white text-slate-700 ring-slate-200 hover:ring-slate-300"
                            }`}
                          >
                            {sub.name}
                            <span className={`tabular-nums text-[12px] font-medium ${full ? "text-emerald-600" : some ? "text-marigold-700" : "text-slate-400"}`}>
                              {sub.entered}/{s.students}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </li>
              ))}
            </ul>
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
