"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, Loader2, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { classService, ClassItem } from "@/lib/services/classService";
import { toast } from "@/components/ui/Toaster";
import { Modal } from "@/components/ui/modal";
import { AddClassModal, AddClassPrefill } from "@/components/settings/classes/AddClassModal";
import { AddSectionModal } from "@/components/settings/classes/AddSectionModal";
import { SectionDrawer } from "@/components/settings/classes/SectionDrawer";
import { ConfirmModal, WINGS, WithTip, plural } from "@/components/settings/classes/shared";

type Counts = Record<string, number>;

/** Sections that have students but are not set up (e.g. stream sections of 11th). */
interface Stray {
  cls: string;
  section: string;
  students: number;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [setupNotice, setSetupNotice] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [addPrefill, setAddPrefill] = useState<AddClassPrefill | null>(null);
  const [addSection, setAddSection] = useState<{ classId: string; names: string[] | null } | null>(null);
  const [renaming, setRenaming] = useState<ClassItem | null>(null);
  const [deleting, setDeleting] = useState<ClassItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [open, setOpen] = useState<{ classId: string; sectionId: string } | null>(null);
  const [moving, setMoving] = useState<string | null>(null);

  const loadClasses = useCallback(async () => {
    const res = await classService.fetchClasses();
    if (res.error) {
      setLoadError(res.error);
      return;
    }
    setLoadError(null);
    setClasses(res.data);
  }, []);

  const loadCounts = useCallback(async () => {
    const res = await classService.studentCounts();
    setCounts(res.error ? {} : res.data);
  }, []);

  const reload = useCallback(async () => {
    await Promise.all([loadClasses(), loadCounts()]);
  }, [loadClasses, loadCounts]);

  useEffect(() => {
    reload();
  }, [reload]);

  const secCount = (cls: string, sec: string) => counts?.[`${cls}|${sec}`] || 0;
  const classCount = (cls: string) => Object.keys(counts || {}).reduce((t, k) => (k.split("|")[0] === cls ? t + (counts as Counts)[k] : t), 0);

  const groups = useMemo(() => {
    const list = classes || [];
    const out = WINGS.map((w) => ({ wing: w, classes: list.filter((c) => c.wing === w) }));
    const other = list.filter((c) => !c.wing || !WINGS.includes(c.wing));
    if (other.length) out.push({ wing: "Other", classes: other });
    return out.filter((g) => g.classes.length);
  }, [classes]);

  /** Student sections with no matching class/section set up here. */
  const strays = useMemo(() => {
    if (!classes || !counts) return [] as Stray[];
    return Object.keys(counts)
      .map((k) => ({ cls: k.split("|")[0], section: k.split("|").slice(1).join("|"), students: counts[k] }))
      .filter((s) => s.students > 0 && !classes.some((c) => c.name === s.cls && c.sections.some((x) => x.name === s.section)));
  }, [classes, counts]);
  const missingClasses = useMemo(() => {
    const names = Array.from(new Set(strays.map((s) => s.cls))).filter((n) => !(classes || []).some((c) => c.name === n));
    return names.map((n) => ({ name: n, sections: strays.filter((s) => s.cls === n) }));
  }, [strays, classes]);

  const totals = useMemo(() => {
    const list = classes || [];
    return {
      classes: list.length,
      sections: list.reduce((t, c) => t + c.sections.length, 0),
      students: Object.keys(counts || {}).reduce((t, k) => t + (counts as Counts)[k], 0),
    };
  }, [classes, counts]);

  /** Swap a class with its neighbour inside the same wing, then save the new order. */
  const move = async (c: ClassItem, dir: -1 | 1) => {
    if (!classes) return;
    const group = groups.find((g) => g.classes.some((x) => x.id === c.id));
    if (!group) return;
    const i = group.classes.findIndex((x) => x.id === c.id);
    const other = group.classes[i + dir];
    if (!other) return;
    const list = classes.slice();
    const a = list.findIndex((x) => x.id === c.id);
    const b = list.findIndex((x) => x.id === other.id);
    list[a] = other;
    list[b] = c;
    const next = list.map((x, idx) => ({ ...x, orderSeq: idx + 1 }));
    const changed = next.filter((x) => x.orderSeq !== classes.find((y) => y.id === x.id)?.orderSeq).map((x) => ({ id: x.id, orderSeq: x.orderSeq as number }));
    const before = classes;
    setClasses(next);
    setMoving(c.id);
    const res = await classService.reorderClasses(changed);
    setMoving(null);
    if (!res.success) {
      setClasses(before);
      toast(res.error || "Could not save the new order.", "error");
    }
  };

  const removeClass = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    const res = await classService.deleteClass(deleting.id);
    setDeleteBusy(false);
    if (!res.success) return toast(res.error || "Could not delete the class.", "error");
    toast(`Class ${deleting.name} deleted.`, "success");
    setDeleting(null);
    await reload();
  };

  const openAdd = (prefill: AddClassPrefill | null) => {
    setAddPrefill(prefill);
    setAddOpen(true);
  };

  const drawerClass = open ? (classes || []).find((c) => c.id === open.classId) || null : null;
  const drawerSection = drawerClass?.sections.find((s) => s.id === open?.sectionId) || null;
  const addSectionClass = addSection ? (classes || []).find((c) => c.id === addSection.classId) || null : null;

  return (
    <div className="space-y-5 pb-16">
      <header className="page-header">
        <div>
          <h1 className="page-title">Classes &amp; subjects</h1>
          <p className="page-subtitle">
            {classes ? (
              <>
                {plural(totals.classes, "class", "classes")} · {plural(totals.sections, "section")}
                {counts ? ` · ${plural(totals.students, "student")}` : ""}
                <span className="hidden sm:inline">. Click a section to rename it or set its subjects.</span>
              </>
            ) : (
              "Classes, their sections and the subjects each section studies"
            )}
          </p>
        </div>
        <button type="button" onClick={() => openAdd(null)} disabled={!classes} className="btn btn-primary shrink-0">
          <Plus className="h-4 w-4" />
          Add class
        </button>
      </header>

      {setupNotice && (
        <div className="alert alert-amber">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{setupNotice} Everything else on this page still works.</span>
        </div>
      )}

      {loadError && !classes ? (
        <div className="card px-5 py-12 text-center">
          <p className="text-sm font-semibold text-slate-900">Could not load classes</p>
          <p className="mt-1 text-[13px] text-slate-500">{loadError}</p>
          <button type="button" onClick={() => { setLoadError(null); reload(); }} className="btn btn-secondary btn-sm mt-4">
            <RotateCcw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      ) : !classes ? (
        <div className="card space-y-3 p-5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="skeleton h-10 w-full" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="card px-5 py-14 text-center">
          <p className="text-sm font-semibold text-slate-900">No classes yet</p>
          <p className="mt-1 text-[13px] text-slate-500">Add your first class with its sections. Subjects can be added now or later.</p>
          <button type="button" onClick={() => openAdd(null)} className="btn btn-primary btn-sm mt-4">
            <Plus className="h-3.5 w-3.5" />
            Add class
          </button>
        </div>
      ) : (
        <section className="card overflow-hidden">
          {groups.map((g, gi) => {
            const wingStudents = g.classes.reduce((t, c) => t + classCount(c.name), 0);
            return (
              <div key={g.wing}>
                <div className={`table-head flex items-baseline justify-between gap-3 border-b border-slate-200 px-5 py-2 ${gi ? "border-t" : ""}`}>
                  <span className="text-slate-700">{g.wing}</span>
                  <span className="font-normal tabular-nums">
                    {plural(g.classes.length, "class", "classes")}
                    {counts ? ` · ${plural(wingStudents, "student")}` : ""}
                  </span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {g.classes.map((c, i) => (
                    <ClassRow
                      key={c.id}
                      cls={c}
                      counts={counts}
                      students={classCount(c.name)}
                      secCount={secCount}
                      strays={strays.filter((s) => s.cls === c.name)}
                      first={i === 0}
                      last={i === g.classes.length - 1}
                      moving={moving === c.id}
                      onMove={(d) => move(c, d)}
                      onOpenSection={(sectionId) => setOpen({ classId: c.id, sectionId })}
                      onAddSection={(names) => setAddSection({ classId: c.id, names })}
                      onRename={() => setRenaming(c)}
                      onDelete={() => setDeleting(c)}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      )}

      {classes && missingClasses.length > 0 && (
        <div className="alert alert-slate items-center">
          <AlertTriangle className="h-4 w-4 shrink-0 text-marigold-600" />
          <span className="min-w-0 flex-1 text-[13px]">
            {missingClasses.map((m, i) => (
              <React.Fragment key={m.name}>
                {i > 0 && "; "}
                <b className="text-slate-900">{m.name}</b> has {plural(m.sections.reduce((t, s) => t + s.students, 0), "student")} ({m.sections.map((s) => s.section).join(", ")})
              </React.Fragment>
            ))}{" "}
            but {missingClasses.length === 1 ? "is" : "are"} not set up here yet.
          </span>
          {missingClasses.slice(0, 2).map((m) => (
            <button key={m.name} type="button" onClick={() => openAdd({ name: m.name, sections: m.sections.map((s) => s.section) })} className="btn btn-secondary btn-sm shrink-0">
              <Plus className="h-3.5 w-3.5" />
              Set up {m.name}
            </button>
          ))}
        </div>
      )}

      <AddClassModal
        isOpen={addOpen}
        prefill={addPrefill}
        existing={(classes || []).map((c) => c.name)}
        onClose={() => setAddOpen(false)}
        onCreated={async () => {
          setAddOpen(false);
          await reload();
        }}
      />

      <AddSectionModal
        cls={addSectionClass}
        prefill={addSection?.names || null}
        onClose={() => setAddSection(null)}
        onAdded={async () => {
          setAddSection(null);
          await reload();
        }}
      />

      <RenameClassModal cls={renaming} students={renaming ? classCount(renaming.name) : 0} taken={(classes || []).map((c) => c.name)} onClose={() => setRenaming(null)} onDone={reload} />

      <ConfirmModal isOpen={!!deleting} title={`Delete class ${deleting?.name || ""}?`} confirmLabel="Delete class" danger busy={deleteBusy} onConfirm={removeClass} onClose={() => setDeleting(null)}>
        <p>
          {deleting?.sections.length
            ? `${deleting.name} and its ${plural(deleting.sections.length, "section")} (${deleting.sections.map((s) => s.name).join(", ")}) are removed, with their subject lists.`
            : `${deleting?.name} has no sections and is removed.`}{" "}
          This cannot be undone.
        </p>
      </ConfirmModal>

      <SectionDrawer
        cls={drawerClass}
        section={drawerSection}
        students={drawerClass && drawerSection ? secCount(drawerClass.name, drawerSection.name) : 0}
        setupNotice={setupNotice}
        onSetupNotice={setSetupNotice}
        onClose={() => setOpen(null)}
        onChanged={reload}
      />
    </div>
  );
}

/* ───────────────────────────── Class row ───────────────────────────── */

function ClassRow({
  cls,
  counts,
  students,
  secCount,
  strays,
  first,
  last,
  moving,
  onMove,
  onOpenSection,
  onAddSection,
  onRename,
  onDelete,
}: {
  cls: ClassItem;
  counts: Counts | null;
  students: number;
  secCount: (cls: string, sec: string) => number;
  strays: Stray[];
  first: boolean;
  last: boolean;
  moving: boolean;
  onMove: (dir: -1 | 1) => void;
  onOpenSection: (id: string) => void;
  onAddSection: (names: string[] | null) => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const subjects = Array.from(new Set(cls.sections.reduce<string[]>((all, s) => all.concat(s.subjects), [])));
  const iconBtn = "rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 disabled:pointer-events-none disabled:opacity-30";

  return (
    <li className="flex flex-wrap items-start gap-x-3 gap-y-2 px-4 py-3 hover:bg-slate-50/50 sm:flex-nowrap sm:px-5">
      <div className="order-1 min-w-0 flex-1 pt-1 sm:w-[108px] sm:flex-none sm:shrink-0">
        <div className="truncate text-sm font-semibold text-slate-900" title={cls.name}>
          {cls.name}
        </div>
        <div className="text-xs text-slate-500">
          {counts ? plural(students, "student") : " "}
        </div>
      </div>

      <div className="order-3 w-full min-w-0 sm:order-2 sm:w-auto sm:flex-1">
        <div className="flex flex-wrap gap-1.5">
          {cls.sections.map((s) => {
            const n = secCount(cls.name, s.name);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onOpenSection(s.id)}
                title={`${cls.name} - ${s.name}: ${plural(n, "student")}, ${s.subjects.length ? plural(s.subjects.length, "subject") : "no subjects yet"}. Click to edit.`}
                className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[13px] shadow-2xs transition hover:border-brand-400 hover:bg-brand-50/60"
              >
                <span className="truncate font-semibold text-slate-800">{s.name}</span>
                {counts && <span className="tabular-nums text-slate-500">{n}</span>}
              </button>
            );
          })}
          {strays.map((s) => (
            <button
              key={s.section}
              type="button"
              onClick={() => onAddSection([s.section])}
              title={`${plural(s.students, "student")} ${s.students === 1 ? "is" : "are"} in ${cls.name} - ${s.section}, but the section is not set up. Click to add it.`}
              className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-dashed border-marigold-300 bg-marigold-50/60 px-2.5 py-1 text-[13px] text-marigold-900 hover:border-marigold-400"
            >
              <span className="truncate font-semibold">{s.section}</span>
              <span className="tabular-nums opacity-70">{s.students}</span>
            </button>
          ))}
          <button type="button" onClick={() => onAddSection(null)} className="inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-2.5 py-1 text-[13px] font-medium text-slate-500 hover:border-brand-400 hover:text-brand-700">
            <Plus className="h-3.5 w-3.5" />
            Section
          </button>
        </div>
        {!cls.sections.length ? (
          <p className="mt-1.5 text-xs text-slate-500">{strays.length ? "No sections set up yet. The dashed ones already have students: click one to add it." : "No sections yet."}</p>
        ) : (
          subjects.length > 0 && (
            <p className="mt-1.5 truncate text-xs text-slate-500" title={subjects.join(", ")}>
              {subjects.join(" · ")}
            </p>
          )
        )}
      </div>

      <div className="order-2 flex shrink-0 items-center gap-0.5 sm:order-3">
        {moving ? (
          <Loader2 className="mx-1.5 h-4 w-4 animate-spin text-slate-400" />
        ) : (
          <>
            <button type="button" onClick={() => onMove(-1)} disabled={first} className={iconBtn} title="Move up" aria-label={`Move ${cls.name} up`}>
              <ArrowUp className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => onMove(1)} disabled={last} className={iconBtn} title="Move down" aria-label={`Move ${cls.name} down`}>
              <ArrowDown className="h-4 w-4" />
            </button>
          </>
        )}
        <span className="mx-1 h-4 w-px bg-slate-200" />
        <button type="button" onClick={onRename} className={iconBtn} title="Rename class" aria-label={`Rename ${cls.name}`}>
          <Pencil className="h-4 w-4" />
        </button>
        <WithTip tip={students ? `${plural(students, "student")} ${students === 1 ? "is" : "are"} in ${cls.name}. Move them before deleting.` : undefined}>
          <button type="button" onClick={onDelete} disabled={!!students || !counts} className={`${iconBtn} hover:bg-rose-50 hover:text-rose-600`} title={students ? undefined : "Delete class"} aria-label={`Delete ${cls.name}`}>
            <Trash2 className="h-4 w-4" />
          </button>
        </WithTip>
      </div>
    </li>
  );
}

/* ───────────────────────────── Rename class ───────────────────────────── */

function RenameClassModal({ cls, students, taken, onClose, onDone }: { cls: ClassItem | null; students: number; taken: string[]; onClose: () => void; onDone: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => setName(cls?.name || ""), [cls]);

  const next = name.trim();
  const clash = !!cls && next.toLowerCase() !== cls.name.toLowerCase() && taken.some((t) => t.toLowerCase() === next.toLowerCase());
  const changed = !!cls && !!next && next !== cls.name;

  const save = async () => {
    if (!cls || !changed || clash) return;
    setBusy(true);
    const res = await classService.updateClass(cls.id, next);
    if (res.success) await onDone();
    setBusy(false);
    if (!res.success) return toast(res.error || "Could not rename the class.", "error");
    toast(`${cls.name} renamed to ${next}.`, "success");
    onClose();
  };

  return (
    <Modal isOpen={!!cls} onClose={() => !busy && onClose()} title={`Rename ${cls?.name || ""}`} maxWidth="max-w-md">
      <div className="space-y-4 text-sm text-slate-600">
        <label className="block">
          <span className="field-label">New name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && save()} maxLength={50} className={`field field-sm w-full ${clash ? "border-rose-300" : ""}`} autoFocus />
        </label>
        {clash ? (
          <p className="text-[13px] text-rose-700">A class named {next} already exists.</p>
        ) : students > 0 ? (
          <p className="rounded-lg bg-slate-50 p-3 text-[13px]">
            Renaming moves all <b className="text-slate-900">{plural(students, "student")}</b> of {cls?.name}
            {cls?.sections.length ? ` (${cls.sections.map((s) => `${cls.name} - ${s.name}`).join(", ")})` : ""} to the new name. Their records, attendance and fees stay the same.
          </p>
        ) : (
          <p className="text-[13px]">No students are in {cls?.name} yet.</p>
        )}
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button type="button" onClick={save} disabled={busy || !changed || clash} className="btn btn-primary btn-sm">
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Rename class
          </button>
        </div>
      </div>
    </Modal>
  );
}
