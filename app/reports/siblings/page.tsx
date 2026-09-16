"use client";

import React from "react";
import { Users, Download } from "lucide-react";

export default function SiblingsListPage() {
  const siblingPairs = [
    { familyId: "FAM-0812", parentName: "Rajesh Sharma", contact: "9876543210", children: [
      { name: "Aarav Sharma", classSec: "10th - A", srNo: "SR-2024-001" },
      { name: "Ananya Sharma", classSec: "6th - B", srNo: "SR-2026-192" }
    ], discountEligible: "Yes (2nd Child 15% Sibling Concession)" },
    { familyId: "FAM-0945", parentName: "Kalyan Singh Rathore", contact: "9829012345", children: [
      { name: "Diya Rathore", classSec: "9th - B", srNo: "SR-2024-002" },
      { name: "Devendra Singh", classSec: "12th - PCM", srNo: "SR-2023-045" }
    ], discountEligible: "Yes (2nd Child 15% Sibling Concession)" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Admin Reports</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Sibling Mappings</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Institutional Sibling Tree & Family Discounts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify enrolled real brothers & sisters by matching guardian mobile numbers and apply institutional sibling fee concessions
          </p>
        </div>

        <button
          onClick={() => alert("Downloading Sibling List (.xlsx)...")}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Sibling Tree</span>
        </button>
      </div>

      <div className="space-y-4">
        {siblingPairs.map((pair, idx) => (
          <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <span className="font-bold text-sm text-slate-900">{pair.parentName}</span>
                <span className="text-xs text-slate-400 font-mono ml-2">Phone: {pair.contact}</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-[10px] font-bold">
                {pair.discountEligible}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {pair.children.map((ch, cIdx) => (
                <div key={cIdx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">{ch.name}</div>
                    <div className="text-[11px] text-slate-500">Class: <strong>{ch.classSec}</strong></div>
                  </div>
                  <div className="font-mono text-slate-400 text-xs">{ch.srNo}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
