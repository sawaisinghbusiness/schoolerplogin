"use client";

import React, { useState } from "react";
import { Camera, Upload, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { MOCK_STUDENTS } from "@/data/mockData";

export default function StudentPhotoUploadPage() {
  const [uploaded, setUploaded] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
          <Camera className="w-3.5 h-3.5 text-emerald-600" />
          <span>Manage Students</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-semibold">Scholar Photo Upload</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Student Photo & ID Card Gallery
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Bulk upload student passport photos named by SR Number (e.g. SR-2024-001.jpg) to Cloudflare R2 / Supabase Storage
        </p>
      </div>

      {uploaded && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">Student photos mapped and synced to scholar profiles!</span>
        </div>
      )}

      <div className="p-6 bg-white rounded-xl border border-dashed-2 border-slate-300 text-center space-y-3">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <Upload className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-slate-900">Drag and drop student image ZIP archive or files</h3>
          <p className="text-xs text-slate-500">Supports JPG, PNG (Max 500KB per image). Names must correspond to SR Numbers.</p>
        </div>
        <button
          onClick={() => {
            setUploaded(true);
            setTimeout(() => setUploaded(false), 4000);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs shadow-xs"
        >
          Select Student Photos (ZIP / Batch)
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {MOCK_STUDENTS.map((s) => (
          <div key={s.id} className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-2">
            <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 mx-auto shadow-xs">
              <img src={s.photoUrl} alt={s.name} className="w-full h-full object-cover" />
            </div>
            <div className="font-bold text-xs text-slate-900 truncate">{s.name}</div>
            <div className="text-[10px] text-slate-400 font-mono">{s.srNo}</div>
            <button
              onClick={() => alert(`Re-uploading photo for ${s.name}...`)}
              className="text-[10px] text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Replace Photo
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
