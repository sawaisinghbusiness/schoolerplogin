"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";

interface RemarkType {
  id: string;
  remarkTitle: string;
  colorTag: string;
  description: string;
}

export default function CopyCheckRemarkTypePage() {
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);

  const [remarks, setRemarks] = useState<RemarkType[]>([
    {
      id: "REM-01",
      remarkTitle: "Excellent & Well Presented",
      colorTag: "bg-emerald-100 text-emerald-800",
      description: "Appreciation for outstanding handwriting and complete exercises."
    },
    {
      id: "REM-02",
      remarkTitle: "Incomplete - Resubmit Tomorrow",
      colorTag: "bg-amber-100 text-amber-800",
      description: "Few questions left unattempted. Must be completed by next period."
    },
    {
      id: "REM-03",
      remarkTitle: "Careless Handwriting / Untidy Work",
      colorTag: "bg-purple-100 text-purple-800",
      description: "Frequent cutting, dirty pages, or improper diagram labels."
    },
    {
      id: "REM-04",
      remarkTitle: "Notebook Not Brought / Defaulter",
      colorTag: "bg-rose-100 text-rose-800",
      description: "Student failed to present notebook during class evaluation."
    }
  ]);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newR: RemarkType = {
      id: `REM-${Date.now()}`,
      remarkTitle: title,
      colorTag: "bg-blue-100 text-blue-800",
      description: desc
    };
    setRemarks([...remarks, newR]);
    setShowModal(false);
    setTitle("");
    setDesc("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const deleteRemark = (id: string) => {
    if (confirm("Delete this remark preset?")) {
      setRemarks(remarks.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <CheckSquare className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Copy Check</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Remark Presets</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Notebook Evaluation Remark Presets
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Configure standardized remarks for teachers to apply during daily student notebook checks
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/copy-check"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Copy Check Report</span>
          </Link>
          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Remark Type</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Remark preset added successfully!</span>
        </div>
      )}

      {/* Remarks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {remarks.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.colorTag}`}>
                  {r.remarkTitle}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{r.id}</span>
              </div>
              <p className="text-slate-600 text-xs mt-2">{r.description}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => deleteRemark(r.id)}
                className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-slate-900">Add Remark Preset</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Remark Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Incomplete Corrections"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="What this remark indicates..."
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
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
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
