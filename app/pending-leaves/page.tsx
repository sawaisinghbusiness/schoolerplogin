"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  FileText,
  User,
  AlertCircle
} from "lucide-react";

interface LeaveApplication {
  id: string;
  applicantType: "Student" | "Staff";
  name: string;
  roleOrClass: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  appliedDate: string;
  hasMedicalDoc: boolean;
  docUrl?: string;
  contact: string;
}

export default function PendingLeavesPage() {
  const [activeTab, setActiveTab] = useState<"all" | "student" | "staff">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [applications, setApplications] = useState<LeaveApplication[]>([
    {
      id: "LV-2026-041",
      applicantType: "Student",
      name: "Aarav Sharma",
      roleOrClass: "Class 10th - A (Roll: 12)",
      fromDate: "2026-09-17",
      toDate: "2026-09-19",
      totalDays: 3,
      reason: "Viral fever and acute throat infection. Doctor advised 3 days complete rest.",
      appliedDate: "2026-09-16 08:30 AM",
      hasMedicalDoc: true,
      docUrl: "Medical_Prescription_Dr_Mehta.pdf",
      contact: "9876543210 (Father: Rajesh Sharma)"
    },
    {
      id: "LV-2026-042",
      applicantType: "Staff",
      name: "Kailash Bishnoi",
      roleOrClass: "TGT Mathematics (Emp Code: T-014)",
      fromDate: "2026-09-18",
      toDate: "2026-09-18",
      totalDays: 1,
      reason: "Attending cousin sister wedding ceremony in Jodhpur.",
      appliedDate: "2026-09-15 04:15 PM",
      hasMedicalDoc: false,
      contact: "9828456123"
    },
    {
      id: "LV-2026-043",
      applicantType: "Student",
      name: "Priya Solanki",
      roleOrClass: "Class 8th - B (Roll: 19)",
      fromDate: "2026-09-20",
      toDate: "2026-09-22",
      totalDays: 3,
      reason: "Family pilgrimage travel to Ramdevra temple festival.",
      appliedDate: "2026-09-16 09:10 AM",
      hasMedicalDoc: false,
      contact: "9414234567 (Father: Vikram Singh)"
    },
    {
      id: "LV-2026-044",
      applicantType: "Staff",
      name: "Rekha Sharma",
      roleOrClass: "PRT Primary English (Emp Code: T-029)",
      fromDate: "2026-09-22",
      toDate: "2026-09-24",
      totalDays: 3,
      reason: "Medical consultation and dental surgery appointment in Jaipur.",
      appliedDate: "2026-09-15 11:20 AM",
      hasMedicalDoc: true,
      docUrl: "Hospital_Appointment_Slip.pdf",
      contact: "9785123984"
    }
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const handleAction = (id: string, action: "Approved" | "Rejected") => {
    const app = applications.find((a) => a.id === id);
    setApplications(applications.filter((a) => a.id !== id));
    setNotification(`Leave application ${id} for ${app?.name} was ${action}.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.roleOrClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.reason.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === "student") return matchesSearch && app.applicantType === "Student";
    if (activeTab === "staff") return matchesSearch && app.applicantType === "Staff";
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
            <span className="text-slate-800 font-semibold">Pending Leaves</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Pending Leave Applications ({applications.length})
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Review, approve or reject leave requests submitted by students (via Parent App) and staff members
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/approved-leaves"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors flex items-center space-x-1"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>View Approved/Rejected History</span>
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
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              activeTab === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Pending ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab("student")}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              activeTab === "student" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Students ({applications.filter((a) => a.applicantType === "Student").length})
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              activeTab === "staff" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Staff ({applications.filter((a) => a.applicantType === "Staff").length})
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, staff, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
          />
        </div>
      </div>

      {/* Applications Cards / List */}
      {filteredApps.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg border border-slate-200 text-slate-400">
          <CalendarCheck className="w-12 h-12 mx-auto mb-2 text-slate-300" />
          <p className="font-bold text-slate-600">No pending leave applications found.</p>
          <p className="text-[11px] mt-0.5">All incoming student and staff leaves have been processed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        app.applicantType === "Student"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {app.applicantType} Leave
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{app.id}</span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {app.totalDays} {app.totalDays === 1 ? "Day" : "Days"}
                  </span>
                </div>

                <div className="mt-2">
                  <h3 className="text-sm font-black text-slate-900">{app.name}</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">{app.roleOrClass}</p>
                </div>

                <div className="mt-3 p-2.5 bg-slate-50 rounded border border-slate-100 space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span className="font-bold">Leave Duration:</span>
                    <span>
                      {app.fromDate} to {app.toDate}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="font-bold">Applied On:</span>
                    <span>{app.appliedDate}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="font-bold">Contact:</span>
                    <span>{app.contact}</span>
                  </div>
                </div>

                <div className="mt-2.5">
                  <p className="text-[11px] font-semibold text-slate-700">Reason for Leave:</p>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed bg-amber-50/50 p-2 rounded border border-amber-100/60">
                    &ldquo;{app.reason}&rdquo;
                  </p>
                </div>

                {app.hasMedicalDoc && (
                  <div className="mt-2 flex items-center space-x-1 text-[11px] text-[#26b99a] font-bold">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="hover:underline cursor-pointer">Attachment: {app.docUrl}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  onClick={() => handleAction(app.id, "Rejected")}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-bold text-xs border border-rose-200 transition-colors flex items-center space-x-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Decline</span>
                </button>
                <button
                  onClick={() => handleAction(app.id, "Approved")}
                  className="px-4 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold text-xs shadow-xs transition-colors flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve Leave</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
