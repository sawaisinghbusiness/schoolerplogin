"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, Phone } from "lucide-react";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { Field } from "@/components/ui/kit";
import { enquiryService, Enquiry, SOURCES } from "@/lib/services/enquiryService";

export const ENQUIRY_CLASSES = ["Pre Nursery", "Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];

/** yyyy-mm-dd for today + n days, in local time. */
export function dayIso(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const FOLLOW_UP_CHIPS = [
  { label: "Tomorrow", days: 1 },
  { label: "In 3 days", days: 3 },
  { label: "Next week", days: 7 },
];

const blank = () => ({
  student_name: "",
  class_wanted: "Nursery",
  gender: "Male",
  dob: "",
  father_name: "",
  mother_name: "",
  mobile: "",
  alt_mobile: "",
  area: "",
  previous_school: "",
  source: "Walk-in",
  next_follow_up: dayIso(2),
  note: "",
});

export function EnquiryFormDrawer({ isOpen, onClose, onSaved }: { isOpen: boolean; onClose: () => void; onSaved: (e: Enquiry) => void }) {
  const [f, setF] = useState(blank());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setF(blank());
    setErrors({});
    setServerError(null);
    setTimeout(() => firstRef.current?.focus(), 60);
  }, [isOpen]);

  const set = (k: keyof ReturnType<typeof blank>, v: string) => setF((p) => ({ ...p, [k]: v }));

  const save = async () => {
    const e: Record<string, string> = {};
    if (!f.student_name.trim()) e.student_name = "Enter the child's name.";
    if (!/^[6-9]\d{9}$/.test(f.mobile)) e.mobile = "Enter a 10-digit mobile number.";
    if (f.alt_mobile && !/^[6-9]\d{9}$/.test(f.alt_mobile)) e.alt_mobile = "Enter a 10-digit number, or leave it empty.";
    setErrors(e);
    if (Object.keys(e).length) return document.getElementById(`enq-${Object.keys(e)[0]}`)?.focus();
    setSaving(true);
    setServerError(null);
    const { note, ...rest } = f;
    const res = await enquiryService.create({ ...rest, note: note.trim() || undefined } as any);
    setSaving(false);
    if (!res.success || !res.data) return setServerError(res.error || "Could not save.");
    onSaved(res.data);
  };

  const bad = (k: string) => (errors[k] ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15" : "");

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      busy={saving}
      title="New enquiry"
      subtitle="A parent asking about admission"
      footer={
        <>
          <button type="button" onClick={onClose} disabled={saving} className="btn btn-secondary ml-auto">
            Cancel
          </button>
          <button type="button" onClick={save} disabled={saving} className="btn btn-primary min-w-[140px]">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : "Save enquiry"}
          </button>
        </>
      }
    >
      <div className="space-y-4 p-5">
        {serverError && (
          <div className="alert alert-rose" role="alert">
            <span>{serverError}</span>
          </div>
        )}
        <section className="card grid grid-cols-2 gap-4 p-5">
          <h3 className="col-span-2 text-sm font-semibold text-slate-900">Child</h3>
          <Field id="enq-student_name" label="Child's name" required error={errors.student_name} className="col-span-2">
            <input ref={firstRef} id="enq-student_name" value={f.student_name} onChange={(e) => set("student_name", e.target.value)} className={`field w-full ${bad("student_name")}`} />
          </Field>
          <Field id="enq-class" label="Admission wanted in" required>
            <select id="enq-class" value={f.class_wanted} onChange={(e) => set("class_wanted", e.target.value)} className="field w-full">
              {ENQUIRY_CLASSES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field id="enq-gender" label="Gender">
            <div id="enq-gender" role="radiogroup" className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
              {[
                ["Male", "Boy"],
                ["Female", "Girl"],
              ].map(([v, l]) => (
                <button key={v} type="button" role="radio" aria-checked={f.gender === v} onClick={() => set("gender", v)} className={`rounded-lg py-2 text-sm font-semibold ${f.gender === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                  {l}
                </button>
              ))}
            </div>
          </Field>
          <Field id="enq-dob" label="Date of birth" hint="Optional">
            <input id="enq-dob" type="date" value={f.dob} onChange={(e) => set("dob", e.target.value)} className="field w-full" />
          </Field>
          <Field id="enq-prev" label="Present school" hint="Optional">
            <input id="enq-prev" value={f.previous_school} onChange={(e) => set("previous_school", e.target.value)} className="field w-full" />
          </Field>
        </section>

        <section className="card grid grid-cols-2 gap-4 p-5">
          <h3 className="col-span-2 text-sm font-semibold text-slate-900">Parent</h3>
          <Field id="enq-father" label="Father's name">
            <input id="enq-father" value={f.father_name} onChange={(e) => set("father_name", e.target.value)} className="field w-full" />
          </Field>
          <Field id="enq-mother" label="Mother's name">
            <input id="enq-mother" value={f.mother_name} onChange={(e) => set("mother_name", e.target.value)} className="field w-full" />
          </Field>
          <Field id="enq-mobile" label="Mobile" required error={errors.mobile}>
            <Phoneish id="enq-mobile" value={f.mobile} onChange={(v) => set("mobile", v)} cls={bad("mobile")} />
          </Field>
          <Field id="enq-alt_mobile" label="Other mobile" hint="Optional" error={errors.alt_mobile}>
            <Phoneish id="enq-alt_mobile" value={f.alt_mobile} onChange={(v) => set("alt_mobile", v)} cls={bad("alt_mobile")} />
          </Field>
          <Field id="enq-area" label="Area / colony">
            <input id="enq-area" value={f.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. Rai Colony" className="field w-full" />
          </Field>
          <Field id="enq-source" label="How did they hear of us?">
            <select id="enq-source" value={f.source} onChange={(e) => set("source", e.target.value)} className="field w-full">
              {SOURCES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        </section>

        <section className="card space-y-4 p-5">
          <h3 className="text-sm font-semibold text-slate-900">Follow-up</h3>
          <div className="flex flex-wrap items-center gap-2">
            <input type="date" aria-label="Next follow-up" value={f.next_follow_up} onChange={(e) => set("next_follow_up", e.target.value)} className="field field-sm" />
            {FOLLOW_UP_CHIPS.map((c) => (
              <button key={c.label} type="button" onClick={() => set("next_follow_up", dayIso(c.days))} className={`btn btn-sm ${f.next_follow_up === dayIso(c.days) ? "btn-soft" : "btn-secondary"}`}>
                {c.label}
              </button>
            ))}
          </div>
          <textarea value={f.note} onChange={(e) => set("note", e.target.value)} rows={3} placeholder="What did the parent ask? e.g. wants school bus from Rai Colony, asked about fees" aria-label="Note" className="field w-full" />
        </section>
      </div>
    </SideDrawer>
  );
}

function Phoneish({ id, value, onChange, cls }: { id: string; value: string; onChange: (v: string) => void; cls?: string }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-1.5 pl-3.5 text-sm font-medium text-slate-500">
        <Phone className="h-4 w-4 text-slate-400" />
        +91
      </span>
      <input id={id} type="tel" inputMode="numeric" maxLength={10} value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))} className={`field w-full pl-[4.75rem] font-mono ${cls || ""}`} />
    </div>
  );
}
