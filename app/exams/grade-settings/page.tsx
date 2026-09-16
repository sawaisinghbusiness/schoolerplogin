"use client";

import React, { useState } from "react";
import { Sliders, Save, CheckCircle2 } from "lucide-react";

export default function GradeSettingsPage() {
  const [saved, setSaved] = useState(false);

  const GRADES = [
    { grade: "A1", min: 91, max: 100, point: 10.0, desc: "Top 1/8th of passed candidates (Outstanding)" },
    { grade: "A2", min: 81, max: 90, point: 9.0, desc: "Next 1/8th of passed candidates (Excellent)" },
    { grade: "B1", min: 71, max: 80, point: 8.0, desc: "Next 1/8th of passed candidates (Very Good)" },
    { grade: "B2", min: 61, max: 70, point: 7.0, desc: "Next 1/8th of passed candidates (Good)" },
    { grade: "C1", min: 51, max: 60, point: 6.0, desc: "Next 1/8th of passed candidates (Fair)" },
    { grade: "C2", min: 41, max: 50, point: 5.0, desc: "Next 1/8th of passed candidates (Average)" },
    { grade: "D", min: 33, max: 40, point: 4.0, desc: "Passing Threshold Grade" },
    { grade: "E", min: 0, max: 32, point: 0.0, desc: "Essential Repeat / Compartment" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manage Exams</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">CBSE Grading Matrix</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            CBSE 9-Point Grading System Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure percentage brackets, grade points (GP), and qualitative remarks for report cards
          </p>
        </div>

        <button
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}
          className="inline-flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Grade Rules</span>
        </button>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">Grading rules synchronized to report card generator!</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4">Grade</th>
              <th className="py-3 px-4">Marks Range (%)</th>
              <th className="py-3 px-4">Grade Point</th>
              <th className="py-3 px-4">Qualitative Remark</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {GRADES.map((g, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-base text-emerald-700">{g.grade}</td>
                <td className="py-3 px-4 font-mono font-bold">{g.min}% - {g.max}%</td>
                <td className="py-3 px-4 font-mono text-slate-900">{g.point.toFixed(1)}</td>
                <td className="py-3 px-4 text-slate-600">{g.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
