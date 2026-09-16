"use client";

import React, { useState } from "react";
import { CalendarCheck, Save, CheckCircle2, Send, Clock, UserCheck, AlertTriangle } from "lucide-react";
import { MOCK_STUDENTS } from "@/data/mockData";

export default function MarkStudentAttendancePage() {
  const [selectedClass, setSelectedClass] = useState("10th - A");
  const [attendanceDate, setAttendanceDate] = useState("2026-09-15");
  const [saved, setSaved] = useState(false);

  // Student attendance statuses state
  const [statusMap, setStatusMap] = useState<Record<string, "Present" | "Absent" | "Leave" | "HalfDay">>({
    "STU-001": "Present",
    "STU-002": "Present",
    "STU-003": "Absent",
    "STU-004": "Present",
    "STU-005": "Present",
    "STU-006": "Absent",
    "STU-007": "Present",
    "STU-008": "Present",
  });

  const setAll = (status: "Present" | "Absent" | "Leave" | "HalfDay") => {
    const updated: any = {};
    MOCK_STUDENTS.forEach((s) => {
      updated[s.id] = status;
    });
    setStatusMap(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 5000);
  };

  const absentCount = Object.values(statusMap).filter((v) => v === "Absent").length;
  const presentCount = Object.values(statusMap).filter((v) => v === "Present").length;

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Student Attendance</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Mark Daily Roll Call</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Daily Student Attendance Sheet
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record morning roll-call, notify absentees via automated SMS, and synchronize with attendance records
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setAll("Present")}
            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 rounded text-xs font-bold transition-colors"
          >
            Mark All Present
          </button>
        </div>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-3 text-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <div className="font-bold text-sm">Attendance Submitted & Verified!</div>
            <div>
              {presentCount} Present scholars recorded. Automated SMS absentee notifications dispatched to {absentCount} parents.
            </div>
          </div>
        </div>
      )}

      {/* Class & Date Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Class - Section</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="p-2 border border-slate-300 rounded font-semibold bg-white text-slate-800"
            >
              <option value="10th - A">10th - Section A</option>
              <option value="10th - B">10th - Section B</option>
              <option value="12th - PCM">12th - PCM</option>
              <option value="9th - B">9th - Section B</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="p-2 border border-slate-300 rounded font-semibold bg-white text-slate-800"
            />
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold text-xs">
            Present: {presentCount}
          </span>
          <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-md font-bold text-xs">
            Absent: {absentCount}
          </span>
        </div>
      </div>

      {/* Student List with Attendance Toggles */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4 w-12 text-center">Roll</th>
              <th className="py-3 px-4">Student Particulars</th>
              <th className="py-3 px-4">Parent Phone</th>
              <th className="py-3 px-4 text-center">Mark Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {MOCK_STUDENTS.map((student) => {
              const currentStatus = statusMap[student.id] || "Present";
              return (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                    {student.rollNo}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{student.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">SR: {student.srNo}</div>
                  </td>
                  <td className="py-3 px-4 font-mono">{student.mobile}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 space-x-1">
                      <button
                        type="button"
                        onClick={() => setStatusMap({ ...statusMap, [student.id]: "Present" })}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                          currentStatus === "Present"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        P
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusMap({ ...statusMap, [student.id]: "Absent" })}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                          currentStatus === "Absent"
                            ? "bg-rose-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        A
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusMap({ ...statusMap, [student.id]: "Leave" })}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                          currentStatus === "Leave"
                            ? "bg-teal-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        L
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusMap({ ...statusMap, [student.id]: "HalfDay" })}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                          currentStatus === "HalfDay"
                            ? "bg-amber-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        HD
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            SMS alerts will be dispatched from Mother Teresa Nobles Academy DLT Account.
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Attendance & Send SMS Alerts</span>
          </button>
        </div>
      </form>
    </div>
  );
}
