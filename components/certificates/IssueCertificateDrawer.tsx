"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, Loader2, Printer, Search, X } from "lucide-react";
import { Student } from "@/data/mockData";
import { certificateService, Certificate, CertificateType, CERT_LABEL } from "@/lib/services/certificateService";
import { classInWords, nextClass } from "@/lib/words";
import { Avatar } from "@/components/ui/Avatar";
import { CertificateDocument, SchoolInfo } from "@/components/certificates/CertificateDocument";
import { PrintSheet, SheetPreview } from "@/components/certificates/SheetPreview";

const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const TYPES: { key: CertificateType; label: string; note: string }[] = [
  { key: "tc", label: "Transfer (TC)", note: "Student is leaving" },
  { key: "bonafide", label: "Bonafide", note: "Proof of studying here" },
  { key: "character", label: "Character", note: "Conduct while here" },
];

type FieldDef = { key: string; label: string; kind?: "text" | "date" | "select"; options?: string[]; wide?: boolean; placeholder?: string };

const FIELDS: Record<CertificateType, FieldDef[]> = {
  tc: [
    { key: "firstAdmission", label: "First admission (date and class)", placeholder: "e.g. 01/04/2021, Class 1st", wide: true },
    { key: "lastExam", label: "Last annual exam and result", wide: true },
    { key: "failed", label: "Failed in the same class?", kind: "select", options: ["No", "Once", "Twice"] },
    { key: "conduct", label: "General conduct", kind: "select", options: ["Excellent", "Very good", "Good", "Satisfactory"] },
    { key: "subjects", label: "Subjects studied", placeholder: "e.g. English, Hindi, Mathematics, EVS", wide: true },
    { key: "promotion", label: "Qualified for promotion?", wide: true },
    { key: "duesUpTo", label: "School dues paid up to", wide: true },
    { key: "concession", label: "Fee concession" },
    { key: "ncc", label: "NCC / Scout / Guide" },
    { key: "workingDays", label: "Working days" },
    { key: "daysPresent", label: "Days present" },
    { key: "games", label: "Games / activities", wide: true },
    { key: "reason", label: "Reason for leaving", kind: "select", options: ["Parents' request", "Parents transferred", "Shifting to another city", "Completed the school course", "Admission in another school"], wide: true },
    { key: "applicationDate", label: "Application date", kind: "date" },
    { key: "issueDate", label: "Issue date", kind: "date" },
    { key: "remarks", label: "Other remarks", wide: true },
  ],
  bonafide: [
    { key: "purpose", label: "Purpose", placeholder: "e.g. opening a bank account, scholarship", wide: true },
    { key: "issueDate", label: "Issue date", kind: "date" },
  ],
  character: [
    { key: "studiedFrom", label: "Studied here from", placeholder: "e.g. April 2019" },
    { key: "studiedTo", label: "Studied here till", placeholder: "e.g. March 2027" },
    { key: "conduct", label: "Conduct and character", kind: "select", options: ["Excellent", "Very good", "Good", "Satisfactory"] },
    { key: "issueDate", label: "Issue date", kind: "date" },
  ],
};

/** Everything the certificate prints, filled from the student's record where we have it. */
function defaults(type: CertificateType, s: Student | null): Record<string, string> {
  const today = todayIso();
  const base: Record<string, string> = s
    ? {
        name: s.name,
        father: s.fatherName,
        mother: s.motherName,
        gender: s.gender,
        admissionNo: s.admissionNo,
        srNo: s.srNo,
        pen: s.penNo,
        dob: (s.dob || "").slice(0, 10),
        class: s.class,
        classSec: s.classSec,
        session: "2026-27",
        nationality: "Indian",
        category: s.category === "General" || !s.category ? "No (General)" : `Yes (${s.category})`,
      }
    : { nationality: "Indian", session: "2026-27" };
  if (type === "bonafide") return { ...base, purpose: "", issueDate: today };
  if (type === "character") return { ...base, studiedFrom: "", studiedTo: "", conduct: "Good", issueDate: today };
  const next = s ? nextClass(s.class) : "";
  return {
    ...base,
    firstAdmission: "",
    lastExam: "Annual examination 2025-26: Passed",
    failed: "No",
    subjects: "",
    promotion: next ? `Yes, to Class ${next} (${classInWords(next)})` : "Not applicable",
    duesUpTo: s && s.balanceFee > 0 ? `${inr(s.balanceFee)} still due` : "All dues paid up to March 2027",
    concession: "None",
    workingDays: "",
    daysPresent: "",
    ncc: "No",
    games: "",
    conduct: "Good",
    applicationDate: today,
    issueDate: today,
    reason: "Parents' request",
    remarks: "",
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  school: SchoolInfo;
  onIssued: (c: Certificate) => void;
}

export function IssueCertificateDrawer({ isOpen, onClose, students, school, onIssued }: Props) {
  const [type, setType] = useState<CertificateType>("tc");
  const [student, setStudent] = useState<Student | null>(null);
  const [query, setQuery] = useState("");
  const [d, setD] = useState<Record<string, string>>(defaults("tc", null));
  const [markLeft, setMarkLeft] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issued, setIssued] = useState<Certificate | null>(null);
  const [printing, setPrinting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!isOpen) return;
    setType("tc");
    setStudent(null);
    setQuery("");
    setD(defaults("tc", null));
    setMarkLeft(true);
    setError(null);
    setIssued(null);
    setTimeout(() => searchRef.current?.focus(), 50);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, saving, onClose]);

  const choose = (t: CertificateType, s: Student | null) => {
    setType(t);
    setStudent(s);
    setD(defaults(t, s));
    setError(null);
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return students
      .filter((s) => s.name.toLowerCase().includes(q) || s.srNo.toLowerCase().includes(q) || (s.fatherName || "").toLowerCase().includes(q) || (s.mobile || "").includes(q))
      .slice(0, 8);
  }, [query, students]);

  const issue = async () => {
    if (!student) return setError("Choose the student first.");
    setSaving(true);
    setError(null);
    const res = await certificateService.issue({ studentId: student.id, type, details: d, markLeft: type === "tc" && markLeft });
    setSaving(false);
    if (!res.success || !res.data) return setError(res.error || "Could not issue the certificate.");
    setIssued(res.data);
    onIssued(res.data);
    setPrinting(true);
  };

  if (!mounted || !isOpen) return null;
  const doc = <CertificateDocument type={type} d={d} serial={issued?.serial_no || "Draft"} school={school} />;

  return createPortal(
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-night-950/40 animate-fadeIn" onClick={() => !saving && onClose()} />
      <div role="dialog" aria-modal="true" aria-label="Issue certificate" className="relative flex h-full w-full max-w-[1120px] flex-col bg-canvas shadow-2xl animate-slide-in-right">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-300/50 bg-white px-5 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{issued ? `${issued.serial_no} issued` : "Issue a certificate"}</h2>
            <p className="text-xs text-slate-500">{issued ? `${CERT_LABEL[issued.type]} for ${student?.name}` : "Details from the student's record are filled in; check them before issuing"}</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1">
          {/* Form */}
          <div className="min-h-0 w-full space-y-4 overflow-y-auto border-slate-300/50 p-5 lg:w-[420px] lg:shrink-0 lg:border-r">
            {issued ? (
              <div className="card p-5 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
                <p className="mt-2 font-semibold text-slate-900">Saved in the certificate register</p>
                <p className="mt-1 text-sm text-slate-500">
                  Serial no. <span className="font-mono font-semibold text-slate-800">{issued.serial_no}</span>
                  {type === "tc" && markLeft ? ". The student is now marked as left." : "."}
                </p>
                <div className="mt-4 grid gap-2">
                  <button type="button" onClick={() => setPrinting(true)} className="btn btn-primary">
                    <Printer className="h-4 w-4" />
                    Print again
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIssued(null);
                      choose(type, null);
                      setQuery("");
                    }}
                    className="btn btn-secondary"
                  >
                    Issue another
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Certificate type">
                  {TYPES.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      role="radio"
                      aria-checked={type === t.key}
                      onClick={() => choose(t.key, student)}
                      className={`rounded-xl border bg-white px-3 py-2.5 text-left transition ${type === t.key ? "border-brand-500 ring-4 ring-brand-500/10" : "border-slate-200 hover:border-slate-300"}`}
                    >
                      <span className="block text-[13px] font-semibold text-slate-900">{t.label}</span>
                      <span className="block text-[11.5px] text-slate-500">{t.note}</span>
                    </button>
                  ))}
                </div>

                {/* Student */}
                <section className="card p-4">
                  <h3 className="mb-2 text-sm font-semibold text-slate-900">Student</h3>
                  {student ? (
                    <div className="flex items-center gap-3">
                      <Avatar name={student.name} id={student.id} photoUrl={student.photoUrl} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-slate-900">{student.name}</div>
                        <div className="truncate text-xs text-slate-500">
                          {student.classSec} · {student.srNo} · {student.fatherName}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          choose(type, null);
                          setTimeout(() => searchRef.current?.focus(), 30);
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          ref={searchRef}
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Name, SR no., father or mobile"
                          aria-label="Find student"
                          className="field w-full pl-9"
                        />
                      </div>
                      {/* Results sit in the flow (not floating), so they push the page down instead of covering it */}
                      {results.length > 0 && (
                        <ul className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1">
                          {results.map((s) => (
                            <li key={s.id}>
                              <button type="button" onClick={() => choose(type, s)} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50">
                                <Avatar name={s.name} id={s.id} photoUrl={s.photoUrl} size="sm" />
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-semibold text-slate-900">{s.name}</span>
                                  <span className="block truncate text-xs text-slate-500">
                                    {s.classSec} · {s.srNo} · {s.fatherName}
                                  </span>
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {query.trim().length >= 2 && results.length === 0 && <p className="mt-2 text-xs text-slate-500">No student matches.</p>}
                    </div>
                  )}
                </section>

                {student && type === "tc" && student.balanceFee > 0 && (
                  <div className="alert alert-amber">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      {inr(student.balanceFee)} fee is still due. Schools usually clear dues before giving a TC.
                    </span>
                  </div>
                )}

                {student && (
                  <section className="card p-4">
                    <h3 className="mb-3 text-sm font-semibold text-slate-900">Details to print</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {FIELDS[type].map((f) => (
                        <label key={f.key} className={f.wide ? "col-span-2" : ""}>
                          <span className="mb-1 block text-xs font-semibold text-slate-600">{f.label}</span>
                          {f.kind === "select" ? (
                            <select value={d[f.key] || ""} onChange={(e) => setD({ ...d, [f.key]: e.target.value })} className="field field-sm w-full">
                              {!f.options?.includes(d[f.key] || "") && d[f.key] ? <option>{d[f.key]}</option> : null}
                              {f.options?.map((o) => (
                                <option key={o}>{o}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={f.kind === "date" ? "date" : "text"}
                              value={d[f.key] || ""}
                              onChange={(e) => setD({ ...d, [f.key]: e.target.value })}
                              placeholder={f.placeholder}
                              className="field field-sm w-full"
                            />
                          )}
                        </label>
                      ))}
                    </div>
                    {type === "tc" && (
                      <label className="mt-4 flex items-start gap-2.5 rounded-lg bg-slate-50 p-3 text-[13px] text-slate-700">
                        <input type="checkbox" checked={markLeft} onChange={(e) => setMarkLeft(e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-600" />
                        <span>
                          Mark {student.name.split(" ")[0]} as left
                          <span className="block text-xs text-slate-500">Keeps the record and fee history, but takes the student off the active list.</span>
                        </span>
                      </label>
                    )}
                  </section>
                )}

                {error && (
                  <div className="alert alert-rose" role="alert">
                    <span>{error}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Preview */}
          <div className="hidden min-h-0 min-w-0 flex-1 overflow-y-auto bg-slate-200/50 p-6 lg:block">
            <SheetPreview>{doc}</SheetPreview>
          </div>
        </div>

        {!issued && (
          <footer className="flex shrink-0 items-center gap-3 border-t border-slate-300/50 bg-white px-5 py-3 sm:px-6">
            <span className="hidden text-[13px] text-slate-500 sm:block">The next serial number is given when you issue</span>
            <span className="ml-auto flex gap-2">
              <button type="button" onClick={onClose} disabled={saving} className="btn btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={issue} disabled={saving || !student} className="btn btn-primary min-w-[160px]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                {saving ? "Issuing…" : "Issue and print"}
              </button>
            </span>
          </footer>
        )}
      </div>

      {printing && <PrintSheet onDone={() => setPrinting(false)}>{doc}</PrintSheet>}
    </div>,
    document.body
  );
}
