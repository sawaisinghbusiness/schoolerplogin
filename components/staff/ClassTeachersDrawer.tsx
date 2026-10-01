"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { ClassItem } from "@/lib/services/classService";
import { StaffMember, staffService } from "@/lib/services/staffService";

/** Every section with a teacher picker: assign or change class teachers in one go. */
export function ClassTeachersDrawer({ isOpen, onClose, classes, staff, onSaved }: {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  staff: StaffMember[];
  onSaved: (changed: number) => void;
}) {
  const teachers = useMemo(() => staff.filter((s) => s.staffType === "teaching" && s.status !== "Relieved").sort((a, b) => a.name.localeCompare(b.name)), [staff]);
  const [pick, setPick] = useState<Record<string, string>>({}); // classSec -> staff id
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const p: Record<string, string> = {};
    for (const t of teachers) if (t.classTeacherOf) p[t.classTeacherOf] = t.id;
    setPick(p);
    setError(null);
  }, [isOpen, teachers]);

  const sections = classes.flatMap((c) => c.sections.map((s) => ({ cls: c.name, classSec: `${c.name} - ${s.name}`, name: s.name })));
  const assigned = Object.values(pick).filter(Boolean).length;
  // Which sections each teacher is picked for (a teacher can only be class teacher of one).
  const doubles = useMemo(() => {
    const seen: Record<string, string[]> = {};
    for (const cs of Object.keys(pick)) if (pick[cs]) (seen[pick[cs]] ||= []).push(cs);
    return Object.keys(seen).filter((id) => seen[id].length > 1).map((id) => ({ id, secs: seen[id] }));
  }, [pick]);

  const save = async () => {
    if (doubles.length) {
      const t = teachers.find((x) => x.id === doubles[0].id);
      return setError(`${t?.name} is picked for ${doubles[0].secs.join(" and ")}. A teacher can be class teacher of one section.`);
    }
    const target: Record<string, string | null> = {};
    for (const t of teachers) target[t.id] = null;
    for (const cs of Object.keys(pick)) if (pick[cs]) target[pick[cs]] = cs;
    const changes = teachers.filter((t) => (t.classTeacherOf || null) !== target[t.id]);
    if (!changes.length) return onClose();
    setBusy(true);
    setError(null);
    // Clear first, then assign, so a section never ends up with two class teachers mid-way.
    const ordered = changes.slice().sort((a, b) => Number(!!target[a.id]) - Number(!!target[b.id]));
    for (const t of ordered) {
      const r = await staffService.setAssignments(t.id, target[t.id], t.subjects);
      if (r.error) {
        setBusy(false);
        return setError(`${t.name}: ${r.error}`);
      }
    }
    setBusy(false);
    onSaved(changes.length);
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      busy={busy}
      width="max-w-[560px]"
      title="Class teachers"
      subtitle={`${assigned} of ${sections.length} sections have one`}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary ml-auto">Cancel</button>
          <button type="button" onClick={save} disabled={busy || !teachers.length} className="btn btn-primary">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Save class teachers
          </button>
        </>
      }
    >
      <div className="space-y-4 p-4 sm:p-5">
        {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100">{error}</p>}
        {!teachers.length ? (
          <p className="card p-6 text-center text-sm text-slate-600">Add teaching staff first, then make them class teachers here.</p>
        ) : (
          <ul className="card divide-y divide-slate-100 overflow-hidden">
            {sections.map((s) => {
              const id = pick[s.classSec] || "";
              const clash = doubles.some((d) => d.id === id);
              return (
                <li key={s.classSec} className="flex items-center gap-3 px-4 py-2">
                  <span className="w-32 shrink-0 text-sm font-semibold text-slate-900">{s.classSec}</span>
                  <select
                    value={id}
                    onChange={(e) => setPick((p) => ({ ...p, [s.classSec]: e.target.value }))}
                    aria-label={`Class teacher of ${s.classSec}`}
                    className={`field field-sm min-w-0 flex-1 ${clash ? "border-rose-400 text-rose-700" : id ? "" : "text-slate-500"}`}
                  >
                    <option value="">No class teacher</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} · {t.designation}
                      </option>
                    ))}
                  </select>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SideDrawer>
  );
}
