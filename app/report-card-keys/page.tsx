"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  ArrowLeft
} from "lucide-react";

interface ReportKey {
  id: string;
  keyLabel: string;
  dataType: "Text" | "Number" | "Dropdown";
  isRequired: boolean;
  defaultValue?: string;
}

export default function ReportCardKeysPage() {
  const [keys, setKeys] = useState<ReportKey[]>([
    { id: "KEY-01", keyLabel: "Height (cm)", dataType: "Number", isRequired: true, defaultValue: "145" },
    { id: "KEY-02", keyLabel: "Weight (kg)", dataType: "Number", isRequired: true, defaultValue: "42" },
    { id: "KEY-03", keyLabel: "Blood Group", dataType: "Dropdown", isRequired: true, defaultValue: "B+" },
    { id: "KEY-04", keyLabel: "Vision (Left/Right)", dataType: "Text", isRequired: false, defaultValue: "6/6" },
    { id: "KEY-05", keyLabel: "Dental Hygiene", dataType: "Dropdown", isRequired: false, defaultValue: "Good" },
    { id: "KEY-06", keyLabel: "Class Teacher General Remark", dataType: "Text", isRequired: true }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [keyLabel, setKeyLabel] = useState("");
  const [dataType, setDataType] = useState<ReportKey["dataType"]>("Text");
  const [isRequired, setIsRequired] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newK: ReportKey = {
      id: `KEY-${Date.now()}`,
      keyLabel,
      dataType,
      isRequired
    };
    setKeys([...keys, newK]);
    setShowModal(false);
    setKeyLabel("");
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
            <span className="text-slate-800 font-semibold">Report Card Extra Keys</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Custom Report Card Fields & Health Keys
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Define additional metadata printed on student report cards (Height, Weight, Blood Group, Health metrics, Teacher remarks)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/report-card"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors"
          >
            ← Report Cards
          </Link>
          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Custom Field</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Report card field added successfully!</span>
        </div>
      )}

      {/* Keys Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden max-w-3xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="p-3"># Field ID</th>
              <th className="p-3">Field Label</th>
              <th className="p-3">Data Type</th>
              <th className="p-3">Mandatory</th>
              <th className="p-3">Default Value</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {keys.map((k) => (
              <tr key={k.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-mono font-bold text-slate-700">{k.id}</td>
                <td className="p-3 font-bold text-slate-900">{k.keyLabel}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                    {k.dataType}
                  </span>
                </td>
                <td className="p-3">
                  {k.isRequired ? (
                    <span className="text-rose-600 font-bold">Required</span>
                  ) : (
                    <span className="text-slate-400">Optional</span>
                  )}
                </td>
                <td className="p-3 font-mono text-slate-600">{k.defaultValue || "—"}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => setKeys(keys.filter((x) => x.id !== k.id))}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-slate-900">Add Report Card Field</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Field Label *</label>
                <input
                  type="text"
                  required
                  value={keyLabel}
                  onChange={(e) => setKeyLabel(e.target.value)}
                  placeholder="e.g. Vision (Left/Right)"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Data Type *</label>
                <select
                  value={dataType}
                  onChange={(e) => setDataType(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                >
                  <option value="Text">Text</option>
                  <option value="Number">Number</option>
                  <option value="Dropdown">Dropdown</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="req_box"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="text-[#26b99a] rounded"
                />
                <label htmlFor="req_box" className="font-bold text-slate-700 cursor-pointer">
                  Mandatory field during report generation
                </label>
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
                  Save Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
