"use client";

import React, { useState } from "react";
import { Building2, Save, CheckCircle2, Shield, School, MapPin, Phone, Mail, Globe } from "lucide-react";

export default function InstituteBasicDetailsPage() {
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: "Mother Teresa Nobles Academy",
    accountCode: "SLRJ0402749",
    affiliationNo: "CBSE-1730045",
    board: "Central Board of Secondary Education (CBSE)",
    foundedYear: "2004",
    principalName: "Dr. K. S. Rathore",
    address: "Opposite Collectorate, Civil Lines, Barmer, Rajasthan - 344001",
    contactNumber: "+91 94140 12345",
    officialEmail: "admin@motherteresa.edu.in",
    website: "https://motherteresaschool.edu.in",
    schoolType: "Co-Educational English Medium Senior Secondary",
    activeSession: "2026-27"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Institute Details</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-semibold">Basic Institutional Profile</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Institute Basic Details
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage master identification, affiliation credentials, contact details, and school letterhead metadata
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">Institutional Basic Profile Updated Successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6 text-xs">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-emerald-700 text-xl">
            M
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">{formData.schoolName}</h2>
            <p className="text-[11px] text-slate-400">Schoollog ERP Account Code: <strong className="text-emerald-700 font-mono">{formData.accountCode}</strong></p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">School Full Name *</label>
            <input
              type="text"
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Affiliation / Registration No *</label>
            <input
              type="text"
              value={formData.affiliationNo}
              onChange={(e) => setFormData({ ...formData, affiliationNo: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Education Board *</label>
            <input
              type="text"
              value={formData.board}
              onChange={(e) => setFormData({ ...formData, board: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Principal / Head of Institution</label>
            <input
              type="text"
              value={formData.principalName}
              onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Official Postal Address *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Official Contact Number *</label>
            <input
              type="text"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Official Institution Email *</label>
            <input
              type="email"
              value={formData.officialEmail}
              onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold flex items-center space-x-1.5 shadow-sm transition-colors text-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
