"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Building2,
  Save,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  School,
  Phone,
  Mail,
  MapPin,
  Globe,
  Loader2,
  ExternalLink
} from "lucide-react";
import { useSchoolProfile } from "@/components/providers/SchoolProfileProvider";
import { SchoolProfile } from "@/lib/services/schoolProfileService";

export default function SchoolDetailsPage() {
  const { schoolProfile, updateProfile, isLoading } = useSchoolProfile();
  const [formData, setFormData] = useState<SchoolProfile>(schoolProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info"; msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when context loads or changes
  useEffect(() => {
    if (schoolProfile) {
      setFormData(schoolProfile);
    }
  }, [schoolProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFeedback({ type: "error", msg: "Logo file size must be less than 2MB." });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData((prev) => ({ ...prev, logo_url: base64String }));
      setFeedback({ type: "info", msg: "New logo uploaded. Click 'Save Profile' to apply everywhere." });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logo_url: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFeedback({ type: "info", msg: "Logo removed. Click 'Save Profile' to apply." });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    const res = await updateProfile(formData);
    setIsSaving(false);

    if (res.success) {
      setFeedback({
        type: "success",
        msg: "Institutional profile updated successfully.",
      });
      setTimeout(() => setFeedback(null), 5000);
    } else {
      setFeedback({
        type: "error",
        msg: "Failed to save changes. Please try again.",
      });
    }
  };

  const schoolInitials =
    formData.school_name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "MT";

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl pb-20 font-sans text-slate-900">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Institutional Basic Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your school letterhead identity, official registration codes, contact channels, and branding logo.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving changes...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-lg text-xs border flex items-start justify-between gap-3 animate-fadeIn ${
            feedback.type === "success"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : feedback.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-slate-100 border-slate-300 text-slate-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.msg}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Brand & Logo Upload Hero Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Logo Preview & Upload Target */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center p-2 relative overflow-hidden group shadow-inner">
                {formData.logo_url ? (
                  <img
                    src={formData.logo_url}
                    alt="School Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black tracking-wider text-slate-800">
                      {schoolInitials}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-semibold">
                      No Logo
                    </span>
                  </div>
                )}
              </div>

              {/* Upload & Remove Actions */}
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  id="logo-upload-input"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
                >
                  <Upload className="w-3 h-3 text-slate-600" />
                  <span>{formData.logo_url ? "Change" : "Upload Logo"}</span>
                </button>

                {formData.logo_url && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-md transition-colors cursor-pointer"
                    title="Remove Logo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1.5 text-center max-w-[160px]">
                PNG, JPG or SVG (Max 2MB). Updates everywhere in ERP.
              </span>
            </div>

            {/* School Profile Summary Banner */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-100 border border-slate-200/80 rounded-md text-[11px] font-mono font-semibold text-slate-700">
                <span>School Code: {formData.school_code || "1040211"}</span>
                <span className="text-slate-300">&bull;</span>
                <span>{formData.state || "Rajasthan"}</span>
              </div>

              <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-snug">
                {formData.school_name || "School Full Name"}
              </h2>

              <p className="text-xs text-slate-500 max-w-xl">
                {formData.address
                  ? `${formData.address}${formData.city ? `, ${formData.city}` : ""}${formData.state ? `, ${formData.state}` : ""}${formData.pincode ? ` - ${formData.pincode}` : ""}`
                  : "Institutional Address"}
              </p>

              <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 font-mono">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {formData.contact1 || "8003911792"}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {formData.email || "mtnabarmer@gmail.com"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Institutional Identity & Codes */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Institutional Identity & Registration Codes
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Official school title and regulatory identification numbers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Institute Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="school_name"
                value={formData.school_name}
                onChange={handleInputChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                placeholder="e.g. MOTHER TERESA NOBLES ACADEMY SR. SEC. SCHOOL"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                School Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="school_code"
                value={formData.school_code}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-lg text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                placeholder="e.g. 1040211"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Affiliation Code
              </label>
              <input
                type="text"
                name="affiliation_no"
                value={formData.affiliation_no}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                placeholder="CBSE / State Board Affiliation No (if any)"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                UDISE Code
              </label>
              <input
                type="text"
                name="udise_code"
                value={formData.udise_code}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                placeholder="Unified District Information System Code"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Official Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                placeholder="e.g. mtnabarmer@gmail.com"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact Numbers */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Official Contact Numbers
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Phone lines for parent inquiries and automated SMS/WhatsApp dispatches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Contact 1 (Primary) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="contact1"
                value={formData.contact1}
                onChange={handleInputChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                placeholder="e.g. 8003911792"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Contact 2 (Secondary)
              </label>
              <input
                type="text"
                name="contact2"
                value={formData.contact2}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                placeholder="e.g. 9460062543"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Geographic & Postal Location */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              3. Geographic & Postal Location
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Precise location credentials for official letterhead and certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Address / Street / Landmark <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                placeholder="e.g. RAM NAGAR"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Village / Area
              </label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                placeholder="e.g. Barmer"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                placeholder="e.g. Barmer"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                District <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                placeholder="e.g. Barmer"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                State <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                placeholder="e.g. Rajasthan"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Pincode <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                placeholder="e.g. 344001"
              />
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving changes...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
