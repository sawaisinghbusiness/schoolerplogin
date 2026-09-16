"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Search,
  Save,
  CheckCircle2,
  Filter,
  ArrowLeft
} from "lucide-react";
import { MOCK_STUDENTS } from "@/data/mockData";

export default function CoscholasticGradesPage() {
  const [selectedClass, setSelectedClass] = useState("10th - A");
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [success, setSuccess] = useState(false);

  const [grades, setGrades] = useState<{
    [key: string]: { workEdu: string; artEdu: string; healthEdu: string; discipline: string };
  }>({
    "STU-001": { workEdu: "A", artEdu: "A", healthEdu: "A", discipline: "A" },
    "STU-002": { workEdu: "A", artEdu: "B", healthEdu: "A", discipline: "A" },
    "STU-003": { workEdu: "B", artEdu: "B", healthEdu: "A", discipline: "B" },
    "STU-004": { workEdu: "A", artEdu: "A", healthEdu: "B", discipline: "A" },
    "STU-005": { workEdu: "B", artEdu: "C", healthEdu: "B", discipline: "B" }
  });

  const handleGradeChange = (
    studentId: string,
    field: "workEdu" | "artEdu" | "healthEdu" | "discipline",
    val: string
  ) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: val
      }
    }));
  };

  const handleSave = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

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
            <span className="text-slate-800 font-semibold">Co-Scholastic Grades</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Co-Scholastic 3-Point Grade Entry Matrix
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Grade students on 3-point scale (A = Outstanding, B = Very Good, C = Fair) across non-scholastic domains
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/coscholastic-skills"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors"
          >
            ← Skills Config
          </Link>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Grades</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Co-scholastic grades saved! Synchronized to Report Card printouts.</span>
        </div>
      )}

      {/* Selectors */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center space-x-4">
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
            <option>8th - A</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-700">Term:</span>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="p-1.5 border border-slate-300 rounded font-bold bg-white text-slate-900"
          >
            <option>Term 1</option>
            <option>Term 2</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="p-3">Roll / SR No.</th>
              <th className="p-3">Student Name</th>
              <th className="p-3 text-center">Work Education</th>
              <th className="p-3 text-center">Art Education</th>
              <th className="p-3 text-center">Health & Physical</th>
              <th className="p-3 text-center">Discipline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {MOCK_STUDENTS.slice(0, 5).map((s) => {
              const entry = grades[s.id] || { workEdu: "A", artEdu: "A", healthEdu: "A", discipline: "A" };
              return (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono">
                    <span className="font-bold text-slate-900 mr-1.5">Roll {s.rollNo}</span>
                    <span className="text-slate-400 text-[10px]">({s.srNo})</span>
                  </td>
                  <td className="p-3 font-bold text-slate-900">{s.name}</td>
                  {(["workEdu", "artEdu", "healthEdu", "discipline"] as const).map((field) => (
                    <td key={field} className="p-3 text-center">
                      <select
                        value={entry[field]}
                        onChange={(e) => handleGradeChange(s.id, field, e.target.value)}
                        className="p-1 border border-slate-300 rounded font-bold font-mono text-center text-xs bg-white text-slate-900"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                      </select>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
