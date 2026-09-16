"use client";

import React from "react";
import { Calendar, Plus, Download } from "lucide-react";

export default function CalendarEventsPage() {
  const events = [
    { title: "Mid-Term Examination Term 1", date: "21 Sep - 30 Sep 2026", type: "Examination", color: "bg-purple-100 text-purple-800" },
    { title: "Mahatma Gandhi Jayanti (National Holiday)", date: "02 Oct 2026", type: "Holiday", color: "bg-rose-100 text-rose-800" },
    { title: "Inter-House Science Exhibition & Robotics Fair", date: "15 Oct 2026", type: "Activity", color: "bg-emerald-100 text-emerald-800" },
    { title: "Parent-Teacher Meeting (PTM 2)", date: "24 Oct 2026", type: "Meeting", color: "bg-blue-100 text-blue-800" },
    { title: "Diwali Vacation Break", date: "08 Nov - 15 Nov 2026", type: "Vacation", color: "bg-amber-100 text-amber-800" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Academic Ops</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Institutional Calendar</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Academic Calendar & Events 2026-27
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Yearly schedule of holidays, exams, sports days, and parent-teacher conferences
          </p>
        </div>

        <button
          onClick={() => alert("Downloading 2026-27 Academic Calendar PDF...")}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Calendar PDF</span>
        </button>
      </div>

      <div className="space-y-3">
        {events.map((ev, i) => (
          <div key={i} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ev.color}`}>
                  {ev.type}
                </span>
                <h3 className="font-bold text-sm text-slate-900">{ev.title}</h3>
              </div>
              <p className="text-slate-500 font-mono">{ev.date}</p>
            </div>

            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded font-semibold text-[11px]">
              Scheduled
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
