"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Save,
  CheckCircle2,
  Search,
  Filter,
  ArrowLeft,
  ChevronRight
} from "lucide-react";
import { MOCK_STUDENTS } from "@/data/mockData";

export default function AssignMentorPage() {
  const [selectedTeacher, setSelectedTeacher] = useState("Kailash Bishnoi (T-014)");
  const [selectedClass, setSelectedClass] = useState("10th - A");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(["STU-001", "STU-002"]);
  const [success, setSuccess] = useState(false);

  const TEACHERS = [
    "Kailash Bishnoi (T-014)",
    "Dr. Arvind Rathore (T-003)",
    "Pooja Sharma (T-021)",
    "Anand Soni (T-008)",
    "Sunita Purohit (T-019)",
    "Bhawani Singh (T-011)"
  ];

  const toggleStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((s) => s !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
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
            <UserCheck className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Exam Cell</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Assign Mentors</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Assign Faculty Mentors to Student Cohorts
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Pair individual teachers with designated mentee groups for behavioral monitoring, academic counseling and parent contact
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/mentees"
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors flex items-center space-x-1"
          >
            <Users className="w-3.5 h-3.5 text-[#26b99a]" />
            <span>Open Mentees Portal</span>
          </Link>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{selectedStudentIds.length} students successfully assigned to {selectedTeacher}!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 1 Col: Mentor Selector */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <span className="font-bold text-slate-900 text-xs block border-b border-slate-100 pb-2">
            1. Select Faculty Mentor
          </span>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mentor / Teacher *</label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded font-bold bg-white text-slate-900"
            >
              {TEACHERS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Filter Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded bg-white"
            >
              <option>10th - A</option>
              <option>9th - B</option>
              <option>12th - PCM</option>
              <option>8th - A</option>
            </select>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
            <span className="font-bold text-slate-700 block text-[11px]">Assigned Summary</span>
            <p className="text-slate-500 text-[11px]">
              Currently selected: <span className="font-bold text-[#26b99a]">{selectedStudentIds.length} Mentees</span>
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#26b99a] hover:bg-[#209b81] text-white font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Mentor Allotment</span>
          </button>
        </div>

        {/* Right 2 Cols: Student Selection Table */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
            <span className="font-bold text-slate-900">
              2. Select Students to Assign ({MOCK_STUDENTS.length} Available)
            </span>
            <div className="space-x-2 text-[11px]">
              <button
                type="button"
                onClick={() => setSelectedStudentIds(MOCK_STUDENTS.map((s) => s.id))}
                className="text-[#26b99a] font-bold hover:underline"
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setSelectedStudentIds([])}
                className="text-slate-500 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="p-3 w-10 text-center">Select</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Class - Sec</th>
                  <th className="p-3">Roll / SR No.</th>
                  <th className="p-3">Father Name</th>
                  <th className="p-3">Mobile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {MOCK_STUDENTS.map((s) => {
                  const isChecked = selectedStudentIds.includes(s.id);
                  return (
                    <tr
                      key={s.id}
                      onClick={() => toggleStudent(s.id)}
                      className={`cursor-pointer transition-colors ${
                        isChecked ? "bg-emerald-50/50" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-[#26b99a] focus:ring-[#26b99a]"
                        />
                      </td>
                      <td className="p-3 font-bold text-slate-900">{s.name}</td>
                      <td className="p-3 font-semibold text-slate-700">{s.classSec}</td>
                      <td className="p-3 font-mono text-slate-600">
                        Roll {s.rollNo} ({s.srNo})
                      </td>
                      <td className="p-3 text-slate-600">{s.fatherName}</td>
                      <td className="p-3 font-mono text-slate-600">{s.mobile}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </div>
  );
}
