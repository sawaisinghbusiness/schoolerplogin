"use client";

import React, { useState } from "react";
import { Hash, Save, CheckCircle2 } from "lucide-react";

export default function SerialGeneratorPage() {
  const [prefix, setPrefix] = useState("SR-2026-");
  const [currentSequence, setCurrentSequence] = useState("1024");
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl pb-10">
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
          <Hash className="w-3.5 h-3.5 text-emerald-600" />
          <span>Manage Students</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-semibold">Scholar Serial Generator</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Serial Number & Scholar Register Configurator
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Define automatic numbering schemes for Scholar Register (SR), Admission Numbers, and Roll Numbers
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">Sequence updated! Next admitted student will receive SR: {prefix}{currentSequence}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">SR Prefix Format</label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Current Sequence Pointer</label>
            <input
              type="number"
              value={currentSequence}
              onChange={(e) => setCurrentSequence(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
            />
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
          <span className="text-slate-500 block">Preview Next 3 Auto-Assigned SRs:</span>
          <div className="flex space-x-3 font-mono font-bold text-emerald-700 pt-1">
            <span>{prefix}{currentSequence}</span>
            <span>&rarr;</span>
            <span>{prefix}{Number(currentSequence) + 1}</span>
            <span>&rarr;</span>
            <span>{prefix}{Number(currentSequence) + 2}</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 3000);
            }}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs shadow-xs"
          >
            Save Sequence Settings
          </button>
        </div>
      </div>
    </div>
  );
}
