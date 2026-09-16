"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart2,
  Search,
  Download,
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  TrendingUp,
  Star
} from "lucide-react";

interface TeacherKpi {
  id: string;
  empCode: string;
  name: string;
  department: string;
  assignedClasses: string;
  syllabusCompletion: number;
  classTestAvg: number;
  attendancePunctuality: number;
  homeworkConsistency: number;
  overallRating: "A+" | "A" | "B+" | "B";
}

export default function TeacherPerformancePage() {
  const [searchTerm, setSearchTerm] = useState("");

  const TEACHERS: TeacherKpi[] = [
    {
      id: "T-014",
      empCode: "T-014",
      name: "Kailash Bishnoi",
      department: "Mathematics",
      assignedClasses: "10th-A, 10th-B, 9th-A",
      syllabusCompletion: 92,
      classTestAvg: 84,
      attendancePunctuality: 98,
      homeworkConsistency: 96,
      overallRating: "A+"
    },
    {
      id: "T-003",
      empCode: "T-003",
      name: "Dr. Arvind Rathore",
      department: "Science",
      assignedClasses: "10th-A, 10th-B, 9th-B",
      syllabusCompletion: 88,
      classTestAvg: 79,
      attendancePunctuality: 95,
      homeworkConsistency: 91,
      overallRating: "A"
    },
    {
      id: "T-021",
      empCode: "T-021",
      name: "Pooja Sharma",
      department: "English Literature",
      assignedClasses: "8th-A, 8th-B, 10th-A",
      syllabusCompletion: 95,
      classTestAvg: 88,
      attendancePunctuality: 100,
      homeworkConsistency: 98,
      overallRating: "A+"
    },
    {
      id: "T-008",
      empCode: "T-008",
      name: "Anand Soni",
      department: "Commerce & Accounts",
      assignedClasses: "11th-Comm, 12th-Comm",
      syllabusCompletion: 82,
      classTestAvg: 76,
      attendancePunctuality: 92,
      homeworkConsistency: 85,
      overallRating: "B+"
    },
    {
      id: "T-011",
      empCode: "T-011",
      name: "Bhawani Singh",
      department: "Physics & Sports",
      assignedClasses: "12th-PCM, 11th-PCM",
      syllabusCompletion: 86,
      classTestAvg: 81,
      attendancePunctuality: 96,
      homeworkConsistency: 89,
      overallRating: "A"
    }
  ];

  const filtered = TEACHERS.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.empCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <BarChart2 className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Admin Reports</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Teacher Performance</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Teacher Academic Performance Scorecard
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Holistic faculty audit: syllabus completion %, class test results average, punctuality, and homework consistency
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1">
            <Download className="w-3.5 h-3.5" />
            <span>Export KPI Report</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-slate-500 text-[11px] font-bold uppercase">Avg Syllabus Progress</span>
          <div className="text-2xl font-black text-[#26b99a] mt-1">88.6%</div>
          <span className="text-[10px] text-slate-400">Target for Mid-Term</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-slate-500 text-[11px] font-bold uppercase">Class Test Passing Avg</span>
          <div className="text-2xl font-black text-blue-600 mt-1">81.6%</div>
          <span className="text-[10px] text-slate-400">Across 68 Sections</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-slate-500 text-[11px] font-bold uppercase">Faculty Attendance</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">96.2%</div>
          <span className="text-[10px] text-slate-400">Biometric Sync</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-slate-500 text-[11px] font-bold uppercase">Top Rated Teachers</span>
          <div className="text-2xl font-black text-amber-600 mt-1">14 Staff</div>
          <span className="text-[10px] text-slate-400">A+ Performance Grade</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search faculty name, department, code..."
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
                <th className="p-3"># Code</th>
                <th className="p-3">Teacher Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Allotted Classes</th>
                <th className="p-3">Syllabus %</th>
                <th className="p-3">Test Avg %</th>
                <th className="p-3">Attendance %</th>
                <th className="p-3">HW Score</th>
                <th className="p-3 text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-700">{t.empCode}</td>
                  <td className="p-3 font-bold text-slate-900">{t.name}</td>
                  <td className="p-3 font-semibold text-slate-700">{t.department}</td>
                  <td className="p-3 text-slate-600">{t.assignedClasses}</td>
                  <td className="p-3 font-bold text-slate-800">{t.syllabusCompletion}%</td>
                  <td className="p-3 font-bold text-blue-600">{t.classTestAvg}%</td>
                  <td className="p-3 font-bold text-emerald-600">{t.attendancePunctuality}%</td>
                  <td className="p-3 font-bold text-purple-600">{t.homeworkConsistency}/100</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        t.overallRating === "A+"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : t.overallRating === "A"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {t.overallRating}
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
