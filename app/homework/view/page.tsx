"use client";

import React from "react";
import { BookOpen, Download, Calendar } from "lucide-react";

export default function ViewHomeworkPage() {
  const homeworks = [
    { classSec: "10th - A", subject: "Mathematics", teacher: "Mrs. Sunita Sharma", assigned: "15 Sep 2026", due: "16 Sep 2026", desc: "NCERT Chapter 4 Exercise 4.3 questions 1 to 8" },
    { classSec: "12th - PCM", subject: "Physics", teacher: "Mr. Vikram Verma", assigned: "15 Sep 2026", due: "17 Sep 2026", desc: "Ray Optics numerical problems 12 to 18 from workbook" },
    { classSec: "9th - B", subject: "English", teacher: "Ms. Rekha Choudhary", assigned: "14 Sep 2026", due: "16 Sep 2026", desc: "Write an essay on 'The Role of Youth in Digital India' (250 words)" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          <span>School Teacher</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-semibold">Active Assignments</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Assigned Homework & Submissions Ledger
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review live tasks posted across classes with assignment and submission timelines
        </p>
      </div>

      <div className="space-y-3">
        {homeworks.map((hw, i) => (
          <div key={i} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-emerald-800 text-xs px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded">
                  {hw.classSec}
                </span>
                <span className="font-bold text-slate-800 text-sm">{hw.subject}</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Due: <strong className="text-rose-600 font-mono">{hw.due}</strong>
              </div>
            </div>

            <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {hw.desc}
            </p>

            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Assigned by: <strong>{hw.teacher}</strong> on {hw.assigned}</span>
              <button
                onClick={() => alert("Viewing student digital submission uploads...")}
                className="text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                View Student Submissions &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
