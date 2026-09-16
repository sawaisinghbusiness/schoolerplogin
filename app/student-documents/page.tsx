"use client";

import React, { useState } from "react";
import { Folder, Download, Filter, Search } from "lucide-react";

export default function StudentDocumentsPage() {
  const [selectedClass, setSelectedClass] = useState("Class 10-A");
  const [fetched, setFetched] = useState(true);

  const mockDocs = [
    { name: "Aarav Sharma", srNo: "SR-2024-001", aadhar: "Uploaded", tc: "Uploaded", marksheet: "Uploaded", birthCert: "Pending" },
    { name: "Diya Rathore", srNo: "SR-2024-002", aadhar: "Uploaded", tc: "Uploaded", marksheet: "Uploaded", birthCert: "Uploaded" },
    { name: "Vikram Choudhary", srNo: "SR-2023-114", aadhar: "Uploaded", tc: "Pending", marksheet: "Uploaded", birthCert: "Uploaded" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-16 text-xs text-slate-800">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Student Documents</h1>
          <p className="text-slate-500 text-[11px]">
            Class-wise multi-section document aggregator and digital dossier auditor
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setFetched(false)}
            className="px-3 py-1.5 border border-slate-300 rounded font-bold text-slate-600 hover:bg-slate-50"
          >
            CLEAR ALL
          </button>
          <button
            onClick={() => setFetched(true)}
            className="px-4 py-1.5 bg-[#26b99a] text-white rounded font-bold hover:bg-[#209b81] shadow-xs"
          >
            FETCH DATA
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded border border-slate-200 shadow-xs flex items-center space-x-4">
        <label className="font-bold text-slate-700">Select Class &amp; Section:</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="p-1.5 border border-slate-300 rounded font-bold bg-slate-50 w-64"
        >
          <option value="Class 10-A">Class 10 - A (52 Students)</option>
          <option value="Class 9-A">Class 9 - A (45 Students)</option>
          <option value="Class 12-MATHS">Class 12 - MATHS (38 Students)</option>
        </select>
      </div>

      {fetched && (
        <div className="bg-white rounded border border-slate-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <th className="p-3">#</th>
                <th className="p-3">SR No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Aadhar Card</th>
                <th className="p-3">T. C.</th>
                <th className="p-3">Marksheet</th>
                <th className="p-3">Birth Cert</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {mockDocs.map((doc, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 text-slate-400">{idx + 1}</td>
                  <td className="p-3 font-mono font-bold text-emerald-700">{doc.srNo}</td>
                  <td className="p-3 font-bold text-slate-900">{doc.name}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {doc.aadhar}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      doc.tc === "Uploaded" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {doc.tc}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {doc.marksheet}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      doc.birthCert === "Uploaded" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {doc.birthCert}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => alert(`Opening document dossier for ${doc.name}...`)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-[10px]"
                    >
                      View Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
