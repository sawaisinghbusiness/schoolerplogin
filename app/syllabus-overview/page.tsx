"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  ChevronDown,
  Upload
} from "lucide-react";

interface SubjectSyllabus {
  id: string;
  subjectName: string;
  teacherName: string;
  totalChapters: number;
  completedChapters: number;
  inProgressChapters: number;
  targetCompletionDate: string;
  chapters: {
    no: number;
    title: string;
    plannedHours: number;
    status: "Completed" | "In Progress" | "Pending";
  }[];
}

export default function SyllabusOverviewPage() {
  const [selectedClass, setSelectedClass] = useState("10th");
  const [selectedStream, setSelectedStream] = useState("All");
  const [expandedSubject, setExpandedSubject] = useState<string | null>("SUB-01");

  const CLASSES = [
    "1st", "2nd", "3rd", "4th", "5th", "6th",
    "7th", "8th", "9th", "10th", "11th", "12th"
  ];

  const SYLLABUS_DATA: SubjectSyllabus[] = [
    {
      id: "SUB-01",
      subjectName: "Mathematics (NCERT)",
      teacherName: "Kailash Bishnoi",
      totalChapters: 14,
      completedChapters: 6,
      inProgressChapters: 1,
      targetCompletionDate: "15 Dec 2026",
      chapters: [
        { no: 1, title: "Real Numbers", plannedHours: 8, status: "Completed" },
        { no: 2, title: "Polynomials", plannedHours: 10, status: "Completed" },
        { no: 3, title: "Pair of Linear Equations in Two Variables", plannedHours: 14, status: "Completed" },
        { no: 4, title: "Quadratic Equations", plannedHours: 12, status: "Completed" },
        { no: 5, title: "Arithmetic Progressions", plannedHours: 10, status: "Completed" },
        { no: 6, title: "Triangles", plannedHours: 16, status: "Completed" },
        { no: 7, title: "Coordinate Geometry", plannedHours: 10, status: "In Progress" },
        { no: 8, title: "Introduction to Trigonometry", plannedHours: 12, status: "Pending" },
        { no: 9, title: "Some Applications of Trigonometry", plannedHours: 8, status: "Pending" },
        { no: 10, title: "Circles", plannedHours: 10, status: "Pending" },
        { no: 11, title: "Areas Related to Circles", plannedHours: 8, status: "Pending" },
        { no: 12, title: "Surface Areas and Volumes", plannedHours: 12, status: "Pending" },
        { no: 13, title: "Statistics", plannedHours: 10, status: "Pending" },
        { no: 14, title: "Probability", plannedHours: 6, status: "Pending" }
      ]
    },
    {
      id: "SUB-02",
      subjectName: "Science & Technology",
      teacherName: "Dr. Arvind Rathore",
      totalChapters: 13,
      completedChapters: 5,
      inProgressChapters: 1,
      targetCompletionDate: "20 Dec 2026",
      chapters: [
        { no: 1, title: "Chemical Reactions and Equations", plannedHours: 10, status: "Completed" },
        { no: 2, title: "Acids, Bases and Salts", plannedHours: 10, status: "Completed" },
        { no: 3, title: "Metals and Non-metals", plannedHours: 12, status: "Completed" },
        { no: 4, title: "Carbon and its Compounds", plannedHours: 14, status: "In Progress" },
        { no: 5, title: "Life Processes", plannedHours: 12, status: "Completed" },
        { no: 6, title: "Control and Coordination", plannedHours: 10, status: "Completed" }
      ]
    },
    {
      id: "SUB-03",
      subjectName: "English Language & Literature",
      teacherName: "Pooja Sharma",
      totalChapters: 18,
      completedChapters: 9,
      inProgressChapters: 2,
      targetCompletionDate: "10 Dec 2026",
      chapters: [
        { no: 1, title: "A Letter to God (First Flight)", plannedHours: 6, status: "Completed" },
        { no: 2, title: "Nelson Mandela: Long Walk to Freedom", plannedHours: 8, status: "Completed" }
      ]
    }
  ];

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
            <span className="text-slate-800 font-semibold">Syllabus Overview</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Academic Syllabus Coverage Matrix
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Monitor course completion percentages, chapter schedules, and pacing for CBSE Board standards
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/syllabus-progress"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors flex items-center space-x-1"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Teacher Lesson Pacing</span>
          </Link>
          <Link
            href="/syllabus-file"
            className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Syllabus PDF</span>
          </Link>
        </div>
      </div>

      {/* Class Pills */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
            Select Class / Standard:
          </span>
          <span className="text-slate-400 text-[10px]">Session: 2026-2027</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CLASSES.map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-3 py-1.5 rounded-md font-bold text-xs transition-all ${
                selectedClass === cls
                  ? "bg-[#26b99a] text-white shadow-xs"
                  : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              Class {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Cards */}
      <div className="space-y-4">
        {SYLLABUS_DATA.map((sub) => {
          const percent = Math.round((sub.completedChapters / sub.totalChapters) * 100);
          const isExpanded = expandedSubject === sub.id;

          return (
            <div
              key={sub.id}
              className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden transition-all"
            >
              <div
                onClick={() => setExpandedSubject(isExpanded ? null : sub.id)}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-slate-900">{sub.subjectName}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                      Class {selectedClass}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Faculty: <span className="font-semibold text-slate-700">{sub.teacherName}</span> • Target: {sub.targetCompletionDate}
                  </p>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-[11px] font-bold text-slate-700">
                      {sub.completedChapters} of {sub.totalChapters} Chapters
                    </div>
                    <div className="w-36 bg-slate-100 rounded-full h-2 mt-1 overflow-hidden">
                      <div
                        className="bg-[#26b99a] h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <span className="font-black text-sm text-[#26b99a] w-12 text-right">
                    {percent}%
                  </span>

                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Expanded Chapter Breakdown */}
              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50/50 p-4 animate-fadeIn">
                  <h4 className="font-bold text-slate-800 mb-2 text-[11px] uppercase tracking-wider">
                    Chapter-wise Plan & Status
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {sub.chapters.map((ch) => (
                      <div
                        key={ch.no}
                        className="bg-white p-2.5 rounded border border-slate-200 flex items-start justify-between space-x-2"
                      >
                        <div>
                          <span className="font-mono text-[10px] text-slate-400 font-bold block">
                            Ch {ch.no} ({ch.plannedHours} hrs)
                          </span>
                          <span className="font-semibold text-slate-800 text-[11px] line-clamp-2">
                            {ch.title}
                          </span>
                        </div>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                            ch.status === "Completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : ch.status === "In Progress"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {ch.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
