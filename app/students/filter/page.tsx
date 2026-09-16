"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Filter, Search, Download } from "lucide-react";
import { MOCK_STUDENTS } from "@/data/mockData";
import { exportStudentsToExcel } from "@/lib/excelHelper";

export default function StudentFilterPage() {
  const [selectedHouse, setSelectedHouse] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTransport, setSelectedTransport] = useState("All");

  const filtered = MOCK_STUDENTS.filter((s) => {
    if (selectedHouse !== "All" && s.house !== selectedHouse) return false;
    if (selectedCategory !== "All" && s.category !== selectedCategory) return false;
    if (selectedTransport !== "All" && (selectedTransport === "Yes" ? !s.transportOpted : s.transportOpted)) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manage Students</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Multi-Parameter Filter</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Demographic & Category Filter Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Query students by caste category, school house, transport facility, and gender ratios
          </p>
        </div>

        <button
          onClick={() => exportStudentsToExcel(filtered, "Filtered_Students_Demographics.xlsx")}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Filtered List ({filtered.length})</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Filter by School House</label>
          <select
            value={selectedHouse}
            onChange={(e) => setSelectedHouse(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded bg-white"
          >
            <option value="All">All Houses</option>
            <option value="Tagore">Tagore House</option>
            <option value="Ashoka">Ashoka House</option>
            <option value="Shivaji">Shivaji House</option>
            <option value="Raman">Raman House</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Filter by Social Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded bg-white"
          >
            <option value="All">All Categories</option>
            <option value="General">General</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Filter by Transport (Bus Pass)</label>
          <select
            value={selectedTransport}
            onChange={(e) => setSelectedTransport(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded bg-white"
          >
            <option value="All">All Students</option>
            <option value="Yes">Bus Pass Opted</option>
            <option value="No">Self Day Scholar</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4">SR Number</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Class - Sec</th>
              <th className="py-3 px-4">House</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Transport Facility</th>
              <th className="py-3 px-4 text-center">Master File</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{s.srNo}</td>
                <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                <td className="py-3 px-4 font-mono">{s.classSec}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-bold">
                    {s.house}
                  </span>
                </td>
                <td className="py-3 px-4">{s.category}</td>
                <td className="py-3 px-4">
                  {s.transportOpted ? (
                    <span className="text-emerald-600 font-semibold">{s.busRoute}</span>
                  ) : (
                    <span className="text-slate-400">Day Scholar</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <Link
                    href="/search-student"
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-semibold text-slate-700"
                  >
                    View File
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
