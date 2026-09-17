"use client";

import React, { useState } from "react";
import { Award, Download, CheckCircle2 } from "lucide-react";

export default function BulkCertificatesPage() {
  const [certType, setCertType] = useState("Bonafide Student Certificate");

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl pb-10">
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
          <Award className="w-3.5 h-3.5 text-emerald-600" />
          <span>Manage Students</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-semibold">Institutional Certificates</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Bulk Certificate Generator & Issuance
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate official Bonafide, Character, Sports Merit, and Transfer Certificates with digital signatures
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Certificate Template</label>
            <select
              value={certType}
              onChange={(e) => setCertType(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800"
            >
              <option value="Bonafide Student Certificate">Bonafide Student Certificate (Study Proof)</option>
              <option value="Character & Conduct Certificate">Character & Conduct Certificate</option>
              <option value="Sports & Athletic Achievement">Sports & Athletic Achievement Certificate</option>
              <option value="Fee Cleared NOC Certificate">Fee Cleared NOC Certificate</option>
              <option value="Transfer Certificate (TC)">Official School Leaving Transfer Certificate (TC)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Issue Date</label>
            <input
              type="date"
              defaultValue="2026-09-15"
              className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800"
            />
          </div>
        </div>

        <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg text-xs space-y-1 text-emerald-900">
          <div className="font-bold">CBSE Standard Institutional Watermark & Digital Stamp:</div>
          <p className="text-xs text-emerald-800">
            St. Paul&apos;s Senior Secondary School crest and CBSE affiliation details are embedded automatically.
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => alert(`Generating ${certType} batch...`)}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs shadow-xs flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate Official Certificates</span>
          </button>
        </div>
      </div>
    </div>
  );
}
