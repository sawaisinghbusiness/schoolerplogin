"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { DESIGNATIONS, StaffInput, StaffMember, StaffType, staffService } from "@/lib/services/staffService";

const EMPTY: Required<Omit<StaffInput, "experienceYears">> & { experienceYears: string } = {
  empCode: "",
  name: "",
  staffType: "teaching",
  department: "",
  designation: "",
  mobile: "",
  altMobile: "",
  email: "",
  qualification: "",
  joiningDate: "",
  gender: "",
  dob: "",
  address: "",
  experienceYears: "",
  notes: "",
};

function Field({ id, label, children, hint }: { id: string; label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

/** Add a staff member, or edit one. */
export function StaffFormDrawer({ isOpen, staff, onClose, onSaved }: { isOpen: boolean; staff: StaffMember | null; onClose: () => void; onSaved: (s: StaffMember) => void }) {
  const [f, setF] = useState(EMPTY);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null); setStep(0);
    if (staff) {
      setF({
        empCode: staff.empCode,
        name: staff.name,
        staffType: staff.staffType,
        department: staff.department,
        designation: staff.designation,
        mobile: staff.mobile,
        altMobile: staff.altMobile,
        email: staff.email,
        qualification: staff.qualification,
        joiningDate: staff.joiningDate,
        gender: staff.gender,
        dob: staff.dob,
        address: staff.address,
        experienceYears: staff.experienceYears === null ? "" : String(staff.experienceYears),
        notes: staff.notes,
      });
    } else {
      setF(EMPTY);
      staffService.nextCode().then((code) => setF((x) => (x.empCode ? x : { ...x, empCode: code })));
    }
  }, [isOpen, staff]);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF((x) => ({ ...x, [k]: e.target.value }));
  const setType = (t: StaffType) => setF((x) => ({ ...x, staffType: t, designation: DESIGNATIONS[t].includes(x.designation) || !x.designation ? "" : x.designation }));

  const validate = () => {
    if (step === 0 && f.name.trim().length < 2) { setError("Enter the full name."); document.getElementById("st-name")?.focus(); return false; }
    if (step === 1 && !f.designation.trim()) { setError("Choose or type a designation."); document.getElementById("st-designation")?.focus(); return false; }
    if (step === 2 && !/^[6-9]\d{9}$/.test(f.mobile)) { setError("Enter a 10-digit mobile number."); document.getElementById("st-mobile")?.focus(); return false; }
    if (step === 2 && f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) { setError("Enter a valid email address."); return false; }
    setError(null); return true;
  };
  const save = async () => {
    if (f.name.trim().length < 2) return setError("Enter the full name.");
    if (!/^[6-9]\d{9}$/.test(f.mobile)) return setError("Enter a 10-digit mobile number.");
    if (!f.designation.trim()) return setError("Choose or type a designation.");
    setBusy(true);
    setError(null);
    const input: StaffInput = { ...f, experienceYears: f.experienceYears === "" ? null : Number(f.experienceYears) };
    try {
      const r = staff ? await staffService.update(staff.id, input) : await staffService.create(input);
      if (r.error || !r.data) return setError(r.error || "Could not save.");
      onSaved(r.data);
    } catch {
      setError("Could not save. Your entered details are still here. Try again.");
    } finally {
      setBusy(false);
    }
  };


  const titles = ["Profile", "Job & joining", "Contact", "Review"];
  const descriptions = ["Start with the person joining your school.", "Record their role, joining details and qualifications.", "Add the number your office can reach them on.", "Check the record before adding this staff member."];
  const input = (key: keyof typeof EMPTY, label: string, type = "text", required = false) => <Field id={"st-"+key} label={label+(required ? " *" : "")}><input id={"st-"+key} type={type} value={f[key]} onChange={set(key)} className="field w-full" disabled={key === "empCode" && !!staff} maxLength={key === "name" ? 150 : 150} {...(type === "number" ? {min:0,max:60,step:0.5} : {})} /></Field>;
  return <SideDrawer isOpen={isOpen} onClose={onClose} busy={busy} width="max-w-[720px]" title={staff ? "Edit staff record" : "New staff member"} subtitle={staff ? staff.empCode : "Create a staff record · Required fields marked *"} footer={<>
    <button type="button" disabled={busy} onClick={() => step ? setStep(step-1) : onClose()} className="btn btn-secondary">{step ? "Back" : "Cancel"}</button>
    <span className="mr-auto text-xs text-slate-500">Step {step+1} of 4</span>
    <button type="button" disabled={busy} onClick={() => {if(step<3){if(validate())setStep(step+1)}else void save()}} className="btn btn-primary">{busy && <Loader2 className="h-4 w-4 animate-spin" />}{step<3 ? "Continue" : staff ? "Save changes" : "Create staff record"}</button>
  </>}>
    <div className="bg-white">
      <nav aria-label="Staff onboarding progress" className="grid grid-cols-4 border-b border-slate-200 px-5">{titles.map((title,i)=><div key={title} aria-current={step===i ? "step" : undefined} className={"flex items-center gap-2 border-b-2 py-4 text-xs font-medium "+(step===i?"border-slate-900 text-slate-900":"border-transparent text-slate-500")}><span className={"grid h-6 w-6 shrink-0 place-items-center rounded-full border "+(i<step?"border-green-700 bg-green-700 text-white":"border-slate-300")}>{i<step?"✓":i+1}</span><span>{title}</span></div>)}</nav>
      <div className="p-5 sm:p-7"><h3 className="text-xl font-semibold text-slate-900">{titles[step]}</h3><p className="mb-7 mt-1 text-sm text-slate-500">{descriptions[step]}</p>
      {error && <p role="alert" className="mb-4 border-l-2 border-red-700 pl-3 text-sm text-red-700">{error}</p>}
      {step===0 && <div className="grid gap-5 sm:grid-cols-2"><div className="sm:col-span-2">{input("name","Full name","text",true)}</div>{input("empCode","Employee code")}<p className="self-center text-xs leading-relaxed text-slate-500">A code is suggested automatically. Each staff member needs their own code.</p>{input("dob","Date of birth","date")}<Field id="st-gender" label="Gender (optional)"><select id="st-gender" className="field w-full" value={f.gender} onChange={set("gender")}><option value="">Select gender</option><option>Female</option><option>Male</option><option>Other</option></select></Field></div>}
      {step===1 && <div className="grid gap-5 sm:grid-cols-2"><fieldset className="sm:col-span-2"><legend className="field-label">Staff category</legend><div className="flex gap-5">{(["teaching","non_teaching"] as StaffType[]).map(t=><label key={t} className="flex items-center gap-2 text-sm"><input type="radio" name="staff-category" checked={f.staffType===t} onChange={()=>setType(t)}/>{t==="teaching"?"Teaching":"Non-teaching"}</label>)}</div></fieldset><Field id="st-designation" label="Designation *"><input id="st-designation" list="staff-designations" className="field w-full" value={f.designation} onChange={set("designation")}/><datalist id="staff-designations">{DESIGNATIONS[f.staffType].map(d=><option key={d} value={d}/>)}</datalist></Field>{input("department","Department")}{input("joiningDate","Date of joining","date")}{input("qualification","Qualification")}{input("experienceYears","Previous experience (years)","number")}</div>}
      {step===2 && <div className="grid gap-5 sm:grid-cols-2">{(["mobile","altMobile"] as const).map(k=><Field key={k} id={"st-"+k} label={k==="mobile"?"Mobile number *":"Other mobile (optional)"}><input id={"st-"+k} type="tel" inputMode="numeric" maxLength={10} value={f[k]} onChange={e=>setF(x=>({...x,[k]:e.target.value.replace(/\D/g,"")}))} className="field w-full"/></Field>)}<div className="sm:col-span-2">{input("email","Email (optional)","email")}</div><div className="sm:col-span-2"><Field id="st-address" label="Address"><textarea id="st-address" rows={3} className="field w-full" value={f.address} onChange={set("address")} maxLength={300}/></Field></div></div>}
      {step===3 && <div><dl className="divide-y divide-slate-200">{[["Full name",f.name],["Employee code",f.empCode||"Assigned when saved"],["Category",f.staffType==="teaching"?"Teaching":"Non-teaching"],["Designation",f.designation],["Department",f.department],["Joining date",f.joiningDate],["Mobile",f.mobile],["Email",f.email],["Qualification",f.qualification]].map(([label,value])=><div key={label} className="grid grid-cols-[1fr_1.4fr] gap-4 py-3 text-sm"><dt className="text-slate-500">{label}</dt><dd className="break-words font-medium text-slate-900">{value||"Not provided"}</dd></div>)}</dl><div className="mt-6"><Field id="st-notes" label="Office notes (optional)"><textarea id="st-notes" className="field w-full" rows={2} value={f.notes} onChange={set("notes")} maxLength={500}/></Field></div><p className="mt-5 text-xs leading-relaxed text-slate-500">After creating this record, set up salary, app access and teaching assignments from the staff profile.</p></div>}
      </div>
    </div>
  </SideDrawer>;
}
