"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Printer,
  Download,
  Calendar,
  Layers,
  ArrowLeft
} from "lucide-react";
import { MOCK_STUDENTS } from "@/data/mockData";

export default function IcseReportCardPage() {
  const [selectedClass, setSelectedClass] = useState("10th - A");

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
            <span className="text-slate-800 font-semibold">ICSE / State Pattern Report Card</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            ICSE & Dual-Pattern Academic Report Cards
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Alternative dual-semester layout featuring distinct internal assessment and theory mark columns
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/report-card"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors"
          >
            ← CBSE Format
          </Link>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print All ICSE Cards</span>
          </button>
        </div>
      </div>

      {/* Selector */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center space-x-3">
        <span className="font-bold text-slate-700">Class:</span>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="p-1.5 border border-slate-300 rounded font-bold bg-white text-slate-900"
        >
          <option>10th - A</option>
          <option>9th - A</option>
          <option>8th - A</option>
        </select>
      </div>

      {/* ICSE Sample Card */}
      <div className="bg-white rounded-lg border-2 border-slate-800 p-6 shadow-xs max-w-3xl space-y-4">
        <div className="text-center border-b-2 border-slate-800 pb-3">
          <h2 className="text-base font-black uppercase text-slate-900">
            MOTHER TERESA NOBLES ACADEMY SR. SEC. SCHOOL
          </h2>
          <p className="text-[10px] text-slate-600">
            Ram Nagar, Barmer • Academic Assessment Statement (Session 2026-2027)
          </p>
          <div className="text-xs font-black uppercase text-blue-900 pt-1">
            SEMESTER I & II CONSOLIDATED STATEMENT
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Candidate Name: <strong>Aarav Sharma</strong></div>
          <div>Roll No: <strong>12</strong></div>
          <div>Registration / SR No: <strong>SR-2024-001</strong></div>
          <div>Class: <strong>10th - A</strong></div>
        </div>

        <table className="w-full text-left border-collapse border border-slate-300 text-xs">
          <thead>
            <tr className="bg-slate-100 font-bold border-b border-slate-300">
              <th className="p-2 border-r border-slate-300">Subject</th>
              <th className="p-2 text-center border-r border-slate-300">Internal (20)</th>
              <th className="p-2 text-center border-r border-slate-300">Theory (80)</th>
              <th className="p-2 text-center border-r border-slate-300">Total (100)</th>
              <th className="p-2 text-center">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono">
            <tr><td className="p-2 font-sans font-semibold border-r border-slate-300">English Language</td><td className="p-2 text-center border-r border-slate-300">18</td><td className="p-2 text-center border-r border-slate-300">70</td><td className="p-2 text-center font-bold border-r border-slate-300">88</td><td className="p-2 text-center font-bold">A</td></tr>
            <tr><td className="p-2 font-sans font-semibold border-r border-slate-300">Mathematics</td><td className="p-2 text-center border-r border-slate-300">20</td><td className="p-2 text-center border-r border-slate-300">76</td><td className="p-2 text-center font-bold border-r border-slate-300">96</td><td className="p-2 text-center font-bold">A+</td></tr>
            <tr><td className="p-2 font-sans font-semibold border-r border-slate-300">Science</td><td className="p-2 text-center border-r border-slate-300">19</td><td className="p-2 text-center border-r border-slate-300">72</td><td className="p-2 text-center font-bold border-r border-slate-300">91</td><td className="p-2 text-center font-bold">A+</td></tr>
            <tr><td className="p-2 font-sans font-semibold border-r border-slate-300">Social Studies</td><td className="p-2 text-center border-r border-slate-300">18</td><td className="p-2 text-center border-r border-slate-300">68</td><td className="p-2 text-center font-bold border-r border-slate-300">86</td><td className="p-2 text-center font-bold">A</td></tr>
          </tbody>
        </table>

        <div className="pt-8 flex justify-between items-end text-xs">
          <span>Date: 16 Sept 2026</span>
          <span className="font-bold text-slate-800">Principal Signature</span>
        </div>
      </div>
    </div>
  );
}
