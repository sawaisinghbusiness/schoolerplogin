"use client";

import React, { useState } from "react";
import { Award, Plus, CheckCircle2 } from "lucide-react";

export default function ClassTestsPage() {
  const [tests, setTests] = useState([
    { title: "Weekly Test 4 - Quadratic Equations", classSec: "10th - A", subject: "Mathematics", date: "12 Sep 2026", maxMarks: 25, status: "Evaluated" },
    { title: "Weekly Test 3 - Ray Optics", classSec: "12th - PCM", subject: "Physics", date: "10 Sep 2026", maxMarks: 25, status: "Evaluated" },
    { title: "Surprise Quiz - Chemical Bonding", classSec: "11th - PCM", subject: "Chemistry", date: "14 Sep 2026", maxMarks: 20, status: "Marks Entry Pending" },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manage Exams</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Class Tests & Quizzes</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Weekly Class Tests & Continuous Assessments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record regular classroom test scores, dispatch instant marks SMS to parents, and track unit progress
          </p>
        </div>

        <button
          onClick={() => alert("Scheduling new weekly unit test...")}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Class Test</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4">Test Title</th>
              <th className="py-3 px-4">Class - Sec</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Test Date</th>
              <th className="py-3 px-4">Max Marks</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {tests.map((t, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">{t.title}</td>
                <td className="py-3 px-4 font-mono font-semibold">{t.classSec}</td>
                <td className="py-3 px-4 text-emerald-700">{t.subject}</td>
                <td className="py-3 px-4 text-slate-500">{t.date}</td>
                <td className="py-3 px-4 font-mono font-bold">{t.maxMarks} M</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    t.status === "Evaluated" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {t.status}
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
