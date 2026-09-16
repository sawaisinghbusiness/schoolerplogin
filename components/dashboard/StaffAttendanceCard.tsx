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
import { UserCheck, ExternalLink, Clock } from "lucide-react";
import { STAFF_ATTENDANCE_DATA } from "@/data/mockData";

export function StaffAttendanceCard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalStaff = STAFF_ATTENDANCE_DATA.reduce((acc, curr) => acc + curr.count, 0);

  // For the chart, we only feed non-zero items so the pie renders properly
  const chartData = STAFF_ATTENDANCE_DATA.filter((item) => item.value > 0);

  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between h-full">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">
              Staff Attendance
            </h3>
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-0.5">
              <Clock className="w-3 h-3" />
              <span>{currentDate}</span>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/admin"
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
          title="Open Staff Attendance Module"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      {/* Main Content: Chart + Legend */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Donut Chart */}
        <div className="w-full md:w-1/2 h-52 relative flex items-center justify-center">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number, name: string) => [
                    `${val} staff`,
                    name
                  ]}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "6px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                    padding: "6px 10px"
                  }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-36 h-36 rounded-full border-8 border-slate-200 animate-pulse" />
          )}

          {/* Center text inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-slate-800 font-mono">
              {totalStaff}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Total Staff
            </span>
          </div>
        </div>

        {/* Detailed Legend alongside chart */}
        <div className="w-full md:w-1/2 space-y-2.5">
          {STAFF_ATTENDANCE_DATA.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded hover:bg-slate-50 transition-colors text-xs border border-transparent hover:border-slate-100"
            >
              <div className="flex items-center space-x-2.5">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-semibold text-slate-700">{item.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-slate-900">
                  {item.count}
                </span>
                <span className="text-[11px] text-slate-500 font-medium min-w-[50px] text-right">
                  ({item.percentage})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 text-[11px]">
          Biometric & RFID status sync active
        </span>
        <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
          54 Absent Staff Alert
        </span>
      </div>
    </div>
  );
}
