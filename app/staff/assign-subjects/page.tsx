"use client";

import React, { useState } from "react";
import { BookOpen, Users, Save, CheckCircle2 } from "lucide-react";

export default function AssignSubjectsPage() {
  const [saved, setSaved] = useState(false);
  const [assignments, setAssignments] = useState([
    { teacher: "Mrs. Sunita Sharma", subject: "Mathematics", classSec: "12th - PCM", periodsPerWeek: 7 },
    { teacher: "Mr. Vikram Verma", subject: "Physics", classSec: "12th - PCM", periodsPerWeek: 6 },
    { teacher: "Mr. Vikram Verma", subject: "Physics", classSec: "11th - PCM", periodsPerWeek: 6 },
    { teacher: "Ms. Rekha Choudhary", subject: "English Literature", classSec: "10th - A", periodsPerWeek: 5 },
    { teacher: "Ms. Rekha Choudhary", subject: "English Literature", classSec: "9th - B", periodsPerWeek: 5 },
    { teacher: "Mrs. Manju Bhati", subject: "General Science", classSec: "8th - A", periodsPerWeek: 6 },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manage Staff</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Assign Subjects</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Teacher-Subject Allocation Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Map faculty members to class sections and weekly timetable teaching workload quotas
          </p>
        </div>

        <button
          onClick={() => {
            const teacher = prompt("Teacher Name:");
            const subject = prompt("Subject Name:");
            const classSec = prompt("Class & Section (e.g. 10th - B):");
            if (teacher && subject && classSec) {
              setAssignments([...assignments, { teacher, subject, classSec, periodsPerWeek: 6 }]);
            }
          }}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          + Assign Subject
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4">Faculty Member</th>
              <th className="py-3 px-4">Allocated Subject</th>
              <th className="py-3 px-4">Class - Section</th>
              <th className="py-3 px-4">Workload (Periods/Wk)</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {assignments.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">{row.teacher}</td>
                <td className="py-3 px-4 text-emerald-700 font-semibold">{row.subject}</td>
                <td className="py-3 px-4 font-mono font-semibold">{row.classSec}</td>
                <td className="py-3 px-4">{row.periodsPerWeek} Periods</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
