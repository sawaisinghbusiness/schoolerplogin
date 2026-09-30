"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { toast } from "@/components/ui/Toaster";
import { classService, ClassItem, SectionItem, SUBJECTS_SETUP_MESSAGE } from "@/lib/services/classService";
import { ChipInput, ConfirmModal, SubjectSuggestions, WithTip, cleanSection, cleanSubject, plural } from "./shared";

const same = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

/** Rename a section, edit its subjects, or delete it. */
export function SectionDrawer({
  cls,
  section,
  students,
  setupNotice,
  onSetupNotice,
  onClose,
  onChanged,
}: {
  cls: ClassItem | null;
  section: SectionItem | null;
  students: number;
  setupNotice: string | null;
  onSetupNotice: (msg: string) => void;
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [allSections, setAllSections] = useState(false);
  const [confirm, setConfirm] = useState<"rename" | "delete" | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setName(section?.name || "");
  }, [section?.id, section?.name]);
  useEffect(() => {
    setSubjects(section ? section.subjects.slice() : []);
    setAllSections(false);
    setConfirm(null);
  }, [section?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!cls || !section) return <SideDrawer isOpen={false} onClose={onClose} title="">{null}</SideDrawer>;

  const label = `${cls.name} - ${section.name}`;
  const newName = cleanSection(name);
  const renamed = !!newName && newName !== section.name;
  const clash = renamed && cls.sections.some((s) => s.id !== section.id && s.name.toLowerCase() === newName.toLowerCase());
  const others = cls.sections.filter((s) => s.id !== section.id);
  const dirty = !same(subjects, section.subjects) || (allSections && others.some((s) => !same(s.subjects, subjects)));

  const rename = async () => {
    setBusy(true);
    const res = await classService.renameSection(section.id, newName);
    if (res.success) await onChanged();
    setBusy(false);
    setConfirm(null);
    if (!res.success) return toast(res.error || "Could not rename the section.", "error");
    toast(`${label} renamed to ${cls.name} - ${newName}.`, "success");
  };

  const saveSubjects = async () => {
    setBusy(true);
    const targets = allSections ? [section].concat(others) : [section];
    let failed = "";
    let setup = "";
    for (const t of targets) {
      const res = await classService.updateSectionSubjects(t.id, subjects);
      if (!res.success) {
        if (res.needsSetup) setup = res.error || SUBJECTS_SETUP_MESSAGE;
        else failed = res.error || "Could not save the subjects.";
        break;
      }
    }
    if (!setup) await onChanged();
    setBusy(false);
    if (setup) return onSetupNotice(setup);
    if (failed) return toast(failed, "error");
    toast(allSections ? `Subjects saved for all ${targets.length} sections of ${cls.name}.` : `Subjects saved for ${label}.`, "success");
  };

  const remove = async () => {
    setBusy(true);
    const res = await classService.deleteSection(section.id);
    setBusy(false);
    setConfirm(null);
    if (!res.success) return toast(res.error || "Could not delete the section.", "error");
    toast(`Section ${label} deleted.`, "success");
    onClose();
    await onChanged();
  };

  return (
    <>
      <SideDrawer
        isOpen
        onClose={onClose}
        busy={busy || !!confirm}
        title={label}
        subtitle={`${plural(students, "student")} · ${section.subjects.length ? plural(section.subjects.length, "subject") : "no subjects yet"}`}
        width="max-w-[480px]"
        footer={
          <>
            <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary btn-sm">
              Close
            </button>
            <button type="button" onClick={saveSubjects} disabled={busy || !dirty || !!setupNotice} className="btn btn-primary btn-sm ml-auto">
              {busy && !confirm && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save subjects
            </button>
          </>
        }
      >
        <div className="space-y-4 p-5">
          <section className="card p-4">
            <label htmlFor="section-name" className="field-label">
              Section name
            </label>
            <div className="flex gap-2">
              <input
                id="section-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && renamed && !clash && setConfirm("rename")}
                maxLength={30}
                className={`field field-sm min-w-0 flex-1 ${clash ? "border-rose-300" : ""}`}
              />
              <button type="button" onClick={() => setConfirm("rename")} disabled={!renamed || clash || busy} className="btn btn-secondary btn-sm shrink-0">
                Rename
              </button>
            </div>
            <p className={`mt-1.5 text-xs ${clash ? "text-rose-700" : "text-slate-500"}`}>
              {clash ? `${cls.name} already has section ${newName}.` : students ? `Its ${plural(students, "student")} move to the new name.` : "No students in this section yet."}
            </p>
          </section>

          <section className="card p-4">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <h3 className="text-[13px] font-semibold text-slate-700">Subjects</h3>
              <span className="text-xs text-slate-500">{subjects.length ? plural(subjects.length, "subject") : "None yet"}</span>
            </div>
            {setupNotice ? (
              <div className="alert alert-amber mb-3 text-[13px]">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{setupNotice}</span>
              </div>
            ) : null}
            <ChipInput values={subjects} onChange={setSubjects} clean={cleanSubject} placeholder="Type a subject and press Enter" label="Subject" />
            <SubjectSuggestions values={subjects} onAdd={(s) => setSubjects(subjects.concat(s))} limit={10} />
            {others.length > 0 && (
              <label className="mt-3 flex cursor-pointer items-center gap-2 border-t border-slate-100 pt-3 text-[13px] text-slate-700">
                <input type="checkbox" checked={allSections} onChange={(e) => setAllSections(e.target.checked)} className="rounded" />
                Use the same subjects for {others.length === 1 ? `${cls.name} - ${others[0].name}` : `all sections of ${cls.name} (${others.map((s) => s.name).join(", ")})`}
              </label>
            )}
          </section>

          <section className="card flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-[13px] font-semibold text-slate-700">Delete section</h3>
              <p className="text-xs text-slate-500">{students ? `${plural(students, "student")} ${students === 1 ? "is" : "are"} in ${label}. Move them from Promote & transfer first.` : "Removes the section. This cannot be undone."}</p>
            </div>
            <WithTip tip={students ? `${label} has ${plural(students, "student")}` : undefined}>
              <button type="button" onClick={() => setConfirm("delete")} disabled={!!students || busy} className="btn btn-sm border border-rose-200 bg-white text-rose-700 hover:bg-rose-50">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </WithTip>
          </section>
        </div>
      </SideDrawer>

      <ConfirmModal isOpen={confirm === "rename"} title={`Rename ${label}?`} confirmLabel="Rename section" busy={busy} onConfirm={rename} onClose={() => setConfirm(null)}>
        <p>
          {label} becomes <b className="text-slate-900">{cls.name} - {newName}</b>.
        </p>
        {students > 0 ? (
          <p className="rounded-lg bg-slate-50 p-3">
            Renaming moves all <b className="text-slate-900">{plural(students, "student")}</b> of {label} to the new name. Their records, attendance and fees stay the same.
          </p>
        ) : (
          <p>No students are in this section yet.</p>
        )}
      </ConfirmModal>

      <ConfirmModal isOpen={confirm === "delete"} title={`Delete ${label}?`} confirmLabel="Delete section" danger busy={busy} onConfirm={remove} onClose={() => setConfirm(null)}>
        <p>
          Section {section.name} and its subject list are removed from {cls.name}. This cannot be undone.
        </p>
      </ConfirmModal>
    </>
  );
}
