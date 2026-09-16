"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Search,
  Download,
  Printer,
  Save,
  CheckCircle2,
  Filter,
  ArrowLeft
} from "lucide-react";

interface StudentMarksRow {
  id: string;
  rollNo: string;
  srNo: string;
  name: string;
  maths: number;
  science: number;
  english: number;
  hindi: number;
  sst: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  status: "Pass" | "Compartment" | "Fail";
}

export default function ViewResultPage() {
  const [selectedClass, setSelectedClass] = useState("10th - A");
  const [selectedExam, setSelectedExam] = useState("Pre-Board Examination Term 1");
  const [searchTerm, setSearchTerm] = useState("");
  const [success, setSuccess] = useState(false);

  const calculateGrade = (pct: number) => {
    if (pct >= 91) return "A1";
    if (pct >= 81) return "A2";
    if (pct >= 71) return "B1";
    if (pct >= 61) return "B2";
    if (pct >= 51) return "C1";
    if (pct >= 41) return "C2";
    if (pct >= 33) return "D";
    return "E";
  };

  const [students, setStudents] = useState<StudentMarksRow[]>([
    { id: "STU-001", rollNo: "12", srNo: "SR-2024-001", name: "Aarav Sharma", maths: 76, science: 72, english: 70, hindi: 74, sst: 68, totalMarks: 360, percentage: 90, grade: "A2", status: "Pass" },
    { id: "STU-002", rollNo: "05", srNo: "SR-2024-002", name: "Diya Rathore", maths: 78, science: 75, english: 74, hindi: 76, sst: 72, totalMarks: 375, percentage: 93.75, grade: "A1", status: "Pass" },
    { id: "STU-003", rollNo: "18", srNo: "SR-2022-098", name: "Karan Soni", maths: 45, science: 52, english: 58, hindi: 60, sst: 48, totalMarks: 263, percentage: 65.75, grade: "B2", status: "Pass" },
    { id: "STU-004", rollNo: "24", srNo: "SR-2024-033", name: "Sanjay Kumar", maths: 24, science: 32, english: 40, hindi: 44, sst: 30, totalMarks: 170, percentage: 42.5, grade: "C2", status: "Compartment" }
  ]);

  const handleMarkChange = (id: string, subject: keyof StudentMarksRow, value: number) => {
    setStudents(
      students.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, [subject]: Number(value) };
        const total = updated.maths + updated.science + updated.english + updated.hindi + updated.sst;
        const pct = Math.round((total / 400) * 100 * 100) / 100;
        const grade = calculateGrade(pct);
        const status = pct >= 33 ? (updated.maths < 27 || updated.science < 27 ? "Compartment" : "Pass") : "Fail";
        return {
          ...updated,
          totalMarks: total,
          percentage: pct,
          grade,
          status
        };
      })
    );
  };

  const handleSave = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.includes(searchTerm) ||
      s.srNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <Award className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Manage Exams</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">View Result & Gazette</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Marks Entry & Examination Gazette Register
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Subject-wise marks entry grid with instant totals, automatic CBSE 9-point grade computation, and gazette export
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors flex items-center space-x-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Gazette</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Marks Changes</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Marks successfully committed! Gazette rankings and percentages updated.</span>
        </div>
      )}

      {/* Selectors Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">Exam:</span>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="p-1.5 border border-slate-300 rounded font-bold bg-white text-slate-900"
            >
              <option>Pre-Board Examination Term 1</option>
              <option>Half Yearly Assessment 2026</option>
              <option>Periodic Assessment Test 1 (PT-1)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="p-1.5 border border-slate-300 rounded font-bold bg-white text-slate-900"
            >
              <option>10th - A</option>
              <option>10th - B</option>
              <option>9th - A</option>
              <option>12th - Science (PCM)</option>
            </select>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, roll no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
          />
        </div>
      </div>

      {/* Gazette Matrix Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3 w-16">Roll No.</th>
                <th className="p-3">Student Name</th>
                <th className="p-2 text-center">Maths (80)</th>
                <th className="p-2 text-center">Science (80)</th>
                <th className="p-2 text-center">English (80)</th>
                <th className="p-2 text-center">Hindi (80)</th>
                <th className="p-2 text-center">SST (80)</th>
                <th className="p-3 text-center bg-slate-100 font-black">Total (400)</th>
                <th className="p-3 text-center font-black text-[#26b99a]">% Pct</th>
                <th className="p-3 text-center">Grade</th>
                <th className="p-3 text-center">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-900">Roll {s.rollNo}</td>
                  <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                    {s.name}
                    <span className="text-[10px] font-mono text-slate-400 block">{s.srNo}</span>
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      value={s.maths}
                      onChange={(e) => handleMarkChange(s.id, "maths", Number(e.target.value))}
                      className="w-14 p-1 border border-slate-300 rounded text-center font-mono font-bold focus:ring-1 focus:ring-[#26b99a]"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      value={s.science}
                      onChange={(e) => handleMarkChange(s.id, "science", Number(e.target.value))}
                      className="w-14 p-1 border border-slate-300 rounded text-center font-mono font-bold focus:ring-1 focus:ring-[#26b99a]"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      value={s.english}
                      onChange={(e) => handleMarkChange(s.id, "english", Number(e.target.value))}
                      className="w-14 p-1 border border-slate-300 rounded text-center font-mono font-bold focus:ring-1 focus:ring-[#26b99a]"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      value={s.hindi}
                      onChange={(e) => handleMarkChange(s.id, "hindi", Number(e.target.value))}
                      className="w-14 p-1 border border-slate-300 rounded text-center font-mono font-bold focus:ring-1 focus:ring-[#26b99a]"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      value={s.sst}
                      onChange={(e) => handleMarkChange(s.id, "sst", Number(e.target.value))}
                      className="w-14 p-1 border border-slate-300 rounded text-center font-mono font-bold focus:ring-1 focus:ring-[#26b99a]"
                    />
                  </td>
                  <td className="p-3 text-center font-mono font-black text-slate-900 bg-slate-50">
                    {s.totalMarks}
                  </td>
                  <td className="p-3 text-center font-mono font-black text-[#26b99a]">
                    {s.percentage}%
                  </td>
                  <td className="p-3 text-center font-black">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {s.grade}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === "Pass"
                          ? "bg-emerald-100 text-emerald-800"
                          : s.status === "Compartment"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
