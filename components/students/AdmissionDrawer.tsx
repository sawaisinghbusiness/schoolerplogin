"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Camera, Check, CheckCircle2, Circle, IndianRupee, Loader2, Phone, Plus, Search, Upload, X } from "lucide-react";
import { SavedStudent, SiblingRef, Student, StudentFull } from "@/data/mockData";
import { studentDocumentService, studentService } from "@/lib/services/studentService";
import { photoService } from "@/lib/services/photoService";
import { transportService, BusRoute } from "@/lib/services/transportService";
import { cropPhoto } from "@/components/ui/PhotoCropper";
import { shrinkDocument } from "@/lib/shrinkPhoto";
import { toast } from "@/components/ui/Toaster";
import { planFor } from "@/lib/feeEngine";
import { useFeeConfig } from "@/lib/services/feeSetupService";
import { Field } from "@/components/ui/kit";
import { useSchoolProfile } from "@/components/providers/SchoolProfileProvider";
import { StudentCard } from "@/components/students/StudentCard";

/*
 * New admission / Edit student: the full admission form, the same fields and option values as the
 * staff app's 7-step form (app for staffs sms project → erp/students/admission), so a record written
 * from either screen reads the same. The details need backend migration 20261020; until it is run the
 * backend saves the old fields and answers detailsSaved: false.
 */

const CLASS_ORDER = ["Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
const GENDERS = ["Male", "Female", "Other"] as const;
const CATEGORIES = ["General", "OBC", "MBC", "SC", "ST", "EWS"];
const RELIGIONS = ["Hindu", "Muslim", "Sikh", "Jain", "Christian", "Buddhist", "Other"];
const TONGUES = ["Hindi", "Marwari", "Sindhi", "Punjabi", "Urdu", "English", "Other"];
const BLOOD = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const EDUCATION = ["Below 10th", "10th", "12th", "Graduate", "Post graduate", "Doctorate"];
const INCOME = ["Below ₹1 lakh", "₹1–2.5 lakh", "₹2.5–5 lakh", "₹5–10 lakh", "Above ₹10 lakh"];
const BOARDS = ["RBSE", "CBSE", "Other"];
const PREV_CLASSES = ["Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th"];
const DOCS: { key: string; label: string; note?: string }[] = [
  { key: "birth", label: "Birth certificate" },
  { key: "aadhaar", label: "Child's Aadhaar card" },
  { key: "tc", label: "Transfer certificate (TC)", note: "From the last school" },
  { key: "marksheet", label: "Last year's marksheet" },
  { key: "caste", label: "Caste certificate", note: "Needed for SC / ST / OBC / MBC" },
  { key: "jan_aadhaar", label: "Jan Aadhaar card" },
  { key: "parent_aadhaar", label: "Parent's Aadhaar card" },
  { key: "income", label: "Income certificate", note: "Only for RTE or scholarship" },
  { key: "photos", label: "4 passport photos" },
];

const TABS = [
  { key: "student", label: "Student" },
  { key: "class", label: "Class & register" },
  { key: "old", label: "Last school" },
  { key: "family", label: "Family" },
  { key: "address", label: "Address & bus" },
  { key: "docs", label: "Documents" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const MOBILE = /^[6-9]\d{9}$/;
const DETAILS_NOT_SAVED = "Name, class and parents are saved; the other details need the new SQL on the server.";

/** Highest trailing number in a list of ids like "SR-2024-1503", plus one. */
function nextNumber(ids: string[], fallback: number) {
  const nums = ids.map((v) => parseInt(String(v).match(/(\d+)\s*$/)?.[1] || "", 10)).filter((n) => Number.isFinite(n));
  return (nums.length ? Math.max(...nums) : fallback - 1) + 1;
}

/** "9 yrs 4 mo" on 1 April of the current session, the age the board asks for. */
function ageOn1April(dob: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return "";
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const [y, m, d] = dob.split("-").map(Number);
  let months = (year - y) * 12 + (4 - m);
  if (1 < d) months -= 1;
  if (months < 0) return "";
  return `${Math.floor(months / 12)} yrs ${months % 12} mo`;
}

function blank(cls = "1st") {
  return {
    // Student
    name: "", nameHi: "", gender: "Male" as string, dob: "", birthPlace: "", aadhaarNo: "", religion: "Hindu", caste: "",
    category: "General", nationality: "Indian", motherTongue: "Hindi", bloodGroup: "", healthNotes: "", cwsn: false, idMark: "",
    // Class and register
    class: cls, section: "", medium: "English", rollNo: "", house: "", srNo: "", admissionNo: "", admissionDate: todayIso(),
    penNo: "", shalaDarpanId: "", admissionType: "New admission", rte: false,
    // Last school
    prevSchool: "", prevBoard: "RBSE", prevClass: "", prevYear: "", prevResult: "", tcNo: "", tcDate: "", leavingReason: "",
    // Family
    fatherName: "", mobile: "", fatherOccupation: "", fatherEducation: "", fatherAadhaar: "", fatherEmail: "",
    motherName: "", motherMobile: "", motherOccupation: "", motherEducation: "", motherAadhaar: "", whatsappTo: "Father",
    familyIncome: "", janAadhaar: "", bpl: false, guardianName: "", guardianRelation: "", guardianMobile: "",
    // Address and bus
    address: "", city: "Barmer", tehsil: "Barmer", district: "Barmer", pincode: "", sameLetters: true, lettersAddress: "",
    transport: false, busRoute: "", busStop: "", emergencyName: "", emergencyRelation: "", emergencyMobile: "",
    // Documents and bank
    documents: {} as Record<string, boolean>, bankHolder: "", bankAccount: "", bankIfsc: "",
  };
}
type Form = ReturnType<typeof blank>;
type Key = keyof Form;
type Errors = Partial<Record<Key, string>>;
export type AdmissionPrefill = Partial<Form>;

/** A student's record laid out as the form (the same rules as the staff app). */
function fromStudent(s: StudentFull): Form {
  const b = blank(s.class);
  const digits = (v?: string) => (v || "").replace(/\D/g, "").slice(-10);
  return {
    ...b,
    name: s.name || "", nameHi: s.nameHi || "", gender: (GENDERS as readonly string[]).includes(s.gender) ? s.gender : "Male", dob: (s.dob || "").slice(0, 10),
    birthPlace: s.birthPlace || "", aadhaarNo: s.aadhaarNo || "", religion: s.religion || b.religion, caste: s.caste || "", category: s.category || "General",
    nationality: s.nationality || b.nationality, motherTongue: s.motherTongue || b.motherTongue, bloodGroup: s.bloodGroup || "", healthNotes: s.healthNotes || "",
    cwsn: !!s.cwsn, idMark: s.idMark || "",
    class: s.class, section: s.section, medium: s.medium || b.medium, rollNo: s.rollNo || "", house: s.house || "", srNo: s.srNo || "", admissionNo: s.admissionNo || "",
    admissionDate: s.admissionDate || "", penNo: s.penNo || "", shalaDarpanId: s.shalaDarpanId || "", admissionType: s.admissionType || b.admissionType, rte: !!s.rte,
    prevSchool: s.prevSchool || "", prevBoard: s.prevBoard || b.prevBoard, prevClass: s.prevClass || "", prevYear: s.prevYear || "", prevResult: s.prevResult || "",
    tcNo: s.tcNo || "", tcDate: s.tcDate || "", leavingReason: s.leavingReason || "",
    fatherName: s.fatherName || "", mobile: digits(s.mobile), fatherOccupation: s.fatherOccupation || "", fatherEducation: s.fatherEducation || "",
    fatherAadhaar: s.fatherAadhaar || "", fatherEmail: s.fatherEmail || "",
    motherName: s.motherName || "", motherMobile: digits(s.motherMobile || (s.contact && s.contact !== s.mobile ? s.contact : "")), motherOccupation: s.motherOccupation || "",
    motherEducation: s.motherEducation || "", motherAadhaar: s.motherAadhaar || "", whatsappTo: s.whatsappTo || "Father",
    familyIncome: s.familyIncome || "", janAadhaar: s.janAadhaar || "", bpl: !!s.bpl,
    guardianName: s.guardianName && s.guardianName !== s.fatherName ? s.guardianName : "", guardianRelation: s.guardianRelation || "", guardianMobile: digits(s.guardianMobile),
    address: s.address || "", city: s.city || "", tehsil: s.tehsil || "", district: s.district || "", pincode: s.pincode || "",
    sameLetters: !s.lettersAddress, lettersAddress: s.lettersAddress || "",
    transport: !!s.transportOpted, busRoute: s.transportOpted ? s.busRoute || "" : "", busStop: s.busStop || "",
    emergencyName: s.emergencyName || "", emergencyRelation: s.emergencyRelation || "", emergencyMobile: digits(s.emergencyMobile),
    documents: s.documents || {}, bankHolder: s.bankHolder || "", bankAccount: s.bankAccount || "", bankIfsc: s.bankIfsc || "",
  };
}

function validate(f: Form, takenSr: Set<string>): Errors {
  const e: Errors = {};
  const optMobile = (k: Key) => {
    const v = f[k] as string;
    if (v && !MOBILE.test(v)) e[k] = "Enter a 10-digit number, or leave it empty.";
  };
  const optDigits = (k: Key, n: number) => {
    const v = (f[k] as string).replace(/\s/g, "");
    if (v && !new RegExp(`^\\d{${n}}$`).test(v)) e[k] = `Enter ${n} digits, or leave it empty.`;
  };
  // Student
  if (!f.name.trim()) e.name = "Enter the student's full name.";
  if (!f.dob) e.dob = "Choose the date of birth.";
  else if (f.dob > todayIso()) e.dob = "Date of birth can't be in the future.";
  optDigits("aadhaarNo", 12);
  // Class and register
  if (!f.section) e.section = "Choose a section.";
  if (!f.srNo.trim()) e.srNo = "Enter the SR number.";
  else if (takenSr.has(f.srNo.trim())) e.srNo = "This SR number is already used.";
  if (!f.admissionDate) e.admissionDate = "Choose the admission date.";
  optDigits("penNo", 11);
  // Family
  if (!f.fatherName.trim()) e.fatherName = "Enter the father's or guardian's name.";
  if (!MOBILE.test(f.mobile)) e.mobile = "Enter a 10-digit mobile number starting with 6, 7, 8 or 9.";
  if (!f.motherName.trim()) e.motherName = "Enter the mother's name.";
  optMobile("motherMobile");
  optMobile("guardianMobile");
  optDigits("fatherAadhaar", 12);
  optDigits("motherAadhaar", 12);
  optDigits("janAadhaar", 10);
  if (f.fatherEmail && !/^\S+@\S+\.\S+$/.test(f.fatherEmail)) e.fatherEmail = "Enter a valid email, or leave it empty.";
  // Address and bus
  optDigits("pincode", 6);
  if (f.transport && !f.busRoute) e.busRoute = "Choose a bus route, or turn the bus off.";
  optMobile("emergencyMobile");
  // Bank
  if (f.bankIfsc && !/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(f.bankIfsc.trim())) e.bankIfsc = "IFSC has 11 characters, like SBIN0001234.";
  return e;
}

/** Which tab a field lives on, to jump to the first mistake. */
const TAB_OF: Partial<Record<Key, TabKey>> = {
  name: "student", dob: "student", aadhaarNo: "student",
  section: "class", srNo: "class", admissionDate: "class", penNo: "class",
  fatherName: "family", mobile: "family", motherName: "family", motherMobile: "family", guardianMobile: "family",
  fatherAadhaar: "family", motherAadhaar: "family", janAadhaar: "family", fatherEmail: "family",
  pincode: "address", busRoute: "address", emergencyMobile: "address",
  bankIfsc: "docs",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Everyone already enrolled: used for the next SR/admission numbers, sections, routes, houses and the sibling search. */
  students: Student[];
  onSaved: (s: Student) => void;
  onOpenProfile: (s: Student) => void;
  /** When set, the drawer edits this student instead of admitting a new one (the full record is loaded here). */
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
  const [saved, setSaved] = useState<SavedStudent | null>(null);
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<TabKey>("student");
  const firstRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  // The photo is picked here and saved together with the student: `data` is a new photo waiting to be
  // saved, `removed` means the current photo should be taken off.
  const [photo, setPhoto] = useState<{ data: string | null; removed: boolean }>({ data: null, removed: false });
  const photoRef = useRef<HTMLInputElement>(null);
  // Edit: the list has no admission details, so the full record is loaded before the form can be used.
  const [full, setFull] = useState<StudentFull | null>(null);
  const [load, setLoad] = useState<{ state: "ready" | "loading" | "error"; error?: string }>({ state: "ready" });
  const loadingId = useRef<string | null>(null);
  const [routes, setRoutes] = useState<BusRoute[] | null>(null);
  const [siblings, setSiblings] = useState<SiblingRef[]>([]);
  const [sibQuery, setSibQuery] = useState("");
  // Document scans waiting to be saved with the form: a data URL to add, or null to take the scan off.
  const [scans, setScans] = useState<Record<string, string | null>>({});
  const [scanLinks, setScanLinks] = useState<Record<string, string> | null>(null);
  const [viewing, setViewing] = useState<{ title: string; src: string } | null>(null);
  const [scanBusy, setScanBusy] = useState<string | null>(null);
  const scanRef = useRef<HTMLInputElement>(null);
  const scanKey = useRef("");

  useEffect(() => setMounted(true), []);

  // Routes and their stops, as Transport keeps them.
  useEffect(() => {
    if (!isOpen || routes) return;
    transportService.list().then((r) => setRoutes(r.routes || []));
  }, [isOpen, routes]);

  // What the school already uses, so the form offers real choices.
  const lookups = useMemo(() => {
    const sectionsByClass = new Map<string, Set<string>>();
    const stopsByRoute = new Map<string, Set<string>>();
    const houses = new Set<string>();
    for (const s of students) {
      if (!sectionsByClass.has(s.class)) sectionsByClass.set(s.class, new Set());
      sectionsByClass.get(s.class)!.add(s.section);
      if (s.transportOpted && s.busRoute) {
        if (!stopsByRoute.has(s.busRoute)) stopsByRoute.set(s.busRoute, new Set());
        if (s.busStop) stopsByRoute.get(s.busRoute)!.add(s.busStop);
      }
      if (s.house) houses.add(s.house);
    }
    for (const r of routes || []) {
      if (!stopsByRoute.has(r.name)) stopsByRoute.set(r.name, new Set());
      for (const st of r.stops || []) if (st?.name) stopsByRoute.get(r.name)!.add(st.name);
    }
    return {
      classes: CLASS_ORDER.filter((c) => sectionsByClass.has(c)).concat(Array.from(sectionsByClass.keys()).filter((c) => !CLASS_ORDER.includes(c))),
      sectionsOf: (c: string) => Array.from(sectionsByClass.get(c) || new Set(["A"])).sort(),
      routes: Array.from(stopsByRoute.keys()).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
      stopsOf: (r: string) => Array.from(stopsByRoute.get(r) || []).sort(),
      houses: Array.from(houses).sort(),
      takenSr: new Set(students.filter((s) => s.id !== editing?.id).map((s) => s.srNo)),
      nextSr: `SR-2026-${nextNumber(students.map((s) => s.srNo), 1001)}`,
      nextAdm: `ADM-${nextNumber(students.map((s) => s.admissionNo), 1)}`,
    };
  }, [students, editing?.id, routes]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadFull = async (id: string) => {
    loadingId.current = id;
    setLoad({ state: "loading" });
    const r = await studentService.fetchStudentFull(id);
    if (loadingId.current !== id) return; // closed or switched student meanwhile
    if (!r.data) return setLoad({ state: "error", error: r.error || "Could not load the student." });
    setFull(r.data);
    setForm(fromStudent(r.data));
    setSiblings(r.data.siblings || []);
    setLoad({ state: "ready" });
  };

  const start = (keepClass?: string) => {
    const cls = keepClass || lookups.classes[0] || "1st";
    const fresh = { srNo: lookups.nextSr, admissionNo: lookups.nextAdm };
    setFull(null);
    loadingId.current = null;
    setLoad({ state: "ready" });
    if (editing && !keepClass) {
      setForm(fromStudent(editing));
      loadFull(editing.id);
    } else if (prefill && !keepClass) {
      const pc = prefill.class && lookups.classes.includes(prefill.class) ? prefill.class : cls;
      setForm({ ...blank(pc), ...prefill, class: pc, section: lookups.sectionsOf(pc)[0] || "", ...fresh });
    } else setForm({ ...blank(cls), section: lookups.sectionsOf(cls)[0] || "", ...fresh });
    setErrors({});
    setTried(false);
    setServerError(null);
    setSaved(null);
    setPhoto({ data: null, removed: false });
    setTab("student");
    setSiblings([]);
    setSibQuery("");
    setScans({});
    setScanLinks(null);
    setViewing(null);
    setTimeout(() => firstRef.current?.focus(), 50);
  };

  useEffect(() => {
    if (isOpen) start();
    else loadingId.current = null;
  }, [isOpen, editing?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen) return;
    // Capture phase + stopPropagation: Esc closes this form only, not the profile drawer underneath.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      if (viewing) setViewing(null);
      else if (!saving) onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [isOpen, onClose, saving, viewing]);

  const set = <K extends Key>(key: K, value: Form[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "class") next.section = lookups.sectionsOf(value as string)[0] || "";
      if (key === "busRoute" || (key === "transport" && !value)) next.busStop = "";
      if (tried) setErrors(validate(next, lookups.takenSr));
      return next;
    });
  };

  const goTab = (t: TabKey) => {
    setTab(t);
    bodyRef.current?.scrollTo({ top: 0 });
  };

  const feeCfg = useFeeConfig();
  const plan = planFor(feeCfg, { cls: form.class, bus: form.transport, newAdmission: true });
  const fees = { total: plan.gross };
  const busYear = feeCfg.transport.amounts.reduce((s, x) => s + x, 0);
  const docsGiven = DOCS.filter((d) => form.documents[d.key]).length;
  const checklist: { label: string; done: boolean; tab: TabKey }[] = [
    { label: "Student's name", done: !!form.name.trim(), tab: "student" },
    { label: "Date of birth", done: !!form.dob, tab: "student" },
    { label: "Class and section", done: !!form.class && !!form.section, tab: "class" },
    { label: "Admission date", done: !!form.admissionDate, tab: "class" },
    { label: "Father's name", done: !!form.fatherName.trim(), tab: "family" },
    { label: "Mother's name", done: !!form.motherName.trim(), tab: "family" },
    { label: "Parent mobile", done: MOBILE.test(form.mobile), tab: "family" },
    { label: "Home address", done: !!form.address.trim(), tab: "address" },
    { label: `Documents (${docsGiven} of ${DOCS.length})`, done: docsGiven === DOCS.length, tab: "docs" },
  ];
  const tabHasError = (t: TabKey) => (Object.keys(errors) as Key[]).some((k) => TAB_OF[k] === t);

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
    contact: form.motherMobile,
    mobile: form.mobile,
    address: form.address,
    penNo: form.penNo,
    gender: form.gender as Student["gender"],
    dob: form.dob,
    category: form.category as Student["category"],
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
  // Aadhaar, Jan Aadhaar and bank details: the backend sends them only to the office. On an edit, if they did
  // not come back, the boxes are hidden and nothing is sent, so a save can't blank them.
  const canPrivate = !editing || (!!full && "aadhaarNo" in full);
  const formReady = !editing || load.state === "ready";

  const onPhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = await cropPhoto(file);
      if (data) setPhoto({ data, removed: false });
    } catch (err: any) {
      toast(err?.message || "Could not use this photo.", "error");
    }
  };

  /* ---------- document scans ---------- */
  const hasScan = (key: string) => (key in scans ? scans[key] !== null : !!full?.documentScans?.includes(key));
  const pickScan = (key: string) => {
    scanKey.current = key;
    scanRef.current?.click();
  };
  const onScanFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    const key = scanKey.current;
    if (!file || !key) return;
    setScanBusy(key);
    try {
      const data = await shrinkDocument(file);
      setScans((s) => ({ ...s, [key]: data }));
      set("documents", { ...form.documents, [key]: true });
    } catch (err: any) {
      toast(err?.message || "Could not use this scan.", "error");
    } finally {
      setScanBusy(null);
    }
  };
  const viewScan = async (key: string, title: string) => {
    const pending = scans[key];
    if (pending) return setViewing({ title, src: pending });
    if (!editing) return;
    let links = scanLinks;
    if (!links) {
      setScanBusy(key);
      const r = await studentDocumentService.list(editing.id);
      setScanBusy(null);
      if (r.error) return toast(r.error, "error");
      links = r.files;
      setScanLinks(links);
    }
    if (links[key]) setViewing({ title, src: links[key] });
    else toast("This scan could not be found. Add it again.", "error");
  };
  const removeScan = (key: string) =>
    setScans((s) => {
      const next = { ...s };
      if (full?.documentScans?.includes(key)) next[key] = null;
      else delete next[key];
      return next;
    });

  /** After the student is saved: store a new photo, or take the old one off. A photo problem never undoes the save. */
  const withPhoto = async <T extends Student>(st: T): Promise<T> => {
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

  /** Then the document scans; again a failure is reported but never undoes the save. */
  const withScans = async (st: Student) => {
    const failed: string[] = [];
    for (const [key, data] of Object.entries(scans)) {
      const r = data ? await studentDocumentService.set(st.id, key, data) : await studentDocumentService.remove(st.id, key);
      if (!r.success) failed.push(DOCS.find((d) => d.key === key)?.label || key);
    }
    if (failed.length) toast(`${st.name} is saved, but these scans were not: ${failed.join(", ")}. Try again from Edit.`, "error");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formReady) return;
    setTried(true);
    const found = validate(form, lookups.takenSr);
    setErrors(found);
    const firstBad = Object.keys(found)[0] as Key | undefined;
    if (firstBad) {
      const t = TAB_OF[firstBad];
      if (t && t !== tab) goTab(t);
      setTimeout(() => document.getElementById(`adm-${firstBad}`)?.focus(), 30);
      return;
    }
    setSaving(true);
    setServerError(null);

    const f = form;
    const t = (v: string) => v.trim();
    const nospace = (v: string) => v.replace(/\s/g, "");
    const details = {
      nameHi: t(f.nameHi), birthPlace: t(f.birthPlace), religion: f.religion, caste: t(f.caste), nationality: t(f.nationality),
      motherTongue: f.motherTongue, bloodGroup: f.bloodGroup, healthNotes: t(f.healthNotes), cwsn: f.cwsn, idMark: t(f.idMark),
      medium: f.medium, admissionDate: f.admissionDate, shalaDarpanId: t(f.shalaDarpanId), admissionType: f.admissionType, rte: f.rte,
      prevSchool: t(f.prevSchool), prevBoard: f.prevSchool.trim() ? f.prevBoard : "", prevClass: f.prevClass, prevYear: f.prevYear, prevResult: t(f.prevResult),
      tcNo: t(f.tcNo), tcDate: f.tcDate, leavingReason: t(f.leavingReason),
      fatherOccupation: t(f.fatherOccupation), fatherEducation: f.fatherEducation, fatherEmail: t(f.fatherEmail),
      motherMobile: f.motherMobile, motherOccupation: t(f.motherOccupation), motherEducation: f.motherEducation,
      whatsappTo: f.whatsappTo, familyIncome: f.familyIncome, bpl: f.bpl, guardianRelation: t(f.guardianRelation), guardianMobile: f.guardianMobile,
      city: t(f.city), tehsil: t(f.tehsil), district: t(f.district), pincode: f.pincode, lettersAddress: f.sameLetters ? "" : t(f.lettersAddress),
      emergencyName: t(f.emergencyName), emergencyRelation: t(f.emergencyRelation), emergencyMobile: f.emergencyMobile,
      busStop: f.transport ? t(f.busStop) : "",
      documents: f.documents,
      ...(canPrivate
        ? {
            aadhaarNo: nospace(f.aadhaarNo), fatherAadhaar: nospace(f.fatherAadhaar), motherAadhaar: nospace(f.motherAadhaar), janAadhaar: nospace(f.janAadhaar),
            bankHolder: t(f.bankHolder), bankAccount: nospace(f.bankAccount), bankIfsc: t(f.bankIfsc).toUpperCase(),
          }
        : {}),
    };
    const siblingIds = siblings.map((s) => s.id);
    const siblingsChanged = editing ? siblingIds.slice().sort().join() !== (full?.siblings || []).map((s) => s.id).sort().join() : siblingIds.length > 0;

    if (editing) {
      const res = await studentService.updateStudent(editing.id, {
        srNo: t(f.srNo),
        admissionNo: t(f.admissionNo),
        penNo: t(f.penNo),
        name: t(f.name),
        gender: f.gender as Student["gender"],
        dob: f.dob,
        category: f.category as Student["category"],
        class: f.class,
        section: f.section,
        rollNo: f.rollNo,
        house: f.house as Student["house"],
        fatherName: t(f.fatherName),
        motherName: t(f.motherName),
        guardianName: t(f.guardianName) || t(f.fatherName),
        mobile: f.mobile,
        contact: f.motherMobile || f.mobile,
        address: t(f.address),
        transportOpted: f.transport,
        busRoute: f.transport ? f.busRoute : undefined,
        ...details,
        ...(siblingsChanged ? { siblingIds } : {}),
      });
      const done = res.success && res.data ? await withPhoto(res.data) : null;
      if (done) await withScans(done);
      setSaving(false);
      if (!done) {
        setServerError(res.error || "Could not save the changes.");
        return;
      }
      if (done.detailsSaved === false) toast(DETAILS_NOT_SAVED, "info");
      onUpdated?.(done);
      return;
    }

    const res = await studentService.createStudent({
      srNo: t(f.srNo),
      admissionNo: t(f.admissionNo) || t(f.srNo),
      penNo: t(f.penNo) || undefined,
      name: t(f.name),
      gender: f.gender as Student["gender"],
      dob: f.dob || undefined,
      category: f.category as Student["category"],
      class: f.class,
      section: f.section,
      classSec: `${f.class} - ${f.section}`,
      rollNo: f.rollNo || undefined,
      house: (f.house || undefined) as Student["house"] | undefined,
      fatherName: t(f.fatherName),
      motherName: t(f.motherName),
      guardianName: t(f.guardianName) || t(f.fatherName),
      mobile: f.mobile,
      contact: f.motherMobile || f.mobile,
      address: t(f.address),
      transportOpted: f.transport,
      busRoute: f.transport ? f.busRoute : undefined,
      status: "Active",
      ...details,
      ...(siblingsChanged ? { siblingIds } : {}),
    });
    const done = res.success && res.data ? await withPhoto(res.data) : null;
    if (done) await withScans(done);
    setSaving(false);
    if (!done) {
      setServerError(res.error || "Could not save the admission.");
      return;
    }
    setSaved(done);
    onSaved(done);
  };

  if (!mounted || !isOpen) return null;

  const err = (k: Key) => (errors[k] ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15" : "");
  const schoolName = schoolProfile.school_name || "School";
  const schoolShort = schoolProfile.short_name || "SPS";

  /* ---------- small field builders, all on the shared Field + .field styles ---------- */
  const text = (
    k: Key,
    label: string,
    o: { required?: boolean; hint?: string; placeholder?: string; num?: boolean; max?: number; type?: string; upper?: boolean; mono?: boolean; wide?: boolean; inputRef?: React.Ref<HTMLInputElement> } = {}
  ) => (
    <Field id={`adm-${k}`} label={label} required={o.required} hint={o.hint} error={errors[k]} className={o.wide ? "sm:col-span-2" : ""}>
      <input
        ref={o.inputRef}
        id={`adm-${k}`}
        type={o.type || "text"}
        inputMode={o.num ? "numeric" : undefined}
        maxLength={o.max}
        placeholder={o.placeholder}
        value={form[k] as string}
        onChange={(e) => set(k, (o.num ? e.target.value.replace(/[^\d ]/g, "") : o.upper ? e.target.value.toUpperCase() : e.target.value) as never)}
        aria-invalid={!!errors[k]}
        autoComplete="off"
        className={`field w-full ${o.mono || o.num ? "font-mono" : ""} ${err(k)}`}
      />
    </Field>
  );
  const select = (k: Key, label: string, options: string[], o: { empty?: string; required?: boolean; hint?: string; wide?: boolean } = {}) => (
    <Field id={`adm-${k}`} label={label} required={o.required} hint={o.hint} error={errors[k]} className={o.wide ? "sm:col-span-2" : ""}>
      <select id={`adm-${k}`} value={form[k] as string} onChange={(e) => set(k, e.target.value as never)} className={`field w-full ${err(k)}`}>
        {o.empty !== undefined && <option value="">{o.empty}</option>}
        {options.map((x) => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </select>
    </Field>
  );
  const phone = (k: Key, label: string, o: { required?: boolean; hint?: string } = {}) => (
    <Field id={`adm-${k}`} label={label} required={o.required} hint={o.hint} error={errors[k]}>
      <PhoneInput id={`adm-${k}`} value={form[k] as string} onChange={(v) => set(k, v as never)} invalid={!!errors[k]} />
    </Field>
  );
  const segmented = (k: Key, label: string, options: [string, string][], wide?: boolean) => (
    <Field id={`adm-${k}`} label={label} className={wide ? "sm:col-span-2" : ""}>
      <div id={`adm-${k}`} role="radiogroup" className="grid gap-1 rounded-xl bg-slate-100 p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map(([value, text]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={form[k] === value}
            onClick={() => set(k, value as never)}
            className={`truncate rounded-lg px-1 py-2 text-sm font-semibold transition ${form[k] === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            {text}
          </button>
        ))}
      </div>
    </Field>
  );
  const toggle = (k: Key, title: string, note?: string) => (
    <div className="flex items-center justify-between gap-4 sm:col-span-2">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800">{title}</p>
        {note && <p className="text-xs text-slate-500">{note}</p>}
      </div>
      <Switch on={!!form[k]} label={title} onClick={() => set(k, !form[k] as never)} />
    </div>
  );
  const more = (title: string, open: boolean, children: React.ReactNode) => (
    <details className="group border-t border-dashed border-slate-200 pt-3 sm:col-span-2" open={open || undefined}>
      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[13px] font-semibold text-brand-700 hover:text-brand-800 [&::-webkit-details-marker]:hidden">
        <Plus className="h-4 w-4 transition-transform group-open:rotate-45" />
        {title}
      </summary>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </details>
  );

  const stops = lookups.stopsOf(form.busRoute);
  const sibTerm = sibQuery.trim().toLowerCase();
  const linked = new Set([editing?.id || "", ...siblings.map((s) => s.id)]);
  const sibFound =
    sibTerm.length >= 2
      ? students
          .filter((s) => !linked.has(s.id) && [s.name, s.srNo, s.fatherName, s.mobile, s.contact].some((v) => (v || "").toLowerCase().includes(sibTerm)))
          .slice(0, 8)
      : [];
  // Children already in the school on the same main mobile: most likely brothers and sisters.
  const sameMobile = MOBILE.test(form.mobile) && !sibTerm ? students.filter((s) => !linked.has(s.id) && s.mobile === form.mobile).slice(0, 4) : [];
  const addSibling = (s: Student) => {
    setSiblings((x) => [...x, { id: s.id, name: s.name, classSec: s.classSec, fatherName: s.fatherName, srNo: s.srNo }]);
    setSibQuery("");
  };

  const VIEWS: Record<TabKey, () => React.ReactNode> = {
    student: () => (
      <>
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
              <p className="text-xs text-slate-500">Shows on the ID card, report card and parent app.</p>
            </div>
            <input ref={photoRef} type="file" accept="image/*" onChange={onPhotoFile} className="hidden" />
          </div>
          {text("name", "Full name", { required: true, placeholder: "e.g. Aryan Singh Rathore", inputRef: firstRef })}
          {text("nameHi", "Name in Hindi", { placeholder: "आरव सिंह राठौड़", hint: "For TC and certificates" })}
          {segmented("gender", "Gender", [
            ["Male", "Boy"],
            ["Female", "Girl"],
            ["Other", "Other"],
          ])}
          {text("dob", "Date of birth", { required: true, type: "date", hint: ageOn1April(form.dob) ? `Age on 1 April: ${ageOn1April(form.dob)}` : undefined })}
          {text("birthPlace", "Place of birth", { placeholder: "Barmer" })}
          {canPrivate && text("aadhaarNo", "Aadhaar number", { num: true, max: 14, placeholder: "12 digits", hint: "Optional" })}
        </Section>

        <Section title="Identity">
          {select("religion", "Religion", RELIGIONS)}
          {text("caste", "Caste")}
          {select("category", "Category", CATEGORIES)}
          {text("nationality", "Nationality")}
          {select("motherTongue", "Mother tongue", TONGUES)}
        </Section>

        <Section title="Health">
          {select("bloodGroup", "Blood group", BLOOD, { empty: "Not known" })}
          {more(
            "Health details (allergy, illness, special needs)",
            !!(form.healthNotes || form.cwsn || form.idMark),
            <>
              {text("healthNotes", "Allergy or illness to know about", { placeholder: "e.g. asthma, peanut allergy", wide: true })}
              {toggle("cwsn", "Child with special needs (CWSN)", "Counted in UDISE+")}
              {text("idMark", "Identification mark", { placeholder: "e.g. mole on left cheek", wide: true })}
            </>
          )}
        </Section>
      </>
    ),

    class: () => (
      <>
        <Section title="Class">
          <Field id="adm-class" label="Class" required>
            <select id="adm-class" value={form.class} onChange={(e) => set("class", e.target.value)} className="field w-full">
              {lookups.classes.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          {select("section", "Section", lookups.sectionsOf(form.class), { required: true })}
          {segmented("medium", "Medium", [
            ["Hindi", "Hindi"],
            ["English", "English"],
          ])}
          <Field id="adm-rollNo" label="Roll no." hint="Optional">
            <input id="adm-rollNo" inputMode="numeric" value={form.rollNo} onChange={(e) => set("rollNo", e.target.value.replace(/\D/g, ""))} className="field w-full font-mono" />
          </Field>
          {select("house", "House", lookups.houses, { empty: "Not yet", hint: "Optional" })}
        </Section>

        <Section title="Register">
          {text("srNo", "SR no.", { required: true, mono: true, hint: editing ? undefined : "Next number in the register" })}
          {text("admissionNo", "Admission no.", { mono: true })}
          {text("admissionDate", "Admission date", { required: true, type: "date" })}
          <Field id="adm-session" label="Session">
            <input id="adm-session" readOnly tabIndex={-1} value="2026-27" className="field w-full" />
          </Field>
          {text("penNo", "PEN (UDISE+)", { num: true, max: 11, hint: "11 digits, if the child has one" })}
          {text("shalaDarpanId", "Shala Darpan ID", { mono: true, hint: "From the old school, if any" })}
        </Section>

        <Section title="Admission type">
          {segmented(
            "admissionType",
            "Type",
            [
              ["New admission", "New admission"],
              ["Re-admission", "Re-admission"],
              ["Transfer", "Transfer"],
            ],
            true
          )}
          {toggle("rte", "Admitted under RTE (25% seat)", "Give the RTE concession in Fee setup")}
        </Section>
      </>
    ),

    old: () => (
      <>
        <Section title="Last school" note="Leave empty for Nursery or a first school">
          {text("prevSchool", "School name", { placeholder: "Saraswati Vidya Mandir, Barmer", wide: true })}
          {select("prevBoard", "Board", BOARDS)}
          {select("prevClass", "Last class passed", PREV_CLASSES, { empty: "—" })}
          {text("prevYear", "Year passed", { num: true, max: 4 })}
          {text("prevResult", "Result / %", { placeholder: "Pass, 82%" })}
        </Section>
        <Section title="Transfer certificate (TC)">
          {text("tcNo", "TC number", { mono: true })}
          {text("tcDate", "TC date", { type: "date" })}
          {text("leavingReason", "Reason for leaving", { placeholder: "e.g. family moved to Barmer", wide: true })}
        </Section>
      </>
    ),

    family: () => (
      <>
        <Section title="Father" note="Fee receipts, absence alerts and the parent app use the main mobile">
          {text("fatherName", "Father's name", { required: true })}
          {phone("mobile", "Main mobile", { required: true })}
          {text("fatherOccupation", "Occupation")}
          {select("fatherEducation", "Education", EDUCATION, { empty: "—" })}
          {more(
            canPrivate ? "Father's Aadhaar and email" : "Father's email",
            !!(form.fatherAadhaar || form.fatherEmail || errors.fatherAadhaar || errors.fatherEmail),
            <>
              {canPrivate && text("fatherAadhaar", "Aadhaar number", { num: true, max: 14 })}
              {text("fatherEmail", "Email", { type: "email" })}
            </>
          )}
        </Section>

        <Section title="Mother">
          {text("motherName", "Mother's name", { required: true })}
          {phone("motherMobile", "Mobile", { hint: "Optional" })}
          {text("motherOccupation", "Occupation")}
          {select("motherEducation", "Education", EDUCATION, { empty: "—" })}
          {canPrivate && more("Mother's Aadhaar", !!(form.motherAadhaar || errors.motherAadhaar), text("motherAadhaar", "Aadhaar number", { num: true, max: 14 }))}
        </Section>

        <Section title="WhatsApp messages go to">
          {segmented(
            "whatsappTo",
            "Number",
            [
              ["Father", "Father"],
              ["Mother", "Mother"],
              ["Both", "Both"],
            ],
            true
          )}
        </Section>

        <Section title="Family details">
          {select("familyIncome", "Yearly income", INCOME, { empty: "—" })}
          {canPrivate && text("janAadhaar", "Jan Aadhaar (family ID)", { num: true, max: 12, placeholder: "10 digits" })}
          {toggle("bpl", "BPL family")}
          {more(
            "Guardian (if the child doesn't live with parents)",
            !!(form.guardianName || form.guardianMobile || form.guardianRelation || errors.guardianMobile),
            <>
              {text("guardianName", "Guardian's name", { wide: true })}
              {text("guardianRelation", "Relation", { placeholder: "e.g. Uncle" })}
              {phone("guardianMobile", "Mobile")}
            </>
          )}
        </Section>

        <Section title="Brother or sister in this school" note="Links them as one family in the register">
          <div className="space-y-3 sm:col-span-2">
            {siblings.length > 0 && (
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {siblings.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 px-3 py-2">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900">
                        {s.name} <span className="font-normal text-slate-500">· {s.classSec}</span>
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        <span className="font-mono">{s.srNo}</span>
                        {s.fatherName ? ` · ${s.fatherName}` : ""}
                      </span>
                    </span>
                    <button type="button" onClick={() => setSiblings((x) => x.filter((y) => y.id !== s.id))} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-600" aria-label={`Remove ${s.name}`}>
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="adm-sibling"
                aria-label="Find brother or sister"
                value={sibQuery}
                onChange={(e) => setSibQuery(e.target.value)}
                placeholder="Find by name, SR no., father or mobile"
                autoComplete="off"
                className="field w-full pl-9"
              />
            </div>
            {(sibFound.length > 0 || sameMobile.length > 0) && (
              <div>
                {sameMobile.length > 0 && <p className="mb-1.5 text-xs text-slate-500">Same main mobile as this form</p>}
                <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
                  {(sibFound.length ? sibFound : sameMobile).map((s) => (
                    <li key={s.id}>
                      <button type="button" onClick={() => addSibling(s)} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-900">
                            {s.name} <span className="font-normal text-slate-500">· {s.classSec}</span>
                          </span>
                          <span className="block truncate text-xs text-slate-500">
                            {s.fatherName ? `${s.gender === "Female" ? "D/o" : "S/o"} ${s.fatherName}` : s.srNo} · {s.mobile}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-brand-700">
                          <Plus className="h-4 w-4" />
                          Link
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {sibTerm.length >= 2 && sibFound.length === 0 && <p className="text-[13px] text-slate-500">No student found.</p>}
          </div>
        </Section>
      </>
    ),

    address: () => (
      <>
        <Section title="Home address">
          <Field id="adm-address" label="House no., street, area" className="sm:col-span-2">
            <textarea id="adm-address" rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="e.g. 12, Gandhi Chowk, Station Road" className="field w-full" />
          </Field>
          {text("city", "Village / city")}
          {text("tehsil", "Tehsil")}
          {text("district", "District")}
          {text("pincode", "PIN code", { num: true, max: 6 })}
          {toggle("sameLetters", "Address for letters is the same", "Turn off to add a second address")}
          {!form.sameLetters && (
            <Field id="adm-lettersAddress" label="Address for letters" className="sm:col-span-2">
              <textarea id="adm-lettersAddress" rows={2} value={form.lettersAddress} onChange={(e) => set("lettersAddress", e.target.value)} className="field w-full" />
            </Field>
          )}
        </Section>

        <section className="card p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">School bus</h3>
              <p className="text-[13px] text-slate-500">{editing ? "Changing this here does not change the fee." : `Adds ${inr(busYear)} bus fee for the session.`}</p>
            </div>
            <Switch on={form.transport} label="Student will use the school bus" onClick={() => set("transport", !form.transport)} />
          </div>
          {form.transport && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {select("busRoute", "Bus route", lookups.routes, { empty: routes ? "Choose a route" : "Loading routes…", required: true })}
              {form.busRoute &&
                (stops.length ? select("busStop", "Stop", stops, { empty: "Choose a stop" }) : text("busStop", "Stop", { hint: "This route has no stops in Transport yet" }))}
            </div>
          )}
        </section>

        <Section title="In an emergency, call">
          {text("emergencyName", "Name")}
          {text("emergencyRelation", "Relation")}
          {phone("emergencyMobile", "Mobile")}
        </Section>
      </>
    ),

    docs: () => (
      <>
        <section className="card p-5">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3">
            <h3 className="text-sm font-semibold text-slate-900">Papers received</h3>
            <p className="text-xs text-slate-500">Tick what the parent gave. You can add the rest later.</p>
          </div>
          <ul className="divide-y divide-slate-100">
            {DOCS.map((d) => {
              const on = !!form.documents[d.key];
              const scanned = hasScan(d.key);
              const pending = d.key in scans;
              return (
                <li key={d.key} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2.5">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => set("documents", { ...form.documents, [d.key]: !on })}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition ${on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white"}`}>
                      {on && <Check className="h-3 w-3" strokeWidth={3.5} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-slate-800">{d.label}</span>
                      {(d.note || pending) && (
                        <span className="block text-xs text-slate-500">{pending ? (scans[d.key] ? "New scan, saved with the form" : "Scan will be removed when you save") : d.note}</span>
                      )}
                    </span>
                  </button>
                  {canPrivate && (
                    <span className="ml-auto flex shrink-0 items-center gap-1">
                      {scanBusy === d.key ? (
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      ) : scanned ? (
                        <>
                          <button type="button" onClick={() => viewScan(d.key, d.label)} className="rounded-md px-2 py-1 text-[13px] font-semibold text-brand-700 hover:bg-brand-50">
                            View
                          </button>
                          <button type="button" onClick={() => pickScan(d.key)} className="rounded-md px-2 py-1 text-[13px] font-semibold text-slate-600 hover:bg-slate-100">
                            Replace
                          </button>
                          <button type="button" onClick={() => removeScan(d.key)} className="rounded-md px-2 py-1 text-[13px] font-semibold text-slate-600 hover:bg-slate-100 hover:text-rose-600">
                            Remove
                          </button>
                        </>
                      ) : (
                        <>
                          {pending && (
                            <button type="button" onClick={() => removeScan(d.key)} className="rounded-md px-2 py-1 text-[13px] font-semibold text-slate-600 hover:bg-slate-100">
                              Undo
                            </button>
                          )}
                          <button type="button" onClick={() => pickScan(d.key)} className="btn btn-secondary btn-sm">
                            <Upload className="h-3.5 w-3.5" />
                            Add scan
                          </button>
                        </>
                      )}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          <input ref={scanRef} type="file" accept="image/*" onChange={onScanFile} className="hidden" />
        </section>

        {canPrivate ? (
          <Section title="Bank account for scholarship">
            {more(
              "Add bank account",
              !!(form.bankHolder || form.bankAccount || form.bankIfsc || errors.bankIfsc),
              <>
                {text("bankHolder", "Account holder", { wide: true })}
                {text("bankAccount", "Account no.", { num: true, max: 20 })}
                {text("bankIfsc", "IFSC", { max: 11, upper: true, mono: true })}
              </>
            )}
          </Section>
        ) : (
          <p className="text-[13px] text-slate-500">Aadhaar, Jan Aadhaar, bank details and document scans are shown to the office (admin, accountant) only.</p>
        )}
      </>
    ),
  };

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
              {saved.detailsSaved === false && (
                <div className="alert alert-amber mt-4 text-left" role="status">
                  <span>{DETAILS_NOT_SAVED}</span>
                </div>
              )}
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
            {/* Sections of the form: one tab each, so the drawer stays short */}
            <nav className="shrink-0 border-b border-slate-300/50 bg-white px-3 sm:px-4" aria-label="Form sections">
              <div className="scroll-row -mb-px gap-0" role="tablist">
                {TABS.map((t) => {
                  const on = tab === t.key;
                  const bad = tried && tabHasError(t.key);
                  return (
                    <button
                      key={t.key}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => goTab(t.key)}
                      className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-3 text-[13.5px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${on ? "border-brand-600 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                    >
                      {t.label}
                      {bad && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" aria-label="has a mistake" />}
                    </button>
                  );
                })}
              </div>
            </nav>

            <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto">
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-5">
                  {serverError && (
                    <div className="alert alert-rose" role="alert">
                      <span>{serverError}</span>
                    </div>
                  )}

                  {editing && load.state === "loading" ? (
                    <div className="card space-y-4 p-5" aria-busy="true">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="skeleton h-10 w-full" />
                      ))}
                    </div>
                  ) : editing && load.state === "error" ? (
                    <div className="card px-6 py-10 text-center text-sm">
                      <p className="font-semibold text-slate-800">Could not load {editing.name}&rsquo;s full record</p>
                      <p className="mt-1 text-slate-500">{load.error}</p>
                      <button type="button" onClick={() => loadFull(editing.id)} className="btn btn-secondary btn-sm mt-3">
                        Try again
                      </button>
                    </div>
                  ) : (
                    VIEWS[tab]()
                  )}
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

                    <div className="card p-2">
                      <ul>
                        {checklist.map((c) => (
                          <li key={c.label}>
                            <button type="button" onClick={() => goTab(c.tab)} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] hover:bg-slate-50">
                              {c.done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-slate-300" />}
                              <span className={c.done ? "text-slate-700" : "text-slate-400"}>{c.label}</span>
                            </button>
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
                <button type="submit" disabled={saving || !formReady} className="btn btn-primary min-w-[150px]">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? "Saving…" : editing ? "Save changes" : "Save admission"}
                </button>
              </span>
            </footer>
          </>
        )}

        {/* A document scan, over the form */}
        {viewing && (
          <div className="absolute inset-0 z-10 flex flex-col bg-night-950/80 animate-fadeIn" role="dialog" aria-label={viewing.title}>
            <div className="flex h-14 shrink-0 items-center justify-between px-5 text-white">
              <span className="text-sm font-semibold">{viewing.title}</span>
              <button type="button" onClick={() => setViewing(null)} className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white" aria-label="Close scan">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-5 pt-0" onClick={() => setViewing(null)}>
              <img src={viewing.src} alt={viewing.title} className="mx-auto max-w-full rounded-lg bg-white" onClick={(e) => e.stopPropagation()} />
            </div>
          </div>
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

function Switch({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onClick} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-brand-600" : "bg-slate-200"}`}>
      <span className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${on ? "translate-x-5" : ""}`} />
    </button>
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
