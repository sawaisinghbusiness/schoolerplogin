"use client";

import React, { useState } from "react";
import { Award, Save, CheckCircle2, Search } from "lucide-react";
import { MOCK_STUDENTS } from "@/data/mockData";

export default function ExamResultsPage() {
  const [saved, setSaved] = useState(false);
  const [marks, setMarks] = useState<Record<string, number>>({
    "STU-001": 74,
    "STU-002": 78,
    "STU-003": 69,
    "STU-004": 72,
    "STU-005": 80,
    "STU-006": 65,
    "STU-007": 71,
    "STU-008": 76,
  });

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manage Exams</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Marks Entry Ledger</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Examination Marks Entry & Result Compilation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Input marks out of 80/100, calculate CBSE normalized grades, and lock final ledger
          </p>
        </div>

        <button
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 4000); }}
          className="inline-flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Marks Ledger</span>
        </button>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">Marks ledger saved! Report cards updated and SMS notifications queued.</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4 w-12 text-center">Roll</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Class - Section</th>
              <th className="py-3 px-4">Theory Marks (Max 80)</th>
              <th className="py-3 px-4">CBSE Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {MOCK_STUDENTS.map((s) => {
              const currentM = marks[s.id] || 70;
              const grade = currentM >= 72 ? "A1" : currentM >= 65 ? "A2" : "B1";
              return (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">{s.rollNo}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                  <td className="py-3 px-4 font-mono">{s.classSec}</td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      max={80}
                      min={0}
                      value={currentM}
                      onChange={(e) => setMarks({ ...marks, [s.id]: Number(e.target.value) })}
                      className="w-24 p-1.5 border border-slate-300 rounded font-mono font-bold text-xs"
                    />
                  </td>
                  <td className="py-3 px-4 font-bold font-mono text-emerald-700">{grade}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
