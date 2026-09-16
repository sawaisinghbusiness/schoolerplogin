"use client";

import React, { useState } from "react";
import { UserCheck2, Save, CheckCircle2 } from "lucide-react";

export default function ClassTeacherPage() {
  const [classTeachers, setClassTeachers] = useState([
    { classSec: "12th - PCM", teacher: "Mrs. Sunita Sharma", roomNo: "Room 301", students: 48 },
    { classSec: "12th - COMM", teacher: "Mr. Ramesh Bhati", roomNo: "Room 302", students: 42 },
    { classSec: "11th - PCM", teacher: "Mr. Vikram Verma", roomNo: "Room 205", students: 50 },
    { classSec: "10th - A", teacher: "Ms. Rekha Choudhary", roomNo: "Room 101", students: 54 },
    { classSec: "10th - B", teacher: "Mr. Dinesh Rathore", roomNo: "Room 102", students: 52 },
    { classSec: "9th - A", teacher: "Mr. Mahendra Singh", roomNo: "Room 103", students: 51 },
    { classSec: "8th - A", teacher: "Mrs. Manju Bhati", roomNo: "Room 104", students: 46 },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
          <UserCheck2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Manage Staff</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-semibold">Class Teacher In-Charge</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Class Teacher Allocation & In-Charge Designation
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Assign primary in-charge teachers responsible for daily attendance, conduct, and report card verification
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4">Class - Section</th>
              <th className="py-3 px-4">Designated Class Teacher</th>
              <th className="py-3 px-4">Classroom Location</th>
              <th className="py-3 px-4">Students Enrolled</th>
              <th className="py-3 px-4 text-center">Change Allocation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {classTeachers.map((ct, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{ct.classSec}</td>
                <td className="py-3 px-4 font-bold text-emerald-800">{ct.teacher}</td>
                <td className="py-3 px-4 text-slate-500">{ct.roomNo}</td>
                <td className="py-3 px-4 font-mono font-semibold">{ct.students} Students</td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => {
                      const newT = prompt(`Enter new Class Teacher for ${ct.classSec}:`, ct.teacher);
                      if (newT) {
                        setClassTeachers(classTeachers.map((c, i) => i === idx ? { ...c, teacher: newT } : c));
                      }
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-semibold text-slate-700"
                  >
                    Reassign
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
