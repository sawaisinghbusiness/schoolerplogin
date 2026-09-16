"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Search,
  Download,
  Phone,
  CheckCircle2,
  Calendar,
  Filter,
  ArrowLeft
} from "lucide-react";

interface FollowupItem {
  id: string;
  studentName: string;
  classSec: string;
  fatherName: string;
  contact: string;
  assignedCaller: string;
  scheduledDate: string;
  priority: "High" | "Medium" | "Low";
  reason: string;
  status: "Pending" | "Done";
}

export default function ListFollowupPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");

  const [followups, setFollowups] = useState<FollowupItem[]>([
    {
      id: "FOL-01",
      studentName: "Vikram Choudhary",
      classSec: "12th - PCM",
      fatherName: "Hanuman Ram Choudhary",
      contact: "9414156789",
      assignedCaller: "Mahendra Parihar",
      scheduledDate: "2026-09-17",
      priority: "High",
      reason: "Father requested evening callback regarding installment breakup of ₹10,000.",
      status: "Pending"
    },
    {
      id: "FOL-02",
      studentName: "Aarav Sharma",
      classSec: "10th - A",
      fatherName: "Rajesh Sharma",
      contact: "9876543210",
      assignedCaller: "Mahendra Parihar",
      scheduledDate: "2026-09-20",
      priority: "Medium",
      reason: "Verify bank deposit of ₹7,000 promised on 20th September.",
      status: "Pending"
    },
    {
      id: "FOL-03",
      studentName: "Meena Kumari",
      classSec: "7th - B",
      fatherName: "Deepak Kumar",
      contact: "9829123456",
      assignedCaller: "Pooja Sharma",
      scheduledDate: "2026-09-16",
      priority: "High",
      reason: "Continuous absence verification with guardian.",
      status: "Pending"
    }
  ]);

  const markDone = (id: string) => {
    setFollowups(
      followups.map((f) => (f.id === id ? { ...f, status: "Done" } : f))
    );
  };

  const filtered = followups.filter((f) => {
    const matchesSearch =
      f.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.fatherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.contact.includes(searchTerm);
    if (filterPriority !== "all" && f.priority !== filterPriority) return false;
    return matchesSearch;
  });

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Call List</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Scheduled Follow-ups</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Follow-up Reminders & Schedule
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Keep track of promised payment dates, pending callbacks, and guardian visits
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/my-calls"
            className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to My Calls Queue</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, father, mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-slate-500 text-[11px] font-semibold">Priority:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="p-1.5 border border-slate-300 rounded text-xs bg-white"
          >
            <option value="all">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
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
                <th className="p-3">Scheduled Date</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Class</th>
                <th className="p-3">Parent & Contact</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Reason / Context</th>
                <th className="p-3">Assigned Caller</th>
                <th className="p-3 text-center">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 whitespace-nowrap font-mono font-bold text-slate-900">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-[#26b99a]" />
                      <span>{f.scheduledDate}</span>
                    </div>
                  </td>
                  <td className="p-3 font-bold text-slate-900">{f.studentName}</td>
                  <td className="p-3 font-semibold text-slate-700">{f.classSec}</td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-800">{f.fatherName}</div>
                    <a
                      href={`tel:${f.contact}`}
                      className="text-[11px] font-mono text-[#26b99a] hover:underline"
                    >
                      {f.contact}
                    </a>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.priority === "High"
                          ? "bg-rose-100 text-rose-800"
                          : f.priority === "Medium"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {f.priority}
                    </span>
                  </td>
                  <td className="p-3 max-w-xs text-slate-700 truncate">{f.reason}</td>
                  <td className="p-3 text-slate-600">{f.assignedCaller}</td>
                  <td className="p-3 text-center">
                    {f.status === "Done" ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        ✓ Completed
                      </span>
                    ) : (
                      <button
                        onClick={() => markDone(f.id)}
                        className="px-2.5 py-1 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold text-[10px] shadow-xs"
                      >
                        Mark Done
                      </button>
                    )}
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
