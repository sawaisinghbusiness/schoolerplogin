"use client";

import React, { useState } from "react";
import { UserPlus, Download, Calendar, Filter } from "lucide-react";
import { MOCK_STUDENTS } from "@/data/mockData";

export default function NewAdmissionsPage() {
  const [selectedClass, setSelectedClass] = useState("All");

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl pb-16 text-xs text-slate-800">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">New Admissions</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
              Total 592
            </span>
          </div>
          <p className="text-slate-500 text-[11px]">
            Comprehensive audit log of newly enrolled scholars for Session 2026-27
          </p>
        </div>

        <button
          onClick={() => alert("Exporting 592 new admissions to Excel...")}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded font-bold shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>Export Excel</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded border border-slate-200 shadow-xs flex flex-wrap items-center gap-4">
        <div>
          <label className="block font-bold text-slate-600 mb-1 text-[11px]">Filter by Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-1.5 border border-slate-300 rounded font-bold bg-slate-50"
          >
            <option value="All">All Classes</option>
            <option value="10th">Class 10</option>
            <option value="9th">Class 9</option>
            <option value="12th">Class 12</option>
            <option value="11th">Class 11</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1 text-[11px]">Admission Date Range:</label>
          <div className="flex items-center space-x-2">
            <input type="date" defaultValue="2026-04-01" className="p-1.5 border border-slate-300 rounded" />
            <span>to</span>
            <input type="date" defaultValue="2026-09-15" className="p-1.5 border border-slate-300 rounded" />
          </div>
        </div>
      </div>

      {/* Admissions Table */}
      <div className="bg-white rounded border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <th className="p-3">#</th>
              <th className="p-3">SR No</th>
              <th className="p-3">Student Name</th>
              <th className="p-3">Class &amp; Sec</th>
              <th className="p-3">Father Name</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Admission Date</th>
              <th className="p-3">Created By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {MOCK_STUDENTS.map((stu, idx) => (
              <tr key={stu.id} className="hover:bg-slate-50">
                <td className="p-3 text-slate-400">{idx + 1}</td>
                <td className="p-3 font-mono font-bold text-emerald-700">{stu.srNo}</td>
                <td className="p-3 font-bold text-slate-900">{stu.name}</td>
                <td className="p-3 font-semibold">{stu.classSec}</td>
                <td className="p-3 text-slate-700">{stu.fatherName}</td>
                <td className="p-3 font-mono">{stu.mobile}</td>
                <td className="p-3 text-slate-500 font-mono">15-04-2026</td>
                <td className="p-3 text-slate-600">MAHENDRA PARIHAR</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
