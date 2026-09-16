"use client";

import React from "react";
import { UserMinus, Download, FileText } from "lucide-react";

export default function LeftStaffPage() {
  const leftStaff = [
    { code: "EMP-089", name: "Mr. Surendra Bishnoi", dept: "Science", designation: "TGT Chemistry", relievedDate: "30 Apr 2026", reason: "Relocated to Jodhpur", experienceCert: "Issued" },
    { code: "EMP-076", name: "Mrs. Kavita Rathore", dept: "Languages", designation: "PRT Hindi", relievedDate: "15 Jun 2026", reason: "Personal / Higher Studies", experienceCert: "Issued" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
          <UserMinus className="w-3.5 h-3.5 text-emerald-600" />
          <span>Manage Staff</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-semibold">Relieved & Left Faculty</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Left Staff & Relieved Personnel Archives
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          History of resigned or relieved staff members with experience certificate generation
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Employee Name</th>
              <th className="py-3 px-4">Department & Post</th>
              <th className="py-3 px-4">Relieved Date</th>
              <th className="py-3 px-4">Relief Reason</th>
              <th className="py-3 px-4 text-center">Service Certificate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {leftStaff.map((st, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-slate-500">{st.code}</td>
                <td className="py-3 px-4 font-bold text-slate-900">{st.name}</td>
                <td className="py-3 px-4">{st.dept} ({st.designation})</td>
                <td className="py-3 px-4 text-slate-500">{st.relievedDate}</td>
                <td className="py-3 px-4 text-slate-600 italic">{st.reason}</td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => alert(`Downloading Experience & Relieving Certificate for ${st.name}...`)}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download PDF</span>
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
