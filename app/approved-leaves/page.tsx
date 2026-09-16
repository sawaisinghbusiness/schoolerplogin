"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Search,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft
} from "lucide-react";

interface LeaveRecord {
  id: string;
  applicantType: "Student" | "Staff";
  name: string;
  roleOrClass: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  status: "Approved" | "Rejected";
  processedBy: string;
  processedDate: string;
  remarks?: string;
}

export default function ApprovedLeavesPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | "Approved" | "Rejected">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const HISTORY: LeaveRecord[] = [
    {
      id: "LV-2026-038",
      applicantType: "Student",
      name: "Rohit Dan",
      roleOrClass: "Class 12th - Science (Roll: 08)",
      fromDate: "2026-09-12",
      toDate: "2026-09-13",
      totalDays: 2,
      reason: "Participating in District Level Chess Tournament at Jodhpur.",
      status: "Approved",
      processedBy: "Mahendra Parihar (Principal)",
      processedDate: "2026-09-11 02:30 PM",
      remarks: "Official sports leave granted. Best of luck."
    },
    {
      id: "LV-2026-037",
      applicantType: "Staff",
      name: "Bhawani Singh",
      roleOrClass: "Sports Incharge & PTI",
      fromDate: "2026-09-12",
      toDate: "2026-09-13",
      totalDays: 2,
      reason: "Accompanying school chess & athletic team for district meet.",
      status: "Approved",
      processedBy: "Mahendra Parihar (Principal)",
      processedDate: "2026-09-11 02:40 PM",
      remarks: "On-duty special leave."
    },
    {
      id: "LV-2026-036",
      applicantType: "Student",
      name: "Pooja Choudhary",
      roleOrClass: "Class 9th - A (Roll: 14)",
      fromDate: "2026-09-08",
      toDate: "2026-09-12",
      totalDays: 5,
      reason: "Family function in village without prior intimation.",
      status: "Rejected",
      processedBy: "Class Teacher (Anand Soni)",
      processedDate: "2026-09-08 10:15 AM",
      remarks: "Leave rejected due to mid-term unit exam week."
    },
    {
      id: "LV-2026-035",
      applicantType: "Staff",
      name: "Sunita Purohit",
      roleOrClass: "TGT Social Science",
      fromDate: "2026-09-05",
      toDate: "2026-09-05",
      totalDays: 1,
      reason: "Casual leave for family domestic work.",
      status: "Approved",
      processedBy: "Mahendra Parihar (Admin)",
      processedDate: "2026-09-04 05:00 PM"
    }
  ];

  const filteredHistory = HISTORY.filter((rec) => {
    const matchesSearch =
      rec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.roleOrClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.reason.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter !== "all" && rec.status !== statusFilter) return false;
    return matchesSearch;
  });

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Breadcrumb Header */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <CalendarCheck className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Leave App.</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Approved / Rejected</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Leave Applications History
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Archived record of all processed leave requests with approvals, rejections, and administrative remarks
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/pending-leaves"
            className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Pending Leaves</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, staff, remarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-slate-500 text-[11px] font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="p-1.5 border border-slate-300 rounded text-xs bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="Approved">Approved Only</option>
            <option value="Rejected">Rejected Only</option>
          </select>

          <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded border border-slate-300 flex items-center space-x-1">
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3"># App ID</th>
                <th className="p-3">Applicant Name</th>
                <th className="p-3">Type & Class/Role</th>
                <th className="p-3">Leave Dates</th>
                <th className="p-3">Days</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Status</th>
                <th className="p-3">Processed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredHistory.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-700">{rec.id}</td>
                  <td className="p-3 font-bold text-slate-900">{rec.name}</td>
                  <td className="p-3">
                    <span className="text-slate-700 block">{rec.roleOrClass}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {rec.applicantType}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap font-mono text-slate-600">
                    {rec.fromDate} to {rec.toDate}
                  </td>
                  <td className="p-3 font-bold text-slate-800">{rec.totalDays}</td>
                  <td className="p-3 max-w-xs">
                    <span className="text-slate-700 truncate block">{rec.reason}</span>
                    {rec.remarks && (
                      <span className="text-[10px] text-slate-500 italic block mt-0.5">
                        Remarks: {rec.remarks}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {rec.status === "Approved" ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1 w-max">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Approved</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center space-x-1 w-max">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        <span>Rejected</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-800">{rec.processedBy}</div>
                    <div className="text-[10px] text-slate-400">{rec.processedDate}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
