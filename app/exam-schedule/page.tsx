"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Printer,
  Download,
  Award,
  Search,
  CheckCircle2,
  Clock,
  ArrowLeft
} from "lucide-react";

interface ScheduleSlot {
  date: string;
  day: string;
  timing: string;
  class10th: string;
  class12thSci: string;
  class12thComm: string;
}

export default function ExamSchedulePage() {
  const [selectedExam, setSelectedExam] = useState("Pre-Board Examination Term 1");

  const SCHEDULE: ScheduleSlot[] = [
    { date: "25 Sept 2026", day: "Friday", timing: "08:30 AM - 11:30 AM", class10th: "Mathematics (041)", class12thSci: "Physics (042)", class12thComm: "Accountancy (055)" },
    { date: "28 Sept 2026", day: "Monday", timing: "08:30 AM - 11:30 AM", class10th: "English Lang & Lit (184)", class12thSci: "Chemistry (043)", class12thComm: "Business Studies (054)" },
    { date: "30 Sept 2026", day: "Wednesday", timing: "08:30 AM - 11:30 AM", class10th: "Science (086)", class12thSci: "Mathematics (041)", class12thComm: "Economics (030)" },
    { date: "03 Oct 2026", day: "Saturday", timing: "08:30 AM - 11:30 AM", class10th: "Social Science (087)", class12thSci: "English Core (301)", class12thComm: "English Core (301)" },
    { date: "06 Oct 2026", day: "Tuesday", timing: "08:30 AM - 11:30 AM", class10th: "Hindi Course A (002)", class12thSci: "Physical Education (048)", class12thComm: "Physical Education (048)" }
  ];

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
            <span className="text-slate-800 font-semibold">Exam Schedule & Green Sheet</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Official Examination Date Sheet (Green Sheet)
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Subject timetable schedule, student reporting hours, and room allotment date sheet for board classes
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
            <span>Print Green Sheet</span>
          </button>
        </div>
      </div>

      {/* Select Exam Dropdown */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-slate-700">Select Exam:</span>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="p-1.5 border border-slate-300 rounded font-bold bg-white text-slate-900"
          >
            <option>Pre-Board Examination Term 1</option>
            <option>Half Yearly Assessment 2026</option>
            <option>Periodic Assessment Test 1 (PT-1)</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-500 font-semibold">
          Timing: <strong className="text-slate-800">08:30 AM to 11:30 AM</strong> (Reporting: 08:00 AM)
        </div>
      </div>

      {/* Green Sheet Style Schedule Table */}
      <div className="bg-white rounded-lg border-2 border-emerald-500 shadow-sm overflow-hidden">
        <div className="bg-[#26b99a] p-4 text-white text-center space-y-1">
          <h2 className="text-base font-black uppercase tracking-wider">
            MOTHER TERESA NOBLES ACADEMY SR. SEC. SCHOOL, BARMER
          </h2>
          <p className="text-xs font-semibold text-emerald-100">
            Official Examination Schedule / Date Sheet • Academic Session 2026-2027
          </p>
          <div className="text-[11px] font-bold text-amber-200 uppercase tracking-widest pt-1">
            {selectedExam}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-50 border-b border-emerald-200 text-[11px] font-black text-emerald-900 uppercase tracking-wider">
                <th className="p-3 border-r border-emerald-200">Date & Day</th>
                <th className="p-3 border-r border-emerald-200">Paper Timing</th>
                <th className="p-3 border-r border-emerald-200">Class 10th</th>
                <th className="p-3 border-r border-emerald-200">Class 12th (Science)</th>
                <th className="p-3">Class 12th (Commerce)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {SCHEDULE.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                    <div>{s.date}</div>
                    <span className="text-[10px] text-slate-400 font-normal uppercase">{s.day}</span>
                  </td>
                  <td className="p-3 text-slate-600 font-mono border-r border-slate-200 whitespace-nowrap">
                    {s.timing}
                  </td>
                  <td className="p-3 font-bold text-slate-900 border-r border-slate-200 bg-slate-50/50">
                    {s.class10th}
                  </td>
                  <td className="p-3 font-bold text-blue-900 border-r border-slate-200">
                    {s.class12thSci}
                  </td>
                  <td className="p-3 font-bold text-purple-900">
                    {s.class12thComm}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[11px] text-slate-600 gap-2">
          <div className="space-y-0.5">
            <span className="font-bold block text-slate-800">Important Instructions:</span>
            <span>1. Students must carry their Admit Cards and school ID daily.</span>
            <span className="block">2. Calculators and electronic gadgets are strictly banned in the examination hall.</span>
          </div>
          <div className="text-right sm:text-center shrink-0">
            <span className="font-bold text-slate-800 block">Exam Cell Incharge</span>
            <span className="text-[10px] text-slate-400">Mother Teresa Nobles Academy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
