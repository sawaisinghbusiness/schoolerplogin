"use client";

import React, { useState } from "react";
import { Award, Download, Printer, Eye } from "lucide-react";
import { MOCK_STUDENTS, Student } from "@/data/mockData";

export default function ReportCardsPage() {
  const [selectedClass, setSelectedClass] = useState("10th - A");
  const [activeStudent, setActiveStudent] = useState<Student>(MOCK_STUDENTS[0]);

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manage Exams</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Report Cards (CBSE / ICSE)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Academic Performance Report Card Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            CBSE standardized holistic progress card with scholastic & co-scholastic marks, attendance, and teacher remarks
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Report Card</span>
        </button>
      </div>

      <div className="flex items-center space-x-3 text-xs bg-white p-3 rounded-lg border border-slate-200">
        <span className="font-bold text-slate-600">Select Student to Preview:</span>
        <select
          value={activeStudent.id}
          onChange={(e) => {
            const found = MOCK_STUDENTS.find(s => s.id === e.target.value);
            if (found) setActiveStudent(found);
          }}
          className="p-1.5 border border-slate-300 rounded font-semibold bg-slate-50"
        >
          {MOCK_STUDENTS.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.classSec} - Roll {s.rollNo})</option>
          ))}
        </select>
      </div>

      {/* Official CBSE Report Card Sheet */}
      <div className="p-6 bg-white rounded-xl border-2 border-slate-300 shadow-md space-y-5 text-xs">
        {/* Header */}
        <div className="text-center border-b-2 border-slate-800 pb-3 space-y-1">
          <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
            Mother Teresa Nobles Academy
          </h2>
          <p className="text-[11px] text-slate-600 font-semibold">
            CBSE Affiliated Senior Secondary Institution | Barmer, Rajasthan
          </p>
          <div className="text-[10px] text-emerald-800 font-mono font-bold">
            ANNUAL HOLISTIC REPORT CARD | ACADEMIC SESSION 2026-27 | ACCOUNT: SLRJ0402749
          </div>
        </div>

        {/* Bio Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px]">
          <div><span className="text-slate-400 block">Student Name:</span><strong className="text-slate-900">{activeStudent.name}</strong></div>
          <div><span className="text-slate-400 block">Class & Section:</span><strong className="text-slate-900">{activeStudent.classSec}</strong></div>
          <div><span className="text-slate-400 block">Scholar No (SR):</span><strong className="text-slate-900 font-mono">{activeStudent.srNo}</strong></div>
          <div><span className="text-slate-400 block">Roll Number:</span><strong className="text-slate-900 font-mono">{activeStudent.rollNo}</strong></div>
          <div><span className="text-slate-400 block">Father&apos;s Name:</span><span className="text-slate-800">{activeStudent.fatherName}</span></div>
          <div><span className="text-slate-400 block">Mother&apos;s Name:</span><span className="text-slate-800">{activeStudent.motherName}</span></div>
          <div><span className="text-slate-400 block">DOB:</span><span className="text-slate-800 font-mono">{activeStudent.dob}</span></div>
          <div><span className="text-slate-400 block">House:</span><strong className="text-purple-700">{activeStudent.house}</strong></div>
        </div>

        {/* Scholastic Table */}
        <div className="space-y-1">
          <div className="font-bold text-xs uppercase tracking-wider text-slate-800">
            Part 1: Scholastic Academic Evaluation
          </div>
          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 font-bold border-b border-slate-300 text-[11px]">
              <tr>
                <th className="p-2 border-r border-slate-300">Subject Name</th>
                <th className="p-2 border-r border-slate-300 text-center">Theory (80)</th>
                <th className="p-2 border-r border-slate-300 text-center">Internal (20)</th>
                <th className="p-2 border-r border-slate-300 text-center">Total (100)</th>
                <th className="p-2 text-center">CBSE Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-2 font-bold border-r border-slate-200">English Core</td>
                <td className="p-2 text-center font-mono border-r border-slate-200">72</td>
                <td className="p-2 text-center font-mono border-r border-slate-200">18</td>
                <td className="p-2 text-center font-mono font-bold border-r border-slate-200">90</td>
                <td className="p-2 text-center font-bold font-mono text-emerald-700">A1</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border-r border-slate-200">Mathematics / Applied Math</td>
                <td className="p-2 text-center font-mono border-r border-slate-200">74</td>
                <td className="p-2 text-center font-mono border-r border-slate-200">19</td>
                <td className="p-2 text-center font-mono font-bold border-r border-slate-200">93</td>
                <td className="p-2 text-center font-bold font-mono text-emerald-700">A1</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border-r border-slate-200">Science / Physics</td>
                <td className="p-2 text-center font-mono border-r border-slate-200">68</td>
                <td className="p-2 text-center font-mono border-r border-slate-200">18</td>
                <td className="p-2 text-center font-mono font-bold border-r border-slate-200">86</td>
                <td className="p-2 text-center font-bold font-mono text-emerald-700">A2</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border-r border-slate-200">Social Science / Chemistry</td>
                <td className="p-2 text-center font-mono border-r border-slate-200">70</td>
                <td className="p-2 text-center font-mono border-r border-slate-200">19</td>
                <td className="p-2 text-center font-mono font-bold border-r border-slate-200">89</td>
                <td className="p-2 text-center font-bold font-mono text-emerald-700">A2</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Remarks & Signatures */}
        <div className="pt-8 flex items-center justify-between text-xs text-center border-t border-slate-200">
          <div><strong className="block border-t border-slate-400 pt-1 w-32">Class Teacher Sign</strong></div>
          <div><strong className="block border-t border-slate-400 pt-1 w-32">Examination Head</strong></div>
          <div><strong className="block border-t border-slate-400 pt-1 w-32">Principal Stamp & Seal</strong></div>
        </div>
      </div>
    </div>
  );
}
