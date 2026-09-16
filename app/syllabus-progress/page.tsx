"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  User,
  Plus
} from "lucide-react";

interface LessonEntry {
  id: string;
  teacherName: string;
  classSec: string;
  subject: string;
  chapterTitle: string;
  topicTaught: string;
  teachingDate: string;
  periodsTaken: number;
  homeworkGiven: string;
}

export default function SyllabusProgressPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

  const [lessons, setLessons] = useState<LessonEntry[]>([
    {
      id: "LES-01",
      teacherName: "Kailash Bishnoi",
      classSec: "10th - A",
      subject: "Mathematics",
      chapterTitle: "Chapter 6: Triangles",
      topicTaught: "Basic Proportionality Theorem (Thales Theorem) Proof and Corollaries",
      teachingDate: "2026-09-15",
      periodsTaken: 2,
      homeworkGiven: "NCERT Exercise 6.2 questions 1 to 6 in practice notebook."
    },
    {
      id: "LES-02",
      teacherName: "Dr. Arvind Rathore",
      classSec: "10th - A",
      subject: "Science",
      chapterTitle: "Chapter 4: Carbon and its Compounds",
      topicTaught: "Homologous series, functional groups (alcohols, aldehydes, ketones)",
      teachingDate: "2026-09-15",
      periodsTaken: 1,
      homeworkGiven: "Draw structural formulas of first 4 members of alcohol series."
    },
    {
      id: "LES-03",
      teacherName: "Pooja Sharma",
      classSec: "8th - B",
      subject: "English",
      chapterTitle: "Chapter 3: Glimpses of the Past",
      topicTaught: "Pictorial narrative reading and comprehension questions",
      teachingDate: "2026-09-14",
      periodsTaken: 1,
      homeworkGiven: "Write short paragraph on 1857 Revolt in your own words."
    }
  ]);

  const filtered = lessons.filter((l) => {
    const matchesSearch =
      l.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.chapterTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.topicTaught.toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedClass !== "all" && !l.classSec.includes(selectedClass)) return false;
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
            <span>Manage Syllabus</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Teacher Daily Lessons</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Daily Teacher Lesson Log & Topic Pacing
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Audit daily classroom instruction logs submitted by subject teachers across sections
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/syllabus-overview"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors"
          >
            ← View Syllabus Matrix
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search teacher, topic, chapter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-slate-500 text-[11px] font-semibold">Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-1.5 border border-slate-300 rounded text-xs bg-white"
          >
            <option value="all">All Classes</option>
            <option value="10th">10th</option>
            <option value="8th">8th</option>
            <option value="12th">12th</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3">Date</th>
                <th className="p-3">Teacher</th>
                <th className="p-3">Class - Sec</th>
                <th className="p-3">Subject & Chapter</th>
                <th className="p-3">Topic / Concepts Covered</th>
                <th className="p-3">Periods</th>
                <th className="p-3">Homework Assigned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 whitespace-nowrap font-mono font-semibold text-slate-700">
                    {l.teachingDate}
                  </td>
                  <td className="p-3 font-bold text-slate-900">{l.teacherName}</td>
                  <td className="p-3 font-semibold text-slate-700">{l.classSec}</td>
                  <td className="p-3">
                    <div className="font-bold text-[#26b99a]">{l.subject}</div>
                    <div className="text-[10px] text-slate-500">{l.chapterTitle}</div>
                  </td>
                  <td className="p-3 text-slate-800 max-w-sm">{l.topicTaught}</td>
                  <td className="p-3 font-bold text-slate-700">{l.periodsTaken}</td>
                  <td className="p-3 text-slate-600 max-w-xs truncate italic">{l.homeworkGiven}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
