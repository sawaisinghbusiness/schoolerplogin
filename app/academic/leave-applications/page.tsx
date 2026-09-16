"use client";

import React, { useState } from "react";
import { FileText, CheckCircle2, XCircle } from "lucide-react";

export default function LeaveApplicationsPage() {
  const [leaves, setLeaves] = useState([
    { id: "1", applicant: "Aarav Sharma (Student)", classSec: "10th - A", days: "2 Days (16-17 Sep)", reason: "Fever & Medical Rest", status: "Pending" },
    { id: "2", applicant: "Mrs. Sunita Sharma (Faculty)", classSec: "PGT Mathematics", days: "1 Day (18 Sep)", reason: "Personal Family Matter", status: "Pending" },
    { id: "3", applicant: "Diya Rathore (Student)", classSec: "9th - B", days: "3 Days (10-12 Sep)", reason: "Sister's Wedding", status: "Approved" },
  ]);

  const handleAction = (id: string, action: string) => {
    setLeaves(leaves.map(l => l.id === id ? { ...l, status: action } : l));
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
          <FileText className="w-3.5 h-3.5 text-emerald-600" />
          <span>Academic Ops</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-semibold">Online Leave Desk</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Leave Applications & Approval Desk
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review leave requests submitted by parents and staff with one-click approval
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4">Applicant</th>
              <th className="py-3 px-4">Class / Role</th>
              <th className="py-3 px-4">Leave Duration</th>
              <th className="py-3 px-4">Stated Reason</th>
              <th className="py-3 px-4 text-center">Status / Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {leaves.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">{l.applicant}</td>
                <td className="py-3 px-4">{l.classSec}</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-800">{l.days}</td>
                <td className="py-3 px-4 text-slate-600 italic">{l.reason}</td>
                <td className="py-3 px-4 text-center">
                  {l.status === "Pending" ? (
                    <div className="flex justify-center space-x-1">
                      <button
                        onClick={() => handleAction(l.id, "Approved")}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(l.id, "Rejected")}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      l.status === "Approved" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {l.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
