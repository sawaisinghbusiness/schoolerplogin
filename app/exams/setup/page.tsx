"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ClipboardCheck, Lock, LockOpen, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { Exam, examService } from "@/lib/services/examService";
import { ClassItem, classService } from "@/lib/services/classService";
import { ExamDrawer } from "@/components/exams/ExamDrawer";
import { SubjectsDrawer } from "@/components/exams/SubjectsDrawer";
import { ConfirmModal } from "@/components/settings/classes/shared";

const day = (iso: string | null) => (iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "");
const dates = (e: Exam) => (!e.start_date ? "Dates not set" : e.end_date && e.end_date !== e.start_date ? `${day(e.start_date)} – ${day(e.end_date)}` : day(e.start_date));
const pattern = (e: Exam) => (e.components.length === 1 ? `Out of ${e.max}` : e.components.map((p) => `${p.max} ${p.name.toLowerCase()}`).join(" + "));

/** "Nursery … 12th" when the classes are a run of the class list, else a short list. */
function classRange(picked: string[], all: string[]) {
  if (!picked.length) return "—";
  if (picked.length === all.length) return "All classes";
  const idx = picked.map((c) => all.indexOf(c)).sort((a, b) => a - b);
  const run = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  if (run && picked.length > 2) return `${all[idx[0]]} to ${all[idx[idx.length - 1]]}`;
  return picked.join(", ");
}

/** "12th: Sec A, C Physics, Chemistry" for classes that sit only part of the exam. */
function scopeNote(e: Exam): string {
  return Object.entries(e.scope || {})
    .filter(([cls, v]) => e.classes.includes(cls) && (v.sections?.length || v.subjects?.length))
    .map(([cls, v]) => [cls + ":", v.sections?.length ? "Sec " + v.sections.join(", ") : "", v.subjects?.length ? v.subjects.join(", ") : ""].filter(Boolean).join(" "))
    .join(" · ");
}

function role(): string {
  try {
    return localStorage.getItem("schooldesk_user_role") || "";
  } catch {
    return "";
  }
}

export default function ExamSetupPage() {
  const [exams, setExams] = useState<Exam[] | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [drawer, setDrawer] = useState<{ exam: Exam | null } | null>(null);
  const [subjectsFor, setSubjectsFor] = useState<ClassItem | null>(null);
  const [deleting, setDeleting] = useState<Exam | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [me, setMe] = useState("");

  const loadClasses = useCallback(async () => {
    const r = await classService.fetchClasses();
    setClasses(r.data || []);
  }, []);

  const load = useCallback(async () => {
    setRefreshing(true);
    const [r] = await Promise.all([examService.list(), loadClasses()]);
    setRefreshing(false);
    setSetupNeeded(r.setupNeeded);
    if (r.error) toast(r.error, "error");
    setExams(r.data);
  }, [loadClasses]);

  useEffect(() => {
    load();
    setMe(role());
  }, [load]);

  const canEdit = me === "admin" || me === "exam_cell";
  const classNames = useMemo(() => classes.filter((c) => c.sections.length).map((c) => c.name), [classes]);
  const missingSubjects = classes.filter((c) => c.sections.some((s) => !s.subjects.length));

  const lock = async (e: Exam) => {
    const r = await examService.setLocked(e.id, !e.locked);
    if (r.error) return toast(r.error, "error");
    setExams((prev) => (prev || []).map((x) => (x.id === e.id ? { ...x, locked: !e.locked } : x)));
    toast(e.locked ? `${e.title} is open for marks again.` : `${e.title} is locked. Marks can no longer be changed.`, "success");
  };

  const remove = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    const r = await examService.remove(deleting.id);
    setDeleteBusy(false);
    if (r.error) return toast(r.error, "error");
    setExams((prev) => (prev || []).filter((x) => x.id !== deleting.id));
    setDeleting(null);
    toast("Exam deleted.", "success");
  };

  return (
    <div className="space-y-5 pb-12">
      <header className="page-header">
        <div>
          <h1 className="page-title">Exam setup</h1>
          <p className="page-subtitle">This session&apos;s exams, the marks for each, and the subjects every class is examined in</p>
        </div>
        {canEdit && !setupNeeded && (
          <button type="button" onClick={() => setDrawer({ exam: null })} className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Add exam
          </button>
        )}
      </header>

      {setupNeeded ? (
        <div className="card p-8 text-center">
          <ClipboardCheck className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">Exams need a one-time database setup</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Run sms backend/supabase/migrations/20261001_exams.sql in the Supabase SQL editor, then check again.</p>
          <button type="button" onClick={load} className="btn btn-secondary btn-sm mt-4">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Check again
          </button>
        </div>
      ) : (
        <section className="card overflow-hidden" aria-label="Exams">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-3.5">
            <h2 className="text-[15px] font-bold text-slate-900">Exams · 2026-27</h2>
            {exams && exams.length > 0 && (
              <Link href="/exams/marks" className="text-[13px] font-semibold text-brand-700 hover:underline">Enter marks →</Link>
            )}
          </div>
          {exams === null ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-11 w-full" />
              ))}
            </div>
          ) : exams.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <ClipboardCheck className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-800">No exam added yet</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Add the exams for this session — Periodic Test 1, Half Yearly, Periodic Test 2, Annual — then teachers can enter marks.</p>
              {canEdit && (
                <button type="button" onClick={() => setDrawer({ exam: null })} className="btn btn-primary btn-sm mt-4">
                  <Plus className="h-4 w-4" />
                  Add the first exam
                </button>
              )}
            </div>
          ) : (
            <>
            <ul className="divide-y divide-slate-100 sm:hidden">
              {exams.map((e) => (
                <li key={e.id} className="flex items-center">
                  <button type="button" onClick={() => canEdit && !e.locked && setDrawer({ exam: e })} className="m-row flex-1 active:bg-slate-50">
                    <span className="m-row-main">
                      <span className="m-row-title">{e.title}</span>
                      <span className="m-row-meta">{classRange(e.classes, classNames)}{scopeNote(e) ? ` (${scopeNote(e)})` : ""} · {dates(e)}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[13px] font-semibold tabular-nums text-slate-700">{pattern(e)}</span>
                      <span className={`mt-0.5 block text-xs ${e.locked ? "text-slate-500" : "text-emerald-700"}`}>{e.locked ? "Locked" : "Open for marks"}</span>
                    </span>
                  </button>
                  {canEdit && (
                    <button type="button" onClick={() => lock(e)} aria-label={e.locked ? `Unlock ${e.title}` : `Lock ${e.title}`} className="flex h-11 w-11 shrink-0 items-center justify-center text-slate-400 active:bg-slate-100">
                      {e.locked ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead className="table-head">
                  <tr>
                    <th className="px-5 py-3 text-left">Exam</th>
                    <th className="px-3 py-3 text-left">Classes</th>
                    <th className="px-3 py-3 text-left">Marks</th>
                    <th className="px-3 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-right"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {exams.map((e) => (
                    <tr key={e.id}>
                      <td className="px-5 py-3">
                        <span className="block font-semibold text-slate-900">{e.title}</span>
                        <span className="block text-xs text-slate-500">{dates(e)}</span>
                      </td>
                      <td className="max-w-[16rem] px-3 py-3 text-slate-700">
                        {classRange(e.classes, classNames)}
                        {scopeNote(e) && (
                          <span className="block truncate text-xs text-slate-500" title={scopeNote(e)}>
                            {scopeNote(e)}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 tabular-nums text-slate-700">{pattern(e)}</td>
                      <td className="px-3 py-3">
                        {e.locked ? <span className="badge badge-slate"><Lock className="h-3 w-3" />Locked</span> : <span className="badge badge-emerald">Open for marks</span>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right">
                        {canEdit && (
                          <>
                            <button type="button" onClick={() => lock(e)} title={e.locked ? "Unlock" : "Lock marks"} aria-label={e.locked ? `Unlock ${e.title}` : `Lock ${e.title}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800">
                              {e.locked ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                            </button>
                            {!e.locked && (
                              <button type="button" onClick={() => setDrawer({ exam: e })} title="Edit" aria-label={`Edit ${e.title}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800">
                                <Pencil className="h-4 w-4" />
                              </button>
                            )}
                            {me === "admin" && !e.locked && (
                              <button type="button" onClick={() => setDeleting(e)} title="Delete" aria-label={`Delete ${e.title}`} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </section>
      )}

      <section className="card overflow-hidden" aria-label="Subjects by class">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 px-5 py-3.5">
          <h2 className="mr-auto text-[15px] font-bold text-slate-900">Subjects by class</h2>
          {missingSubjects.length > 0 && (
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-marigold-800">
              <AlertTriangle className="h-4 w-4" />
              {missingSubjects.length} {missingSubjects.length === 1 ? "class has" : "classes have"} no subjects yet
            </span>
          )}
        </div>
        <ul className="divide-y divide-slate-100">
          {classes.filter((c) => c.sections.length).map((c) => {
            const lists = c.sections.map((s) => s.subjects);
            const same = lists.every((l) => JSON.stringify(l) === JSON.stringify(lists[0]));
            return (
              <li key={c.id} className="flex items-start gap-4 px-5 py-3">
                <span className="w-24 shrink-0 pt-0.5 font-semibold text-slate-900">{c.name}</span>
                <div className="min-w-0 flex-1 text-[13px]">
                  {same ? (
                    lists[0]?.length ? <span className="text-slate-700">{lists[0].join(", ")}</span> : <span className="text-marigold-800">Not set</span>
                  ) : (
                    c.sections.map((s) => (
                      <p key={s.id} className="text-slate-700">
                        <b className="font-semibold text-slate-500">{s.name}:</b> {s.subjects.length ? s.subjects.join(", ") : <span className="text-marigold-800">Not set</span>}
                      </p>
                    ))
                  )}
                </div>
                {me === "admin" && (
                  <button type="button" onClick={() => setSubjectsFor(c)} className="btn btn-secondary btn-sm shrink-0">
                    {lists.some((l) => l.length) ? "Change" : "Set subjects"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <ExamDrawer
        isOpen={!!drawer}
        exam={drawer?.exam || null}
        classes={classes.filter((c) => c.sections.length)}
        nextOrder={(exams || []).length}
        onClose={() => setDrawer(null)}
        onSaved={(saved) => {
          setExams((prev) => (prev?.some((x) => x.id === saved.id) ? prev.map((x) => (x.id === saved.id ? saved : x)) : [...(prev || []), saved]));
          setDrawer(null);
          toast(`${saved.title} saved.`, "success");
        }}
      />
      <SubjectsDrawer
        cls={subjectsFor}
        onClose={() => setSubjectsFor(null)}
        onSaved={() => {
          toast(`Subjects of ${subjectsFor?.name} saved.`, "success");
          setSubjectsFor(null);
          loadClasses();
        }}
      />
      <ConfirmModal isOpen={!!deleting} title={`Delete ${deleting?.title || "exam"}?`} confirmLabel="Delete exam" danger busy={deleteBusy} onConfirm={remove} onClose={() => setDeleting(null)}>
        All marks entered for this exam are deleted too. This cannot be undone.
      </ConfirmModal>
    </div>
  );
}
