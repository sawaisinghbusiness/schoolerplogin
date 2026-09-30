"use client";

import React, { useRef, useState } from "react";
import { Bus, MapPin, Phone, RotateCw } from "lucide-react";
import { Student } from "@/data/mockData";
import { initials } from "@/components/ui/Avatar";

const dob = (d?: string) => (d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

/**
 * The student's identity card. Leans toward the pointer, and turns over on click
 * (or Enter/Space) to show the family and contact side.
 */
export function StudentCard({ student: s, schoolName, schoolShort }: { student: Student; schoolName: string; schoolShort: string }) {
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 8, y: px * 10 });
  };

  return (
    <div ref={ref} className="mx-auto max-w-[420px] [perspective:1400px]" onPointerMove={onMove} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
      <div
        className="transition-transform duration-150 ease-out [transform-style:preserve-3d] motion-reduce:!transform-none"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={() => setFlipped((f) => !f)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setFlipped((f) => !f);
            }
          }}
          aria-pressed={flipped}
          aria-label={flipped ? "Show front of student card" : "Show back of student card"}
          className="relative block aspect-[1.586] min-h-[236px] w-full cursor-pointer select-none rounded-2xl text-left transition-transform duration-700 [transform-style:preserve-3d] [transition-timing-function:cubic-bezier(0.3,0.9,0.3,1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marigold-400/40 motion-reduce:duration-0"
          style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
        >
          <Front s={s} schoolName={schoolName} schoolShort={schoolShort} />
          <Back s={s} schoolName={schoolName} />
        </div>
      </div>
      <p className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-slate-500">
        <RotateCw className="h-3.5 w-3.5" />
        Click the card to see the {flipped ? "front" : "back"}
      </p>
    </div>
  );
}

function Front({ s, schoolName, schoolShort }: { s: Student; schoolName: string; schoolShort: string }) {
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl bg-night-900 p-5 text-white shadow-xl [backface-visibility:hidden]">
      {/* A quiet marigold arc in the corner: the school's colour, not decoration for its own sake */}
      <span aria-hidden className="absolute -right-16 -top-16 h-44 w-44 rounded-full border-[18px] border-marigold-400/10" />

      <div className="relative flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-marigold-400 text-[11px] font-extrabold text-night-950">{schoolShort}</span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-[13px] font-bold">{schoolName}</span>
          <span className="block text-[11px] text-night-400">Student card · 2026-27</span>
        </span>
      </div>

      <div className="relative mt-auto flex items-end gap-4 pt-3">
        {s.photoUrl ? (
          <img src={s.photoUrl} alt="" className="h-[84px] w-[70px] shrink-0 rounded-xl object-cover ring-2 ring-white/10" />
        ) : (
          <span aria-hidden className="flex h-[84px] w-[70px] shrink-0 items-center justify-center rounded-xl bg-night-700 text-2xl font-bold text-marigold-300 ring-2 ring-white/10">
            {initials(s.name)}
          </span>
        )}
        <div className="min-w-0 pb-0.5">
          <div className="truncate text-[21px] font-bold leading-tight tracking-tight">{s.name}</div>
          <div className="mt-1.5 flex items-center gap-2 text-[13px]">
            <span className="rounded-md bg-marigold-400 px-2 py-0.5 font-bold text-night-950">{s.classSec}</span>
            {s.rollNo && <span className="text-night-300">Roll {s.rollNo}</span>}
          </div>
        </div>
      </div>

      <dl className="relative mt-4 grid grid-cols-3 gap-3 border-t border-white/10 pt-3 text-[12px]">
        <Field label="SR no." value={s.srNo} />
        <Field label="Admission no." value={s.admissionNo || "—"} />
        <Field label="Date of birth" value={dob(s.dob)} />
      </dl>
    </div>
  );
}

function Back({ s, schoolName }: { s: Student; schoolName: string }) {
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl bg-white p-5 text-slate-900 shadow-xl ring-1 ring-slate-200 [backface-visibility:hidden] [transform:rotateY(180deg)]">
      <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-marigold-400" />
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13px]">
        <BackField label="Father" value={s.fatherName || "—"} />
        <BackField label="Mother" value={s.motherName || "—"} />
      </dl>
      <div className="mt-3 space-y-1.5 text-[13px]">
        <p className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="font-semibold tabular-nums">{s.mobile || "—"}</span>
          {s.contact && s.contact !== s.mobile && <span className="tabular-nums text-slate-500">· {s.contact}</span>}
        </p>
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="line-clamp-2 text-slate-700">{s.address || "—"}</span>
        </p>
        <p className="flex items-center gap-2">
          <Bus className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="text-slate-700">{s.transportOpted ? s.busRoute || "School bus" : "Comes on own"}</span>
        </p>
      </div>
      <p className="mt-auto border-t border-dashed border-slate-200 pt-2.5 text-[11.5px] leading-snug text-slate-500">
        If found, please return to {schoolName}, Barmer.
      </p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-night-400">{label}</dt>
      <dd className="truncate font-semibold tabular-nums text-white">{value}</dd>
    </div>
  );
}

function BackField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="truncate font-semibold">{value}</dd>
    </div>
  );
}
