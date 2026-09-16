"use client";

import React from "react";
import { ClipboardList, Download } from "lucide-react";

export default function StaffDailyReportPage() {
  const depts = [
    { dept: "Administration", total: 6, present: 5, absent: 1, ratio: "83.3%" },
    { dept: "Mathematics", total: 12, present: 1, absent: 11, ratio: "8.3%" },
    { dept: "Science", total: 15, present: 2, absent: 13, ratio: "13.3%" },
    { dept: "Languages", total: 14, present: 3, absent: 11, ratio: "21.4%" },
    { dept: "Finance & Accounts", total: 4, present: 1, absent: 3, ratio: "25.0%" },
    { dept: "Physical Education", total: 5, present: 1, absent: 4, ratio: "20.0%" },
    { dept: "IT & Labs", total: 6, present: 1, absent: 5, ratio: "16.6%" },
    { dept: "Transport Staff", total: 6, present: 0, absent: 6, ratio: "0.0%" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
            <span>Staff Attendance</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Department Breakdown</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Staff Daily Attendance Summary (Total: 68 Staff)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Department-wise presence, unpunched biometric status, and pending leave applications
          </p>
        </div>

        <button
          onClick={() => alert("Downloading Staff Attendance Summary...")}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Excel</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Sanctioned Strength</th>
              <th className="py-3 px-4 text-emerald-400">Present Turnout</th>
              <th className="py-3 px-4 text-rose-400">Unmarked / Absent</th>
              <th className="py-3 px-4">Presence Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {depts.map((d, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">{d.dept}</td>
                <td className="py-3 px-4 font-mono">{d.total}</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-700">{d.present}</td>
                <td className="py-3 px-4 font-mono font-bold text-rose-600">{d.absent}</td>
                <td className="py-3 px-4 font-bold">{d.ratio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
