"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
  TrendingUp
} from "lucide-react";

export function StudentAttendanceCard() {
  const [isMarked, setIsMarked] = useState(true);

  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden flex flex-col justify-between h-full hover:border-slate-300 transition-all">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200/80">
            <ClipboardCheck className="w-4 h-4 stroke-[1.8]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Scholar Daily Attendance
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800">
                Live Today
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-0.5">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{currentDate}</span>
            </div>
          </div>
        </div>

        <Link
          href="/daily-attendance-report"
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Open Daily Attendance Report"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      {/* Body Content */}
      <div className="p-5 sm:p-6 space-y-5 flex-1 flex flex-col justify-center">
        {/* Metric Highlights */}
        <div className="grid grid-cols-4 gap-2 text-center p-3 bg-slate-50/70 rounded-xl border border-slate-100 text-xs">
          <div>
            <span className="text-xs uppercase text-slate-400 font-semibold block">Total</span>
            <span className="text-base font-bold text-slate-900 font-mono">1,924</span>
          </div>
          <div>
            <span className="text-xs uppercase text-emerald-600 font-semibold block">Present</span>
            <span className="text-base font-bold text-emerald-600 font-mono">1,842</span>
          </div>
          <div>
            <span className="text-xs uppercase text-rose-500 font-semibold block">Absent</span>
            <span className="text-base font-bold text-rose-600 font-mono">68</span>
          </div>
          <div>
            <span className="text-xs uppercase text-amber-600 font-semibold block">Leave</span>
            <span className="text-base font-bold text-amber-600 font-mono">14</span>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-700 flex items-center space-x-1.5">
              <span>Section Verification Status</span>
              <span className="text-emerald-600 font-mono text-xs bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                93.8% Verified
              </span>
            </span>
            <span className="text-slate-500 font-mono text-xs">30 / 32 Sections</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: "93.8%" }}
              title="Verified Present"
            />
            <div
              className="bg-amber-400 h-full transition-all duration-500"
              style={{ width: "6.2%" }}
              title="Pending Sections"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>2 Sections Pending (Class 6-C, Class 11-Arts D)</span>
            <span className="text-emerald-600 font-medium">Auto-SMS Alert Scheduled 11:30 AM</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
        <Link
          href="/daily-attendance-report"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          View Section Breakdown &rarr;
        </Link>

        <Link
          href="/mark-attendance"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <span>Mark Attendance</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

