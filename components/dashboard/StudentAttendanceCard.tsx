"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight
} from "lucide-react";

export function StudentAttendanceCard() {
  const [markedToday, setMarkedToday] = useState(false);

  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between h-full">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">
              Student Attendance
            </h3>
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-0.5">
              <Clock className="w-3 h-3" />
              <span>{currentDate}</span>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/admin"
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
          title="Open Student Attendance Module"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      {/* Body Content */}
      <div className="p-5 sm:p-6 space-y-5 flex-1 flex flex-col justify-center">
        {!markedToday ? (
          <>
            {/* Status Alert Banner */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-lg flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-amber-900">
                  No Attendance Taken
                </div>
                <div className="text-[11px] text-amber-700 mt-0.5">
                  Attendance has not yet been submitted for any class today.
                </div>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-600">Daily Submission Progress</span>
                <span className="text-slate-400 font-mono">0% (0 / 32 Sections)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: "0%" }}
                />
              </div>
            </div>

            {/* Statistics Summary */}
            <div className="grid grid-cols-3 gap-2 text-center py-2 bg-slate-50 rounded-lg border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                  Total Enrolled
                </span>
                <span className="text-base font-bold text-slate-800 font-mono">1,924</span>
              </div>
              <div className="border-x border-slate-200">
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                  Classes
                </span>
                <span className="text-base font-bold text-slate-800 font-mono">14</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                  Sections
                </span>
                <span className="text-base font-bold text-slate-800 font-mono">32</span>
              </div>
            </div>
          </>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-3">
            <div className="flex items-center space-x-2 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="font-bold text-sm">Attendance In Progress</div>
            </div>
            <div className="text-xs text-emerald-700">
              Sample attendance batch updated. 1,842 students verified present, 82 absentees notified via SMS.
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={() => setMarkedToday(!markedToday)}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          {markedToday ? "Reset to Unmarked State" : "Simulate Bulk Mark"}
        </button>

        <Link
          href="/search-student"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold transition-colors"
        >
          <span>Mark Class Attendance</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
