"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PhoneCall,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Tag,
  ArrowLeft
} from "lucide-react";

interface CallReason {
  id: string;
  reasonTitle: string;
  category: "Positive / Promised" | "Negative / Dispute" | "Unreachable" | "Followup";
  colorBadge: string;
  description: string;
}

export default function CallListReasonsPage() {
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);

  const [reasons, setReasons] = useState<CallReason[]>([
    {
      id: "REA-01",
      reasonTitle: "Payment Promised by Date",
      category: "Positive / Promised",
      colorBadge: "bg-emerald-100 text-emerald-800",
      description: "Parent committed to clear outstanding fees before the specified date."
    },
    {
      id: "REA-02",
      reasonTitle: "Call Later / Parent Busy",
      category: "Followup",
      colorBadge: "bg-amber-100 text-amber-800",
      description: "Parent was in meeting/work, requested to call in evening."
    },
    {
      id: "REA-03",
      reasonTitle: "Phone Switched Off / Out of Reach",
      category: "Unreachable",
      colorBadge: "bg-purple-100 text-purple-800",
      description: "Phone network unreachable or continuous ringing without response."
    },
    {
      id: "REA-04",
      reasonTitle: "Fee Dispute / Concession Requested",
      category: "Negative / Dispute",
      colorBadge: "bg-rose-100 text-rose-800",
      description: "Parent claimed fee calculation mismatch or requested management concession."
    },
    {
      id: "REA-05",
      reasonTitle: "Parent Will Visit School Personally",
      category: "Positive / Promised",
      colorBadge: "bg-blue-100 text-blue-800",
      description: "Parent agreed to visit administrative office on upcoming Saturday."
    },
    {
      id: "REA-06",
      reasonTitle: "Wrong / Invalid Mobile Number",
      category: "Unreachable",
      colorBadge: "bg-slate-100 text-slate-800",
      description: "Number does not belong to student family or is permanently invalid."
    }
  ]);

  const [title, setTitle] = useState("");
  const [cat, setCat] = useState<CallReason["category"]>("Positive / Promised");
  const [desc, setDesc] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const color =
      cat === "Positive / Promised"
        ? "bg-emerald-100 text-emerald-800"
        : cat === "Followup"
        ? "bg-amber-100 text-amber-800"
        : cat === "Unreachable"
        ? "bg-purple-100 text-purple-800"
        : "bg-rose-100 text-rose-800";

    const newR: CallReason = {
      id: `REA-${Date.now()}`,
      reasonTitle: title,
      category: cat,
      colorBadge: color,
      description: desc
    };
    setReasons([...reasons, newR]);
    setShowModal(false);
    setTitle("");
    setDesc("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const deleteReason = (id: string) => {
    if (confirm("Delete this disposition tag?")) {
      setReasons(reasons.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <PhoneCall className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Call List</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Call Reasons & Tags</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Call Outcome Reasons & Disposition Tags
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Configure standardized dropdown options for staff to record the outcome of parent phone calls
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/call-list"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Campaigns</span>
          </Link>
          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Call Reason</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Call reason tag created successfully!</span>
        </div>
      )}

      {/* Grid of Reasons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reasons.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.colorBadge}`}>
                  {r.category}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{r.id}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-2">{r.reasonTitle}</h3>
              <p className="text-slate-600 text-[11px] mt-1">{r.description}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                onClick={() => deleteReason(r.id)}
                className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-slate-900">Add Call Disposition Reason</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason / Tag Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Requested Online Payment QR Link"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={cat}
                  onChange={(e) => setCat(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                >
                  <option value="Positive / Promised">Positive / Promised</option>
                  <option value="Followup">Followup Required</option>
                  <option value="Unreachable">Unreachable / No Answer</option>
                  <option value="Negative / Dispute">Negative / Dispute</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Context on when this disposition is selected..."
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
                  Save Reason Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
