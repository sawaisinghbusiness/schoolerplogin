"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, Search, Phone, Mail, Award, Shield, UserPlus, Filter } from "lucide-react";

export default function StaffSearchPage() {
  const [query, setQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  const STAFF_MEMBERS = [
    { id: "EMP-001", name: "Dr. K. S. Rathore", role: "Principal & Director", dept: "Administration", mobile: "9414012345", email: "principal@motherteresa.edu.in", subject: "Educational Leadership", status: "Active" },
    { id: "EMP-002", name: "Mrs. Sunita Sharma", role: "Senior PGT Teacher", dept: "Mathematics", mobile: "9829055443", email: "sunita.math@motherteresa.edu.in", subject: "Calculus & Higher Math", status: "Active" },
    { id: "EMP-003", name: "Mr. Vikram Verma", role: "PGT Physics", dept: "Science", mobile: "9414199887", email: "vikram.phy@motherteresa.edu.in", subject: "Physics & Lab Work", status: "Active" },
    { id: "EMP-004", name: "Ms. Rekha Choudhary", role: "TGT English", dept: "Languages", mobile: "9784311223", email: "rekha.eng@motherteresa.edu.in", subject: "English Literature", status: "Active" },
    { id: "EMP-005", name: "Mr. Ramesh Bhati", role: "Accounts Officer", dept: "Finance & Accounts", mobile: "9460122334", email: "accounts@motherteresa.edu.in", subject: "Fee Collection & DLT", status: "Active" },
    { id: "EMP-006", name: "Mr. Mahendra Singh", role: "HOD Sports & Discipline", dept: "Physical Education", mobile: "9602433445", email: "sports@motherteresa.edu.in", subject: "Athletics & Physical Training", status: "Active" },
  ];

  const filtered = STAFF_MEMBERS.filter((s) => {
    const matchQ = s.name.toLowerCase().includes(query.toLowerCase()) || s.mobile.includes(query) || s.id.toLowerCase().includes(query.toLowerCase());
    const matchDept = selectedDept === "All" || s.dept === selectedDept;
    return matchQ && matchDept;
  });

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manage Staff</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Search Staff Directory</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Search Institutional Staff Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Locate teaching faculty, administrative officers, and subject heads by name, mobile, or department
          </p>
        </div>

        <Link
          href="/staff/add"
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add New Staff</span>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff by name, employee code (EMP-001) or mobile..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-md text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="All">All Departments</option>
          <option value="Administration">Administration</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Science">Science</option>
          <option value="Languages">Languages</option>
          <option value="Finance & Accounts">Finance & Accounts</option>
          <option value="Physical Education">Physical Education</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((staff) => (
          <div key={staff.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                  {staff.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{staff.name}</h3>
                  <div className="text-[11px] text-slate-500">{staff.role} • <span className="font-mono text-emerald-700">{staff.id}</span></div>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                {staff.status}
              </span>
            </div>

            <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div className="flex items-center space-x-2">
                <Phone className="w-3 h-3 text-emerald-600" />
                <span>{staff.mobile}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>{staff.email}</span>
              </div>
              <div className="flex items-center space-x-2 pt-1 border-t border-slate-200/60 text-[11px]">
                <Award className="w-3 h-3 text-purple-600" />
                <span>Department: <strong>{staff.dept}</strong> ({staff.subject})</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
