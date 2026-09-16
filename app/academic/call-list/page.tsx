"use client";

import React, { useState } from "react";
import { Phone, PhoneCall, CheckCircle2 } from "lucide-react";
import { MOCK_STUDENTS } from "@/data/mockData";

export default function CallListPage() {
  const [calledMap, setCalledMap] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
          <Phone className="w-3.5 h-3.5 text-emerald-600" />
          <span>Academic Ops</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-semibold">Guardian Call List</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Parent Telephonic Follow-Up & Call Register
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Priority calling list for chronic absentees, fee reminders, and student behavioral consultations
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Class</th>
              <th className="py-3 px-4">Parent Phone</th>
              <th className="py-3 px-4">Follow-Up Reason</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {MOCK_STUDENTS.slice(0, 5).map((s, idx) => {
              const isCalled = calledMap[s.id];
              return (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                  <td className="py-3 px-4 font-mono">{s.classSec}</td>
                  <td className="py-3 px-4 font-mono font-bold">{s.mobile}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {idx % 2 === 0 ? "Absent for 2 consecutive days" : "Quarterly fee installment pending"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        setCalledMap({ ...calledMap, [s.id]: true });
                        alert(`Call log recorded with parent of ${s.name}!`);
                      }}
                      className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                        isCalled ? "bg-emerald-100 text-emerald-800" : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      {isCalled ? "Called ✓" : "Dial & Log Call"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
