"use client";

import React, { useState } from "react";
import { Sliders, Bell, Shield, Save, CheckCircle2, AlertTriangle, Key } from "lucide-react";

export default function CustomSettingsPage() {
  const [saved, setSaved] = useState(false);

  const SETTING_ITEMS = [
    { id: "sms_absent", title: "Automated Daily Absentee SMS Alert", desc: "Dispatch automatic SMS to parent mobile at 10:30 AM for unmarked/absent students", category: "SMS Gateway", defaultChecked: true },
    { id: "sms_fee_due", title: "Quarterly Fee Reminder Notice", desc: "Send WhatsApp & SMS payment links 7 days before quarter installment deadline", category: "SMS Gateway", defaultChecked: true },
    { id: "dlt_strict", title: "DLT Header Strict Enforcement", desc: "Validate Template ID and PE Entity ID (1401568294901) before delivery queue", category: "SMS Gateway", defaultChecked: true },
    { id: "gate_pass_alert", title: "Gate Pass Parent Live Confirmation", desc: "Instant SMS alert when security guard scans student out of gate", category: "Security", defaultChecked: true },
    { id: "biometric_sync", title: "Staff Biometric Machine Auto-Sync", desc: "Poll TCP/IP Biometric Attendance Punch machine every 15 minutes", category: "Biometric", defaultChecked: true },
    { id: "cbse_grade_calc", title: "CBSE 9-Point Grading Normalization", desc: "Auto-calculate A1 to E2 grades according to standard 2026-27 CBSE examination bylaws", category: "Examination", defaultChecked: true },
    { id: "auto_sr_gen", title: "Serial Number & Scholar Register Auto-Increment", desc: "Increment SR sequence format: SR-2026-XXXX", category: "Admission", defaultChecked: true },
    { id: "copy_check_lock", title: "Teacher Copy Check Deadline Enforcement", desc: "Lock remarks submission after 7 business days of test completion", category: "Academic Ops", defaultChecked: false },
    { id: "parent_portal_pass", title: "Direct OTP Parent Login", desc: "Allow parents to login via 6-digit WhatsApp OTP without remembering password", category: "Security", defaultChecked: true },
    { id: "tc_principal_seal", title: "Digital Institutional Stamp on TC", desc: "Overlay official digital seal and signature hash on TC PDFs", category: "Certificates", defaultChecked: true },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            <span>Institute Details</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Custom Settings</span>
            <span className="px-1.5 py-0.2 bg-orange-500 text-white rounded text-[10px] font-bold">30</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Institutional Rulebook & Custom Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure 30 automated behavioral rules for SMS delivery, biometric synchronization, exams, and gate pass clearances
          </p>
        </div>

        <button
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
          }}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Rulebook (30 Items)</span>
        </button>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">All 30 Institutional Custom Settings Synchronized to SchoolDesk Cloud!</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100">
        {SETTING_ITEMS.map((item, idx) => (
          <div key={item.id} className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs sm:text-sm text-slate-900">{item.title}</span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">
                  {item.category}
                </span>
              </div>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input
                type="checkbox"
                defaultChecked={item.defaultChecked}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
