"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sliders,
  Power,
  Check,
  X,
  Phone,
  Calendar,
  FileText,
  Shield,
  Save,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  Lock,
  Upload
} from "lucide-react";

export default function SchoolSettingsPage() {
  const [unsavedChanges, setUnsavedChanges] = useState(0);
  const [savedNotification, setSavedNotification] = useState(false);

  // Switch states
  const [prospectus, setProspectus] = useState<"on" | "off">("off");
  const [resetInvoice, setResetInvoice] = useState<"session" | "fin" | "continuous">("continuous");
  const [enquirySession, setEnquirySession] = useState("2026-2027");
  const [feesReceiptTemplate, setFeesReceiptTemplate] = useState<"on" | "off">("off");
  const [resetChallan, setResetChallan] = useState<"session" | "fin" | "continuous">("session");
  const [resetSrNo, setResetSrNo] = useState<"session" | "continuous">("session");
  const [inventoryTemplate, setInventoryTemplate] = useState<"on" | "off">("off");

  // Notifications
  const [feesNotify, setFeesNotify] = useState<"off" | "sms_app" | "app">("sms_app");
  const [holidayNotify, setHolidayNotify] = useState<"off" | "sms_app" | "app">("app");
  const [skipHostelAbsent, setSkipHostelAbsent] = useState<"on" | "off">("off");

  // Director settings
  const [concessionOtp, setConcessionOtp] = useState(true);
  const [approvalContact, setApprovalContact] = useState("8769444584");
  const [fineOtp, setFineOtp] = useState(false);

  // Admit card
  const [admitStudentPhoto, setAdmitStudentPhoto] = useState(true);
  const [admitSrNo, setAdmitSrNo] = useState(true);
  const [admitRollNo, setAdmitRollNo] = useState(false);
  const [admitAdmissionNo, setAdmitAdmissionNo] = useState(false);
  const [admitDob, setAdmitDob] = useState(true);
  const [admitMotherName, setAdmitMotherName] = useState(true);
  const [admitTeacherSign, setAdmitTeacherSign] = useState(true);
  const [hideTiming, setHideTiming] = useState(false);
  const [hideExamName, setHideExamName] = useState(false);

  // Accounts
  const [defaulterMsgType, setDefaulterMsgType] = useState<"fees" | "installment" | "total">("installment");
  const [defaulterAutoNotify, setDefaulterAutoNotify] = useState(false);
  const [deletePaidConcession, setDeletePaidConcession] = useState<"on" | "off">("on");
  const [showAdjustFees, setShowAdjustFees] = useState<"on" | "off">("off");

  // Teacher App permissions
  const [teacherAppFeatures, setTeacherAppFeatures] = useState({
    markAttendance: true,
    addHomework: true,
    classTests: true,
    coscholastic: false,
    reportCard: true,
    sendNotifications: false,
  });

  // Payroll
  const [isSundayHoliday, setIsSundayHoliday] = useState(true);

  // Enquiry Message
  const [enquiryMsg, setEnquiryMsg] = useState(
    "Dear ::father_name::, as per your admission enquiry for ::student_name:: in class ::standard_name::, your token no. is ::token::. For further details, call ::school_contact::. Regards, ::school_name::"
  );

  const handleFieldChange = () => {
    setUnsavedChanges((prev) => prev + 1);
  };

  const handleSave = () => {
    setSavedNotification(true);
    setUnsavedChanges(0);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const insertToken = (token: string) => {
    setEnquiryMsg((prev) => prev + " " + token);
    handleFieldChange();
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn text-xs text-slate-800">
      {/* Top Header */}
      <div className="pb-2 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">School Settings</h1>
          <p className="text-slate-500 text-xs">
            Master rulebook, institutional toggles, and Director 2FA authorizations (Mother Teresa Nobles Academy)
          </p>
        </div>
      </div>

      {savedNotification && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg flex items-center space-x-2 font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Institutional settings updated successfully!</span>
        </div>
      )}

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block font-bold text-slate-700 mb-1">Filter Setting Group</label>
          <select className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-slate-50">
            <option value="ALL">ALL</option>
            <option value="FEATURES">School Features (ON/OFF)</option>
            <option value="DIRECTOR">Director Settings</option>
            <option value="ADMIT">Admit Card Settings</option>
            <option value="ACCOUNTS">Accounts Settings</option>
            <option value="CERT">Student Certificates</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block font-bold text-slate-700 mb-1">Go to Setting</label>
          <select className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-slate-50">
            <option value="">Select Setting...</option>
            <option value="prospectus">Prospectus</option>
            <option value="invoice">Reset Invoice No</option>
            <option value="director_otp">Director Concession OTP</option>
            <option value="defaulters">Defaulter Auto Notify</option>
          </select>
        </div>
      </div>

      {/* Section 1: School Features (ON/OFF) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs divide-y divide-slate-100">
        <div className="p-4 bg-slate-50 font-bold text-slate-800 text-sm">
          School Features (ON/OFF)
        </div>

        {/* Prospectus */}
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-bold text-slate-900">Prospectus</div>
            <div className="text-slate-500 text-xs">Issue Prospectus to enquiry</div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => { setProspectus("on"); handleFieldChange(); }}
              className={`px-4 py-1.5 rounded-lg flex items-center space-x-1.5 font-bold transition-colors ${
                prospectus === "on" ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>Turn On</span>
            </button>
            <button
              onClick={() => { setProspectus("off"); handleFieldChange(); }}
              className={`px-4 py-1.5 rounded-lg flex items-center space-x-1.5 font-bold transition-colors ${
                prospectus === "off" ? "bg-rose-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>Turn Off</span>
            </button>
          </div>
        </div>

        {/* Reset Invoice No */}
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-bold text-slate-900">Reset Invoice No for New Financial Year</div>
            <div className="text-slate-500 text-xs">&quot;On&quot; will start receipts from 01</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setResetInvoice("session"); handleFieldChange(); }}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                resetInvoice === "session" ? "bg-rose-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Change on session basis
            </button>
            <button
              onClick={() => { setResetInvoice("fin"); handleFieldChange(); }}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                resetInvoice === "fin" ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Change on fin. year basis
            </button>
            <button
              onClick={() => { setResetInvoice("continuous"); handleFieldChange(); }}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                resetInvoice === "continuous" ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Keep continuous
            </button>
          </div>
        </div>

        {/* Enquiry Active Session */}
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-bold text-slate-900">School Enquiry Active Session</div>
            <div className="text-slate-500 text-xs">Academic session for new prospective admissions</div>
          </div>
          <select
            value={enquirySession}
            onChange={(e) => { setEnquirySession(e.target.value); handleFieldChange(); }}
            className="p-2 border border-slate-300 rounded-lg text-xs bg-slate-50 font-bold"
          >
            <option value="2026-2027">2026-2027</option>
            <option value="2025-2026">2025-2026</option>
          </select>
        </div>

        {/* Fees receipt template */}
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-bold text-slate-900">Fees receipt template design</div>
            <div className="text-slate-500 text-xs">Use custom template design</div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => { setFeesReceiptTemplate("on"); handleFieldChange(); }}
              className={`px-4 py-1.5 rounded-lg font-bold transition-colors ${
                feesReceiptTemplate === "on" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              Turn On
            </button>
            <button
              onClick={() => { setFeesReceiptTemplate("off"); handleFieldChange(); }}
              className={`px-4 py-1.5 rounded-lg font-bold transition-colors ${
                feesReceiptTemplate === "off" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              Turn Off
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Director Settings (2FA Security) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs divide-y divide-slate-100">
        <div className="p-4 bg-slate-50 font-bold text-slate-800 text-sm flex items-center space-x-2">
          <Shield className="w-4 h-4 text-rose-600" />
          <span>Director Settings (2FA OTP Protection)</span>
        </div>

        {/* Concession OTP */}
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-bold text-slate-900">Delete concession otp approval</div>
            <div className="text-slate-500 text-xs">Requires Director SMS OTP verification before removing paid concession</div>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer font-bold">
              <input
                type="checkbox"
                checked={concessionOtp}
                onChange={(e) => { setConcessionOtp(e.target.checked); handleFieldChange(); }}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span>{concessionOtp ? "Yes" : "No"}</span>
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-slate-600 font-semibold">Contact for approval:</span>
              <input
                type="text"
                value={approvalContact}
                onChange={(e) => { setApprovalContact(e.target.value); handleFieldChange(); }}
                className="p-1.5 border border-slate-300 rounded font-mono font-bold w-32 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Fine OTP */}
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-bold text-slate-900">Delete fine otp approval</div>
            <div className="text-slate-500 text-xs">Requires Director SMS OTP verification before waiving late fines</div>
          </div>
          <label className="flex items-center space-x-2 cursor-pointer font-bold">
            <input
              type="checkbox"
              checked={fineOtp}
              onChange={(e) => { setFineOtp(e.target.checked); handleFieldChange(); }}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <span>{fineOtp ? "Yes" : "No"}</span>
          </label>
        </div>
      </div>

      {/* Section 3: Automatic Notifications */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs divide-y divide-slate-100">
        <div className="p-4 bg-slate-50 font-bold text-slate-800 text-sm">
          Automatic Notifications
        </div>

        {/* Student Fees Notification */}
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-bold text-slate-900">Student Fees Notification</div>
            <div className="text-slate-500 text-xs">Default channel for sending fees reminders</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setFeesNotify("off"); handleFieldChange(); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${feesNotify === "off" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600"}`}
            >
              Turn Off
            </button>
            <button
              onClick={() => { setFeesNotify("sms_app"); handleFieldChange(); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${feesNotify === "sms_app" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}
            >
              SMS + App
            </button>
            <button
              onClick={() => { setFeesNotify("app"); handleFieldChange(); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${feesNotify === "app" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}
            >
              Only App
            </button>
          </div>
        </div>

        {/* Auto Notify Holidays */}
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-bold text-slate-900">Auto Notify Holidays</div>
            <div className="text-slate-500 text-xs">Send automatic calendar holiday alerts</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setHolidayNotify("off"); handleFieldChange(); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${holidayNotify === "off" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600"}`}
            >
              Turn Off
            </button>
            <button
              onClick={() => { setHolidayNotify("sms_app"); handleFieldChange(); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${holidayNotify === "sms_app" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}
            >
              SMS + App
            </button>
            <button
              onClick={() => { setHolidayNotify("app"); handleFieldChange(); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${holidayNotify === "app" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}
            >
              Only App
            </button>
          </div>
        </div>
      </div>

      {/* Section 4: Enquiry Greeting Message Template */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="font-bold text-slate-900 text-sm">Enquiry Settings & Greeting Message</div>
        <p className="text-slate-500 text-xs">
          Default message sent to parents upon admission inquiry registration:
        </p>
        <textarea
          rows={3}
          value={enquiryMsg}
          onChange={(e) => { setEnquiryMsg(e.target.value); handleFieldChange(); }}
          className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
        />
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => insertToken("::student_name::")} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-xs transition-colors">
            ENTER STUDENT NAME
          </button>
          <button onClick={() => insertToken("::father_name::")} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-xs transition-colors">
            ENTER FATHER NAME
          </button>
          <button onClick={() => insertToken("::standard_name::")} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-xs transition-colors">
            ENTER STANDARD
          </button>
          <button onClick={() => insertToken("::token::")} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-xs transition-colors">
            ENTER TOKEN
          </button>
          <button onClick={() => insertToken("::school_name::")} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-xs transition-colors">
            ENTER SCHOOL NAME
          </button>
          <button onClick={() => insertToken("::school_contact::")} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-xs transition-colors">
            ENTER SCHOOL CONTACT
          </button>
        </div>
      </div>

      {/* Section 5: Teacher Mobile App Features */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="font-bold text-slate-900 text-sm">Teacher App Features</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(teacherAppFeatures).map(([key, val]) => (
            <label key={key} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={val}
                onChange={(e) => {
                  setTeacherAppFeatures((prev) => ({ ...prev, [key]: e.target.checked }));
                  handleFieldChange();
                }}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="capitalize font-semibold text-slate-700">
                {key.replace(/([A-Z])/g, " $1")}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Section 6: HR Payroll Settings */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex items-center justify-between">
        <div>
          <div className="font-bold text-slate-900">HR Payroll Settings — Is Sunday Holiday</div>
          <div className="text-slate-500 text-xs">Auto-credit paid weekly off for staff payroll calculation</div>
        </div>
        <label className="flex items-center space-x-2 cursor-pointer font-bold">
          <input
            type="checkbox"
            checked={isSundayHoliday}
            onChange={(e) => { setIsSundayHoliday(e.target.checked); handleFieldChange(); }}
            className="w-4 h-4 text-emerald-600 rounded"
          />
          <span>{isSundayHoliday ? "Yes" : "No"}</span>
        </label>
      </div>

      {/* Responsive Bottom Action Bar */}
      <div className="sticky bottom-0 z-30 bg-slate-900 border-t border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-xl mt-6">
        <div className="text-white text-xs font-semibold">
          Mother Teresa Nobles Academy Rulebook
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center space-x-2 text-xs"
        >
          <Save className="w-4 h-4" />
          <span>Update Settings ({unsavedChanges})</span>
        </button>
      </div>
    </div>
  );
}
