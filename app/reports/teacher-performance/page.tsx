"use client";

import React from "react";
import { UserCheck2, Download, Award, Star } from "lucide-react";

export default function TeacherPerformancePage() {
  const teachers = [
    { name: "Mrs. Sunita Sharma", dept: "Mathematics", syllabusCovered: "88%", avgClassMarks: "84.5%", studentRating: 4.8, status: "Outstanding" },
    { name: "Mr. Vikram Verma", dept: "Science (Physics)", syllabusCovered: "92%", avgClassMarks: "81.2%", studentRating: 4.7, status: "Excellent" },
    { name: "Ms. Rekha Choudhary", dept: "Languages (English)", syllabusCovered: "85%", avgClassMarks: "79.0%", studentRating: 4.6, status: "Very Good" },
    { name: "Mr. Mahendra Singh", dept: "Physical Education", syllabusCovered: "95%", avgClassMarks: "89.0%", studentRating: 4.9, status: "Outstanding" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <UserCheck2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Admin Reports</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Teacher KPI Audits</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Teacher Academic Performance & Class Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate faculty efficiency through syllabus completion percentage, class test average scores, and parent feedback
          </p>
        </div>

        <button
          onClick={() => alert("Downloading Faculty KPI Report...")}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export KPI Report</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4">Faculty Member</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Syllabus Completion</th>
              <th className="py-3 px-4">Batch Average Marks</th>
              <th className="py-3 px-4">Feedback Rating</th>
              <th className="py-3 px-4 text-center">Annual Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {teachers.map((t, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">{t.name}</td>
                <td className="py-3 px-4">{t.dept}</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-700">{t.syllabusCovered}</td>
                <td className="py-3 px-4 font-mono">{t.avgClassMarks}</td>
                <td className="py-3 px-4 flex items-center space-x-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{t.studentRating} / 5.0</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
