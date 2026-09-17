"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  UserPlus,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Bus,
  GraduationCap,
  IndianRupee,
  Receipt,
  ClipboardCheck,
  Cake,
  Briefcase
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { StudentAttendanceCard } from "@/components/dashboard/StudentAttendanceCard";
import { StaffAttendanceCard } from "@/components/dashboard/StaffAttendanceCard";
import { studentService } from "@/lib/services/studentService";

export default function AdminDashboardPage() {
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const DASHBOARD_CARDS = [
    {
      id: "students",
      title: "Students",
      count: "1,924",
      icon: "GraduationCap",
      hasExternalLink: true,
      href: "/search-student",
      trend: "100% Active Scholars",
    },
    {
      id: "fees",
      title: "Fees Collected (Sep)",
      count: "₹38.45 L",
      icon: "IndianRupee",
      hasExternalLink: true,
      href: "/collect-fees",
      trend: "+14.2% Growth vs Last Mo",
    },
    {
      id: "attendance",
      title: "Scholar Attendance",
      count: "95.7%",
      icon: "ClipboardCheck",
      hasExternalLink: true,
      href: "/daily-attendance-report",
      trend: "1,842 Present Today",
    },
    {
      id: "sms-sent",
      title: "SMS Sent (Sep)",
      count: "2,844",
      icon: "Send",
      hasExternalLink: true,
      href: "/daily-sms-count",
      trend: "98.4% Delivered",
    },
    {
      id: "new-admissions",
      title: "New Admissions",
      count: "592",
      icon: "UserPlus",
      hasExternalLink: true,
      href: "/new-admissions",
      trend: "+14 This Session",
    },
    {
      id: "birthdays",
      title: "Birthdays",
      count: "8",
      icon: "Cake",
      hasExternalLink: true,
      href: "/list-birthday",
      trend: "Today's Greetings",
    },
    {
      id: "staff",
      title: "Staff & Faculty",
      count: "68",
      icon: "Briefcase",
      hasExternalLink: true,
      href: "/staffs",
      trend: "61 on Duty (90%)",
    },
    {
      id: "transport-students",
      title: "Transport Students",
      count: "458",
      icon: "Bus",
      hasExternalLink: true,
      href: "/search-student",
      trend: "Bus Routes 1-4",
    },
  ];

  const handleExportSheet = () => {
    setNotificationMsg("Daily Institutional Executive Attendance Report exported successfully (.xlsx)!");
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-sans">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{notificationMsg}</span>
        </div>
      )}

      {/* Page Header & Institutional Identity */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Institutional Control Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Academic Session 2026-27 • Real-time attendance, fee collections, communication metrics, and student ledger
          </p>
        </div>

        {/* Executive Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/collect-fees"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Fee Counter</span>
          </Link>

          <Link
            href="/search-student"
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Student</span>
          </Link>

          <Link
            href="/add-students"
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-500" />
            <span>New Admission</span>
          </Link>

          <Link
            href="/mark-attendance"
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Mark Attendance</span>
          </Link>

          <button
            onClick={handleExportSheet}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            title="Download Daily Attendance Summary"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </div>

      {/* 8 VIBRANT KPI METRIC CARDS (4 cols desktop, 2 cols tablet, 1 col mobile) */}
      <section aria-label="Institutional Key Performance Indicators">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {DASHBOARD_CARDS.map((card) => (
            <StatCard
              key={card.id}
              title={card.title}
              count={card.count}
              icon={card.icon}
              hasExternalLink={card.hasExternalLink}
              href={card.href}
              trend={card.trend}
            />
          ))}
        </div>
      </section>

      {/* 2 VISUAL OPERATIONAL CHARTS (Side by Side in Equal Columns) */}
      <section aria-label="Daily Attendance & Operations">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          <div className="h-full">
            <StudentAttendanceCard />
          </div>

          <div className="h-full">
            <StaffAttendanceCard />
          </div>
        </div>
      </section>
    </div>
  );
}

