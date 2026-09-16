"use client";

import React, { useState } from "react";
import { BookOpen, CheckCircle2, Plus, Save } from "lucide-react";

export default function CopyCheckPage() {
  const [activeTab, setActiveTab] = useState<"add" | "report" | "remarks">("report");
  const [success, setSuccess] = useState(false);

  const copyChecks = [
    { teacher: "Mrs. Sunita Sharma", subject: "Mathematics", classSec: "10th - A", totalCopies: 54, checked: 52, pending: 2, remarks: "Complete till Chapter 4", status: "Verified by Principal" },
    { teacher: "Mr. Vikram Verma", subject: "Physics", classSec: "12th - PCM", totalCopies: 48, checked: 48, pending: 0, remarks: "Lab notebooks checked", status: "Verified by Principal" },
    { teacher: "Ms. Rekha Choudhary", subject: "English", classSec: "9th - B", totalCopies: 49, checked: 45, pending: 4, remarks: "Essays under correction", status: "Pending Verification" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          <span>Academic Ops</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-semibold">Copy Check Module</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Notebook / Copy Check Supervision & Audit
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Monitor teacher notebook correction frequency, record Principal remarks, and ensure student homework verification
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl overflow-hidden text-xs font-bold">
        <button
          onClick={() => setActiveTab("report")}
          className={`py-3 px-5 border-b-2 transition-all ${
            activeTab === "report" ? "border-emerald-600 text-emerald-700 bg-emerald-50/50" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Copy Check Status Report
        </button>
        <button
          onClick={() => setActiveTab("add")}
          className={`py-3 px-5 border-b-2 transition-all ${
            activeTab === "add" ? "border-emerald-600 text-emerald-700 bg-emerald-50/50" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          + Record Copy Check Entry
        </button>
        <button
          onClick={() => setActiveTab("remarks")}
          className={`py-3 px-5 border-b-2 transition-all ${
            activeTab === "remarks" ? "border-emerald-600 text-emerald-700 bg-emerald-50/50" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Principal Supervisory Remarks
        </button>
      </div>

      {activeTab === "report" && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4">Teacher & Subject</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Total Copies</th>
                <th className="py-3 px-4 text-emerald-400">Checked</th>
                <th className="py-3 px-4 text-rose-400">Pending</th>
                <th className="py-3 px-4">Teacher Remarks</th>
                <th className="py-3 px-4 text-center">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {copyChecks.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{c.teacher}</div>
                    <div className="text-[11px] text-slate-500">{c.subject}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold">{c.classSec}</td>
                  <td className="py-3 px-4 font-mono">{c.totalCopies}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">{c.checked}</td>
                  <td className="py-3 px-4 font-mono font-bold text-rose-600">{c.pending}</td>
                  <td className="py-3 px-4 text-slate-600">{c.remarks}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.status.includes("Verified") ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "add" && (
        <form onSubmit={(e) => { e.preventDefault(); setSuccess(true); setTimeout(() => setSuccess(false), 3000); }} className="bg-white p-6 rounded-b-xl border border-t-0 border-slate-200 shadow-xs space-y-4 text-xs">
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">Copy check log recorded!</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Class & Section</label>
              <input type="text" defaultValue="10th - A" className="w-full p-2 border border-slate-300 rounded" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Subject</label>
              <input type="text" defaultValue="Mathematics" className="w-full p-2 border border-slate-300 rounded" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Copies Checked</label>
              <input type="number" defaultValue="52" className="w-full p-2 border border-slate-300 rounded font-mono font-bold" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pending Unchecked Copies</label>
              <input type="number" defaultValue="2" className="w-full p-2 border border-slate-300 rounded font-mono font-bold" />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Teacher Correction Notes</label>
            <textarea rows={3} defaultValue="Checked homework up to Chapter 4 Exercise 4.3" className="w-full p-2 border border-slate-300 rounded" />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs shadow-xs">
              Submit Copy Log
            </button>
          </div>
        </form>
      )}

      {activeTab === "remarks" && (
        <div className="bg-white p-6 rounded-b-xl border border-t-0 border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-2">
            <h4 className="font-bold text-emerald-900">Principal Supervisory Remark (15 Sep 2026)</h4>
            <p className="text-slate-700 leading-relaxed">
              &quot;Class 10th mathematics corrections are thorough. Teachers must ensure regular index signing and date stamps on homework pages.&quot;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
