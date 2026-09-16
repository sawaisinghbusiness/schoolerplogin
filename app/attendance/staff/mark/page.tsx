"use client";

import React, { useState } from "react";
import { ClipboardList, Save, CheckCircle2, UserCheck } from "lucide-react";

export default function MarkStaffAttendancePage() {
  const [saved, setSaved] = useState(false);
  const [staffList, setStaffList] = useState([
    { id: "EMP-001", name: "Dr. K. S. Rathore", dept: "Administration", status: "Present", inTime: "07:55 AM" },
    { id: "EMP-002", name: "Mrs. Sunita Sharma", dept: "Mathematics", status: "Absent", inTime: "--" },
    { id: "EMP-003", name: "Mr. Vikram Verma", dept: "Science", status: "Absent", inTime: "--" },
    { id: "EMP-004", name: "Ms. Rekha Choudhary", dept: "Languages", status: "Absent", inTime: "--" },
    { id: "EMP-005", name: "Mr. Ramesh Bhati", dept: "Finance", status: "Absent", inTime: "--" },
    { id: "EMP-006", name: "Mr. Mahendra Singh", dept: "Sports", status: "Absent", inTime: "--" },
    { id: "EMP-007", name: "Er. Deepak Jain", dept: "IT & Labs", status: "Absent", inTime: "--" },
    { id: "EMP-008", name: "Mrs. Manju Bhati", dept: "Primary Wing", status: "Absent", inTime: "--" },
  ]);

  const toggleStatus = (id: string, newStatus: string) => {
    setStaffList(staffList.map(s => s.id === id ? { ...s, status: newStatus, inTime: newStatus === "Present" ? "08:05 AM" : "--" } : s));
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
            <span>Staff Attendance</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Mark Staff Attendance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Faculty & Non-Teaching Attendance Register
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manual biometric override, attendance verification, and salary deduction tracking
          </p>
        </div>

        <button
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 4000);
          }}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Staff Register</span>
        </button>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">Staff attendance records verified and synced to payroll register!</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Staff Member</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Punch In Time</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {staffList.map((st) => (
              <tr key={st.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{st.id}</td>
                <td className="py-3 px-4 font-bold text-slate-900">{st.name}</td>
                <td className="py-3 px-4">{st.dept}</td>
                <td className="py-3 px-4 font-mono">{st.inTime}</td>
                <td className="py-3 px-4 text-center">
                  <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 space-x-1">
                    <button
                      onClick={() => toggleStatus(st.id, "Present")}
                      className={`px-2.5 py-1 rounded text-xs font-bold ${
                        st.status === "Present" ? "bg-emerald-600 text-white" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => toggleStatus(st.id, "Absent")}
                      className={`px-2.5 py-1 rounded text-xs font-bold ${
                        st.status === "Absent" ? "bg-rose-600 text-white" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Absent
                    </button>
                    <button
                      onClick={() => toggleStatus(st.id, "On Leave")}
                      className={`px-2.5 py-1 rounded text-xs font-bold ${
                        st.status === "On Leave" ? "bg-teal-600 text-white" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Leave
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
