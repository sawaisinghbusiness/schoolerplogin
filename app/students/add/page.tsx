"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserPlus, Save, CheckCircle2, GraduationCap, ArrowLeft } from "lucide-react";

export default function AddStudentPage() {
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    srNo: `SR-2026-${Math.floor(100 + Math.random() * 900)}`,
    admissionNo: `ADM-${Math.floor(9000 + Math.random() * 1000)}`,
    penNo: `PEN-RJ-2026-${Math.floor(100 + Math.random() * 900)}`,
    name: "",
    class: "10th",
    section: "A",
    rollNo: "35",
    gender: "Male",
    dob: "2010-05-15",
    fatherName: "",
    motherName: "",
    mobile: "",
    address: "Civil Lines, Barmer, Rajasthan",
    category: "General",
    house: "Tagore",
    transport: "No"
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
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manage Students</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">New Admission Form</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Student Scholar Registration Form
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Enroll a new student for Academic Session 2026-27 with auto-generated SR and Admission numbers
          </p>
        </div>

        <Link
          href="/search-student"
          className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Student Search</span>
        </Link>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">Student Enrolled Successfully! Welcome SMS dispatched to {formData.mobile}.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div>
            <label className="block font-bold text-slate-600 mb-1">SR Number (Auto)</label>
            <input type="text" value={formData.srNo} readOnly className="w-full p-2 border border-slate-200 rounded font-mono font-bold bg-white text-slate-800" />
          </div>
          <div>
            <label className="block font-bold text-slate-600 mb-1">Admission No</label>
            <input type="text" value={formData.admissionNo} readOnly className="w-full p-2 border border-slate-200 rounded font-mono font-bold bg-white text-slate-800" />
          </div>
          <div>
            <label className="block font-bold text-slate-600 mb-1">Government PEN No</label>
            <input type="text" value={formData.penNo} onChange={(e) => setFormData({ ...formData, penNo: e.target.value })} className="w-full p-2 border border-slate-300 rounded font-mono bg-white" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Student Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Aryan Singh"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Class & Section *</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded bg-white"
              >
                <option value="6th">6th</option>
                <option value="7th">7th</option>
                <option value="8th">8th</option>
                <option value="9th">9th</option>
                <option value="10th">10th</option>
                <option value="11th">11th</option>
                <option value="12th">12th</option>
              </select>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded bg-white"
              >
                <option value="A">Sec A</option>
                <option value="B">Sec B</option>
                <option value="C">Sec C</option>
                <option value="PCM">PCM</option>
                <option value="COMM">COMM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Father&apos;s Name *</label>
            <input
              type="text"
              placeholder="Father's name"
              value={formData.fatherName}
              onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mother&apos;s Name</label>
            <input
              type="text"
              placeholder="Mother's name"
              value={formData.motherName}
              onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Parent Mobile (For SMS Alerts) *</label>
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
            <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">House Allocation</label>
            <select
              value={formData.house}
              onChange={(e) => setFormData({ ...formData, house: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded bg-white"
            >
              <option value="Tagore">Tagore</option>
              <option value="Ashoka">Ashoka</option>
              <option value="Shivaji">Shivaji</option>
              <option value="Raman">Raman</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Transport Facility</label>
            <select
              value={formData.transport}
              onChange={(e) => setFormData({ ...formData, transport: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded bg-white"
            >
              <option value="No">Day Scholar (Self)</option>
              <option value="Yes">Bus Pass Required</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1.5 text-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Complete Admission & Enroll</span>
          </button>
        </div>
      </form>
    </div>
  );
}
