"use client";

import React, { useState } from "react";
import { Award, Save, CheckCircle2 } from "lucide-react";
import { MOCK_STUDENTS } from "@/data/mockData";

export default function CoScholasticPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manage Exams</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Co-Scholastic Grades</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Co-Scholastic & Life Skills Evaluation (CBSE Part 2)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Grade work education, art education, health & physical fitness, and discipline behavior on a 3-point scale (A, B, C)
          </p>
        </div>

        <button
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}
          className="inline-flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Co-Scholastic Ledger</span>
        </button>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">Co-scholastic skill ratings submitted!</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Class</th>
              <th className="py-3 px-4">Work Education</th>
              <th className="py-3 px-4">Art Education</th>
              <th className="py-3 px-4">Health & Fitness</th>
              <th className="py-3 px-4">Discipline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {MOCK_STUDENTS.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                <td className="py-3 px-4 font-mono">{s.classSec}</td>
                <td className="py-3 px-4">
                  <select defaultValue="A" className="p-1 border border-slate-300 rounded font-bold">
                    <option value="A">Grade A (Outstanding)</option>
                    <option value="B">Grade B (Very Good)</option>
                    <option value="C">Grade C (Fair)</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  <select defaultValue="A" className="p-1 border border-slate-300 rounded font-bold">
                    <option value="A">Grade A</option>
                    <option value="B">Grade B</option>
                    <option value="C">Grade C</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  <select defaultValue="A" className="p-1 border border-slate-300 rounded font-bold">
                    <option value="A">Grade A</option>
                    <option value="B">Grade B</option>
                    <option value="C">Grade C</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  <select defaultValue="A" className="p-1 border border-slate-300 rounded font-bold">
                    <option value="A">Grade A</option>
                    <option value="B">Grade B</option>
                    <option value="C">Grade C</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
