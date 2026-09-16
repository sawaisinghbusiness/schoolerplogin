"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Save,
  CheckCircle2,
  Calendar,
  Layers,
  BookOpen,
  ArrowLeft
} from "lucide-react";

interface StudentEvaluation {
  id: string;
  name: string;
  srNo: string;
  rollNo: string;
  status: "Excellent" | "Complete" | "Incomplete" | "Not Submitted";
  remark: string;
}

export default function AddCopyCheckPage() {
  const [selectedClass, setSelectedClass] = useState("10th - A");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [chapterTitle, setChapterTitle] = useState("Chapter 6: Triangles (Exercise 6.1 - 6.3)");
  const [checkDate, setCheckDate] = useState("2026-09-16");
  const [success, setSuccess] = useState(false);

  const [students, setStudents] = useState<StudentEvaluation[]>([
    { id: "STU-001", name: "Aarav Sharma", srNo: "SR-2024-001", rollNo: "12", status: "Excellent", remark: "Neat work" },
    { id: "STU-002", name: "Diya Rathore", srNo: "SR-2024-002", rollNo: "05", status: "Complete", remark: "Well done" },
    { id: "STU-003", name: "Karan Soni", srNo: "SR-2022-098", rollNo: "18", status: "Incomplete", remark: "Ex 6.3 pending" },
    { id: "STU-004", name: "Sanjay Kumar", srNo: "SR-2024-033", rollNo: "24", status: "Not Submitted", remark: "Notebook missing" },
    { id: "STU-005", name: "Pooja Choudhary", srNo: "SR-2024-055", rollNo: "14", status: "Complete", remark: "Checked" }
  ]);

  const setAllStatus = (status: StudentEvaluation["status"]) => {
    setStudents(students.map((s) => ({ ...s, status })));
  };

  const updateStudentStatus = (id: string, status: StudentEvaluation["status"]) => {
    setStudents(students.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const updateStudentRemark = (id: string, remark: string) => {
    setStudents(students.map((s) => (s.id === id ? { ...s, remark } : s)));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3500);
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <CheckSquare className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Copy Check</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Daily Notebook Checking</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Record Daily Notebook Checking & Corrections
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Log student notebook submissions, record incomplete work remarks, and notify parents
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/copy-check"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Copy Check Report</span>
          </Link>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Notebook check evaluation recorded! Parents of non-submitted students notified.</span>
        </div>
      )}

      {/* Control Form Bar */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Class & Section *</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded bg-white font-bold"
            >
              <option>10th - A</option>
              <option>10th - B</option>
              <option>9th - A</option>
              <option>8th - A</option>
              <option>12th - PCM</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Subject *</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded bg-white font-bold"
            >
              <option>Mathematics</option>
              <option>Science</option>
              <option>English</option>
              <option>Hindi</option>
              <option>Social Science</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Checking Date *</label>
            <input
              type="date"
              value={checkDate}
              onChange={(e) => setCheckDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Topic / Chapter Checked *</label>
            <input
              type="text"
              required
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Set Bar */}
        <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-slate-700">Quick Mark All:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setAllStatus("Excellent")}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px]"
            >
              All Excellent
            </button>
            <button
              type="button"
              onClick={() => setAllStatus("Complete")}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[10px]"
            >
              All Complete
            </button>
            <button
              type="button"
              onClick={() => setAllStatus("Incomplete")}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-[10px]"
            >
              All Incomplete
            </button>
            <button
              type="button"
              onClick={() => setAllStatus("Not Submitted")}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-[10px]"
            >
              All Not Submitted
            </button>
          </div>
        </div>

        {/* Students Evaluation Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="p-3 w-28">Roll No.</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3 text-center">Submission Status</th>
                  <th className="p-3">Teacher Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900">
                      Roll {s.rollNo}
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {s.name}
                      <span className="text-[10px] font-mono text-slate-400 block">{s.srNo}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center space-x-1.5">
                        {(["Excellent", "Complete", "Incomplete", "Not Submitted"] as const).map(
                          (st) => {
                            const isCurrent = s.status === st;
                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() => updateStudentStatus(s.id, st)}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all border ${
                                  isCurrent
                                    ? st === "Excellent"
                                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                      : st === "Complete"
                                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                      : st === "Incomplete"
                                      ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                                      : "bg-rose-600 text-white border-rose-600 shadow-xs"
                                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {st}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={s.remark}
                        onChange={(e) => updateStudentRemark(s.id, e.target.value)}
                        placeholder="Optional teacher remark..."
                        className="w-full p-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#26b99a] hover:bg-[#209b81] text-white font-bold rounded-lg shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Submit Daily Copy Check</span>
          </button>
        </div>
      </form>
    </div>
  );
}
