"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";

interface GradeScale {
  id: string;
  grade: string;
  minMark: number;
  maxMark: number;
  gradePoint: number;
  description: string;
}

export default function GradeSettingPage() {
  const [success, setSuccess] = useState(false);
  const [scale, setScale] = useState<GradeScale[]>([
    { id: "1", grade: "A1", minMark: 91, maxMark: 100, gradePoint: 10.0, description: "Top 1/8th of the passed candidates" },
    { id: "2", grade: "A2", minMark: 81, maxMark: 90, gradePoint: 9.0, description: "Next 1/8th of the passed candidates" },
    { id: "3", grade: "B1", minMark: 71, maxMark: 80, gradePoint: 8.0, description: "Next 1/8th of the passed candidates" },
    { id: "4", grade: "B2", minMark: 61, maxMark: 70, gradePoint: 7.0, description: "Next 1/8th of the passed candidates" },
    { id: "5", grade: "C1", minMark: 51, maxMark: 60, gradePoint: 6.0, description: "Next 1/8th of the passed candidates" },
    { id: "6", grade: "C2", minMark: 41, maxMark: 50, gradePoint: 5.0, description: "Next 1/8th of the passed candidates" },
    { id: "7", grade: "D", minMark: 33, maxMark: 40, gradePoint: 4.0, description: "Eligible for qualifying certificate" },
    { id: "8", grade: "E", minMark: 0, maxMark: 32, gradePoint: 0.0, description: "Essential Repeat / Compartment" }
  ]);

  const handleSave = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

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
            <span className="text-slate-800 font-semibold">Grade Settings</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            CBSE 9-Point Grading Scale Setup
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Configure percentage ranges and grade point values for automated report card evaluations
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/exam-schedule"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors"
          >
            ← Exam Schedule
          </Link>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Grading Scale</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Grading configuration updated and active for all sessions!</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden max-w-3xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="p-3">Grade</th>
              <th className="p-3">Min Marks (%)</th>
              <th className="p-3">Max Marks (%)</th>
              <th className="p-3">Grade Point</th>
              <th className="p-3">CBSE Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {scale.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-black text-slate-900 text-sm">{item.grade}</td>
                <td className="p-3 font-mono font-bold">{item.minMark}%</td>
                <td className="p-3 font-mono font-bold">{item.maxMark}%</td>
                <td className="p-3 font-mono font-black text-[#26b99a]">{item.gradePoint.toFixed(1)}</td>
                <td className="p-3 text-slate-600">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
