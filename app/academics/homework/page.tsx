"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { NotebookPen, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { ConfirmModal } from "@/components/settings/classes/shared";
import { HomeworkDrawer } from "@/components/homework/HomeworkDrawer";
import { HwClass, Homework, PostOption, homeworkService } from "@/lib/services/homeworkService";

const todayStr = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const dayLabel = (iso: string) => {
  const t = todayStr();
  const y = new Date(Date.parse(t) - 864e5).toISOString().slice(0, 10);
  if (iso === t) return "Today";
  if (iso === y) return "Yesterday";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
};
const dueLabel = (iso: string) => (iso === todayStr() ? "Due today" : "Due " + new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }));

export default function HomeworkPage() {
  const [classes, setClasses] = useState<HwClass[] | null>(null);
  const [options, setOptions] = useState<PostOption[]>([]);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [subject, setSubject] = useState("");
  const [items, setItems] = useState<Homework[] | null>(null);
  const [drawer, setDrawer] = useState<{ item: Homework | null } | null>(null);
  const [deleting, setDeleting] = useState<Homework | null>(null);
  const [delBusy, setDelBusy] = useState(false);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [role, setRole] = useState("");

  const loadOptions = useCallback(async () => {
    const r = await homeworkService.options();
    if (r.error) toast(r.error, "error");
    setSetupNeeded(r.setupNeeded);
    setOptions(r.options);
    setClasses(r.classes);
    return r;
  }, []);

  useEffect(() => {
    try {
      setRole(localStorage.getItem("schooldesk_user_role") || "");
    } catch {
      /* display only */
    }
    loadOptions().then((r) => {
      // Start on the first class the viewer can post for (a teacher's own), else the first class.
      const mine = r.options[0];
      const cls = (mine && r.classes.find((c) => c.sections.some((s) => s.id === mine.sectionId))) || r.classes[0];
      setClassId(cls?.id || "");
      setSectionId(mine?.sectionId || cls?.sections[0]?.id || "");
    });
  }, [loadOptions]);

  const cls = classes?.find((c) => c.id === classId);
  const section = cls?.sections.find((s) => s.id === sectionId);

  const load = useCallback(async () => {
    if (!sectionId) return;
    setItems(null);
    const r = await homeworkService.list(sectionId, subject);
    if (r.error) toast(r.error, "error");
    setItems(r.data);
  }, [sectionId, subject]);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => setSubject(""), [sectionId]);

  const groups = useMemo(() => {
    const m = new Map<string, Homework[]>();
    for (const h of items || []) m.set(h.assignedOn, [...(m.get(h.assignedOn) || []), h]);
    return Array.from(m.entries());
  }, [items]);

  const remove = async () => {
    if (!deleting) return;
    setDelBusy(true);
    const r = await homeworkService.remove(deleting.id);
    setDelBusy(false);
    setDeleting(null);
    if (!r.success) return toast(r.error || "Could not delete.", "error");
    toast("Homework deleted.", "success");
    load();
  };

  if (setupNeeded) {
    return (
      <div className="card mx-auto mt-6 max-w-lg p-8 text-center">
        <NotebookPen className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-3 font-semibold text-slate-900">Homework needs a one-time database setup</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Run sms backend/supabase/migrations/20261003_homework.sql in the Supabase SQL editor.</p>
        <button type="button" onClick={loadOptions} className="btn btn-secondary btn-sm mt-4">
          <RefreshCw className="h-4 w-4" />
          Check again
        </button>
      </div>
    );
  }

  const canPost = options.length > 0;

  return (
    <div className="space-y-5 pb-12">
      <header className="page-header">
        <h1 className="page-title">Homework</h1>
        {canPost && (
          <button type="button" onClick={() => setDrawer({ item: null })} className="btn btn-primary">
            <Plus className="h-4 w-4" />
            New homework
          </button>
        )}
      </header>

      {classes && classes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setSectionId(classes.find((c) => c.id === e.target.value)?.sections[0]?.id || "");
            }}
            aria-label="Class"
            className="field field-sm w-36"
          >
            {classes.map((c) => (
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
          <select value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Subject" className="field field-sm w-40">
            <option value="">All subjects</option>
            {(section?.subjects || []).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      {role === "teacher" && classes && !canPost && (
        <div className="card p-4 text-sm text-slate-700">Your classes are not set up yet. Ask the admin to give you your subjects under Staff, then you can post homework here.</div>
      )}

      {classes === null || items === null ? (
        <div className="card space-y-3 p-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-16 w-full" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="card px-6 py-14 text-center text-sm text-slate-600">No classes yet. Add them under Settings, Classes.</div>
      ) : groups.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <NotebookPen className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-800">No homework for {section ? `${cls?.name} - ${section.name}` : "this class"}{subject ? ` in ${subject}` : ""}</p>
          {canPost && (
            <button type="button" onClick={() => setDrawer({ item: null })} className="btn btn-primary btn-sm mt-4">
              <Plus className="h-4 w-4" />
              Post the first one
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map(([day, list]) => (
            <section key={day} aria-label={dayLabel(day)}>
              <h2 className="mb-2 px-1 text-[13px] font-semibold text-slate-600">{dayLabel(day)}</h2>
              <ul className="card divide-y divide-slate-100 overflow-hidden">
                {list.map((h) => {
                  const long = h.details.length > 160 || h.details.split("\n").length > 3;
                  const expanded = open.has(h.id);
                  return (
                    <li key={h.id} className="px-4 py-3.5 sm:px-5">
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="badge badge-brand">{h.subject}</span>
                            {h.dueDate && <span className="text-xs font-medium text-slate-600">{dueLabel(h.dueDate)}</span>}
                          </div>
                          <p className="mt-1.5 text-[15px] font-semibold text-slate-900">{h.title}</p>
                          {h.details && <p className={`mt-1 whitespace-pre-wrap text-sm text-slate-700 ${expanded ? "" : "line-clamp-3"}`}>{h.details}</p>}
                          {long && (
                            <button type="button" onClick={() => setOpen((s) => { const n = new Set(s); n.has(h.id) ? n.delete(h.id) : n.add(h.id); return n; })} className="mt-1 text-[13px] font-semibold text-brand-700 hover:underline">
                              {expanded ? "Show less" : "Read more"}
                            </button>
                          )}
                          {h.by && <p className="mt-1.5 text-xs text-slate-500">{h.by}</p>}
                        </div>
                        {h.canEdit && (
                          <span className="flex shrink-0">
                            <button type="button" onClick={() => setDrawer({ item: h })} aria-label={`Change ${h.title}`} className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => setDeleting(h)} aria-label={`Delete ${h.title}`} className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-rose-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <HomeworkDrawer
        open={!!drawer}
        options={options}
        sectionId={sectionId}
        editing={drawer?.item || null}
        onClose={() => setDrawer(null)}
        onSaved={() => {
          setDrawer(null);
          toast(drawer?.item ? "Homework saved." : "Homework posted.", "success");
          load();
        }}
      />
      <ConfirmModal isOpen={!!deleting} title="Delete this homework?" confirmLabel="Delete" danger busy={delBusy} onConfirm={remove} onClose={() => setDeleting(null)}>
        {deleting?.title}
      </ConfirmModal>
    </div>
  );
}
