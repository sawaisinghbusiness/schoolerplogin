"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Clock, TriangleAlert } from "lucide-react";

// Order validated for colour-blind separation: never put the blue next to the green.
const SEGMENTS = [
  { key: "Present", count: 1842, color: "#089173" },
  { key: "Absent", count: 68, color: "#E5484D" },
  { key: "On leave", count: 14, color: "#0284C7" },
];
const TOTAL = SEGMENTS.reduce((s, x) => s + x.count, 0);
const SECTIONS_DONE = 30;
const SECTIONS_TOTAL = 32;

export function StudentAttendanceCard() {
  const [hover, setHover] = useState<string | null>(null);
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  const pct = ((SEGMENTS[0].count / TOTAL) * 100).toFixed(1);

  return (
    <section className="flex h-full flex-col rounded-2xl bg-white shadow-card">
      <header className="flex items-start justify-between gap-4 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <CalendarCheck className="h-5 w-5" strokeWidth={1.9} />
          </span>
          <div>
            <h3 className="text-[15px] font-bold text-slate-900">Student attendance</h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              {today}
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11.5px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Live
        </span>
      </header>

      <div className="flex-1 px-5 sm:px-6">
        <div className="flex items-end gap-3">
          <span className="text-4xl font-bold tracking-tight tabular-nums text-slate-900">{pct}%</span>
          <span className="mb-1.5 text-sm text-slate-500">
            {SEGMENTS[0].count.toLocaleString("en-IN")} of {TOTAL.toLocaleString("en-IN")} present
          </span>
        </div>

        {/* Stacked bar with 2px gaps between segments */}
        <div className="relative mt-5 flex h-3 gap-[2px]" role="img" aria-label={SEGMENTS.map((s) => `${s.key} ${s.count}`).join(", ")}>
          {SEGMENTS.map((s, i) => (
            <div
              key={s.key}
              onMouseEnter={() => setHover(s.key)}
              onMouseLeave={() => setHover(null)}
              className={`relative h-full origin-left animate-grow transition-opacity ${i === 0 ? "rounded-l-full" : ""} ${
                i === SEGMENTS.length - 1 ? "rounded-r-full" : ""
              } ${hover && hover !== s.key ? "opacity-40" : ""}`}
              style={{ width: `${Math.max((s.count / TOTAL) * 100, 1.2)}%`, backgroundColor: s.color, animationDelay: `${i * 120}ms` }}
            >
              {hover === s.key && (
                <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg animate-fadeIn">
                  {s.key}: <span className="font-mono font-semibold">{s.count.toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legend doubles as the data table */}
        <dl className="mt-5 grid grid-cols-3 gap-3">
          {SEGMENTS.map((s) => (
            <div
              key={s.key}
              onMouseEnter={() => setHover(s.key)}
              onMouseLeave={() => setHover(null)}
              className="rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100"
            >
              <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.key}
              </dt>
              <dd className="mt-1 text-lg font-bold tabular-nums text-slate-900">{s.count.toLocaleString("en-IN")}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-marigold-50 px-3.5 py-3 text-xs text-marigold-900 ring-1 ring-marigold-100">
          <TriangleAlert className="mt-px h-4 w-4 shrink-0 text-marigold-600" />
          <span>
            <span className="font-semibold">
              {SECTIONS_TOTAL - SECTIONS_DONE} of {SECTIONS_TOTAL} sections not marked yet
            </span>{" "}
            — Class 6-C and Class 11-Arts D. Parents get an absence alert at 11:30 AM.
          </span>
        </div>
      </div>

      <footer className="mt-5 flex items-center justify-between border-t border-slate-100 px-5 py-3.5 sm:px-6">
        <Link href="/attendance/today" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
          Section breakdown
        </Link>
        <Link
          href="/attendance/mark"
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          Mark attendance
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </footer>
    </section>
  );
}
