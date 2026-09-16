"use client";

import React, { useState } from "react";
import { Clock, Save, CheckCircle2 } from "lucide-react";

export default function StaffAttendanceSlotsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl pb-10">
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Staff Attendance</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-semibold">Biometric Shifts</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Staff Shifts, Biometric Grace Time & Half-Day Rules
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure morning arrival grace minutes, evening departure punch cut-off, and auto-half-day thresholds
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">Staff shift rules saved!</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Faculty In-Time Shift</label>
            <input type="time" defaultValue="07:45" className="w-full p-2 border border-slate-300 rounded font-mono font-bold" />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Late Arrival Grace Window (Mins)</label>
            <input type="number" defaultValue="15" className="w-full p-2 border border-slate-300 rounded font-mono font-bold" />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Half-Day Departure Time</label>
            <input type="time" defaultValue="12:30" className="w-full p-2 border border-slate-300 rounded font-mono font-bold" />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Shift Out-Time (Evening Exit)</label>
            <input type="time" defaultValue="14:30" className="w-full p-2 border border-slate-300 rounded font-mono font-bold" />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 3000);
            }}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs shadow-xs"
          >
            Save Shift Settings
          </button>
        </div>
      </div>
    </div>
  );
}
