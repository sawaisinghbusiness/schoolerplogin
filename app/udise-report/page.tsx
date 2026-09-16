"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Printer,
  Search,
  Filter,
  Layers,
  Building,
  CheckCircle2
} from "lucide-react";

interface UdiseClassRow {
  standard: string;
  boys: number;
  girls: number;
  transgender: number;
  total: number;
  general: number;
  obc: number;
  sc: number;
  st: number;
  minority: number;
  cwsn: number;
}

export default function UdiseReportPage() {
  const [session, setSession] = useState("2026-2027");

  const UDISE_ROWS: UdiseClassRow[] = [
    { standard: "Pre-Primary (Play/NUR/KG)", boys: 84, girls: 72, transgender: 0, total: 156, general: 65, obc: 68, sc: 14, st: 9, minority: 8, cwsn: 1 },
    { standard: "Class 1st", boys: 78, girls: 64, transgender: 0, total: 142, general: 60, obc: 62, sc: 12, st: 8, minority: 6, cwsn: 0 },
    { standard: "Class 2nd", boys: 82, girls: 70, transgender: 0, total: 152, general: 63, obc: 66, sc: 15, st: 8, minority: 7, cwsn: 1 },
    { standard: "Class 3rd", boys: 76, girls: 68, transgender: 0, total: 144, general: 58, obc: 64, sc: 14, st: 8, minority: 5, cwsn: 0 },
    { standard: "Class 4th", boys: 80, girls: 74, transgender: 0, total: 154, general: 62, obc: 68, sc: 16, st: 8, minority: 9, cwsn: 0 },
    { standard: "Class 5th", boys: 85, girls: 75, transgender: 0, total: 160, general: 66, obc: 70, sc: 14, st: 10, minority: 8, cwsn: 2 },
    { standard: "Class 6th", boys: 90, girls: 78, transgender: 0, total: 168, general: 70, obc: 74, sc: 15, st: 9, minority: 7, cwsn: 0 },
    { standard: "Class 7th", boys: 88, girls: 76, transgender: 0, total: 164, general: 68, obc: 72, sc: 16, st: 8, minority: 6, cwsn: 1 },
    { standard: "Class 8th", boys: 92, girls: 80, transgender: 0, total: 172, general: 72, obc: 76, sc: 15, st: 9, minority: 8, cwsn: 0 },
    { standard: "Class 9th", boys: 96, girls: 84, transgender: 0, total: 180, general: 75, obc: 80, sc: 16, st: 9, minority: 7, cwsn: 1 },
    { standard: "Class 10th", boys: 94, girls: 82, transgender: 0, total: 176, general: 74, obc: 78, sc: 15, st: 9, minority: 8, cwsn: 1 },
    { standard: "Class 11th", boys: 48, girls: 38, transgender: 0, total: 86, general: 38, obc: 38, sc: 6, st: 4, minority: 4, cwsn: 0 },
    { standard: "Class 12th", boys: 42, girls: 28, transgender: 0, total: 70, general: 32, obc: 30, sc: 5, st: 3, minority: 3, cwsn: 0 }
  ];

  const totalBoys = UDISE_ROWS.reduce((acc, r) => acc + r.boys, 0);
  const totalGirls = UDISE_ROWS.reduce((acc, r) => acc + r.girls, 0);
  const totalStudents = UDISE_ROWS.reduce((acc, r) => acc + r.total, 0);
  const totalGen = UDISE_ROWS.reduce((acc, r) => acc + r.general, 0);
  const totalObc = UDISE_ROWS.reduce((acc, r) => acc + r.obc, 0);
  const totalSc = UDISE_ROWS.reduce((acc, r) => acc + r.sc, 0);
  const totalSt = UDISE_ROWS.reduce((acc, r) => acc + r.st, 0);
  const totalMin = UDISE_ROWS.reduce((acc, r) => acc + r.minority, 0);
  const totalCwsn = UDISE_ROWS.reduce((acc, r) => acc + r.cwsn, 0);

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <FileText className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Extra Features</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">UDISE Report</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Government UDISE+ Institutional Gender & Social Audit
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Format compliance for Ministry of Education UDISE+ Portal (School Code: 1040211 • Barmer District)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors flex items-center space-x-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print UDISE Table</span>
          </button>
          <button className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1">
            <Download className="w-3.5 h-3.5" />
            <span>Export UDISE CSV</span>
          </button>
        </div>
      </div>

      {/* Institutional Metadata Card */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-400 font-mono uppercase">School Affiliation & Details</span>
          <h3 className="font-black text-slate-900 text-sm">
            MOTHER TERESA NOBLES ACADEMY SR. SEC. SCHOOL, BARMER
          </h3>
          <p className="text-slate-500 text-[11px]">
            UDISE Code: <strong className="text-slate-800">08040200114</strong> • School Code: <strong className="text-slate-800">1040211</strong> • Session: <strong className="text-slate-800">{session}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Boys</span>
            <div className="text-lg font-black text-blue-600">{totalBoys}</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Girls</span>
            <div className="text-lg font-black text-rose-600">{totalGirls}</div>
          </div>
          <div className="text-right pl-3 border-l border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Students</span>
            <div className="text-xl font-black text-[#26b99a]">{totalStudents}</div>
          </div>
        </div>
      </div>

      {/* UDISE Matrix Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <th rowSpan={2} className="p-3 border-r border-slate-200">Class / Standard</th>
                <th colSpan={4} className="p-2 border-r border-slate-200 text-center bg-blue-50 text-blue-900">
                  Enrolment by Gender
                </th>
                <th colSpan={5} className="p-2 border-r border-slate-200 text-center bg-emerald-50 text-emerald-900">
                  Social Category Breakdown
                </th>
                <th rowSpan={2} className="p-3 text-center bg-purple-50 text-purple-900">CWSN</th>
              </tr>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-600">
                <th className="p-2 text-center">Boys</th>
                <th className="p-2 text-center">Girls</th>
                <th className="p-2 text-center">Trans</th>
                <th className="p-2 text-center border-r border-slate-200 font-black">Total</th>
                <th className="p-2 text-center">Gen</th>
                <th className="p-2 text-center">OBC</th>
                <th className="p-2 text-center">SC</th>
                <th className="p-2 text-center">ST</th>
                <th className="p-2 text-center border-r border-slate-200">Minority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {UDISE_ROWS.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors text-center">
                  <td className="p-2.5 pl-3 text-left font-bold text-slate-900 border-r border-slate-200">
                    {r.standard}
                  </td>
                  <td className="p-2.5 font-mono text-blue-700 font-semibold">{r.boys}</td>
                  <td className="p-2.5 font-mono text-rose-700 font-semibold">{r.girls}</td>
                  <td className="p-2.5 font-mono text-slate-400">{r.transgender}</td>
                  <td className="p-2.5 font-mono font-black text-slate-900 border-r border-slate-200 bg-slate-50/50">
                    {r.total}
                  </td>
                  <td className="p-2.5 font-mono text-slate-700">{r.general}</td>
                  <td className="p-2.5 font-mono text-slate-700">{r.obc}</td>
                  <td className="p-2.5 font-mono text-slate-700">{r.sc}</td>
                  <td className="p-2.5 font-mono text-slate-700">{r.st}</td>
                  <td className="p-2.5 font-mono text-slate-700 border-r border-slate-200">{r.minority}</td>
                  <td className="p-2.5 font-mono font-bold text-purple-700">{r.cwsn}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300 text-center">
                <td className="p-3 pl-3 text-left border-r border-slate-200">Grand Total (School)</td>
                <td className="p-3 font-mono text-blue-700">{totalBoys}</td>
                <td className="p-3 font-mono text-rose-700">{totalGirls}</td>
                <td className="p-3 font-mono text-slate-400">0</td>
                <td className="p-3 font-mono border-r border-slate-200 text-sm text-[#26b99a]">
                  {totalStudents}
                </td>
                <td className="p-3 font-mono">{totalGen}</td>
                <td className="p-3 font-mono">{totalObc}</td>
                <td className="p-3 font-mono">{totalSc}</td>
                <td className="p-3 font-mono">{totalSt}</td>
                <td className="p-3 font-mono border-r border-slate-200">{totalMin}</td>
                <td className="p-3 font-mono text-purple-700">{totalCwsn}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
