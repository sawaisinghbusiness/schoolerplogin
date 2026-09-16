"use client";

import React from "react";
import { FileText, Download, CheckCircle2 } from "lucide-react";

export default function TcHistoryPage() {
  const tcList = [
    { tcNo: "TC-2026-042", student: "Karan Johar", srNo: "SR-2021-089", class: "10th", father: "Ramesh Johar", issuedDate: "12 Aug 2026", reason: "Parent Job Transfer", status: "Issued & Archived" },
    { tcNo: "TC-2026-041", student: "Priya Sharma", srNo: "SR-2022-114", class: "8th", father: "Suresh Sharma", issuedDate: "05 Aug 2026", reason: "Higher Education Admission", status: "Issued & Archived" },
    { tcNo: "TC-2026-040", student: "Deepak Meena", srNo: "SR-2020-003", class: "12th", father: "Gopal Meena", issuedDate: "15 Jul 2026", reason: "Completed Class 12 Board", status: "Issued & Archived" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Admin Reports</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Transfer Certificate Register</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Transfer Certificate (TC) Issuance History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Permanent register of issued school leaving certificates, reasons, and security clearance verifications
          </p>
        </div>

        <button
          onClick={() => alert("Downloading Complete TC Register...")}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export TC Register</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4">TC Book No</th>
              <th className="py-3 px-4">Student Name & SR</th>
              <th className="py-3 px-4">Class Passed</th>
              <th className="py-3 px-4">Issue Date</th>
              <th className="py-3 px-4">Reason for Leaving</th>
              <th className="py-3 px-4 text-center">Duplicate PDF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {tcList.map((tc, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-emerald-800">{tc.tcNo}</td>
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900">{tc.student}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{tc.srNo}</div>
                </td>
                <td className="py-3 px-4 font-mono">{tc.class}</td>
                <td className="py-3 px-4 text-slate-500">{tc.issuedDate}</td>
                <td className="py-3 px-4 text-slate-600 italic">{tc.reason}</td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => alert(`Downloading duplicate copy of ${tc.tcNo} for ${tc.student}...`)}
                    className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
