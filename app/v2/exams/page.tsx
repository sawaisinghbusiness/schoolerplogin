"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Calendar,
  FileText,
  Plus,
  Search,
  Download,
  Printer,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Filter,
  BarChart2,
  Sliders,
  Layers
} from "lucide-react";

export default function ExamsV2Page() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "classtests" | "terms" | "marks" | "gazette" | "reportcards" | "settings"
  >("overview");
  const [selectedClass, setSelectedClass] = useState("10th - A");
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Stats for 6-card pipeline
  const PIPELINE = [
    { title: "Upcoming Tests", count: 4, label: "Scheduled this week", color: "text-blue-600 bg-blue-50" },
    { title: "Conducting Today", count: 2, label: "Math & Physics Test", color: "text-amber-600 bg-amber-50" },
    { title: "Marks Pending Entry", count: 3, label: "Awaiting teacher marks", color: "text-rose-600 bg-rose-50" },
    { title: "Evaluated & Verified", count: 18, label: "Ready for gazette", color: "text-emerald-600 bg-emerald-50" },
    { title: "Published to App", count: 16, label: "Visible on Parent App", color: "text-purple-600 bg-purple-50" },
    { title: "Report Cards Ready", count: 42, label: "Class 10th-A batch", color: "text-teal-600 bg-teal-50" }
  ];

  const EXAMS_LIST = [
    { id: "EXM-01", name: "Pre-Board Examination Term 1", term: "Term 1", classes: "10th, 12th", startDate: "2026-09-25", endDate: "2026-10-06", status: "Scheduled" },
    { id: "EXM-02", name: "Half Yearly Assessment 2026", term: "Term 1", classes: "1st to 9th, 11th", startDate: "2026-10-08", endDate: "2026-10-18", status: "Scheduled" },
    { id: "EXM-03", name: "Periodic Assessment Test 1 (PT-1)", term: "Term 1", classes: "All Classes", startDate: "2026-07-22", endDate: "2026-07-30", status: "Completed" }
  ];

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
            <span className="text-slate-800 font-semibold">Exams Portal v2 (Beta)</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Comprehensive Examination Management Hub
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Class tests pipeline, CBSE Board examinations, gazette tabulation sheets, and automated report card publishing
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/exam-schedule"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors flex items-center space-x-1"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Green Sheet Schedule</span>
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Exam</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 7 Modern Tabs Bar */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2">
        {[
          { key: "overview", label: "Dashboard Overview" },
          { key: "classtests", label: "Weekly Class Tests" },
          { key: "terms", label: "Terms & Board Exams" },
          { key: "marks", label: "Marks Entry Matrix" },
          { key: "gazette", label: "Gazette Result Sheet" },
          { key: "reportcards", label: "Report Cards (Bulk)" },
          { key: "settings", label: "Grade Scales & Keys" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3 py-1.5 rounded-md font-bold text-xs transition-all ${
              activeTab === tab.key
                ? "bg-[#26b99a] text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 6-Card Pipeline */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {PIPELINE.map((p, idx) => (
          <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase truncate block">{p.title}</span>
            <div className={`text-2xl font-black ${p.color.split(" ")[0]}`}>{p.count}</div>
            <span className="text-[10px] text-slate-400 block truncate">{p.label}</span>
          </div>
        ))}
      </div>

      {/* Tab Content 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Active & Scheduled Examinations</span>
              <span className="text-slate-400 text-[11px]">Academic Session 2026-2027</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="p-3"># Exam ID</th>
                    <th className="p-3">Examination Title</th>
                    <th className="p-3">Academic Term</th>
                    <th className="p-3">Applicable Standards</th>
                    <th className="p-3">Dates</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {EXAMS_LIST.map((ex) => (
                    <tr key={ex.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-700">{ex.id}</td>
                      <td className="p-3 font-bold text-slate-900">{ex.name}</td>
                      <td className="p-3 font-semibold text-slate-700">{ex.term}</td>
                      <td className="p-3 text-slate-600">{ex.classes}</td>
                      <td className="p-3 whitespace-nowrap text-slate-600">
                        {ex.startDate} to {ex.endDate}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ex.status === "Scheduled"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {ex.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Link
                            href="/view-result"
                            className="px-2.5 py-1 bg-slate-100 hover:bg-[#26b99a] hover:text-white rounded font-bold text-[10px] text-slate-700 transition-colors"
                          >
                            Enter Marks
                          </Link>
                          <Link
                            href="/report-card"
                            className="px-2.5 py-1 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold text-[10px] shadow-xs"
                          >
                            Report Cards
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Weekly Class Tests */}
      {activeTab === "classtests" && (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Weekly Class Test Tracker</h3>
              <p className="text-slate-500 text-[11px]">Track 20-mark and 25-mark weekly unit tests by teachers</p>
            </div>
            <Link
              href="/class-test-report-card"
              className="px-3 py-1.5 bg-[#26b99a] text-white font-bold rounded shadow-xs"
            >
              Class Test Report Card &rarr;
            </Link>
          </div>
          <p className="text-slate-600">
            Click on &apos;Enter Marks&apos; to record weekly class test scores or generate student progress cards.
          </p>
        </div>
      )}

      {/* Tab Content 3: Terms & Board Exams */}
      {activeTab === "terms" && (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-sm text-slate-900">Terms Weightage Setup</h3>
            <Link href="/list-terms" className="text-[#26b99a] font-bold hover:underline">
              Manage Terms Page &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="font-bold block text-slate-900">Term 1 (Half Yearly)</span>
              <span className="text-slate-500 text-[11px]">Weightage: 40% in Annual Final Card</span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="font-bold block text-slate-900">Term 2 (Annual Exam)</span>
              <span className="text-slate-500 text-[11px]">Weightage: 60% in Annual Final Card</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 4: Marks Entry */}
      {activeTab === "marks" && (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-sm text-slate-900">Subject Marks Matrix</h3>
            <Link href="/view-result" className="text-[#26b99a] font-bold hover:underline">
              Open Full Marks Matrix &rarr;
            </Link>
          </div>
          <p className="text-slate-600">
            Easily enter theory marks, practical scores, and internal assessments with instant totals and grade calculations.
          </p>
        </div>
      )}

      {/* Tab Content 5: Gazette */}
      {activeTab === "gazette" && (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-sm text-slate-900">Master Class Gazette Register</h3>
            <button onClick={() => window.print()} className="px-3 py-1.5 bg-slate-100 font-bold rounded flex items-center space-x-1">
              <Printer className="w-3.5 h-3.5" />
              <span>Print Gazette Sheet</span>
            </button>
          </div>
          <p className="text-slate-600">
            Official tabulated gazette register containing all student marks, total percentage, division, and ranks.
          </p>
        </div>
      )}

      {/* Tab Content 6: Report Cards */}
      {activeTab === "reportcards" && (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-sm text-slate-900">Bulk Report Card Printing</h3>
            <Link href="/report-card" className="text-[#26b99a] font-bold hover:underline">
              Open Report Card Generator &rarr;
            </Link>
          </div>
          <p className="text-slate-600">
            Generate and bulk-download official CBSE Report Cards featuring school crest, grading scale, attendance, and signatures.
          </p>
        </div>
      )}

      {/* Tab Content 7: Settings */}
      {activeTab === "settings" && (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-sm text-slate-900">Examination Configuration</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/grade-setting" className="p-3 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 font-bold block">
              9-Point Grading Scale &rarr;
            </Link>
            <Link href="/coscholastic-skills" className="p-3 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 font-bold block">
              Co-Scholastic Skills &rarr;
            </Link>
            <Link href="/report-card-keys" className="p-3 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 font-bold block">
              Custom Report Card Keys &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
