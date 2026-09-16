"use client";

import React, { useState } from "react";
import { UserPlus, Save, CheckCircle2, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddStaffPage() {
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    empCode: `EMP-${Math.floor(100 + Math.random() * 900)}`,
    fullName: "",
    gender: "Female",
    mobile: "",
    email: "",
    department: "Mathematics",
    designation: "PGT Teacher",
    qualification: "M.Sc., B.Ed.",
    joiningDate: "2026-09-15",
    primarySubject: "Mathematics",
    salary: "45000",
    address: "Civil Lines, Barmer, Rajasthan"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manage Staff</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">New Faculty Onboarding</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Add New Faculty & Staff Member
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register employee biometric profile, assign department role, and issue ERP credentials
          </p>
        </div>

        <Link
          href="/staff/list"
          className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Staff List</span>
        </Link>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">Staff Member Registered! Credentials & Biometric ID generated.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Employee Code *</label>
            <input
              type="text"
              value={formData.empCode}
              readOnly
              className="w-full p-2 border border-slate-200 rounded bg-slate-50 font-mono font-bold text-slate-700"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Mrs. Anjali Sharma"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mobile Number (For Login) *</label>
            <input
              type="tel"
              placeholder="10-digit mobile"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="staff@motherteresa.edu.in"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded bg-white"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Department *</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded bg-white"
            >
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="Languages">Languages</option>
              <option value="Social Studies">Social Studies</option>
              <option value="Administration">Administration</option>
              <option value="Physical Education">Physical Education</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Designation *</label>
            <input
              type="text"
              placeholder="e.g. PGT Physics"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Highest Qualification</label>
            <input
              type="text"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1.5 text-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Onboard & Save Staff</span>
          </button>
        </div>
      </form>
    </div>
  );
}
