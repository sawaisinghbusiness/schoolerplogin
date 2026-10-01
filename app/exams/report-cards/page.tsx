"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, FileText, Printer, RefreshCw } from "lucide-react";
import { examService, Exam, Report, ReportCard, SectionProgress } from "@/lib/services/examService";
import { useSchoolProfile } from "@/components/providers/SchoolProfileProvider";
import { SheetPreview } from "@/components/certificates/SheetPreview";
import { ReportCardDocument, ReportSchool } from "@/components/exams/report/ReportCardDocument";
import { PrintReportCards } from "@/components/exams/report/PrintReportCards";

const SETUP_FILE = "sms backend/supabase/migrations/20261001_exams.sql";

/** Reads ?exam=…&section=… without useSearchParams. */
function readQuery() {
  if (typeof window === "undefined") return { exam: "", section: "" };
  const q = new URLSearchParams(window.location.search);
  return { exam: q.get("exam") || "", section: q.get("section") || "" };
}

function writeQuery(exam: string, section: string) {
  const u = new URL(window.location.href);
  if (exam) u.searchParams.set("exam", exam);
  else u.searchParams.delete("exam");
  if (section) u.searchParams.set("section", section);
  else u.searchParams.delete("section");
  window.history.replaceState(null, "", u.pathname + u.search);
}

/** The latest exam that has already started, else the first one. */
function defaultExam(list: Exam[]) {
  const today = new Date().toISOString().slice(0, 10);
  const started = list.filter((e) => e.start_date && e.start_date <= today).sort((a, b) => (b.start_date || "").localeCompare(a.start_date || ""));
  return (started[0] || list[0])?.id || "";
}

function resultBadge(c: ReportCard) {
  if (!c.complete) return { cls: "badge-slate", text: "Incomplete" };
  if (c.result === "Passed") return { cls: "badge-emerald", text: "Passed" };
  return { cls: "badge-amber", text: "Needs improvement" };
}

export default function ReportCardsPage() {
  const { schoolProfile } = useSchoolProfile();
  const [exams, setExams] = useState<Exam[] | null>(null);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [examId, setExamId] = useState("");
  const [sections, setSections] = useState<SectionProgress[] | null>(null);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [section, setSection] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [selected, setSelected] = useState("");
  const [printing, setPrinting] = useState<ReportCard[] | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [checking, setChecking] = useState(false);

  const school: ReportSchool = {
    name: schoolProfile.school_name || "School",
    short: schoolProfile.short_name || "SPS",
    affiliationNo: schoolProfile.affiliation_no,
    schoolCode: schoolProfile.school_code,
    place: [schoolProfile.address, schoolProfile.city || "Barmer", schoolProfile.state || "Rajasthan"].filter(Boolean).join(", "),
    pincode: schoolProfile.pincode,
    phone: [schoolProfile.contact1, schoolProfile.contact2].filter(Boolean).join(", "),
    email: schoolProfile.email,
    logoUrl: schoolProfile.logo_url || undefined,
    principal: schoolProfile.principal_name || undefined,
  };

  // Exams
  const loadExams = async () => {
    setChecking(true);
    const r = await examService.list();
    setChecking(false);
    setSetupNeeded(r.setupNeeded);
    setListError(r.error || null);
    setExams(r.data);
    const q = readQuery();
    const id = r.data.some((e) => e.id === q.exam) ? q.exam : defaultExam(r.data);
    setExamId(id);
    if (id !== q.exam) setSection("");
    else setSection(q.section);
  };
  useEffect(() => {
    loadExams();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sections of the chosen exam
  useEffect(() => {
    if (!examId) return;
    let alive = true;
    setSections(null);
    setSectionError(null);
    examService.progress(examId).then((r) => {
      if (!alive) return;
      if (!r.data) return setSectionError(r.error || "Could not load the sections for this exam.");
      const list = r.data.sections;
      setSections(list);
      setSection((cur) => (list.some((s) => s.classSec === cur) ? cur : list.length === 1 ? list[0].classSec : ""));
    });
    return () => {
      alive = false;
    };
  }, [examId, reloadKey]);

  // Report for the chosen section
  const sectionReady = !!section && !!sections && sections.some((s) => s.classSec === section);
  useEffect(() => {
    if (examId && sections) writeQuery(examId, section);
    if (!examId || !sectionReady) {
      setReport(null);
      setReportError(null);
      return;
    }
    let alive = true;
    setReportLoading(true);
    setReportError(null);
    examService.report(examId, section).then((r) => {
      if (!alive) return;
      setReportLoading(false);
      if (!r.data) {
        setReport(null);
        return setReportError(r.error || "Could not load the report cards.");
      }
      setReport(r.data);
      setSelected((cur) => (r.data!.cards.some((c) => c.studentId === cur) ? cur : r.data!.cards[0]?.studentId || ""));
    });
    return () => {
      alive = false;
    };
  }, [examId, section, sectionReady, reloadKey]);

  const cards = report && report.classSec === section && report.exam.id === examId ? report.cards : null;
  const card = cards?.find((c) => c.studentId === selected) || null;
  const incomplete = useMemo(() => (cards || []).filter((c) => !c.complete).length, [cards]);
  const exam = exams?.find((e) => e.id === examId) || null;

  const pickExam = (id: string) => {
    setExamId(id);
    setSection("");
    setReport(null);
  };

  return (
    <div className="space-y-5 pb-12">
      <header className="page-header">
        <div>
          <h1 className="page-title">Report cards</h1>
          <p className="page-subtitle">Each student&apos;s card for an exam, ready to print on A4.</p>
        </div>
        {exams && exams.length > 0 && (
          <div className="flex shrink-0 flex-wrap gap-2">
            <select value={examId} onChange={(e) => pickExam(e.target.value)} aria-label="Exam" className="field field-sm w-52">
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
            <select value={section} onChange={(e) => setSection(e.target.value)} disabled={!sections} aria-label="Section" className="field field-sm w-44">
              <option value="">{sections ? (sections.length ? "Pick a section" : "No sections") : "Loading…"}</option>
              {(sections || []).map((s) => (
                <option key={s.classSec} value={s.classSec}>
                  {s.classSec} ({s.students})
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      {exams === null ? (
        <PageSkeleton />
      ) : setupNeeded ? (
        <div className="card p-8 text-center">
          <FileText className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">Exams need a one-time database setup</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Run <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[12px] text-slate-700">{SETUP_FILE}</code> in the Supabase SQL editor, then check again.
          </p>
          <button type="button" onClick={loadExams} className="btn btn-secondary btn-sm mt-4">
            <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
            Check again
          </button>
        </div>
      ) : listError ? (
        <div className="alert alert-rose items-center">
          <span className="flex-1">{listError}</span>
          <button type="button" onClick={loadExams} className="btn btn-secondary btn-sm">
            <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
            Try again
          </button>
        </div>
      ) : exams.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <FileText className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-800">No exam set up yet</p>
          <p className="mt-1 text-sm text-slate-500">Add an exam with its classes and parts first. Report cards come from the marks entered for it.</p>
          <Link href="/exams/setup" className="btn btn-primary btn-sm mt-4">
            Set up an exam
          </Link>
        </div>
      ) : sectionError ? (
        <div className="alert alert-rose items-center">
          <span className="flex-1">{sectionError}</span>
          <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="btn btn-secondary btn-sm">
            Try again
          </button>
        </div>
      ) : sections === null ? (
        <PageSkeleton />
      ) : sections.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <p className="font-semibold text-slate-800">No section sits {exam?.title || "this exam"}</p>
          <p className="mt-1 text-sm text-slate-500">Add classes to the exam in exam setup.</p>
          <Link href="/exams/setup" className="btn btn-secondary btn-sm mt-4">
            Open exam setup
          </Link>
        </div>
      ) : !section ? (
        <div className="card px-6 py-16 text-center">
          <FileText className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-800">Pick a section</p>
          <p className="mt-1 text-sm text-slate-500">{exam?.title} report cards are made one section at a time.</p>
          {sections && sections.length > 0 && (
            <div className="mx-auto mt-4 flex max-w-xl flex-wrap justify-center gap-2">
              {sections.map((s) => (
                <button key={s.classSec} type="button" onClick={() => setSection(s.classSec)} className="btn btn-secondary btn-sm">
                  {s.classSec}
                  <span className="tabular-nums text-slate-400">{s.students}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : reportError ? (
        <div className="alert alert-rose items-center">
          <span className="flex-1">{reportError}</span>
          <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="btn btn-secondary btn-sm">
            Try again
          </button>
        </div>
      ) : !cards || reportLoading ? (
        <PageSkeleton />
      ) : cards.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <p className="font-semibold text-slate-800">No students in {section}</p>
          <p className="mt-1 text-sm text-slate-500">Students admitted to this section will appear here.</p>
        </div>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Students */}
          <section className="card overflow-hidden" aria-label="Students">
            <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-2.5 text-[13px]">
              <span className="font-semibold text-slate-800">{section}</span>
              <span className="tabular-nums text-slate-500">
                {cards.length} students{incomplete ? ` · ${incomplete} incomplete` : ""}
              </span>
            </div>
            <ul className="max-h-[300px] divide-y divide-slate-100 overflow-y-auto lg:max-h-[calc(100vh-230px)]">
              {cards.map((c) => {
                const b = resultBadge(c);
                const on = c.studentId === selected;
                return (
                  <li key={c.studentId}>
                    <button
                      type="button"
                      onClick={() => setSelected(c.studentId)}
                      aria-current={on ? "true" : undefined}
                      className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors ${on ? "bg-brand-50" : "hover:bg-slate-50"}`}
                    >
                      <span className={`w-6 shrink-0 pt-px text-right text-[12px] tabular-nums ${on ? "font-semibold text-brand-700" : "text-slate-400"}`}>{c.rollNo || "–"}</span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-[13.5px] font-semibold ${on ? "text-brand-800" : "text-slate-900"}`}>{c.name}</span>
                        <span className="mt-0.5 flex items-center gap-2 text-[12px] text-slate-500">
                          {c.complete ? (
                            <span className="tabular-nums">
                              {c.percent.toFixed(1)}% · {c.grade}
                            </span>
                          ) : null}
                          <span className={`badge ${b.cls} px-2 py-0 text-[11px]`} title={c.result}>
                            {b.text}
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Card */}
          <section className="min-w-0 space-y-3" aria-label="Report card">
            <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
              <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                <p className="truncate text-[14px] font-semibold text-slate-900">{card ? card.name : "Pick a student"}</p>
                {card && <p className="truncate text-[12px] text-slate-500" title={card.result}>{card.result}</p>}
              </div>
              <button type="button" onClick={() => card && setPrinting([card])} disabled={!card || !!printing} className="btn btn-secondary btn-sm">
                <Printer className="h-4 w-4" />
                Print this card
              </button>
              <button type="button" onClick={() => setPrinting(cards)} disabled={!!printing} className="btn btn-primary btn-sm">
                <Printer className="h-4 w-4" />
                Print whole class ({cards.length})
              </button>
            </div>
            {incomplete > 0 && (
              <div className="alert alert-amber py-2.5 text-[13px]">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {incomplete === 1 ? "1 card is" : `${incomplete} cards are`} incomplete: some subjects have no marks yet, so they print with “—” and no grade or rank.{" "}
                  <Link href="/exams/marks" className="font-semibold underline underline-offset-2">
                    Enter marks
                  </Link>
                </span>
              </div>
            )}
            {card && exam && report && (
              <SheetPreview>
                <ReportCardDocument exam={report.exam} classSec={report.classSec} card={card} school={school} />
              </SheetPreview>
            )}
          </section>
        </div>
      )}

      {printing && report && (
        <PrintReportCards onDone={() => setPrinting(null)}>
          {printing.map((c) => (
            <ReportCardDocument key={c.studentId} exam={report.exam} classSec={report.classSec} card={c} school={school} />
          ))}
        </PrintReportCards>
      )}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="card space-y-3 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-9 w-full" />
        ))}
      </div>
      <div className="skeleton mx-auto aspect-[794/1123] w-full max-w-[794px]" />
    </div>
  );
}
