"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/Toaster";
import { classService, ClassItem } from "@/lib/services/classService";
import { ChipInput, SubjectSuggestions, cleanSection, cleanSubject, plural } from "./shared";

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

/** Adds one or more sections to an existing class. New sections start with the class's current subjects. */
export function AddSectionModal({
  cls,
  prefill,
  onClose,
  onAdded,
}: {
  cls: ClassItem | null;
  prefill: string[] | null;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [names, setNames] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const have = new Set((cls?.sections || []).map((s) => s.name.toLowerCase()));
  const nextLetters = LETTERS.filter((l) => !have.has(l.toLowerCase())).slice(0, 4);
  const from = cls?.sections.find((s) => s.subjects.length);

  useEffect(() => {
    if (!cls) return;
    setNames(prefill?.length ? prefill : nextLetters.slice(0, 1));
    setSubjects(from ? from.subjects.slice() : []);
  }, [cls?.id, prefill]); // eslint-disable-line react-hooks/exhaustive-deps

  const dupes = names.filter((n) => have.has(n.toLowerCase()));

  const save = async () => {
    if (!cls) return;
    if (!names.length) return toast("Enter at least one section name.", "error");
    if (dupes.length) return toast(`${cls.name} already has section ${dupes.join(", ")}.`, "error");
    setSaving(true);
    const res = await classService.addSections(cls.id, names, subjects);
    setSaving(false);
    if (!res.success) return toast(res.error || "Could not add the section.", "error");
    toast(`${plural(names.length, "section")} added to ${cls.name}.`, "success");
    onAdded();
  };

  return (
    <Modal isOpen={!!cls} onClose={() => !saving && onClose()} title={cls ? `Add section to ${cls.name}` : ""} subtitle={cls?.sections.length ? `Now: ${cls.sections.map((s) => s.name).join(", ")}` : "No sections yet"} maxWidth="max-w-lg">
      <div className="space-y-5 text-sm">
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-slate-700">New sections</span>
            {nextLetters.length > 0 && (
              <div className="flex gap-1" role="group" aria-label="Quick sections">
                {nextLetters.map((s) => {
                  const on = names.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setNames(on ? names.filter((x) => x !== s) : names.concat(s))}
                      className={`h-7 w-8 rounded-md border text-[13px] font-semibold transition ${on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <ChipInput values={names} onChange={setNames} clean={cleanSection} max={20} maxLength={30} placeholder="Or type a name, e.g. Science-Bio" label="Section name" chipClass="bg-brand-50 text-brand-800" />
          {dupes.length > 0 && <p className="mt-1.5 text-[13px] text-rose-700">Already in {cls?.name}: {dupes.join(", ")}</p>}
        </div>

        <div>
          <span className="field-label">
            Subjects{" "}
            <span className="font-normal text-slate-500">{from ? `(copied from ${cls?.name} - ${from.name}, change if needed)` : "(optional)"}</span>
          </span>
          <ChipInput values={subjects} onChange={setSubjects} clean={cleanSubject} placeholder="Type a subject and press Enter" label="Subject" />
          <SubjectSuggestions values={subjects} onAdd={(s) => setSubjects(subjects.concat(s))} limit={8} />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} disabled={saving} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button type="button" onClick={save} disabled={saving || !names.length || dupes.length > 0} className="btn btn-primary btn-sm">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saving ? "Adding…" : names.length > 1 ? `Add ${names.length} sections` : "Add section"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
