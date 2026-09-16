"use client";

import React, { useState } from "react";
import { Bell, Plus, Download, FileText } from "lucide-react";

export default function CircularsPage() {
  const circulars = [
    { no: "CIR-2026-018", title: "Term 1 Mid-Term Examination Datesheet & Guidelines", date: "12 Sep 2026", audience: "All Students & Parents", status: "Published" },
    { no: "CIR-2026-017", title: "Mandatory School Winter Uniform Specifications", date: "05 Sep 2026", audience: "All Parents", status: "Published" },
    { no: "CIR-2026-016", title: "Bus Route No. 4 Timing Adjustment Notice", date: "28 Aug 2026", audience: "Bus Commuters", status: "Published" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Bell className="w-3.5 h-3.5 text-emerald-600" />
            <span>Academic Ops</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Institutional Circulars</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Official School Circulars & Notices
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Publish administrative notices, sync with SchoolDesk mobile app, and broadcast WhatsApp alerts
          </p>
        </div>

        <button
          onClick={() => alert("Creating new official school circular...")}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Circular</span>
        </button>
      </div>

      <div className="space-y-3">
        {circulars.map((c, i) => (
          <div key={i} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-emerald-700">{c.no}</span>
                <span className="px-2 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">{c.audience}</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">{c.title}</h3>
              <p className="text-slate-400 text-[11px]">Issued on: {c.date}</p>
            </div>

            <button
              onClick={() => alert(`Downloading ${c.no} PDF circular...`)}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
