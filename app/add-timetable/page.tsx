"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Save,
  CheckCircle2,
  Clock,
  Printer,
  Copy,
  AlertCircle
} from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = [
  { no: 1, time: "08:00 - 08:45 AM" },
  { no: 2, time: "08:45 - 09:30 AM" },
  { no: 3, time: "09:30 - 10:15 AM" },
  { no: 4, time: "10:15 - 11:00 AM" },
  { no: 5, time: "11:30 - 12:15 PM" },
  { no: 6, time: "12:15 - 01:00 PM" },
  { no: 7, time: "01:00 - 01:40 PM" },
  { no: 8, time: "01:40 - 02:20 PM" }
];

const SUBJECTS = [
  "Mathematics",
  "Science (Phy/Chem/Bio)",
  "English Core",
  "Hindi",
  "Social Science",
  "Computer Science",
  "Physical Education",
  "Library / Activity"
];

const TEACHERS = [
  "Kailash Bishnoi",
  "Dr. Arvind Rathore",
  "Pooja Sharma",
  "Anand Soni",
  "Sunita Purohit",
  "Bhawani Singh",
  "Rekha Sharma"
];

export default function AddTimetablePage() {
  const [selectedClass, setSelectedClass] = useState("10th - A");
  const [success, setSuccess] = useState(false);

  // Timetable state: [dayIndex][periodIndex] = { subject, teacher }
  const [schedule, setSchedule] = useState<{ [key: string]: { subject: string; teacher: string } }>({
    "Monday-1": { subject: "Mathematics", teacher: "Kailash Bishnoi" },
    "Monday-2": { subject: "Science (Phy/Chem/Bio)", teacher: "Dr. Arvind Rathore" },
    "Monday-3": { subject: "English Core", teacher: "Pooja Sharma" },
    "Monday-4": { subject: "Hindi", teacher: "Sunita Purohit" },
    "Monday-5": { subject: "Social Science", teacher: "Anand Soni" },
    "Monday-6": { subject: "Computer Science", teacher: "Rekha Sharma" },
    "Monday-7": { subject: "Physical Education", teacher: "Bhawani Singh" },
    "Monday-8": { subject: "Library / Activity", teacher: "Pooja Sharma" }
  });

  const handleSlotChange = (day: string, periodNo: number, field: "subject" | "teacher", value: string) => {
    const key = `${day}-${periodNo}`;
    setSchedule((prev) => ({
      ...prev,
      [key]: {
        subject: field === "subject" ? value : prev[key]?.subject || SUBJECTS[0],
        teacher: field === "teacher" ? value : prev[key]?.teacher || TEACHERS[0]
      }
    }));
  };

  const handleSave = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3500);
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Manage Timetable</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Weekly Timetable Builder</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Class Weekly Timetable Configurator
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Configure periods 1 to 8 across 6 working days, assign faculty, and eliminate teacher schedule clashes
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/timetablefile"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors"
          >
            PDF Timetable Files
          </Link>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors flex items-center space-x-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Timetable</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Timetable</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Weekly timetable for {selectedClass} successfully saved and updated on Teacher and Parent App!</span>
        </div>
      )}

      {/* Class Selector Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-slate-700 text-xs">Select Target Class & Section:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-1.5 border border-slate-300 rounded font-bold text-xs bg-white text-slate-900"
          >
            <option>10th - A</option>
            <option>10th - B</option>
            <option>9th - A</option>
            <option>9th - B</option>
            <option>12th - Science (PCM)</option>
            <option>12th - Commerce</option>
            <option>12th - Arts</option>
            <option>11th - Science</option>
            <option>8th - A</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-500 font-semibold">
          Recess / Lunch Interval: <span className="text-slate-800">11:00 AM - 11:30 AM</span>
        </div>
      </div>

      {/* Timetable Grid Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700">
              <th className="p-3 border-r border-slate-200 w-28">Day / Period</th>
              {PERIODS.map((p) => (
                <th key={p.no} className="p-2.5 border-r border-slate-200 text-center">
                  <div className="font-black text-slate-900">Period {p.no}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{p.time}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {DAYS.map((day) => (
              <tr key={day} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-3 border-r border-slate-200 font-black text-slate-900 bg-slate-50/80 whitespace-nowrap">
                  {day}
                </td>
                {PERIODS.map((p) => {
                  const key = `${day}-${p.no}`;
                  const slot = schedule[key] || {
                    subject: SUBJECTS[(p.no - 1) % SUBJECTS.length],
                    teacher: TEACHERS[(p.no - 1) % TEACHERS.length]
                  };

                  return (
                    <td key={p.no} className="p-1.5 border-r border-slate-200 align-top">
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-200 space-y-1 hover:border-[#26b99a] transition-colors">
                        <select
                          value={slot.subject}
                          onChange={(e) => handleSlotChange(day, p.no, "subject", e.target.value)}
                          className="w-full text-[10px] p-1 font-bold text-slate-900 border border-slate-200 rounded bg-white"
                        >
                          {SUBJECTS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <select
                          value={slot.teacher}
                          onChange={(e) => handleSlotChange(day, p.no, "teacher", e.target.value)}
                          className="w-full text-[9px] p-0.5 text-slate-600 border border-slate-200 rounded bg-white"
                        >
                          {TEACHERS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
