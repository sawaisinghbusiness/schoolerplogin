"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, UserPlus, Phone, Mail, Edit, Trash2, ShieldCheck, Download, RefreshCw, Database } from "lucide-react";
import { staffService, StaffMember } from "@/lib/services/staffService";

export default function StaffListPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await staffService.fetchStaff();
      setStaffList(res.data);
      setIsLive(res.isLive);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Institutional Faculty & Staff Roster
            </h1>
            {isLive ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Database className="w-3 h-3" />
                <span>Supabase Live</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-300">
                <span>Demo Engine</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete database of 68 institutional employees, department designations, and contact files
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded text-slate-700 text-xs font-semibold shadow-xs"
            title="Refresh Roster"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/add-staff"
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
              {loading && staffList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>Loading faculty roster...</span>
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No faculty members found in database.
                  </td>
                </tr>
              ) : (
                staffList.map((st) => (
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
                      {st.attendance === "Present" ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Present</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">
                          {st.attendance}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          href="/update-staff"
                          className="p-1 hover:bg-slate-100 text-slate-600 rounded"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${st.name} from active staff?`)) {
                              staffService.deleteStaff(st.id);
                              setStaffList(staffList.filter((s) => s.id !== st.id));
                            }
                          }}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
