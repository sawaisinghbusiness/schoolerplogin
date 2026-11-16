"use client";

import React, { useState } from "react";
import { Bus, ChevronDown, MapPin, Phone, School } from "lucide-react";
import { Student } from "@/data/mockData";
import { initials } from "@/components/ui/Avatar";
import { useSchoolProfile } from "@/components/providers/SchoolProfileProvider";
import "./student-identity.css";

const dob = (value?: string) => value ? new Date(value + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/** A working identity summary. Printed school cards have their own document layout. */
export function StudentCard({ student: s, schoolName }: { student: Student; schoolName: string; schoolShort: string }) {
  const { schoolProfile } = useSchoolProfile();
  const [failedLogo, setFailedLogo] = useState<string | null>(null);
  const logo = schoolProfile.logo_url;
  return (
    <section className="student-identity overflow-hidden !rounded-[6px] border border-[#F2D4D4] bg-white" aria-label={`${s.name}, identity summary`}>
      <div className="student-identity-school">
        {logo && failedLogo !== logo ? <img src={logo} alt="" className="student-identity-logo" onError={() => setFailedLogo(logo)} /> : <School size={26} className="shrink-0 text-slate-500" aria-hidden />}
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-600" title={schoolName}>{schoolName}</span>
        <span className={`shrink-0 text-[11px] font-medium ${s.status === "Inactive" ? "text-slate-500" : "text-emerald-700"}`}>{s.status === "Inactive" ? "Left school" : "Active student"}</span>
      </div>
      <div className="student-identity-body">
        <div className="student-identity-person">
        {s.photoUrl ? <img src={s.photoUrl} alt="" className="student-identity-photo object-cover object-[50%_22%]" /> : <span className="student-identity-photo grid place-items-center bg-slate-50 text-lg font-medium text-slate-500" aria-hidden>{initials(s.name)}</span>}
        <div className="min-w-0 flex-1">
          <h3 className="student-identity-name" title={s.name}>{s.name}</h3>
          <p className="student-identity-class">Class {s.classSec}{s.rollNo ? ` · Roll ${s.rollNo}` : ""}</p>
        </div>
        </div>
        <dl className="student-identity-facts">
          <Field label="SR no." value={s.srNo || "—"} />
          <Field label="Admission no." value={s.admissionNo || "—"} />
          <Field label="Date of birth" value={dob(s.dob)} />
        </dl>
      </div>
      <details className="group border-t border-slate-100">
        <summary className="flex min-h-[42px] cursor-pointer list-none items-center justify-between px-4 text-xs font-medium text-slate-600 [&::-webkit-details-marker]:hidden">Family &amp; contact details<ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden /></summary>
        <div className="space-y-3 px-4 pb-4">
          <dl className="grid grid-cols-2 gap-4"><Field label="Father" value={s.fatherName || "—"} /><Field label="Mother" value={s.motherName || "—"} /></dl>
          <p className="flex items-center gap-2 text-sm text-slate-700"><Phone className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />{s.mobile ? <a href={`tel:${s.mobile}`} className="font-medium tabular-nums text-brand-700 hover:underline">{s.mobile}</a> : "No phone recorded"}{s.contact && s.contact !== s.mobile && <span className="tabular-nums text-slate-500">· {s.contact}</span>}</p>
          <p className="flex items-start gap-2 text-sm text-slate-600"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden /><span>{s.address || "No address recorded"}</span></p>
          <p className="flex items-center gap-2 text-sm text-slate-600"><Bus className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />{s.transportOpted ? s.busRoute || "School bus" : "Own transport"}</p>
        </div>
      </details>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="text-[11px] text-slate-500">{label}</dt><dd className="mt-0.5 break-words text-[13px] font-medium text-slate-800">{value}</dd></div>;
}
