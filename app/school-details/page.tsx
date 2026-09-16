"use client";

import React, { useState } from "react";
import {
  Building2,
  Save,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Upload,
  ExternalLink
} from "lucide-react";

export default function SchoolDetailsPage() {
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: "MOTHER TERESA NOBLES ACADEMY SR. SEC. SCHOOL",
    accountCode: "SLRJ0402749",
    schoolCode: "1040211",
    affiliationNo: "",
    address: "RAM NAGAR, Barmer, Rajasthan",
    pincode: "344001",
    contact1: "8003911792",
    contact2: "9460062543",
    email: "mtnabarmer@gmail.com",
    mapsLink: "https://maps.app.goo.gl/LR2Qx9ZbiN8EYZrF6",
    logoUrl: "https://via.placeholder.com/150",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-16 text-xs text-slate-800">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Institute Details</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Basic Details</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Institute Basic Details
          </h1>
          <p className="text-slate-500 text-[11px]">
            Master school profile, government code, contact numbers, and official letterhead credentials
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#26b99a] hover:bg-[#209b81] text-white rounded text-xs font-bold shadow-xs transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded flex items-center space-x-2 font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>School details updated successfully!</span>
        </div>
      )}

      <div className="bg-white rounded border border-slate-200 shadow-xs p-6 space-y-6">
        {/* Header Branding Card */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100">
          <div className="w-24 h-24 rounded border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-2 text-center bg-slate-50 hover:bg-slate-100 cursor-pointer relative group">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg mb-1">
              MT
            </div>
            <span className="text-[10px] text-slate-500 font-semibold">Change Logo</span>
          </div>

          <div className="space-y-1 text-center sm:text-left flex-1">
            <h2 className="text-base font-bold text-slate-900">{formData.schoolName}</h2>
            <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold text-[11px]">
                ACCOUNT ID: {formData.accountCode}
              </span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono font-bold text-[11px]">
                SCHOOL CODE: {formData.schoolCode}
              </span>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">School Full Name *</label>
            <input
              type="text"
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded font-semibold text-xs focus:ring-1 focus:ring-[#26b99a]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">School Code *</label>
            <input
              type="text"
              value={formData.schoolCode}
              onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-[#26b99a]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Affiliation No</label>
            <input
              type="text"
              value={formData.affiliationNo}
              placeholder="Enter affiliation number if applicable"
              onChange={(e) => setFormData({ ...formData, affiliationNo: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Pincode *</label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-[#26b99a]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Primary Contact Number *</label>
            <input
              type="text"
              value={formData.contact1}
              onChange={(e) => setFormData({ ...formData, contact1: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-[#26b99a]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Secondary Contact Number</label>
            <input
              type="text"
              value={formData.contact2}
              onChange={(e) => setFormData({ ...formData, contact2: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-[#26b99a]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Full School Address *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Google Maps Location Link</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.mapsLink}
                onChange={(e) => setFormData({ ...formData, mapsLink: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-[#26b99a]"
              />
              <a
                href={formData.mapsLink}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded flex items-center space-x-1 shrink-0 font-bold"
              >
                <span>View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
