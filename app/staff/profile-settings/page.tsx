"use client";

import React, { useState } from "react";
import { Sliders, Save, CheckCircle2 } from "lucide-react";

export default function StaffProfileSettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl pb-10">
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
          <Sliders className="w-3.5 h-3.5 text-emerald-600" />
          <span>Manage Staff</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-semibold">Faculty Profile Policies</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Staff Profile & Portal Permissions
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure teacher login access permissions, mobile app view rights, and document upload permissions
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">Staff profile policies updated!</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
          <div>
            <div className="font-bold text-slate-800">Allow Teachers to Edit Personal Profile</div>
            <div className="text-slate-500 text-[11px]">Teachers can update phone number and address from mobile app</div>
          </div>
          <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
        </label>

        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
          <div>
            <div className="font-bold text-slate-800">Biometric Punch Geofencing</div>
            <div className="text-slate-500 text-[11px]">Require staff to be within 200m of school campus for mobile attendance</div>
          </div>
          <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
        </label>

        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
          <div>
            <div className="font-bold text-slate-800">Teacher Leave Application Module</div>
            <div className="text-slate-500 text-[11px]">Allow staff to request casual leave online directly to Principal</div>
          </div>
          <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
        </label>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 3000);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs shadow-xs"
          >
            Save Profile Policies
          </button>
        </div>
      </div>
    </div>
  );
}
