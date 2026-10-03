"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Camera, CheckCircle2, Circle, IndianRupee, Loader2, Phone, Plus, X } from "lucide-react";
import { Student } from "@/data/mockData";
import { studentService } from "@/lib/services/studentService";
import { photoService } from "@/lib/services/photoService";
import { shrinkPhoto } from "@/lib/shrinkPhoto";
import { toast } from "@/components/ui/Toaster";
import { planFor } from "@/lib/feeEngine";
import { useFeeConfig } from "@/lib/services/feeSetupService";
import { Field } from "@/components/ui/kit";
import { useSchoolProfile } from "@/components/providers/SchoolProfileProvider";
import { StudentCard } from "@/components/students/StudentCard";

const CLASS_ORDER = ["Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
const CATEGORIES = ["General", "OBC", "SC", "ST"] as const;
const GENDERS = ["Male", "Female", "Other"] as const;
const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");

/** Highest trailing number in a list of ids like "SR-2024-1503", plus one. */
function nextNumber(ids: string[], fallback: number) {
  const nums = ids.map((v) => parseInt(String(v).match(/(\d+)\s*$/)?.[1] || "", 10)).filter((n) => Number.isFinite(n));
  return (nums.length ? Math.max(...nums) : fallback - 1) + 1;
}

function blank(cls = "1st") {
  return {
    name: "",
    gender: "Male" as (typeof GENDERS)[number],
    dob: "",
    category: "General" as (typeof CATEGORIES)[number],
    penNo: "",
    class: cls,
    section: "",
    rollNo: "",
    house: "",
    srNo: "",
    admissionNo: "",
    fatherName: "",
    motherName: "",
    guardianName: "",
    mobile: "",
    altMobile: "",
    address: "",
    transport: false,
    busRoute: "",
  };
}
type Form = ReturnType<typeof blank>;
type Errors = Partial<Record<keyof Form, string>>;
export type AdmissionPrefill = Partial<Form>;

/** An enrolled student's record, laid out as the form. */
function fromStudent(s: Student): Form {
  return {
    name: s.name || "",
    gender: (GENDERS as readonly string[]).includes(s.gender) ? s.gender : "Male",
    dob: (s.dob || "").slice(0, 10),
    category: (CATEGORIES as readonly string[]).includes(s.category) ? s.category : "General",
    penNo: s.penNo || "",
    class: s.class,
    section: s.section,
    rollNo: s.rollNo || "",
    house: s.house || "",
    srNo: s.srNo || "",
    admissionNo: s.admissionNo || "",
    fatherName: s.fatherName || "",
    motherName: s.motherName || "",
    guardianName: s.guardianName && s.guardianName !== s.fatherName ? s.guardianName : "",
    mobile: (s.mobile || "").replace(/\D/g, "").slice(-10),
    altMobile: s.contact && s.contact !== s.mobile ? s.contact.replace(/\D/g, "").slice(-10) : "",
    address: s.address || "",
    transport: !!s.transportOpted,
    busRoute: s.transportOpted ? s.busRoute || "" : "",
  };
}

function validate(f: Form, takenSr: Set<string>): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Enter the student's full name.";
  if (!f.section) e.section = "Choose a section.";
  if (!f.srNo.trim()) e.srNo = "Enter the SR number.";
  else if (takenSr.has(f.srNo.trim())) e.srNo = "This SR number is already used.";
  if (!f.fatherName.trim()) e.fatherName = "Enter the father's or guardian's name.";
  if (!/^[6-9]\d{9}$/.test(f.mobile)) e.mobile = "Enter a 10-digit mobile number starting with 6, 7, 8 or 9.";
  if (f.altMobile && !/^[6-9]\d{9}$/.test(f.altMobile)) e.altMobile = "Enter a 10-digit number, or leave it empty.";
  if (f.dob && new Date(f.dob) > new Date()) e.dob = "Date of birth can't be in the future.";
  if (f.transport && !f.busRoute) e.busRoute = "Choose a bus route, or turn the bus off.";
  return e;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Everyone already enrolled: used for the next SR/admission numbers, sections, routes and houses. */
  students: Student[];
  onSaved: (s: Student) => void;
  onOpenProfile: (s: Student) => void;
  /** When set, the drawer edits this student instead of admitting a new one. */
  editing?: Student | null;
  onUpdated?: (s: Student) => void;
  /** Details already known (e.g. from an enquiry) to start a new admission with. */
  prefill?: Partial<Form> | null;
}

export function AdmissionDrawer({ isOpen, onClose, students, onSaved, onOpenProfile, editing, onUpdated, prefill }: Props) {
  const { schoolProfile } = useSchoolProfile();
  const [form, setForm] = useState<Form>(blank());
  const [errors, setErrors] = useState<Errors>({});
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState<Student | null>(null);
  const [mounted, setMounted] = useState(false);
  const firstRef = useRef<HTMLInputElement>(null);
  // The photo is picked here and saved together with the student: `data` is a new photo waiting to be
  // saved, `removed` means the current photo should be taken off.
  const [photo, setPhoto] = useState<{ data: string | null; removed: boolean }>({ data: null, removed: false });
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  // What the school already uses, so the form offers real choices.
  const lookups = useMemo(() => {
    const sectionsByClass = new Map<string, Set<string>>();
    const routes = new Set<string>();
    const houses = new Set<string>();
    for (const s of students) {
      if (!sectionsByClass.has(s.class)) sectionsByClass.set(s.class, new Set());
      sectionsByClass.get(s.class)!.add(s.section);
      if (s.transportOpted && s.busRoute) routes.add(s.busRoute);
      if (s.house) houses.add(s.house);
    }
    return {
      classes: CLASS_ORDER.filter((c) => sectionsByClass.has(c)).concat(Array.from(sectionsByClass.keys()).filter((c) => !CLASS_ORDER.includes(c))),
      sectionsOf: (c: string) => Array.from(sectionsByClass.get(c) || new Set(["A"])).sort(),
      routes: Array.from(routes).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
      houses: Array.from(houses).sort(),
      takenSr: new Set(students.filter((s) => s.id !== editing?.id).map((s) => s.srNo)),
      nextSr: `SR-2026-${nextNumber(students.map((s) => s.srNo), 1001)}`,
      nextAdm: `ADM-${nextNumber(students.map((s) => s.admissionNo), 1)}`,
    };
  }, [students, editing?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = (keepClass?: string) => {
    const cls = keepClass || lookups.classes[0] || "1st";
    if (editing && !keepClass) setForm(fromStudent(editing));
    else if (prefill && !keepClass) {
      const pc = prefill.class && lookups.classes.includes(prefill.class) ? prefill.class : cls;
      setForm({ ...blank(pc), ...prefill, class: pc, section: lookups.sectionsOf(pc)[0] || "", srNo: lookups.nextSr, admissionNo: lookups.nextAdm });
    } else setForm({ ...blank(cls), section: lookups.sectionsOf(cls)[0] || "", srNo: lookups.nextSr, admissionNo: lookups.nextAdm });
    setErrors({});
    setTried(false);
    setServerError(null);
    setSaved(null);
    setPhoto({ data: null, removed: false });
    setTimeout(() => firstRef.current?.focus(), 50);
  };

  useEffect(() => {
    if (isOpen) start();
  }, [isOpen, editing?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen) return;
    // Capture phase + stopPropagation: Esc closes this form only, not the profile drawer underneath.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      if (!saving) onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [isOpen, onClose, saving]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "class") next.section = lookups.sectionsOf(value as string)[0] || "";
      if (tried) setErrors(validate(next, lookups.takenSr));
      return next;
    });
  };

  const feeCfg = useFeeConfig();
  const plan = planFor(feeCfg, { cls: form.class, bus: form.transport, newAdmission: true });
  const fees = { total: plan.gross };
  const busYear = feeCfg.transport.amounts.reduce((s, x) => s + x, 0);
  const checklist = [
    { label: "Student's name", done: !!form.name.trim() },
    { label: "Class and section", done: !!form.class && !!form.section },
    { label: "Father's name", done: !!form.fatherName.trim() },
    { label: "Parent mobile", done: /^[6-9]\d{9}$/.test(form.mobile) },
    { label: "Date of birth", done: !!form.dob },
    { label: "Home address", done: !!form.address.trim() },
  ];

  const preview: Student = {
    id: "new",
    photoUrl: photo.data || (photo.removed ? "" : editing?.photoUrl || ""),
    name: form.name.trim() || "New student",
    srNo: form.srNo,
    admissionNo: form.admissionNo,
    rollNo: form.rollNo,
    class: form.class,
    section: form.section,
    classSec: `${form.class} - ${form.section || "?"}`,
    fatherName: form.fatherName,
    motherName: form.motherName,
    guardianName: form.guardianName,
    contact: form.altMobile,
    mobile: form.mobile,
    address: form.address,
    penNo: form.penNo,
    gender: form.gender,
    dob: form.dob,
    category: form.category,
    house: (form.house || "Tagore") as Student["house"],
    transportOpted: form.transport,
    busRoute: form.busRoute,
    status: "Active",
    totalFee: editing ? editing.totalFee : fees.total,
    paidFee: editing ? editing.paidFee : 0,
    balanceFee: editing ? editing.balanceFee : fees.total,
  };
  // An edit never rewrites the fee; say so when a change would normally affect it.
  const feeAffectingChange = !!editing && (editing.class !== form.class || !!editing.transportOpted !== form.transport);

  const shownPhoto = photo.data || (photo.removed ? "" : editing?.photoUrl || "");

  const onPhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setPhoto({ data: await shrinkPhoto(file), removed: false });
    } catch (err: any) {
      toast(err?.message || "Could not use this photo.", "error");
    }
  };

  /** After the student is saved: store a new photo, or take the old one off. A photo problem never undoes the save. */
  const withPhoto = async (st: Student): Promise<Student> => {
    if (photo.data) {
      const r = await photoService.set(st.id, photo.data);
      if (r.url) return { ...st, photoUrl: r.url };
      toast(st.name + " is saved, but the photo was not: " + (r.error || "try again from Students > Photos."), "error");
    } else if (editing && photo.removed && editing.photoUrl) {
      const r = await photoService.remove(st.id);
      if (!r.error) return { ...st, photoUrl: "" };
      toast(st.name + " is saved, but the photo could not be removed.", "error");
    }
    return st;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    const found = validate(form, lookups.takenSr);
    setErrors(found);
    const firstBad = Object.keys(found)[0];
    if (firstBad) {
      document.getElementById(`adm-${firstBad}`)?.focus();
      return;
    }
    setSaving(true);
    setServerError(null);

    if (editing) {
      const res = await studentService.updateStudent(editing.id, {
        srNo: form.srNo.trim(),
        admissionNo: form.admissionNo.trim(),
        penNo: form.penNo.trim(),
        name: form.name.trim(),
        gender: form.gender,
        dob: form.dob,
        category: form.category,
        class: form.class,
        section: form.section,
        rollNo: form.rollNo,
        house: form.house as Student["house"],
        fatherName: form.fatherName.trim(),
        motherName: form.motherName.trim(),
        guardianName: form.guardianName.trim() || form.fatherName.trim(),
        mobile: form.mobile,
        contact: form.altMobile || form.mobile,
        address: form.address.trim(),
        transportOpted: form.transport,
        busRoute: form.transport ? form.busRoute : undefined,
      });
      const done = res.success && res.data ? await withPhoto(res.data) : null;
      setSaving(false);
      if (!done) {
        setServerError(res.error || "Could not save the changes.");
        return;
      }
      onUpdated?.(done);
      return;
    }

    const res = await studentService.createStudent({
      srNo: form.srNo.trim(),
      admissionNo: form.admissionNo.trim() || form.srNo.trim(),
      penNo: form.penNo.trim() || undefined,
      name: form.name.trim(),
      gender: form.gender,
      dob: form.dob || undefined,
      category: form.category,
      class: form.class,
      section: form.section,
      classSec: `${form.class} - ${form.section}`,
      rollNo: form.rollNo || undefined,
      house: (form.house || undefined) as Student["house"] | undefined,
      fatherName: form.fatherName.trim(),
      motherName: form.motherName.trim(),
      guardianName: form.guardianName.trim() || form.fatherName.trim(),
      mobile: form.mobile,
      contact: form.altMobile || form.mobile,
      address: form.address.trim(),
      transportOpted: form.transport,
      busRoute: form.transport ? form.busRoute : undefined,
      status: "Active",
    });
    const done = res.success && res.data ? await withPhoto(res.data) : null;
    setSaving(false);
    if (!done) {
      setServerError(res.error || "Could not save the admission.");
      return;
    }
    setSaved(done);
    onSaved(done);
  };

  if (!mounted || !isOpen) return null;

  const err = (k: keyof Form) => (errors[k] ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15" : "");
  const schoolName = schoolProfile.school_name || "School";
  const schoolShort = schoolProfile.short_name || "SPS";

  return createPortal(
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-night-950/40 animate-fadeIn" onClick={() => !saving && onClose()} />

      <form
        onSubmit={submit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-label={editing ? `Edit ${editing.name}` : "New admission"}
        className="relative flex h-full w-full max-w-[1000px] flex-col bg-canvas shadow-2xl animate-slide-in-right"
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-300/50 bg-white px-5 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{editing ? "Edit student" : saved ? "Admission saved" : "New admission"}</h2>
            <p className="text-xs text-slate-500">{editing ? `${editing.name} · ${editing.srNo}` : "Session 2026-27"}</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>

        {saved ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-md px-5 py-10 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </span>
              <h3 className="mt-4 text-xl font-bold text-slate-900">{saved.name} is admitted</h3>
              <p className="mt-1 text-sm text-slate-500">
                Class {saved.classSec} · SR <span className="font-mono">{saved.srNo}</span> · {inr(saved.totalFee)} fee for the session
              </p>
              <div className="mt-6">
                <StudentCard student={saved} schoolName={schoolName} schoolShort={schoolShort} />
              </div>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                <Link href={`/fees/collect?student=${encodeURIComponent(saved.id)}`} className="btn btn-primary">
                  <IndianRupee className="h-4 w-4" />
                  Collect fee now
                </Link>
                <button type="button" onClick={() => start(saved.class)} className="btn btn-secondary">
                  <Plus className="h-4 w-4" />
                  Admit another
                </button>
                <button type="button" onClick={() => onOpenProfile(saved)} className="btn btn-secondary sm:col-span-2">
                  Open profile
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-5">
                  {serverError && (
                    <div className="alert alert-rose" role="alert">
                      <span>{serverError}</span>
                    </div>
                  )}

                  <Section title="Student" note="As on the birth certificate">
                    <div className="flex items-center gap-4 sm:col-span-2">
                      <button
                        type="button"
                        onClick={() => photoRef.current?.click()}
                        aria-label={shownPhoto ? "Change photo" : "Add photo"}
                        className="flex h-24 w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300"
                      >
                        {shownPhoto ? <img src={shownPhoto} alt="" className="h-full w-full object-cover" /> : <Camera className="h-6 w-6" />}
                      </button>
                      <div className="flex flex-col items-start gap-1.5">
                        <button type="button" onClick={() => photoRef.current?.click()} className="btn btn-secondary btn-sm">
                          {shownPhoto ? "Change photo" : "Add photo"}
                        </button>
                        {shownPhoto && (
                          <button type="button" onClick={() => setPhoto({ data: null, removed: !!editing?.photoUrl })} className="text-[13px] font-semibold text-slate-600 hover:text-rose-600">
                            Remove
                          </button>
                        )}
                      </div>
                      <input ref={photoRef} type="file" accept="image/*" onChange={onPhotoFile} className="hidden" />
                    </div>
                    <Field id="adm-name" label="Full name" required error={errors.name} className="sm:col-span-2">
                      <input ref={firstRef} id="adm-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Aryan Singh Rathore" className={`field w-full ${err("name")}`} />
                    </Field>
                    <Field id="adm-gender" label="Gender">
                      <div id="adm-gender" role="radiogroup" className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
                        {GENDERS.map((g) => (
                          <button
                            key={g}
                            type="button"
                            role="radio"
                            aria-checked={form.gender === g}
                            onClick={() => set("gender", g)}
                            className={`rounded-lg py-2 text-sm font-semibold transition ${form.gender === g ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                          >
                            {g === "Male" ? "Boy" : g === "Female" ? "Girl" : "Other"}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <Field id="adm-dob" label="Date of birth" error={errors.dob}>
                      <input id="adm-dob" type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} className={`field w-full ${err("dob")}`} />
                    </Field>
                    <Field id="adm-category" label="Category">
                      <select id="adm-category" value={form.category} onChange={(e) => set("category", e.target.value as Form["category"])} className="field w-full">
                        {CATEGORIES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </Field>
                    <Field id="adm-penNo" label="PEN (UDISE+)" hint="Optional">
                      <input id="adm-penNo" value={form.penNo} onChange={(e) => set("penNo", e.target.value)} className="field w-full font-mono" />
                    </Field>
                  </Section>

                  <Section title="Class and register">
                    <Field id="adm-class" label="Class" required>
                      <select id="adm-class" value={form.class} onChange={(e) => set("class", e.target.value)} className="field w-full">
                        {lookups.classes.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </Field>
                    <Field id="adm-section" label="Section" required error={errors.section}>
                      <select id="adm-section" value={form.section} onChange={(e) => set("section", e.target.value)} className={`field w-full ${err("section")}`}>
                        {lookups.sectionsOf(form.class).map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </Field>
                    <Field id="adm-rollNo" label="Roll no." hint="Optional">
                      <input id="adm-rollNo" inputMode="numeric" value={form.rollNo} onChange={(e) => set("rollNo", e.target.value.replace(/\D/g, ""))} className="field w-full font-mono" />
                    </Field>
                    <Field id="adm-house" label="House" hint="Optional">
                      <select id="adm-house" value={form.house} onChange={(e) => set("house", e.target.value)} className="field w-full">
                        <option value="">Not yet</option>
                        {lookups.houses.map((h) => (
                          <option key={h}>{h}</option>
                        ))}
                      </select>
                    </Field>
                    <Field id="adm-srNo" label="SR no." required error={errors.srNo} hint={editing ? undefined : "Next number in the register"}>
                      <input id="adm-srNo" value={form.srNo} onChange={(e) => set("srNo", e.target.value)} className={`field w-full font-mono ${err("srNo")}`} />
                    </Field>
                    <Field id="adm-admissionNo" label="Admission no.">
                      <input id="adm-admissionNo" value={form.admissionNo} onChange={(e) => set("admissionNo", e.target.value)} className="field w-full font-mono" />
                    </Field>
                  </Section>

                  <Section title="Parents and contact" note="Fee receipts and absence alerts go to this mobile">
                    <Field id="adm-fatherName" label="Father's name" required error={errors.fatherName}>
                      <input id="adm-fatherName" value={form.fatherName} onChange={(e) => set("fatherName", e.target.value)} className={`field w-full ${err("fatherName")}`} />
                    </Field>
                    <Field id="adm-motherName" label="Mother's name">
                      <input id="adm-motherName" value={form.motherName} onChange={(e) => set("motherName", e.target.value)} className="field w-full" />
                    </Field>
                    <Field id="adm-mobile" label="Parent mobile" required error={errors.mobile}>
                      <PhoneInput id="adm-mobile" value={form.mobile} onChange={(v) => set("mobile", v)} invalid={!!errors.mobile} />
                    </Field>
                    <Field id="adm-altMobile" label="Other mobile" hint="Optional" error={errors.altMobile}>
                      <PhoneInput id="adm-altMobile" value={form.altMobile} onChange={(v) => set("altMobile", v)} invalid={!!errors.altMobile} />
                    </Field>
                    <Field id="adm-guardianName" label="Local guardian" hint="Leave empty if same as father" className="sm:col-span-2">
                      <input id="adm-guardianName" value={form.guardianName} onChange={(e) => set("guardianName", e.target.value)} className="field w-full" />
                    </Field>
                    <Field id="adm-address" label="Home address" className="sm:col-span-2">
                      <textarea id="adm-address" rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="House no., street, area, Barmer" className="field w-full" />
                    </Field>
                  </Section>

                  <section className="card p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">School bus</h3>
                        <p className="text-[13px] text-slate-500">{editing ? "Changing this here does not change the fee." : `Adds ${inr(busYear)} bus fee for the session.`}</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={form.transport}
                        aria-label="Student will use the school bus"
                        onClick={() => set("transport", !form.transport)}
                        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${form.transport ? "bg-brand-600" : "bg-slate-200"}`}
                      >
                        <span className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${form.transport ? "translate-x-5" : ""}`} />
                      </button>
                    </div>
                    {form.transport && (
                      <Field id="adm-busRoute" label="Bus route" required error={errors.busRoute} className="mt-4 sm:w-1/2">
                        <select id="adm-busRoute" value={form.busRoute} onChange={(e) => set("busRoute", e.target.value)} className={`field w-full ${err("busRoute")}`}>
                          <option value="">Choose a route</option>
                          {lookups.routes.map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                      </Field>
                    )}
                  </section>
                </div>

                {/* Live preview: the card fills in as you type, and the fee is spelt out */}
                <aside className="hidden lg:block">
                  <div className="sticky top-0 space-y-4">
                    <StudentCard student={preview} schoolName={schoolName} schoolShort={schoolShort} />

                    {editing ? (
                      <div className="card p-4">
                        <h3 className="text-sm font-semibold text-slate-900">Fee for 2026-27</h3>
                        <dl className="mt-3 space-y-1.5 text-[13px]">
                          <FeeLine label="Total" value={editing.totalFee} />
                          <FeeLine label="Paid" value={editing.paidFee} />
                          <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-bold">
                            <dt className="text-slate-900">Due</dt>
                            <dd className={`tabular-nums ${editing.balanceFee > 0 ? "text-rose-600" : "text-emerald-700"}`}>{editing.balanceFee > 0 ? inr(editing.balanceFee) : "Nil"}</dd>
                          </div>
                        </dl>
                        {feeAffectingChange && (
                          <p className="mt-3 rounded-lg bg-marigold-50 px-3 py-2 text-xs text-marigold-900">
                            Class or bus changed. The fee stays {inr(editing.totalFee)}; change it from Fees if needed.
                          </p>
                        )}
                      </div>
                    ) : (
                    <div className="card p-4">
                      <h3 className="text-sm font-semibold text-slate-900">Fee for 2026-27</h3>
                      <dl className="mt-3 space-y-1.5 text-[13px]">
                        {plan.lines.map((l) => (
                          <FeeLine key={l.key} label={l.key === "admission" ? `${l.name} (once)` : l.name} value={l.total} />
                        ))}
                        <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-bold text-slate-900">
                          <dt>Total</dt>
                          <dd className="tabular-nums">{inr(fees.total)}</dd>
                        </div>
                      </dl>
                    </div>
                    )}

                    <div className="card p-4">
                      <ul className="space-y-2">
                        {checklist.map((c) => (
                          <li key={c.label} className="flex items-center gap-2.5 text-[13px]">
                            {c.done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-slate-300" />}
                            <span className={c.done ? "text-slate-700" : "text-slate-400"}>{c.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </aside>
              </div>
            </div>

            <footer className="flex shrink-0 items-center gap-3 border-t border-slate-300/50 bg-white px-5 py-3 sm:px-6">
              <span className="hidden text-[13px] text-slate-500 sm:block">
                {editing ? (
                  "Changes are saved to the student's record"
                ) : (
                  <>
                    Fee <span className="font-semibold tabular-nums text-slate-800">{inr(fees.total)}</span> will be added to the ledger
                  </>
                )}
              </span>
              <span className="ml-auto flex gap-2">
                <button type="button" onClick={onClose} disabled={saving} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary min-w-[150px]">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? "Saving…" : editing ? "Save changes" : "Save admission"}
                </button>
              </span>
            </footer>
          </>
        )}
      </form>
    </div>,
    document.body
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {note && <p className="text-xs text-slate-500">{note}</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function PhoneInput({ id, value, onChange, invalid }: { id: string; value: string; onChange: (v: string) => void; invalid?: boolean }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-1.5 pl-3.5 text-sm font-medium text-slate-500">
        <Phone className="h-4 w-4 text-slate-400" />
        +91
      </span>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        maxLength={10}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        aria-invalid={invalid}
        className={`field w-full pl-[4.75rem] font-mono ${invalid ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15" : ""}`}
      />
    </div>
  );
}

function FeeLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-slate-600">
      <dt>{label}</dt>
      <dd className="tabular-nums">{inr(value)}</dd>
    </div>
  );
}
