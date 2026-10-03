"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { ClassItem, classService } from "@/lib/services/classService";
import { ChipInput, SubjectSuggestions, cleanSubject } from "@/components/settings/classes/shared";

/** Subjects for one class: the same list for every section, or one list per section (e.g. 11th streams). */
export function SubjectsDrawer({ cls, onClose, onSaved }: { cls: ClassItem | null; onClose: () => void; onSaved: () => void }) {
  const [same, setSame] = useState(true);
  const [all, setAll] = useState<string[]>([]);
  const [per, setPer] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cls) return;
    const lists = cls.sections.map((s) => s.subjects);
    const identical = lists.every((l) => JSON.stringify(l) === JSON.stringify(lists[0] || []));
    // Stream sections (longer names) usually differ, so start them separately.
    setSame(identical && !cls.sections.some((s) => s.name.length > 2));
    setAll(lists.find((l) => l.length) || []);
    const p: Record<string, string[]> = {};
    for (const s of cls.sections) p[s.id] = s.subjects;
    setPer(p);
    setError(null);
  }, [cls]);

  const save = async () => {
    if (!cls) return;
    const lists = cls.sections.map((s) => ({ id: s.id, subjects: same ? all : per[s.id] || [] }));
    if (lists.some((l) => !l.subjects.length)) return setError("Every section needs at least one subject.");
    setBusy(true);
    setError(null);
    for (const l of lists) {
      const r = await classService.updateSectionSubjects(l.id, l.subjects);
      if (r.error) {
        setBusy(false);
        return setError(r.error);
      }
    }
    setBusy(false);
    onSaved();
  };

  return (
    <SideDrawer
      isOpen={!!cls}
      onClose={onClose}
      busy={busy}
      width="max-w-[560px]"
      title={cls ? `Subjects of ${cls.name}` : "Subjects"}
      subtitle="Marks are entered and printed for these subjects"
      footer={
        <>
          <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary ml-auto">Cancel</button>
          <button type="button" onClick={save} disabled={busy} className="btn btn-primary">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Save subjects
          </button>
        </>
      }
    >
      {cls && (
        <div className="space-y-4 p-5">
          {error && <p role="alert" className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-800 ring-1 ring-rose-300">{error}</p>}
          {cls.sections.length > 1 && (
            <label className="card flex cursor-pointer items-center gap-3 p-4">
              <input type="checkbox" checked={same} onChange={(e) => setSame(e.target.checked)} className="h-4 w-4 accent-brand-600" />
              <span>
                <span className="block text-sm font-semibold text-slate-900">Same subjects in every section</span>
                <span className="block text-xs text-slate-500">Untick when sections differ, like Science and Commerce.</span>
              </span>
            </label>
          )}
          {same ? (
            <section className="card p-4">
              <h3 className="mb-3 text-sm font-bold text-slate-900">{cls.sections.length > 1 ? `Sections ${cls.sections.map((s) => s.name).join(", ")}` : `Section ${cls.sections[0]?.name || ""}`}</h3>
              <ChipInput values={all} onChange={setAll} clean={cleanSubject} placeholder="Type a subject and press Enter" label="Subjects" />
              <SubjectSuggestions values={all} onAdd={(s) => setAll((v) => [...v, s])} />
            </section>
          ) : (
            cls.sections.map((s) => (
              <section key={s.id} className="card p-4">
                <h3 className="mb-3 text-sm font-bold text-slate-900">Section {s.name}</h3>
                <ChipInput values={per[s.id] || []} onChange={(v) => setPer((p) => ({ ...p, [s.id]: v }))} clean={cleanSubject} placeholder="Type a subject and press Enter" label={`Subjects of ${s.name}`} />
                <SubjectSuggestions values={per[s.id] || []} onAdd={(x) => setPer((p) => ({ ...p, [s.id]: [...(p[s.id] || []), x] }))} limit={8} />
              </section>
            ))
          )}
        </div>
      )}
    </SideDrawer>
  );
}
