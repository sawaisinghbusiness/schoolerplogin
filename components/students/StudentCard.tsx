"use client";

import React from "react";
import { Bus, ChevronDown, MapPin, Phone } from "lucide-react";
import { Student } from "@/data/mockData";
import { initials } from "@/components/ui/Avatar";

const dob = (value?: string) => value ? new Date(value + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/** A working identity summary. Printed school cards have their own document layout. */
export function StudentCard({ student: s, schoolName, schoolShort }: { student: Student; schoolName: string; schoolShort: string }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white" aria-label={`${s.name}, identity summary`}>
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-slate-100 text-[10px] font-semibold text-slate-600" aria-hidden>{schoolShort}</span>
        <span className="truncate text-xs font-medium text-slate-600">{schoolName}</span>
        <span className={`ml-auto text-xs font-medium ${s.status === "Inactive" ? "text-slate-500" : "text-emerald-700"}`}>{s.status === "Inactive" ? "Left school" : "Active student"}</span>
      </div>
      <div className="flex items-center gap-4 px-4 py-4">
        {s.photoUrl ? <img src={s.photoUrl} alt="" className="h-[76px] w-[64px] shrink-0 rounded-md border border-slate-200 object-cover" /> : <span className="grid h-[76px] w-[64px] shrink-0 place-items-center rounded-md border border-slate-200 bg-slate-50 text-xl font-medium text-slate-500" aria-hidden>{initials(s.name)}</span>}
        <div className="min-w-0">
          <h3 className="break-words text-xl font-semibold leading-tight text-slate-900">{s.name}</h3>
          <p className="mt-1.5 text-sm text-slate-600">Class {s.classSec}{s.rollNo ? ` · Roll ${s.rollNo}` : ""}</p>
          <p className="mt-1 text-xs text-slate-500">SR no. <span className="font-medium text-slate-700">{s.srNo || "—"}</span></p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-4 border-t border-slate-100 px-4 py-3">
        <Field label="Admission no." value={s.admissionNo || "—"} />
        <Field label="Date of birth" value={dob(s.dob)} />
      </dl>
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