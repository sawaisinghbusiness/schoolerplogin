"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Calendar,
  Download,
  Filter,
  Eye,
  FileText,
  PlusCircle,
  Users
} from "lucide-react";

interface HomeworkRecord {
  id: string;
  assignedDate: string;
  dueDate: string;
  classSec: string;
  subject: string;
  teacherName: string;
  content: string;
  attachmentName?: string;
  submissionsCount: number;
  totalStudents: number;
  smsSent: boolean;
}

export default function ShowHomeworkPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedHw, setSelectedHw] = useState<HomeworkRecord | null>(null);

  const [records, setRecords] = useState<HomeworkRecord[]>([
    {
      id: "HW-01",
      assignedDate: "2026-09-15",
      dueDate: "2026-09-17",
      classSec: "10th - A",
      subject: "Mathematics",
      teacherName: "Kailash Bishnoi",
      content: "Complete NCERT Chapter 6 (Triangles) Exercise 6.3 questions 1 to 8 in practice register.",
      attachmentName: "Triangles_Exercise_Hints.pdf",
      submissionsCount: 38,
      totalStudents: 42,
      smsSent: true
    },
    {
      id: "HW-02",
      assignedDate: "2026-09-15",
      dueDate: "2026-09-16",
      classSec: "10th - A",
      subject: "Science",
      teacherName: "Dr. Arvind Rathore",
      content: "Draw electron dot structure of methane, ethane, ethene and ethyne with bonding diagrams.",
      submissionsCount: 35,
      totalStudents: 42,
      smsSent: false
    },
    {
      id: "HW-03",
      assignedDate: "2026-09-14",
      dueDate: "2026-09-16",
      classSec: "8th - B",
      subject: "English Core",
      teacherName: "Pooja Sharma",
      content: "Write a 150-word descriptive essay on 'A Visit to the Thar Desert Fair' using rich vocabulary.",
      submissionsCount: 39,
      totalStudents: 40,
      smsSent: false
    },
    {
      id: "HW-04",
      assignedDate: "2026-09-14",
      dueDate: "2026-09-18",
      classSec: "12th - PCM",
      subject: "Physics",
      teacherName: "Bhawani Singh",
      content: "Solve numerical problems 12 to 24 from Chapter 4 (Moving Charges and Magnetism).",
      attachmentName: "Physics_Assignment_Sheet_04.pdf",
      submissionsCount: 28,
      totalStudents: 34,
      smsSent: true
    }
  ]);

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.content.toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedClass !== "all" && !r.classSec.includes(selectedClass)) return false;
    return matchesSearch;
  });

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <BookOpen className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>School Teacher</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">View Homework</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Published Class Homework Directory
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Audit daily assignments, download worksheets, check student submission counts, and track teacher posting regularity
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/homework"
            className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Assign New Homework</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search subject, teacher, content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-slate-500 text-[11px] font-semibold">Filter Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-1.5 border border-slate-300 rounded text-xs bg-white"
          >
            <option value="all">All Classes</option>
            <option value="10th">Class 10th</option>
            <option value="9th">Class 9th</option>
            <option value="8th">Class 8th</option>
            <option value="12th">Class 12th</option>
          </select>

          <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded border border-slate-300 flex items-center space-x-1">
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Homework Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3">Dates (Assigned / Due)</th>
                <th className="p-3">Class</th>
                <th className="p-3">Subject & Teacher</th>
                <th className="p-3">Assignment Description</th>
                <th className="p-3">Attachment</th>
                <th className="p-3">Submissions</th>
                <th className="p-3">SMS</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((r) => {
                const percent = Math.round((r.submissionsCount / r.totalStudents) * 100);
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{r.assignedDate}</div>
                      <div className="text-[10px] text-rose-600 font-bold">Due: {r.dueDate}</div>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{r.classSec}</td>
                    <td className="p-3">
                      <div className="font-bold text-[#26b99a]">{r.subject}</div>
                      <div className="text-[10px] text-slate-500">{r.teacherName}</div>
                    </td>
                    <td className="p-3 max-w-sm text-slate-700 leading-snug">{r.content}</td>
                    <td className="p-3">
                      {r.attachmentName ? (
                        <span className="text-[#26b99a] font-bold text-[11px] flex items-center space-x-1 hover:underline cursor-pointer">
                          <FileText className="w-3.5 h-3.5" />
                          <span className="max-w-[120px] truncate">{r.attachmentName}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">None</span>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-bold text-slate-800">
                        {r.submissionsCount}/{r.totalStudents} ({percent}%)
                      </div>
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="bg-[#26b99a] h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      {r.smsSent ? (
                        <span className="text-emerald-600 font-bold text-[11px]">Sent</span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedHw(r)}
                        className="p-1.5 text-slate-500 hover:text-[#26b99a] rounded hover:bg-slate-100"
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedHw && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-start border-b border-slate-200 pb-2">
              <div>
                <span className="text-[10px] text-slate-400 font-mono">{selectedHw.id}</span>
                <h3 className="font-bold text-sm text-slate-900">
                  {selectedHw.classSec} - {selectedHw.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedHw(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Teacher:</span>
                <span className="font-semibold text-slate-800">{selectedHw.teacherName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Assigned Date:</span>
                <span className="font-semibold text-slate-800">{selectedHw.assignedDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Submission Due Date:</span>
                <span className="font-semibold text-rose-600">{selectedHw.dueDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Submissions Status:</span>
                <span className="font-semibold text-emerald-600">
                  {selectedHw.submissionsCount} of {selectedHw.totalStudents} completed
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs leading-relaxed text-slate-800">
              <span className="font-bold block mb-1 text-slate-900">Instructions:</span>
              {selectedHw.content}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedHw(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 font-bold rounded text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
