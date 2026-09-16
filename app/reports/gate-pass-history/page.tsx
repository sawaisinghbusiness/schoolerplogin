"use client";

import React from "react";
import { Ticket, Download } from "lucide-react";

export default function GatePassHistoryPage() {
  const passes = [
    { passId: "GP-891042", student: "Aarav Sharma", classSec: "10th - A", time: "11:30 AM", date: "15 Sep 2026", escort: "Father (Rajesh Sharma)", reason: "Medical indisposition / clinic visit", status: "Cleared Gate" },
    { passId: "GP-891041", student: "Diya Rathore", classSec: "9th - B", time: "10:15 AM", date: "14 Sep 2026", escort: "Mother (Meenakshi Rathore)", reason: "Family function travel", status: "Cleared Gate" },
    { passId: "GP-891040", student: "Vikram Choudhary", classSec: "12th - PCM", time: "01:00 PM", date: "12 Sep 2026", escort: "Self (Senior student)", reason: "District Sports Trial", status: "Cleared Gate" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Ticket className="w-3.5 h-3.5 text-emerald-600" />
            <span>Admin Reports</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Campus Exit Logs</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Gate Pass Dispatch & Security Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time security log of authorized early departures for students and faculty members
          </p>
        </div>

        <button
          onClick={() => alert("Downloading Gate Pass Security Logs...")}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Security Logs</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4">Pass ID</th>
              <th className="py-3 px-4">Student & Class</th>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Escort Person</th>
              <th className="py-3 px-4">Exit Reason</th>
              <th className="py-3 px-4 text-center">Security Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {passes.map((p, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.passId}</td>
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900">{p.student}</div>
                  <div className="text-[11px] text-slate-400">{p.classSec}</div>
                </td>
                <td className="py-3 px-4 text-slate-600 font-mono">{p.date} • {p.time}</td>
                <td className="py-3 px-4">{p.escort}</td>
                <td className="py-3 px-4 text-slate-500 italic">{p.reason}</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                    {p.status}
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
