"use client";

import React from "react";
import { FileSpreadsheet, Download, Upload } from "lucide-react";
import { MOCK_STUDENTS } from "@/data/mockData";
import { exportStudentsToExcel } from "@/lib/excelHelper";

export default function UpdateExcelPage() {
  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl pb-10">
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Manage Students</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-semibold">Update via Excel</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Bulk Student Data Modification via Excel
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Export existing student master, update mobile numbers, PEN numbers, or addresses in bulk, and re-upload
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Step 1: Download Current Roster</h3>
          <p className="text-slate-500">Download the pre-filled spreadsheet containing current student records with locked SR keys.</p>
          <button
            onClick={() => exportStudentsToExcel(MOCK_STUDENTS, "SchoolDesk_Student_Update_Template.xlsx")}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition-colors"
          >
            Download Data (.xlsx)
          </button>
        </div>

        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Step 2: Upload Modified Spreadsheet</h3>
          <p className="text-slate-500">System matches records by SR Number and automatically updates edited columns.</p>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={() => alert("Student spreadsheet verified! 8 records updated in database.")}
            className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-900 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
