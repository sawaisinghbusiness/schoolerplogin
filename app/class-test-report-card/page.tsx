"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Printer,
  Download,
  Search,
  Filter,
  ArrowLeft
} from "lucide-react";
import { MOCK_STUDENTS } from "@/data/mockData";

export default function ClassTestReportCardPage() {
  const [selectedClass, setSelectedClass] = useState("10th - A");
  const [testMonth, setTestMonth] = useState("September 2026");

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <Award className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Manage Exams</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Class Test Report Card</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Monthly / Weekly Class Test Progress Card
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Progress performance slip for weekly 20/25 mark unit tests distributed to parents during PTM
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/v2/exams"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors"
          >
            ← Exams Hub
          </Link>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print All Slips</span>
          </button>
        </div>
      </div>

      {/* Selectors */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-700">Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-1.5 border border-slate-300 rounded font-bold bg-white text-slate-900"
          >
            <option>10th - A</option>
            <option>10th - B</option>
            <option>9th - A</option>
            <option>12th - PCM</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-700">Test Month:</span>
          <select
            value={testMonth}
            onChange={(e) => setTestMonth(e.target.value)}
            className="p-1.5 border border-slate-300 rounded font-bold bg-white text-slate-900"
          >
            <option>September 2026</option>
            <option>August 2026</option>
            <option>July 2026</option>
          </select>
        </div>
      </div>

      {/* Slips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_STUDENTS.slice(0, 4).map((s) => (
          <div
            key={s.id}
            className="border border-slate-300 rounded-lg p-4 bg-white shadow-xs space-y-3 font-sans"
          >
            <div className="border-b border-slate-200 pb-2 flex justify-between items-start">
              <div>
                <h3 className="font-black text-xs uppercase text-slate-900">
                  Mother Teresa Nobles Academy
                </h3>
                <span className="text-[10px] text-slate-500">Unit Test Scorecard • {testMonth}</span>
              </div>
              <span className="font-mono font-bold text-slate-700 text-xs">Roll {s.rollNo}</span>
            </div>

            <div className="flex justify-between text-[11px] text-slate-700">
              <span>Student: <strong>{s.name}</strong></span>
              <span>Class: <strong>{s.classSec}</strong></span>
            </div>

            <table className="w-full text-left border-collapse text-[10px] border border-slate-200">
              <thead>
                <tr className="bg-slate-50 font-bold border-b border-slate-200">
                  <th className="p-1.5 border-r border-slate-200">Test Subject</th>
                  <th className="p-1.5 text-center border-r border-slate-200">Max</th>
                  <th className="p-1.5 text-center border-r border-slate-200">Obt.</th>
                  <th className="p-1.5 text-center">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr><td className="p-1 border-r border-slate-200">Mathematics</td><td className="p-1 text-center border-r border-slate-200">25</td><td className="p-1 text-center font-bold border-r border-slate-200">23</td><td className="p-1 text-center text-emerald-600 font-bold">Good</td></tr>
                <tr><td className="p-1 border-r border-slate-200">Science</td><td className="p-1 text-center border-r border-slate-200">25</td><td className="p-1 text-center font-bold border-r border-slate-200">21</td><td className="p-1 text-center text-emerald-600 font-bold">Good</td></tr>
                <tr><td className="p-1 border-r border-slate-200">English</td><td className="p-1 text-center border-r border-slate-200">25</td><td className="p-1 text-center font-bold border-r border-slate-200">22</td><td className="p-1 text-center text-emerald-600 font-bold">Good</td></tr>
              </tbody>
            </table>

            <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500">
              <span>Class Teacher Sign: ________</span>
              <span>Parent Signature: ________</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
