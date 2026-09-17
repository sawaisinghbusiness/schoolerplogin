"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowLeft
} from "lucide-react";

interface Term {
  id: string;
  termName: string;
  weightagePercent: number;
  startDate: string;
  endDate: string;
  isLocked: boolean;
}

export default function ListTermsPage() {
  const [terms, setTerms] = useState<Term[]>([
    {
      id: "TRM-01",
      termName: "Term 1 (Half Yearly & Periodic)",
      weightagePercent: 40,
      startDate: "2026-07-01",
      endDate: "2026-10-31",
      isLocked: false
    },
    {
      id: "TRM-02",
      termName: "Term 2 (Annual Examination)",
      weightagePercent: 60,
      startDate: "2026-11-01",
      endDate: "2027-03-31",
      isLocked: false
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [termName, setTermName] = useState("");
  const [weightage, setWeightage] = useState(50);
  const [startDate, setStartDate] = useState("2026-07-01");
  const [endDate, setEndDate] = useState("2026-10-31");
  const [success, setSuccess] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newT: Term = {
      id: `TRM-${Date.now()}`,
      termName,
      weightagePercent: weightage,
      startDate,
      endDate,
      isLocked: false
    };
    setTerms([...terms, newT]);
    setShowModal(false);
    setTermName("");
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
            <span className="text-slate-800 font-semibold">Manage Terms</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Academic Terms & Weightage Configuration
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Divide the academic session into evaluation terms and configure their relative weightage in the annual report card
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
          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add New Term</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Academic term saved successfully!</span>
        </div>
      )}

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {terms.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 font-mono">
                  {t.id}
                </span>
                <span className="font-mono font-black text-[#26b99a] text-sm">
                  {t.weightagePercent}% Weightage
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mt-2">{t.termName}</h3>

              <div className="mt-3 p-2.5 bg-slate-50 rounded border border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Duration:</span>
                </span>
                <span className="font-semibold text-slate-800 font-mono">
                  {t.startDate} to {t.endDate}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                {t.isLocked ? "🔒 Locked for editing" : "🔓 Open for marks entry"}
              </span>
              <div className="flex items-center space-x-1">
                <button className="p-1 text-slate-400 hover:text-slate-700 rounded">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-slate-900">Add Academic Term</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Term Name *</label>
                <input
                  type="text"
                  required
                  value={termName}
                  onChange={(e) => setTermName(e.target.value)}
                  placeholder="e.g. Term 1 (Mid-Term Assessment)"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Weightage Percentage in Final Result (%) *</label>
                <input
                  type="number"
                  required
                  value={weightage}
                  onChange={(e) => setWeightage(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
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

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold"
                >
                  Save Term
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
