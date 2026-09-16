"use client";

import React from "react";
import { Award, Download } from "lucide-react";

export default function CertificatesHistoryPage() {
  const certs = [
    { certNo: "CERT-2026-102", student: "Aarav Sharma", type: "Bonafide Student Certificate", issuedOn: "14 Sep 2026", purpose: "Passport Application Verification", issuedBy: "Admin" },
    { certNo: "CERT-2026-101", student: "Diya Rathore", type: "Character & Conduct Certificate", issuedOn: "10 Sep 2026", purpose: "Scholarship Scheme Submission", issuedBy: "Principal" },
    { certNo: "CERT-2026-100", student: "Karan Soni", type: "Inter-School Sports Achievement", issuedOn: "02 Sep 2026", purpose: "State Level Athletics Meet", issuedBy: "Sports HOD" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Admin Reports</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Certificates Issued</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Institutional Certificate Register
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit history of all issued Bonafide, Character, and Sports certificates with digital verification codes
          </p>
        </div>

        <button
          onClick={() => alert("Downloading Certificates Master Register...")}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Master Log</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4">Certificate No</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Certificate Type</th>
              <th className="py-3 px-4">Issued Date</th>
              <th className="py-3 px-4">Stated Purpose</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {certs.map((c, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.certNo}</td>
                <td className="py-3 px-4 font-bold text-slate-900">{c.student}</td>
                <td className="py-3 px-4 font-semibold text-emerald-800">{c.type}</td>
                <td className="py-3 px-4 text-slate-500">{c.issuedOn}</td>
                <td className="py-3 px-4 text-slate-600 italic">{c.purpose}</td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => alert(`Downloading copy of ${c.certNo}...`)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-semibold text-slate-700"
                  >
                    Download
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
