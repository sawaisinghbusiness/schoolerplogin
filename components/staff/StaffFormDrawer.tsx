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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
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

  const save = async () => {
    if (f.name.trim().length < 2) return setError("Enter the full name.");
    if (!/^[6-9]\d{9}$/.test(f.mobile)) return setError("Enter a 10-digit mobile number.");
    if (!f.designation.trim()) return setError("Choose or type a designation.");
    setBusy(true);
    setError(null);
    const input: StaffInput = { ...f, experienceYears: f.experienceYears === "" ? null : Number(f.experienceYears) };
    const r = staff ? await staffService.update(staff.id, input) : await staffService.create(input);
    setBusy(false);
    if (r.error || !r.data) return setError(r.error || "Could not save.");
    onSaved(r.data);
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      busy={busy}
      width="max-w-[640px]"
      title={staff ? `Edit ${staff.name}` : "Add staff"}
      subtitle={staff ? `${staff.empCode} · ${staff.designation}` : "Teachers and office staff"}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary ml-auto">Cancel</button>
          <button type="button" onClick={save} disabled={busy} className="btn btn-primary">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {staff ? "Save changes" : "Add staff"}
          </button>
        </>
      }
    >
      <div className="space-y-4 p-5">
        {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100">{error}</p>}

        <section className="card space-y-4 p-4">
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1" role="radiogroup" aria-label="Staff type">
            {([["teaching", "Teaching"], ["non_teaching", "Non-teaching"]] as [StaffType, string][]).map(([t, label]) => (
              <button key={t} type="button" role="radio" aria-checked={f.staffType === t} onClick={() => setType(t)} className={`flex-1 rounded-lg px-3 py-1.5 text-[13px] font-semibold ${f.staffType === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
            <Field id="st-name" label="Full name">
              <input id="st-name" value={f.name} onChange={set("name")} className="field w-full" maxLength={150} placeholder="e.g. Sunita Sharma" />
            </Field>
            <Field id="st-code" label="Employee code">
              <input id="st-code" value={f.empCode} onChange={(e) => setF((x) => ({ ...x, empCode: e.target.value.toUpperCase() }))} disabled={!!staff} className="field w-full font-mono" maxLength={30} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="st-desig" label="Designation">
              <input id="st-desig" list="st-desig-list" value={f.designation} onChange={set("designation")} className="field w-full" maxLength={100} placeholder={f.staffType === "teaching" ? "e.g. TGT" : "e.g. Office Clerk"} />
              <datalist id="st-desig-list">
                {DESIGNATIONS[f.staffType].map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </Field>
            <Field id="st-dept" label="Department" hint={f.staffType === "teaching" ? "e.g. Science, Primary wing" : "e.g. Office, Transport"}>
              <input id="st-dept" value={f.department} onChange={set("department")} className="field w-full" maxLength={100} />
            </Field>
          </div>
        </section>

        <section className="card grid gap-4 p-4 sm:grid-cols-2">
          <Field id="st-mobile" label="Mobile">
            <input id="st-mobile" inputMode="numeric" maxLength={10} value={f.mobile} onChange={(e) => setF((x) => ({ ...x, mobile: e.target.value.replace(/\D/g, "") }))} className="field w-full tabular-nums" />
          </Field>
          <Field id="st-alt" label="Other mobile (optional)">
            <input id="st-alt" inputMode="numeric" maxLength={10} value={f.altMobile} onChange={(e) => setF((x) => ({ ...x, altMobile: e.target.value.replace(/\D/g, "") }))} className="field w-full tabular-nums" />
          </Field>
          <Field id="st-email" label="Email (optional)">
            <input id="st-email" type="email" value={f.email} onChange={set("email")} className="field w-full" maxLength={150} />
          </Field>
          <Field id="st-gender" label="Gender">
            <select id="st-gender" value={f.gender} onChange={set("gender")} className="field w-full">
              <option value="">—</option>
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>
          </Field>
          <Field id="st-dob" label="Date of birth">
            <input id="st-dob" type="date" value={f.dob} onChange={set("dob")} className="field w-full" />
          </Field>
          <Field id="st-join" label="Joined on">
            <input id="st-join" type="date" value={f.joiningDate} onChange={set("joiningDate")} className="field w-full" />
          </Field>
          <Field id="st-qual" label="Qualification">
            <input id="st-qual" value={f.qualification} onChange={set("qualification")} className="field w-full" maxLength={150} placeholder="e.g. M.Sc., B.Ed." />
          </Field>
          <Field id="st-exp" label="Experience before joining (years)">
            <input id="st-exp" type="number" min={0} max={60} value={f.experienceYears} onChange={set("experienceYears")} className="field w-full tabular-nums" />
          </Field>
          <div className="sm:col-span-2">
            <Field id="st-addr" label="Address">
              <textarea id="st-addr" rows={2} value={f.address} onChange={set("address")} className="field w-full" maxLength={300} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field id="st-notes" label="Notes (office only)">
              <textarea id="st-notes" rows={2} value={f.notes} onChange={set("notes")} className="field w-full" maxLength={500} />
            </Field>
          </div>
        </section>
      </div>
    </SideDrawer>
  );
}
