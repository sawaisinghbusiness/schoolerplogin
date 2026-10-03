"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, Plus, Printer, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { PrintSheet } from "@/components/certificates/SheetPreview";
import { useSchoolProfile } from "@/components/providers/SchoolProfileProvider";
import { Busy, DAYS, Entry, Overview, Period, TeacherEntry, timetableService } from "@/lib/services/timetableService";
import { CellModal } from "@/components/timetable/CellModal";
import { PeriodsDrawer } from "@/components/timetable/PeriodsDrawer";
import { TimetableDocument } from "@/components/timetable/TimetableDocument";

type Tab = "class" | "teacher";
const todayCol = () => {
  const d = new Date().getDay(); // 0 = Sunday
  return d >= 1 && d <= 6 ? d : 0;
};

export default function TimetablePage() {
  const { schoolProfile } = useSchoolProfile();
  const [ov, setOv] = useState<Overview | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("class");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [busy, setBusy] = useState<Busy[]>([]);
  const [tEntries, setTEntries] = useState<TeacherEntry[] | null>(null);
  const [cell, setCell] = useState<{ day: number; period: Period } | null>(null);
  const [periodsOpen, setPeriodsOpen] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadOverview = useCallback(async () => {
    const r = await timetableService.overview();
    if (!r.data) return setFailed(r.error || "Could not load the timetable.");
    setFailed(null);
    setOv(r.data);
    return r.data;
  }, []);

  useEffect(() => {
    try {
      setIsAdmin(localStorage.getItem("schooldesk_user_role") === "admin");
    } catch {
      /* display only */
    }
    loadOverview().then((d) => {
      if (!d || d.setupNeeded) return;
      const first = d.classes[0];
      setClassId(first?.id || "");
      setSectionId(first?.sections[0]?.id || "");
      // A teacher opens on their own week.
      if (d.me && d.teachers.some((t) => t.id === d.me)) {
        setTab("teacher");
        setTeacherId(d.me);
      } else setTeacherId(d.teachers.find((t) => t.teaching)?.id || "");
    });
  }, [loadOverview]);

  const cls = ov?.classes.find((c) => c.id === classId);
  const section = cls?.sections.find((s) => s.id === sectionId);
  const classSec = cls && section ? `${cls.name} - ${section.name}` : "";
  const teacherName = useCallback((id: string | null) => ov?.teachers.find((t) => t.id === id)?.name || "", [ov]);

  const loadSection = useCallback(async () => {
    if (!sectionId) return;
    const r = await timetableService.section(sectionId);
    if (r.error) toast(r.error, "error");
    setEntries(r.entries);
    setBusy(r.busy);
  }, [sectionId]);

  useEffect(() => {
    setEntries(null);
    if (tab === "class") loadSection();
  }, [tab, loadSection]);

  useEffect(() => {
    if (tab !== "teacher" || !teacherId) return;
    setTEntries(null);
    timetableService.teacher(teacherId).then((r) => {
      if (r.error) toast(r.error, "error");
      setTEntries(r.entries);
    });
  }, [tab, teacherId]);

  const periods = ov?.periods || [];
  const teachers = (ov?.teachers || []).filter((t) => t.teaching);
  const today = todayCol();
  const entryAt = (day: number, p: Period) => entries?.find((e) => e.day === day && e.periodId === p.id) || null;
  const tEntryAt = (day: number, p: Period) => tEntries?.find((e) => e.day === day && e.periodId === p.id) || null;
  const lessonCount = tEntries?.length ?? 0;

  if (failed || (ov && ov.setupNeeded)) {
    return (
      <div className="card mx-auto mt-6 max-w-lg p-8 text-center">
        <CalendarDays className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-3 font-semibold text-slate-900">{ov?.setupNeeded ? "Timetable needs a one-time database setup" : "Could not load the timetable"}</p>
        {ov?.setupNeeded && <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Run sms backend/supabase/migrations/20261003_timetable.sql in the Supabase SQL editor.</p>}
        <button type="button" onClick={loadOverview} className="btn btn-secondary btn-sm mt-4">
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-12">
      <header className="page-header">
        <h1 className="page-title">Timetable</h1>
        {ov && (
          <div className="flex justify-end gap-2">
            {tab === "class" && section && (
              <button type="button" onClick={() => setPrinting(true)} className="btn btn-secondary px-3 sm:px-4" aria-label="Print timetable">
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Print</span>
              </button>
            )}
            {isAdmin && (
              <button type="button" onClick={() => setPeriodsOpen(true)} className="btn btn-secondary px-3 sm:px-4" aria-label="Edit periods">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Periods</span>
              </button>
            )}
          </div>
        )}
      </header>

      {!ov ? (
        <div className="card skeleton h-96" />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="View">
              {(
                [
                  ["class", "Class"],
                  ["teacher", "Teacher"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={tab === k}
                  onClick={() => setTab(k)}
                  className={`rounded-lg px-4 py-1.5 text-[13px] font-semibold transition ${tab === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "class" ? (
              <>
                <select
                  value={classId}
                  onChange={(e) => {
                    setClassId(e.target.value);
                    setSectionId(ov.classes.find((c) => c.id === e.target.value)?.sections[0]?.id || "");
                  }}
                  aria-label="Class"
                  className="field field-sm w-36"
                >
                  {ov.classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select value={sectionId} onChange={(e) => setSectionId(e.target.value)} aria-label="Section" className="field field-sm w-32">
                  {(cls?.sections || []).map((s) => (
                    <option key={s.id} value={s.id}>
                      Section {s.name}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} aria-label="Teacher" className="field field-sm w-56 max-w-full">
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {tEntries && <span className="text-[13px] tabular-nums text-slate-600">{lessonCount} lessons a week</span>}
              </>
            )}
          </div>

          {tab === "teacher" && !teachers.length ? (
            <div className="card px-6 py-14 text-center text-sm text-slate-600">No teachers on the staff list yet.</div>
          ) : (
            <section className="card overflow-hidden" aria-label={tab === "class" ? `Timetable of ${classSec}` : "Teacher timetable"}>
              {(tab === "class" ? entries === null : tEntries === null) ? (
                <div className="space-y-3 p-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton h-14 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] border-separate border-spacing-0 text-sm">
                    <thead>
                      <tr>
                        <th className="sticky left-0 z-10 w-28 border-b border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-xs font-semibold text-slate-500">Period</th>
                        {DAYS.map((d, i) => (
                          <th key={d} className={`border-b border-slate-200 bg-slate-50 px-2 py-2.5 text-center text-xs font-semibold ${today === i + 1 ? "text-brand-700" : "text-slate-500"}`}>
                            {d}
                            {today === i + 1 && <span className="mx-auto mt-1 block h-0.5 w-6 rounded-full bg-brand-600" />}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {periods.map((p) => (
                        <tr key={p.id}>
                          <th scope="row" className="sticky left-0 z-10 whitespace-nowrap border-b border-slate-100 bg-white px-3 py-2 text-left align-middle">
                            <span className="block text-[13px] font-semibold text-slate-900">{p.label}</span>
                            {p.start && (
                              <span className="block text-xs font-normal tabular-nums text-slate-500">
                                {p.start}–{p.end}
                              </span>
                            )}
                          </th>
                          {p.isBreak ? (
                            <td colSpan={6} className="border-b border-slate-100 bg-slate-50/70 px-3 py-2 text-center text-xs font-medium text-slate-500">
                              {p.label}
                            </td>
                          ) : (
                            DAYS.map((_, i) => {
                              const day = i + 1;
                              const e = tab === "class" ? entryAt(day, p) : null;
                              const t = tab === "teacher" ? tEntryAt(day, p) : null;
                              const editable = tab === "class" && isAdmin;
                              const inner = e ? (
                                <>
                                  <span className="block truncate text-[13px] font-semibold text-slate-900">{e.subject}</span>
                                  {e.staffId && <span className="block truncate text-xs text-slate-500">{teacherName(e.staffId)}</span>}
                                </>
                              ) : t ? (
                                <>
                                  <span className="block truncate text-[13px] font-semibold text-slate-900">{t.classSec}</span>
                                  <span className="block truncate text-xs text-slate-500">{t.subject}</span>
                                </>
                              ) : editable ? (
                                <Plus className="mx-auto h-4 w-4 text-slate-300 group-hover:text-slate-500" />
                              ) : null;
                              return (
                                <td key={day} className={`border-b border-l border-slate-100 p-0 ${today === day ? "bg-brand-50/30" : ""}`}>
                                  {editable ? (
                                    <button type="button" onClick={() => setCell({ day, period: p })} aria-label={`${DAYS[i]} ${p.label}${e ? `: ${e.subject}` : ", empty"}`} className="group flex h-[60px] w-full flex-col justify-center px-2 text-left hover:bg-slate-50">
                                      {inner}
                                    </button>
                                  ) : (
                                    <div className="flex h-[60px] flex-col justify-center px-2">{inner}</div>
                                  )}
                                </td>
                              );
                            })
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </>
      )}

      <CellModal
        open={!!cell}
        sectionId={sectionId}
        classSec={classSec}
        subjects={section?.subjects || []}
        day={cell?.day || 1}
        period={cell?.period || null}
        entry={cell ? entryAt(cell.day, cell.period) : null}
        teachers={ov?.teachers || []}
        busy={busy}
        onClose={() => setCell(null)}
        onChanged={() => {
          setCell(null);
          loadSection();
        }}
      />
      <PeriodsDrawer
        open={periodsOpen}
        periods={periods}
        onClose={() => setPeriodsOpen(false)}
        onSaved={async () => {
          setPeriodsOpen(false);
          toast("Periods saved.", "success");
          await loadOverview();
          loadSection();
        }}
      />
      {printing && entries && (
        <PrintSheet onDone={() => setPrinting(false)}>
          <TimetableDocument school={schoolProfile.school_name || "School"} classSec={classSec} periods={periods} entries={entries} teacherName={teacherName} />
        </PrintSheet>
      )}
    </div>
  );
}
