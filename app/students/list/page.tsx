"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GraduationCap, Search, Phone, Eye, CreditCard, Ticket, Download } from "lucide-react";
import { MOCK_STUDENTS } from "@/data/mockData";
import { exportStudentsToExcel } from "@/lib/excelHelper";

export default function StudentsListPage() {
  const [search, setSearch] = useState("");
  const filtered = MOCK_STUDENTS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.srNo.toLowerCase().includes(search.toLowerCase()) || s.mobile.includes(search));

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manage Students</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Student Scholar Directory</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Institutional Student Roster (1,924 Scholars)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active enrolled scholars across all wings (Pre-Primary, Primary, Middle, Secondary & Senior Secondary)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportStudentsToExcel(filtered)}
            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded text-slate-700 text-xs font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Roster</span>
          </button>
          <Link
            href="/students/add"
            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
          >
            <span>+ New Admission</span>
          </Link>
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center space-x-2 text-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Quick filter students by name, SR number or parent phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border-none focus:outline-none text-slate-800"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4">SR Number</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Class - Section</th>
              <th className="py-3 px-4">Father Name</th>
              <th className="py-3 px-4">Mobile</th>
              <th className="py-3 px-4">Fee Status</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{s.srNo}</td>
                <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                <td className="py-3 px-4 font-mono font-semibold text-emerald-800">{s.classSec}</td>
                <td className="py-3 px-4">{s.fatherName}</td>
                <td className="py-3 px-4 font-mono">{s.mobile}</td>
                <td className="py-3 px-4">
                  {s.balanceFee === 0 ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                      Cleared
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">
                      Due ₹{s.balanceFee.toLocaleString()}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <Link
                    href="/search-student"
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold"
                  >
                    Open Master File
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
