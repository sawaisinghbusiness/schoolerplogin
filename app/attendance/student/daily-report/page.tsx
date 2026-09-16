"use client";

import React from "react";
import { CalendarCheck, Download, FileSpreadsheet } from "lucide-react";

export default function StudentDailyReportPage() {
  const reports = [
    { classSec: "12th - PCM", total: 48, present: 45, absent: 3, percentage: "93.75%" },
    { classSec: "12th - COMM", total: 42, present: 39, absent: 3, percentage: "92.85%" },
    { classSec: "11th - PCM", total: 50, present: 46, absent: 4, percentage: "92.00%" },
    { classSec: "10th - A", total: 54, present: 52, absent: 2, percentage: "96.29%" },
    { classSec: "10th - B", total: 52, present: 48, absent: 4, percentage: "92.30%" },
    { classSec: "9th - A", total: 51, present: 49, absent: 2, percentage: "96.07%" },
    { classSec: "9th - B", total: 49, present: 47, absent: 2, percentage: "95.91%" },
    { classSec: "8th - A", total: 46, present: 44, absent: 2, percentage: "95.65%" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Student Attendance</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Executive Daily Report</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Daily Institutional Attendance Summary
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Class-by-class attendance turnout percentages, absentee headcounts, and SMS dispatch status
          </p>
        </div>

        <button
          onClick={() => alert("Downloading Daily Attendance Summary Excel Sheet...")}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Summary (.xlsx)</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4">Class & Section</th>
              <th className="py-3 px-4">Enrolled Students</th>
              <th className="py-3 px-4 text-emerald-400">Present Turnout</th>
              <th className="py-3 px-4 text-rose-400">Absentees</th>
              <th className="py-3 px-4">Turnout Ratio</th>
              <th className="py-3 px-4 text-center">SMS Delivery</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {reports.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.classSec}</td>
                <td className="py-3 px-4 font-mono">{r.total}</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-700">{r.present}</td>
                <td className="py-3 px-4 font-mono font-bold text-rose-600">{r.absent}</td>
                <td className="py-3 px-4 font-bold">{r.percentage}</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                    Dispatched
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
