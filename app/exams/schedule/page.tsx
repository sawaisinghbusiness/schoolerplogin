"use client";

import React from "react";
import { Calendar, Download, Clock } from "lucide-react";

export default function ExamSchedulePage() {
  const datesheet = [
    { date: "21 Sep 2026", time: "09:00 AM - 12:00 PM", subject: "Mathematics / Applied Math", class: "Class 10th & 12th", room: "Wing B Halls" },
    { date: "23 Sep 2026", time: "09:00 AM - 12:00 PM", subject: "Physics / Business Studies", class: "Class 11th & 12th", room: "Wing B Halls" },
    { date: "25 Sep 2026", time: "09:00 AM - 12:00 PM", subject: "Chemistry / Accountancy", class: "Class 11th & 12th", room: "Wing B Halls" },
    { date: "28 Sep 2026", time: "09:00 AM - 12:00 PM", subject: "English Core / Elective", class: "All Senior Classes", room: "All Exam Rooms" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manage Exams</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Term 1 Datesheet</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Institutional Examination Datesheet & Seating Plan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official timetable for upcoming Term 1 Examinations for Session 2026-27
          </p>
        </div>

        <button
          onClick={() => alert("Downloading Term 1 Datesheet PDF...")}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Datesheet PDF</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4">Exam Date</th>
              <th className="py-3 px-4">Time Window</th>
              <th className="py-3 px-4">Subject Paper</th>
              <th className="py-3 px-4">Class Target</th>
              <th className="py-3 px-4">Seating Arrangement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {datesheet.map((d, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">{d.date}</td>
                <td className="py-3 px-4 font-mono text-slate-600">{d.time}</td>
                <td className="py-3 px-4 font-semibold text-emerald-800">{d.subject}</td>
                <td className="py-3 px-4">{d.class}</td>
                <td className="py-3 px-4 text-slate-500">{d.room}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
