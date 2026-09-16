"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";

export default function PromoteStudentsPage() {
  const [fromSession, setFromSession] = useState("25-26");
  const [toSession, setToSession] = useState("26-27");
  const [fromClass, setFromClass] = useState("Class 9");
  const [toClass, setToClass] = useState("Class 10");
  const [promotedCount, setPromotedCount] = useState<number | null>(null);

  const handlePromote = () => {
    if (confirm(`Are you sure you want to promote ${fromClass} (${fromSession}) to ${toClass} (${toSession})?`)) {
      setPromotedCount(64);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl pb-16 text-xs text-slate-800">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Promote Students</h1>
        <p className="text-slate-500 text-[11px]">
          Annual session migration engine to bulk promote scholar rosters to higher grades
        </p>
      </div>

      {promotedCount !== null && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg flex items-center space-x-2 font-bold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Success! {promotedCount} scholars successfully promoted from {fromClass} to {toClass} for Session {toSession}!</span>
        </div>
      )}

      <div className="bg-white p-6 rounded border border-slate-200 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Source Session */}
          <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-3">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
              Source (From)
            </span>
            <div>
              <label className="block font-bold text-slate-600 mb-1">From Session:</label>
              <select
                value={fromSession}
                onChange={(e) => setFromSession(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded font-bold bg-white"
              >
                <option value="25-26">2025-2026</option>
                <option value="26-27">2026-2027</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">From Standard:</label>
              <select
                value={fromClass}
                onChange={(e) => setFromClass(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded font-bold bg-white"
              >
                <option value="Class 9">Class 9 (64 Students)</option>
                <option value="Class 10">Class 10 (58 Students)</option>
                <option value="Class 11">Class 11 (72 Students)</option>
              </select>
            </div>
          </div>

          {/* Destination Session */}
          <div className="p-4 bg-emerald-50/50 rounded border border-emerald-200 space-y-3">
            <span className="font-bold text-emerald-800 uppercase tracking-wider text-[11px] block">
              Destination (To)
            </span>
            <div>
              <label className="block font-bold text-slate-600 mb-1">To Session:</label>
              <select
                value={toSession}
                onChange={(e) => setToSession(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded font-bold bg-white"
              >
                <option value="26-27">2026-2027 (Active)</option>
                <option value="27-28">2027-2028</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Promote To Standard:</label>
              <select
                value={toClass}
                onChange={(e) => setToClass(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded font-bold bg-white"
              >
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handlePromote}
          className="w-full py-3 bg-[#26b99a] hover:bg-[#209b81] text-white font-bold rounded shadow-md transition-colors flex items-center justify-center space-x-2 text-sm"
        >
          <span>Execute Scholar Promotion</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
