"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { Briefcase, ExternalLink, Clock, Wifi, ArrowRight } from "lucide-react";
import { STAFF_ATTENDANCE_DATA } from "@/data/mockData";

export function StaffAttendanceCard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalStaff = STAFF_ATTENDANCE_DATA.reduce((acc, curr) => acc + curr.count, 0);
  const presentCount = STAFF_ATTENDANCE_DATA.find((s) => s.name === "Present")?.count || 0;
  const presentPercent = Math.round((presentCount / totalStaff) * 100);

  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden flex flex-col justify-between h-full hover:border-slate-300 transition-all">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200/80">
            <Briefcase className="w-4 h-4 stroke-[1.8]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Faculty & Staff Attendance
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800">
                {presentPercent}% Present
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-0.5">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{currentDate}</span>
            </div>
          </div>
        </div>

        <Link
          href="/daily-staff-attendance"
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Open Staff Attendance Module"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      {/* Main Content: Chart + Legend */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Donut Chart */}
        <div className="w-full md:w-1/2 h-48 relative flex items-center justify-center">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={STAFF_ATTENDANCE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={74}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {STAFF_ATTENDANCE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number, name: string) => [
                    `${val} staff members`,
                    name
                  ]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                    padding: "8px 12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                  }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-36 h-36 rounded-full border-4 border-slate-100 animate-pulse" />
          )}

          {/* Center text inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {presentCount}/{totalStaff}
            </span>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              On Duty Today
            </span>
          </div>
        </div>

        {/* Detailed Legend alongside chart */}
        <div className="w-full md:w-1/2 space-y-2">
          {STAFF_ATTENDANCE_DATA.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors text-xs border border-transparent hover:border-slate-100"
            >
              <div className="flex items-center space-x-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-slate-700">{item.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-slate-900">
                  {item.count}
                </span>
                <span className="text-xs text-slate-400 font-medium min-w-[45px] text-right">
                  ({item.percentage})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium">Biometric Terminal Online (SPSS Main Gate)</span>
        </div>
        <Link
          href="/daily-staff-attendance"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          Staff Roster &rarr;
        </Link>
      </div>
    </div>
  );
}

