"use client";

import React, { useState } from "react";
import { Award, Plus, Save, CheckCircle2 } from "lucide-react";

export default function AddExamsPage() {
  const [success, setSuccess] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl pb-10">
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
          <Award className="w-3.5 h-3.5 text-emerald-600" />
          <span>Manage Exams</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-semibold">Create Exam Paper</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Add Examination / Subject Paper
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Schedule subject papers, configure max theory/practical marks, and set passing thresholds
        </p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">Exam Paper Created & Time Table Published!</span>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); setSuccess(true); setTimeout(() => setSuccess(false), 4000); }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Examination Title *</label>
            <input type="text" defaultValue="Term 1 Mid-Term Examination" className="w-full p-2 border border-slate-300 rounded" required />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Class *</label>
            <select className="w-full p-2 border border-slate-300 rounded bg-white">
              <option>10th Standard</option>
              <option>12th PCM</option>
              <option>12th Commerce</option>
              <option>9th Standard</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Subject *</label>
            <input type="text" defaultValue="Mathematics" className="w-full p-2 border border-slate-300 rounded" required />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Exam Date & Time</label>
            <input type="datetime-local" defaultValue="2026-09-22T09:00" className="w-full p-2 border border-slate-300 rounded font-mono" />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Max Theory Marks</label>
            <input type="number" defaultValue="80" className="w-full p-2 border border-slate-300 rounded font-mono font-bold" />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Internal / Practical Marks</label>
            <input type="number" defaultValue="20" className="w-full p-2 border border-slate-300 rounded font-mono font-bold" />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs shadow-xs">
            Publish Exam Paper
          </button>
        </div>
      </form>
    </div>
  );
}
