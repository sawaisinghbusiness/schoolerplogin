"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Search,
  Download,
  Calendar,
  Filter,
  Plus,
  BarChart2,
  BookOpen
} from "lucide-react";

interface CopyCheckRecord {
  id: string;
  studentName: string;
  srNo: string;
  rollNo: string;
  classSec: string;
  subject: string;
  chapterTitle: string;
  checkDate: string;
  evaluationStatus: "Excellent" | "Complete" | "Incomplete" | "Not Submitted";
  teacherRemarks: string;
  checkedBy: string;
}

export default function CopyCheckReportPage() {
  const [selectedClass, setSelectedClass] = useState("10th - A");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [searchTerm, setSearchTerm] = useState("");

  const [records, setRecords] = useState<CopyCheckRecord[]>([
    {
      id: "CC-01",
      studentName: "Aarav Sharma",
      srNo: "SR-2024-001",
      rollNo: "12",
      classSec: "10th - A",
      subject: "Mathematics",
      chapterTitle: "Ch 6: Triangles (Ex 6.1 - 6.3)",
      checkDate: "2026-09-15",
      evaluationStatus: "Excellent",
      teacherRemarks: "Neat handwriting, all theorems proved step-by-step with accurate diagrams.",
      checkedBy: "Kailash Bishnoi"
    },
    {
      id: "CC-02",
      studentName: "Diya Rathore",
      srNo: "SR-2024-002",
      rollNo: "05",
      classSec: "10th - A",
      subject: "Mathematics",
      chapterTitle: "Ch 6: Triangles (Ex 6.1 - 6.3)",
      checkDate: "2026-09-15",
      evaluationStatus: "Complete",
      teacherRemarks: "Completed, needs practice on Pythagoras converse application.",
      checkedBy: "Kailash Bishnoi"
    },
    {
      id: "CC-03",
      studentName: "Karan Soni",
      srNo: "SR-2022-098",
      rollNo: "18",
      classSec: "10th - A",
      subject: "Mathematics",
      chapterTitle: "Ch 6: Triangles (Ex 6.1 - 6.3)",
      checkDate: "2026-09-15",
      evaluationStatus: "Incomplete",
      teacherRemarks: "Exercise 6.3 questions 5 to 12 missing. Asked to complete by tomorrow.",
      checkedBy: "Kailash Bishnoi"
    },
    {
      id: "CC-04",
      studentName: "Sanjay Kumar",
      srNo: "SR-2024-033",
      rollNo: "24",
      classSec: "10th - A",
      subject: "Mathematics",
      chapterTitle: "Ch 6: Triangles (Ex 6.1 - 6.3)",
      checkDate: "2026-09-15",
      evaluationStatus: "Not Submitted",
      teacherRemarks: "Notebook not brought to class. Parent alerted via app notice.",
      checkedBy: "Kailash Bishnoi"
    }
  ]);

  const total = records.length;
  const excellent = records.filter((r) => r.evaluationStatus === "Excellent").length;
  const complete = records.filter((r) => r.evaluationStatus === "Complete").length;
  const incomplete = records.filter((r) => r.evaluationStatus === "Incomplete").length;
  const notSubmitted = records.filter((r) => r.evaluationStatus === "Not Submitted").length;

  const filtered = records.filter((r) =>
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.rollNo.includes(searchTerm) ||
    r.teacherRemarks.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <span className="text-slate-800 font-semibold">Copy Check Report</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Notebook Evaluation & Checking Reports
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Class notebook checking records, teacher correction remarks, and incomplete homework audits
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/copy-check-remark-type"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors"
          >
            Remark Types
          </Link>
          <Link
            href="/add-copy-check"
            className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Daily Copy Check</span>
          </Link>
        </div>
      </div>

      {/* 4 Status Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-emerald-700 text-[11px] font-bold uppercase">Excellent / Exemplary</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{excellent}</div>
          <span className="text-[10px] text-slate-400">Neat & complete notes</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-blue-700 text-[11px] font-bold uppercase">Complete</span>
          <div className="text-2xl font-black text-blue-600 mt-1">{complete}</div>
          <span className="text-[10px] text-slate-400">Regular submission</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-amber-700 text-[11px] font-bold uppercase">Incomplete / Poor</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{incomplete}</div>
          <span className="text-[10px] text-amber-700 font-semibold">Resubmission pending</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-rose-700 text-[11px] font-bold uppercase">Not Submitted</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{notSubmitted}</div>
          <span className="text-[10px] text-rose-700 font-semibold">Parent notified</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-slate-500 font-semibold">Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-1.5 border border-slate-300 rounded font-bold text-xs bg-white text-slate-900"
          >
            <option>10th - A</option>
            <option>10th - B</option>
            <option>9th - A</option>
            <option>8th - A</option>
            <option>12th - PCM</option>
          </select>

          <span className="text-slate-500 font-semibold ml-2">Subject:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="p-1.5 border border-slate-300 rounded font-bold text-xs bg-white text-slate-900"
          >
            <option>Mathematics</option>
            <option>Science</option>
            <option>English</option>
            <option>Hindi</option>
            <option>Social Science</option>
          </select>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, roll no., remark..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3">Roll / SR No.</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Topic / Chapter Checked</th>
                <th className="p-3">Evaluation Status</th>
                <th className="p-3">Teacher Remarks</th>
                <th className="p-3">Evaluator</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 whitespace-nowrap">
                    <span className="font-bold text-slate-900 mr-1.5">Roll {r.rollNo}</span>
                    <span className="text-[10px] font-mono text-slate-400">({r.srNo})</span>
                  </td>
                  <td className="p-3 font-bold text-slate-900">{r.studentName}</td>
                  <td className="p-3 font-semibold text-slate-700">{r.chapterTitle}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.evaluationStatus === "Excellent"
                          ? "bg-emerald-100 text-emerald-800"
                          : r.evaluationStatus === "Complete"
                          ? "bg-blue-100 text-blue-800"
                          : r.evaluationStatus === "Incomplete"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {r.evaluationStatus}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700 max-w-xs">{r.teacherRemarks}</td>
                  <td className="p-3 text-slate-600">{r.checkedBy}</td>
                  <td className="p-3 whitespace-nowrap text-slate-500">{r.checkDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
