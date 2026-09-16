"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  School,
  Sparkles,
  Calendar,
  Send,
  UserCheck2,
  FileSpreadsheet,
  Database
} from "lucide-react";
import { DASHBOARD_STATS } from "@/data/mockData";
import { StatCard } from "@/components/dashboard/StatCard";
import { StudentAttendanceCard } from "@/components/dashboard/StudentAttendanceCard";
import { StaffAttendanceCard } from "@/components/dashboard/StaffAttendanceCard";
import { studentService } from "@/lib/services/studentService";


export default function AdminDashboardPage() {
  const [liveStudentCount, setLiveStudentCount] = useState<number | null>(null);
  const [isLiveDb, setIsLiveDb] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await studentService.fetchStudents();
        if (res.isLive) {
          setLiveStudentCount(res.data.length);
          setIsLiveDb(true);
        }
      } catch (err) {
        console.error("Dashboard student load error:", err);
      }
    }
    load();
  }, []);

  const stats = DASHBOARD_STATS.map((stat) => {
    if (stat.id === "students" && isLiveDb && liveStudentCount !== null) {
      return {
        ...stat,
        count: String(liveStudentCount),
      };
    }
    return stat;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <School className="w-3.5 h-3.5 text-emerald-600" />
            <span>School Admin</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-800 font-semibold">Institutional Dashboard</span>
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Administrative Control Center
            </h1>
            {isLiveDb && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Database className="w-3 h-3 text-emerald-600" />
                <span>Supabase Live</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time analytics, session metrics, and live attendance for Mother Teresa Nobles Academy
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex items-center space-x-2">
          <Link
            href="/search-student"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            <UserCheck2 className="w-3.5 h-3.5" />
            <span>Search Student (9-Way)</span>
          </Link>
          <button
            onClick={() => alert("Exporting Daily Executive Attendance Sheet (Excel)...")}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </div>

      {/* Task 2.1: 8 KPI STAT CARDS GRID (4 cols desktop, 2 cols tablet, 1 col mobile) */}
      <section aria-label="Key Performance Indicators">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {stats.map((stat) => (
            <StatCard
              key={stat.id}
              title={stat.title}
              count={stat.count}
              icon={stat.icon}
              color={stat.color}
              hasExternalLink={stat.hasExternalLink}
              href={stat.href}
            />
          ))}
        </div>
      </section>


      {/* Task 2.2: LIVE ATTENDANCE SECTION (2 Columns Below Stats) */}
      <section aria-label="Live Attendance Monitoring">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {/* Left Column: Student Attendance Widget */}
          <div className="h-full">
            <StudentAttendanceCard />
          </div>

          {/* Right Column: Staff Attendance Widget (Recharts Donut Chart) */}
          <div className="h-full">
            <StaffAttendanceCard />
          </div>
        </div>
      </section>

      {/* Additional Quick Info Banner matching Schoollog look */}
      <div className="p-4 bg-slate-900 text-slate-200 rounded-lg shadow-sm border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">Academic Term 1 In Progress</span>
            <span className="text-slate-400 text-[11px]">
              Session 2026-27 is active. Mid-Term Examination papers uploading ends Friday.
            </span>
          </div>
        </div>
        <Link
          href="/search-student"
          className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold rounded border border-slate-700 transition-colors"
        >
          Manage Class Roster &rarr;
        </Link>
      </div>
    </div>
  );
}
