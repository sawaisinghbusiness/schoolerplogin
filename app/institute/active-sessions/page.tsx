"use client";

import React, { useState } from "react";
import { Calendar, CheckCircle2, AlertCircle, Plus, ShieldCheck } from "lucide-react";

export default function ActiveSessionsPage() {
  const [sessions, setSessions] = useState([
    { code: "26-27", name: "Academic Year 2026-2027", start: "01 Apr 2026", end: "31 Mar 2027", status: "Active (Current)", students: 1924 },
    { code: "25-26", name: "Academic Year 2025-2026", start: "01 Apr 2025", end: "31 Mar 2026", status: "Archived", students: 1810 },
    { code: "24-25", name: "Academic Year 2024-2025", start: "01 Apr 2024", end: "31 Mar 2025", status: "Archived", students: 1740 },
    { code: "23-24", name: "Academic Year 2023-2024", start: "01 Apr 2023", end: "31 Mar 2024", status: "Archived", students: 1620 },
    { code: "22-23", name: "Academic Year 2022-2023", start: "01 Apr 2022", end: "31 Mar 2023", status: "Archived", students: 1515 },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Institute Details</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Active Sessions</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Academic Session Lifecycles
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Switch institutional working years, configure annual rollover dates, and lock archived sessions
          </p>
        </div>

        <button
          onClick={() => alert("Creating next academic session schema...")}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Session (27-28)</span>
        </button>
      </div>

      <div className="space-y-3">
        {sessions.map((ses) => (
          <div
            key={ses.code}
            className={`p-4 rounded-xl border transition-all ${
              ses.code === "26-27"
                ? "bg-emerald-50/40 border-emerald-300 shadow-xs"
                : "bg-white border-slate-200"
            } flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
                ses.code === "26-27"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600"
              }`}>
                {ses.code}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">{ses.name}</h3>
                <p className="text-slate-500 text-[11px]">
                  Term Span: {ses.start} to {ses.end} | Enrolled: <strong>{ses.students} Students</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                ses.code === "26-27"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600"
              }`}>
                {ses.status}
              </span>
              {ses.code !== "26-27" && (
                <button
                  onClick={() => alert(`Switching system context to session ${ses.code}...`)}
                  className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 rounded text-slate-700 font-semibold"
                >
                  View Archive
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
