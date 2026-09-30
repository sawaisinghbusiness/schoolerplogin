"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/Toaster";
import { classService } from "@/lib/services/classService";
import { ChipInput, SubjectSuggestions, WINGS, STANDARD_CLASSES, cleanSection, cleanSubject, guessWing, plural } from "./shared";

export interface AddClassPrefill {
  name?: string;
  sections?: string[];
}

const QUICK = ["A", "B", "C", "D"];

export function AddClassModal({
  isOpen,
  prefill,
  existing,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  prefill: AddClassPrefill | null;
  existing: string[];
  onClose: () => void;
  onCreated: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [wing, setWing] = useState("");
  const [wingTouched, setWingTouched] = useState(false);
  const [sections, setSections] = useState<string[]>(["A"]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const n = prefill?.name || "";
    setName(n);
    setWing(guessWing(n));
    setWingTouched(false);
    setSections(prefill?.sections?.length ? prefill.sections : ["A"]);
    setSubjects([]);
  }, [isOpen, prefill]);

  const taken = new Set(existing.map((e) => e.toLowerCase()));
  const missing = STANDARD_CLASSES.filter((c) => !taken.has(c.toLowerCase()));
  const clash = taken.has(name.trim().toLowerCase());

  const setClassName = (v: string) => {
    setName(v);
    if (!wingTouched) setWing(guessWing(v));
  };
  const toggle = (s: string) => setSections(sections.includes(s) ? sections.filter((x) => x !== s) : QUICK.filter((q) => q === s || sections.includes(q)).concat(sections.filter((x) => !QUICK.includes(x))));

  const save = async () => {
    const clean = name.trim();
    if (!clean) return toast("Enter the class name.", "error");
    if (clash) return toast(`Class ${clean} already exists. Add sections to it instead.`, "error");
    if (!sections.length) return toast("Add at least one section.", "error");
    setSaving(true);
    const res = await classService.createClass(clean, sections, subjects, wing || null);
    setSaving(false);
    if (!res.success) return toast(res.error || "Could not add the class.", "error");
    toast(`Class ${clean} added with ${plural(sections.length, "section")}.`, "success");
    onCreated(clean);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => !saving && onClose()} title="Add class" subtitle="Sections can be added or renamed later" maxWidth="max-w-lg">
      <div className="space-y-5 text-sm">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <label>
            <span className="field-label">Class name</span>
            <input value={name} onChange={(e) => setClassName(e.target.value)} maxLength={50} placeholder="e.g. 12th" className={`field field-sm w-full ${clash ? "border-rose-300" : ""}`} autoFocus />
          </label>
          <label>
            <span className="field-label">Wing</span>
            <select
              value={wing}
              onChange={(e) => {
                setWing(e.target.value);
                setWingTouched(true);
              }}
              className="field field-sm w-full"
            >
              <option value="">No wing</option>
              {WINGS.map((w) => (
                <option key={w}>{w}</option>
              ))}
            </select>
          </label>
        </div>
        {clash ? (
          <p className="-mt-3 text-[13px] text-rose-700">{name.trim()} already exists. Use &ldquo;Add section&rdquo; on that class instead.</p>
        ) : (
          missing.length > 0 &&
          !name && (
            <div className="-mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-500">Not set up yet:</span>
              {missing.map((c) => (
                <button key={c} type="button" onClick={() => setClassName(c)} className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 hover:border-brand-400 hover:text-brand-700">
                  {c}
                </button>
              ))}
            </div>
          )
        )}

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-slate-700">Sections</span>
            <div className="flex gap-1" role="group" aria-label="Quick sections">
              {QUICK.map((s) => {
                const on = sections.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(s)}
                    className={`h-7 w-8 rounded-md border text-[13px] font-semibold transition ${on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          <ChipInput values={sections} onChange={setSections} clean={cleanSection} max={20} maxLength={30} placeholder="Or type a name, e.g. Science-Maths" label="Section name" chipClass="bg-brand-50 text-brand-800" />
        </div>

        <div>
          <span className="field-label">
            Subjects <span className="font-normal text-slate-500">(optional, given to every section)</span>
          </span>
          <ChipInput values={subjects} onChange={setSubjects} clean={cleanSubject} placeholder="Type a subject and press Enter" label="Subject" />
          <SubjectSuggestions values={subjects} onAdd={(s) => setSubjects(subjects.concat(s))} limit={8} />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} disabled={saving} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button type="button" onClick={save} disabled={saving || !name.trim() || clash || !sections.length} className="btn btn-primary btn-sm">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saving ? "Adding…" : "Add class"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
