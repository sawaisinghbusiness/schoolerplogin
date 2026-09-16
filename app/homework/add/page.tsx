"use client";

import React, { useState } from "react";
import { BookOpen, Save, CheckCircle2, Upload } from "lucide-react";

export default function AddHomeworkPage() {
  const [success, setSuccess] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl pb-10">
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          <span>School Teacher</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-semibold">Homework Dispatch</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Assign Daily Homework & Study Tasks
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Post daily homework, attach PDF worksheets, and sync automatically to Parent Mobile App & WhatsApp
        </p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">Homework Published! Notification sent to student portal.</span>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); setSuccess(true); setTimeout(() => setSuccess(false), 4000); }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Class & Section *</label>
            <select className="w-full p-2 border border-slate-300 rounded bg-white">
              <option>10th - A</option>
              <option>10th - B</option>
              <option>12th - PCM</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Subject *</label>
            <input type="text" defaultValue="Mathematics" className="w-full p-2 border border-slate-300 rounded" required />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Submission Due Date</label>
            <input type="date" defaultValue="2026-09-16" className="w-full p-2 border border-slate-300 rounded" />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Attach Worksheet (Optional)</label>
            <input type="file" className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-slate-100" />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Homework Description / Questions *</label>
          <textarea
            rows={4}
            defaultValue="Solve NCERT Chapter 4 (Quadratic Equations) Exercise 4.3 questions 1 to 8 in class practice notebook."
            className="w-full p-3 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none text-xs"
            required
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs shadow-xs">
            Publish Homework to Class
          </button>
        </div>
      </form>
    </div>
  );
}
