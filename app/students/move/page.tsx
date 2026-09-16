"use client";

import React, { useState } from "react";
import { ArrowRightLeft, Save, CheckCircle2 } from "lucide-react";

export default function MoveStudentsPage() {
  const [success, setSuccess] = useState(false);
  const [fromClass, setFromClass] = useState("10th");
  const [fromSec, setFromSec] = useState("A");
  const [toClass, setToClass] = useState("11th");
  const [toSec, setToSec] = useState("PCM");

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl pb-10">
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
          <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
          <span>Manage Students</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-semibold">Class Promotion & Section Shifting</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Move & Promote Students Across Classes
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Execute annual class promotion or reassign students between sections in bulk
        </p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">Students successfully transferred from {fromClass} - {fromSec} to {toClass} - {toSec}!</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <h3 className="font-bold text-sm text-slate-900">1. Source Class (Transfer From)</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Class</label>
                <select value={fromClass} onChange={(e) => setFromClass(e.target.value)} className="w-full p-2 border border-slate-300 rounded bg-white">
                  <option value="9th">9th</option>
                  <option value="10th">10th</option>
                  <option value="11th">11th</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Section</label>
                <select value={fromSec} onChange={(e) => setFromSec(e.target.value)} className="w-full p-2 border border-slate-300 rounded bg-white">
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                </select>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">54 Students eligible in this section.</p>
          </div>

          <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-3">
            <h3 className="font-bold text-sm text-slate-900">2. Target Destination (Transfer To)</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Class</label>
                <select value={toClass} onChange={(e) => setToClass(e.target.value)} className="w-full p-2 border border-slate-300 rounded bg-white">
                  <option value="10th">10th</option>
                  <option value="11th">11th</option>
                  <option value="12th">12th</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Section</label>
                <select value={toSec} onChange={(e) => setToSec(e.target.value)} className="w-full p-2 border border-slate-300 rounded bg-white">
                  <option value="PCM">PCM</option>
                  <option value="COMM">COMM</option>
                  <option value="A">Section A</option>
                </select>
              </div>
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold">Available Capacity: 16 vacant seats.</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              setSuccess(true);
              setTimeout(() => setSuccess(false), 4000);
            }}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold shadow-xs transition-colors"
          >
            Execute Promotion / Move Batch
          </button>
        </div>
      </div>
    </div>
  );
}
