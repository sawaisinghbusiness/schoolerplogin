"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  BookOpen,
  Filter,
  Check,
  X
} from "lucide-react";

interface TeacherRequest {
  id: string;
  teacherName: string;
  empCode: string;
  requestType: "Subject Allotment" | "Class Teacher Role" | "Timetable Adjustment";
  requestedClass: string;
  requestedSubject: string;
  currentAllotment: string;
  reason: string;
  requestDate: string;
  status: "Pending" | "Approved" | "Declined";
}

export default function TeacherRequestPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  const [requests, setRequests] = useState<TeacherRequest[]>([
    {
      id: "REQ-01",
      teacherName: "Kailash Bishnoi",
      empCode: "T-014",
      requestType: "Subject Allotment",
      requestedClass: "Class 10th - B",
      requestedSubject: "Mathematics",
      currentAllotment: "Class 9th - A, B (Mathematics)",
      reason: "Class 10th-B syllabus synchronization required with Board batches.",
      requestDate: "2026-09-14",
      status: "Pending"
    },
    {
      id: "REQ-02",
      teacherName: "Rekha Sharma",
      empCode: "T-029",
      requestType: "Class Teacher Role",
      requestedClass: "Class 4th - A",
      requestedSubject: "All Primary Core",
      currentAllotment: "Subject Teacher (English 3rd & 4th)",
      reason: "Previous class teacher on extended maternity leave.",
      requestDate: "2026-09-12",
      status: "Pending"
    },
    {
      id: "REQ-03",
      teacherName: "Anand Soni",
      empCode: "T-008",
      requestType: "Timetable Adjustment",
      requestedClass: "Class 11th - Commerce",
      requestedSubject: "Accountancy & Business Studies",
      currentAllotment: "Periods 1, 2, 5",
      reason: "Requested 1st period shift due to bus commute arrival timing.",
      requestDate: "2026-09-08",
      status: "Approved"
    }
  ]);

  const handleAction = (id: string, action: "Approved" | "Declined") => {
    setRequests(
      requests.map((r) => (r.id === id ? { ...r, status: action } : r))
    );
    setNotification(`Request ${id} marked as ${action}.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const pendingRequests = requests.filter((r) => r.status === "Pending");
  const historyRequests = requests.filter((r) => r.status !== "Pending");

  const displayList = activeTab === "pending" ? pendingRequests : historyRequests;
  const filteredList = displayList.filter(
    (r) =>
      r.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.requestedClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.requestedSubject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <User className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Manage Staff</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Teacher Requests</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Teacher Requests & Subject Reallocations
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Review teacher requests for class teacher allotment, subject reassignments, and timetable adjustments
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/assign-teacher-subjects"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors flex items-center space-x-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Teacher Subject Matrix</span>
          </Link>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs & Search */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex space-x-1 border border-slate-200 p-1 rounded-md bg-slate-50 w-full md:w-auto">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              activeTab === "pending"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pending Requests ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              activeTab === "history"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Request History ({historyRequests.length})
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search teacher, class, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3"># ID</th>
                <th className="p-3">Teacher Name</th>
                <th className="p-3">Request Type</th>
                <th className="p-3">Requested Target</th>
                <th className="p-3">Current Assignment</th>
                <th className="p-3">Reason / Justification</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-center">Action / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No requests found in this view.
                  </td>
                </tr>
              ) : (
                filteredList.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-700">{r.id}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{r.teacherName}</div>
                      <div className="text-[10px] text-slate-400">{r.empCode}</div>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{r.requestType}</td>
                    <td className="p-3">
                      <div className="font-bold text-[#26b99a]">{r.requestedClass}</div>
                      <div className="text-[10px] text-slate-500">{r.requestedSubject}</div>
                    </td>
                    <td className="p-3 text-slate-600 text-[11px]">{r.currentAllotment}</td>
                    <td className="p-3 max-w-xs text-slate-700 italic truncate">&ldquo;{r.reason}&rdquo;</td>
                    <td className="p-3 whitespace-nowrap text-slate-500">{r.requestDate}</td>
                    <td className="p-3 text-center">
                      {r.status === "Pending" ? (
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => handleAction(r.id, "Approved")}
                            title="Approve Request"
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded font-bold text-[11px] border border-emerald-200 flex items-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleAction(r.id, "Declined")}
                            title="Decline Request"
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-bold text-[11px] border border-rose-200 flex items-center space-x-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.status === "Approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {r.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
