"use client";

import React from "react";
import { FileBarChart2, Download, Calendar } from "lucide-react";

export default function ReportsAttendancePage() {
  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <FileBarChart2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Admin Reports</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Attendance Analytics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Institutional Attendance Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quarterly and annual attendance logs for CBSE inspection compliance and student audit
          </p>
        </div>

        <button
          onClick={() => alert("Downloading Institutional Attendance Audit Report (.xlsx)...")}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs text-center">
          <div className="text-slate-500">Average Student Attendance</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">94.8%</div>
          <div className="text-[10px] text-slate-400">Current Session 2026-27</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs text-center">
          <div className="text-slate-500">Average Staff Presence</div>
          <div className="text-2xl font-black text-blue-600 mt-1">96.2%</div>
          <div className="text-[10px] text-slate-400">68 Full-Time Employees</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs text-center">
          <div className="text-slate-500">Chronic Absentees (&lt; 75%)</div>
          <div className="text-2xl font-black text-rose-600 mt-1">12 Scholars</div>
          <div className="text-[10px] text-rose-500 font-semibold">Parent Intimation Sent</div>
        </div>
      </div>
    </div>
  );
}
