"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, UserPlus, Phone, Mail, Edit, Trash2, ShieldCheck, Download } from "lucide-react";

export default function StaffListPage() {
  const [staffList, setStaffList] = useState([
    { id: "EMP-001", name: "Dr. K. S. Rathore", designation: "Principal", dept: "Administration", mobile: "9414012345", email: "principal@motherteresa.edu.in", status: "Active", attendance: "Present" },
    { id: "EMP-002", name: "Mrs. Sunita Sharma", designation: "Senior PGT", dept: "Mathematics", mobile: "9829055443", email: "sunita.math@motherteresa.edu.in", status: "Active", attendance: "Absent" },
    { id: "EMP-003", name: "Mr. Vikram Verma", designation: "PGT Physics", dept: "Science", mobile: "9414199887", email: "vikram.phy@motherteresa.edu.in", status: "Active", attendance: "Absent" },
    { id: "EMP-004", name: "Ms. Rekha Choudhary", designation: "TGT English", dept: "Languages", mobile: "9784311223", email: "rekha.eng@motherteresa.edu.in", status: "Active", attendance: "Absent" },
    { id: "EMP-005", name: "Mr. Ramesh Bhati", designation: "Accounts Officer", dept: "Finance", mobile: "9460122334", email: "accounts@motherteresa.edu.in", status: "Active", attendance: "Absent" },
    { id: "EMP-006", name: "Mr. Mahendra Singh", designation: "HOD Physical Ed", dept: "Sports", mobile: "9602433445", email: "sports@motherteresa.edu.in", status: "Active", attendance: "Absent" },
    { id: "EMP-007", name: "Er. Deepak Jain", designation: "System Admin", dept: "IT & Labs", mobile: "9166554433", email: "deepak.it@motherteresa.edu.in", status: "Active", attendance: "Absent" },
    { id: "EMP-008", name: "Mrs. Manju Bhati", designation: "PRT Primary Head", dept: "Primary Wing", mobile: "9587441122", email: "manju.prt@motherteresa.edu.in", status: "Active", attendance: "Absent" }
  ]);

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manage Staff</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Faculty Roster List</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Institutional Faculty & Staff Roster
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete database of 68 institutional employees, department designations, and contact files
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/staff/add"
            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Staff</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#1e293b] text-slate-200 uppercase font-bold text-[11px] border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4">Department & Role</th>
                <th className="py-3 px-4">Mobile Number</th>
                <th className="py-3 px-4">Today&apos;s Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {staffList.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{st.id}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{st.name}</div>
                    <div className="text-[11px] text-slate-400">{st.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{st.designation}</div>
                    <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px]">
                      {st.dept}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">{st.mobile}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      st.attendance === "Present"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}>
                      {st.attendance}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => alert(`Opening employee dossier for ${st.name}`)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold"
                    >
                      Dossier
                    </button>
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
