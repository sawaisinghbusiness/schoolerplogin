"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Save,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  ArrowLeft
} from "lucide-react";

export default function AddExamPage() {
  const [examName, setExamName] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [selectedClasses, setSelectedClasses] = useState<string[]>(["10th", "12th"]);
  const [startDate, setStartDate] = useState("2026-09-25");
  const [endDate, setEndDate] = useState("2026-10-06");
  const [maxMarksPerSubject, setMaxMarksPerSubject] = useState(80);
  const [passingPercentage, setPassingPercentage] = useState(33);
  const [success, setSuccess] = useState(false);

  const ALL_CLASSES = ["9th", "10th", "11th - Science", "11th - Commerce", "12th - Science", "12th - Commerce"];

  const toggleClass = (c: string) => {
    if (selectedClasses.includes(c)) {
      setSelectedClasses(selectedClasses.filter((x) => x !== c));
    } else {
      setSelectedClasses([...selectedClasses, c]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3500);
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
            <span className="text-slate-800 font-semibold">Add Exam</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Create New Examination / Test Series
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Configure examination titles, assign applicable standards, set maximum marks, and configure passing thresholds
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/exam-schedule"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View Exams</span>
          </Link>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Examination successfully created! You can now generate the timetable date sheet.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-4 max-w-2xl">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Examination Title *</label>
          <input
            type="text"
            required
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            placeholder="e.g. Pre-Board Examination 2026-27"
            className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#26b99a] focus:outline-none font-bold text-slate-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Academic Term *</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded bg-white font-bold"
            >
              <option>Term 1</option>
              <option>Term 2</option>
              <option>Annual Final</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Theory Max Marks (Default) *</label>
            <input
              type="number"
              required
              value={maxMarksPerSubject}
              onChange={(e) => setMaxMarksPerSubject(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Start Date *</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">End Date *</label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-2">Select Applicable Classes *</label>
          <div className="flex flex-wrap gap-1.5">
            {ALL_CLASSES.map((cls) => {
              const isSelected = selectedClasses.includes(cls);
              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => toggleClass(cls)}
                  className={`px-3 py-1.5 rounded font-bold text-xs transition-all border ${
                    isSelected
                      ? "bg-[#26b99a] text-white border-[#26b99a] shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cls}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#26b99a] hover:bg-[#209b81] text-white font-bold rounded shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Create Examination</span>
          </button>
        </div>
      </form>
    </div>
  );
}
