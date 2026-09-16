"use client";

import React, { useState } from "react";
import { Award, Plus, Calendar } from "lucide-react";

export default function ManageTermsPage() {
  const [terms, setTerms] = useState([
    { name: "Term 1 (Mid-Term Assessment)", start: "15 Sep 2026", end: "30 Sep 2026", weightage: "40%", status: "Active In-Progress" },
    { name: "Periodic Test 1 (PT-1)", start: "10 Jul 2026", end: "20 Jul 2026", weightage: "10%", status: "Completed" },
    { name: "Periodic Test 2 (PT-2)", start: "10 Dec 2026", end: "20 Dec 2026", weightage: "10%", status: "Scheduled" },
    { name: "Term 2 (Annual Final Board)", start: "15 Feb 2027", end: "10 Mar 2027", weightage: "40%", status: "Scheduled" },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manage Exams</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Evaluation Terms</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Academic Examination Terms & Assessment Windows
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure CBSE assessment terms, weightage percentages, and report card grade aggregation rules
          </p>
        </div>

        <button
          onClick={() => {
            const name = prompt("Term Name:");
            if (name) setTerms([...terms, { name, start: "01 Jan 2027", end: "15 Jan 2027", weightage: "10%", status: "Scheduled" }]);
          }}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Evaluation Term</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {terms.map((t, idx) => (
          <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-700 font-mono">Weightage: {t.weightage}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  t.status.includes("Active") ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                }`}>
                  {t.status}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">{t.name}</h3>
              <p className="text-xs text-slate-500">Timeline: {t.start} to {t.end}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">CBSE Assessment Standard</span>
              <button
                onClick={() => alert(`Configuring marksheets for ${t.name}...`)}
                className="text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Configure Weightage &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
