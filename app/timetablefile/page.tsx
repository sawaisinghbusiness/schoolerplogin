"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Upload,
  Download,
  FileText,
  Trash2,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";

interface TimetableDoc {
  id: string;
  title: string;
  className: string;
  effectiveFrom: string;
  fileSize: string;
  fileName: string;
  uploadedDate: string;
}

export default function TimetableFilePage() {
  const [docs, setDocs] = useState<TimetableDoc[]>([
    {
      id: "TT-01",
      title: "Master High School Timetable (9th to 12th)",
      className: "9th to 12th",
      effectiveFrom: "01 July 2026",
      fileSize: "1.8 MB",
      fileName: "Master_Timetable_HighSchool_2026.pdf",
      uploadedDate: "2026-07-01"
    },
    {
      id: "TT-02",
      title: "Middle School Timetable (6th to 8th)",
      className: "6th to 8th",
      effectiveFrom: "01 July 2026",
      fileSize: "1.4 MB",
      fileName: "Middle_School_Timetable_2026.pdf",
      uploadedDate: "2026-07-01"
    },
    {
      id: "TT-03",
      title: "Primary Wing Timing & Period Schedule (1st to 5th)",
      className: "1st to 5th",
      effectiveFrom: "01 July 2026",
      fileSize: "1.1 MB",
      fileName: "Primary_Wing_Periods_2026.pdf",
      uploadedDate: "2026-07-01"
    }
  ]);

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Admin Reports</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Timetable Files</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Class Timetable Documents & Charts
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Archived PDF timetable schedules published for download and notice board printing
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/add-timetable"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors"
          >
            ← Timetable Builder
          </Link>
          <button
            onClick={() => alert("Upload PDF timetable...")}
            className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>+ Upload Timetable PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  {doc.className}
                </span>
                <span className="text-[10px] text-slate-400">From {doc.effectiveFrom}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{doc.title}</h3>
              <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                <FileText className="w-4 h-4 text-rose-500" />
                <span className="font-mono truncate">{doc.fileName}</span>
                <span className="text-slate-400">({doc.fileSize})</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Uploaded {doc.uploadedDate}</span>
              <button
                onClick={() => alert(`Downloading ${doc.fileName}...`)}
                className="px-3 py-1 bg-slate-100 hover:bg-[#26b99a] hover:text-white rounded font-bold text-[11px] text-slate-700 transition-colors flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
