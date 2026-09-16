"use client";

import React from "react";
import { FileSpreadsheet, Upload, Download, CheckCircle2 } from "lucide-react";

export default function StaffExcelPage() {
  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl pb-10">
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Manage Staff</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-semibold">Staff Excel Operations</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Staff Bulk Import & Export Excel
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Download staff roster templates or import employee records directly from spreadsheet
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Download Staff Master Sheet</h3>
            <p className="text-slate-500 text-xs mt-1">Export all 68 active staff records with employee codes, departments, phone numbers, and designations.</p>
          </div>
          <button
            onClick={() => alert("Downloading Staff_Master_Roster_2026.xlsx...")}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition-colors"
          >
            Export Staff Roster (.xlsx)
          </button>
        </div>

        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Bulk Upload New Staff</h3>
            <p className="text-slate-500 text-xs mt-1">Select an .xlsx spreadsheet containing columns: Code, Name, Department, Mobile, Email, and Qualification.</p>
          </div>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={() => alert("Staff spreadsheet uploaded and validated successfully!")}
            className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-900 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
