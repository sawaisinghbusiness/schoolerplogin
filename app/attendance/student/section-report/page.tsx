"use client";

import React, { useState } from "react";
import { CalendarCheck, Download, Filter } from "lucide-react";
import { MOCK_STUDENTS } from "@/data/mockData";

export default function StudentSectionReportPage() {
  const [selectedMonth, setSelectedMonth] = useState("September 2026");

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Student Attendance</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Section-Wise Attendance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Section-Wise Cumulative Attendance Register
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Student-by-student working days attendance count and eligibility verification for board exams (CBSE 75% rule)
          </p>
        </div>

        <button
          onClick={() => alert("Downloading Monthly Section Attendance Register (.xlsx)...")}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Register</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4">SR Number</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Working Days</th>
              <th className="py-3 px-4">Days Present</th>
              <th className="py-3 px-4">Attendance %</th>
              <th className="py-3 px-4 text-center">CBSE 75% Criteria</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {MOCK_STUDENTS.map((s, idx) => {
              const present = 22 - (idx % 3);
              const pct = ((present / 24) * 100).toFixed(1);
              return (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{s.srNo}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                  <td className="py-3 px-4 font-mono">24 Days</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">{present} Days</td>
                  <td className="py-3 px-4 font-bold font-mono">{pct}%</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                      Eligible
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
