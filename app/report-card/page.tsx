"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Printer,
  Download,
  Search,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowLeft
} from "lucide-react";
import { MOCK_STUDENTS } from "@/data/mockData";

export default function ReportCardPage() {
  const [selectedClass, setSelectedClass] = useState("10th - A");
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [selectedStudent, setSelectedStudent] = useState<typeof MOCK_STUDENTS[0] | null>(null);

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
            <span className="text-slate-800 font-semibold">Report Cards</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            CBSE Official Student Report Cards
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Bulk print and publish CBSE bi-annual report cards with marks tabulation, co-scholastic grades, and attendance summary
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/exam-schedule"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors"
          >
            ← Exam Schedule
          </Link>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Bulk Print All (Class {selectedClass})</span>
          </button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-slate-700">Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-1.5 border border-slate-300 rounded font-bold bg-white text-slate-900"
          >
            <option>10th - A</option>
            <option>10th - B</option>
            <option>9th - A</option>
            <option>12th - PCM</option>
          </select>

          <span className="font-bold text-slate-700 ml-2">Assessment Term:</span>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="p-1.5 border border-slate-300 rounded font-bold bg-white text-slate-900"
          >
            <option>Term 1 (Mid-Term)</option>
            <option>Annual Final (Combined)</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-500 font-semibold">
          Affiliation Code: <strong className="text-slate-900">1040211</strong>
        </div>
      </div>

      {/* Student List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_STUDENTS.slice(0, 6).map((student) => (
          <div
            key={student.id}
            className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <img
                src={student.photoUrl}
                alt={student.name}
                className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
              />
              <div className="space-y-0.5">
                <h3 className="font-bold text-slate-900 text-sm">{student.name}</h3>
                <p className="text-[11px] text-slate-500 font-semibold">
                  Roll No: {student.rollNo} • SR: {student.srNo}
                </p>
                <p className="text-[10px] text-slate-400">Father: {student.fatherName}</p>
              </div>
            </div>

            <div className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Term 1 Total:</span>
              <span className="font-bold text-[#26b99a]">360 / 400 (90%) - Grade A2</span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                onClick={() => setSelectedStudent(student)}
                className="px-3 py-1 bg-slate-100 hover:bg-[#26b99a] hover:text-white rounded font-bold text-[11px] text-slate-700 transition-colors flex items-center space-x-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Card</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-1 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold text-[11px] shadow-xs flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Report Card Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-start border-b border-slate-200 pb-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900">CBSE Report Card Preview</h3>
                <span className="text-[10px] text-slate-400">Mother Teresa Nobles Academy Sr. Sec. School</span>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base"
              >
                ✕
              </button>
            </div>

            {/* Official Report Card Layout */}
            <div className="border-2 border-slate-800 p-5 rounded space-y-3 bg-white text-slate-900">
              <div className="text-center space-y-0.5 border-b-2 border-slate-800 pb-2">
                <h2 className="text-sm font-black uppercase tracking-wider">
                  MOTHER TERESA NOBLES ACADEMY SR. SEC. SCHOOL
                </h2>
                <p className="text-[10px] text-slate-600">
                  Affiliated to CBSE, New Delhi • School Code: 1040211 • Barmer (Raj.)
                </p>
                <div className="text-[11px] font-black uppercase text-emerald-800 pt-1">
                  REPORT CARD • SESSION 2026-2027
                </div>
              </div>

              {/* Student Info */}
              <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-slate-200 pb-2">
                <div>Student Name: <strong>{selectedStudent.name}</strong></div>
                <div>Roll No: <strong>{selectedStudent.rollNo}</strong></div>
                <div>Father Name: <strong>{selectedStudent.fatherName}</strong></div>
                <div>Class & Section: <strong>{selectedStudent.classSec}</strong></div>
                <div>Mother Name: <strong>{selectedStudent.motherName}</strong></div>
                <div>Scholar No (SR): <strong>{selectedStudent.srNo}</strong></div>
              </div>

              {/* Marks Table */}
              <div>
                <span className="font-bold text-[10px] uppercase text-slate-700 block mb-1">
                  Part 1: Scholastic Areas
                </span>
                <table className="w-full text-left border-collapse border border-slate-300 text-[10px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-300">
                      <th className="p-1.5 border-r border-slate-300">Subject Name</th>
                      <th className="p-1.5 text-center border-r border-slate-300">Max Marks</th>
                      <th className="p-1.5 text-center border-r border-slate-300">Marks Obtained</th>
                      <th className="p-1.5 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr><td className="p-1.5 border-r border-slate-300 font-semibold">Mathematics (041)</td><td className="p-1.5 text-center border-r border-slate-300">80</td><td className="p-1.5 text-center border-r border-slate-300 font-bold">76</td><td className="p-1.5 text-center font-bold">A2</td></tr>
                    <tr><td className="p-1.5 border-r border-slate-300 font-semibold">Science (086)</td><td className="p-1.5 text-center border-r border-slate-300">80</td><td className="p-1.5 text-center border-r border-slate-300 font-bold">72</td><td className="p-1.5 text-center font-bold">A2</td></tr>
                    <tr><td className="p-1.5 border-r border-slate-300 font-semibold">English Lang & Lit (184)</td><td className="p-1.5 text-center border-r border-slate-300">80</td><td className="p-1.5 text-center border-r border-slate-300 font-bold">70</td><td className="p-1.5 text-center font-bold">B1</td></tr>
                    <tr><td className="p-1.5 border-r border-slate-300 font-semibold">Hindi Course A (002)</td><td className="p-1.5 text-center border-r border-slate-300">80</td><td className="p-1.5 text-center border-r border-slate-300 font-bold">74</td><td className="p-1.5 text-center font-bold">A2</td></tr>
                    <tr><td className="p-1.5 border-r border-slate-300 font-semibold">Social Science (087)</td><td className="p-1.5 text-center border-r border-slate-300">80</td><td className="p-1.5 text-center border-r border-slate-300 font-bold">68</td><td className="p-1.5 text-center font-bold">B2</td></tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-black border-t border-slate-300">
                      <td className="p-1.5 border-r border-slate-300">Grand Total</td>
                      <td className="p-1.5 text-center border-r border-slate-300">400</td>
                      <td className="p-1.5 text-center border-r border-slate-300 text-emerald-700">360 (90%)</td>
                      <td className="p-1.5 text-center text-emerald-700">A2</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Co-Scholastic & Attendance */}
              <div className="grid grid-cols-2 gap-3 text-[10px] pt-1">
                <div className="p-2 border border-slate-200 rounded">
                  <span className="font-bold block mb-1">Part 2: Co-Scholastic (3-Point Scale)</span>
                  <div className="space-y-0.5">
                    <div className="flex justify-between"><span>Work Education:</span><strong>Grade A</strong></div>
                    <div className="flex justify-between"><span>Art Education:</span><strong>Grade A</strong></div>
                    <div className="flex justify-between"><span>Health & Physical:</span><strong>Grade A</strong></div>
                    <div className="flex justify-between"><span>Discipline:</span><strong>Grade A</strong></div>
                  </div>
                </div>

                <div className="p-2 border border-slate-200 rounded space-y-1">
                  <span className="font-bold block">Attendance & Teacher Remark</span>
                  <div className="flex justify-between"><span>Attendance:</span><strong>184 / 196 Days (93.8%)</strong></div>
                  <div className="pt-1 text-slate-600 italic leading-tight">
                    &ldquo;Excellent grasping ability and regular participation in class assignments.&rdquo;
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-6 flex justify-between items-end text-[10px]">
                <div className="text-center"><span className="border-t border-slate-800 pt-1 font-bold block w-24">Class Teacher</span></div>
                <div className="text-center"><span className="border-t border-slate-800 pt-1 font-bold block w-24">Parent Signature</span></div>
                <div className="text-center"><span className="border-t border-slate-800 pt-1 font-bold block w-24">Principal Seal</span></div>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
