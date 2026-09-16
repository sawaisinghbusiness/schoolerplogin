"use client";

import React, { useState } from "react";
import { BookOpenCheck, Download, Printer } from "lucide-react";

export default function TimetablePage() {
  const [selectedClass, setSelectedClass] = useState("10th - A");

  const schedule = [
    { period: "Period 1 (08:15 - 09:00)", mon: "Mathematics", tue: "Mathematics", wed: "Physics", thu: "Physics", fri: "Mathematics", sat: "Test" },
    { period: "Period 2 (09:00 - 09:45)", mon: "English", tue: "English", wed: "Chemistry", thu: "Chemistry", fri: "English", sat: "Activity" },
    { period: "Period 3 (09:45 - 10:30)", mon: "Physics", tue: "Physics", wed: "Mathematics", thu: "Mathematics", fri: "Biology", sat: "Sports" },
    { period: "Recess (10:30 - 11:00)", mon: "BREAK", tue: "BREAK", wed: "BREAK", thu: "BREAK", fri: "BREAK", sat: "BREAK" },
    { period: "Period 4 (11:00 - 11:45)", mon: "Chemistry", tue: "Chemistry", wed: "English", thu: "English", fri: "Social Sci", sat: "Library" },
    { period: "Period 5 (11:45 - 12:30)", mon: "Computer IT", tue: "Computer IT", wed: "Lab Practical", thu: "Lab Practical", fri: "Sports", sat: "House Activity" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <BookOpenCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Academic Ops</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Master Class Timetable</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Weekly Master Timetable & Bell Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure periods, faculty substitution periods, and laboratory slot rotations
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Timetable</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-3">Time Slot</th>
              <th className="py-3 px-3">Monday</th>
              <th className="py-3 px-3">Tuesday</th>
              <th className="py-3 px-3">Wednesday</th>
              <th className="py-3 px-3">Thursday</th>
              <th className="py-3 px-3">Friday</th>
              <th className="py-3 px-3">Saturday</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {schedule.map((row, idx) => (
              <tr key={idx} className={row.mon === "BREAK" ? "bg-amber-50/60 font-bold text-center" : "hover:bg-slate-50"}>
                <td className="py-3 px-3 font-mono font-bold text-slate-900">{row.period}</td>
                <td className="py-3 px-3 font-semibold text-emerald-800">{row.mon}</td>
                <td className="py-3 px-3 font-semibold text-emerald-800">{row.tue}</td>
                <td className="py-3 px-3 font-semibold text-emerald-800">{row.wed}</td>
                <td className="py-3 px-3 font-semibold text-emerald-800">{row.thu}</td>
                <td className="py-3 px-3 font-semibold text-emerald-800">{row.fri}</td>
                <td className="py-3 px-3 font-semibold text-purple-800">{row.sat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
