"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Upload,
  Search,
  Download,
  Trash2,
  CheckCircle2,
  BookOpen,
  ArrowLeft
} from "lucide-react";

interface SyllabusDoc {
  id: string;
  className: string;
  subject: string;
  academicYear: string;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  uploadedDate: string;
}

export default function SyllabusFilePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [success, setSuccess] = useState(false);

  const [docs, setDocs] = useState<SyllabusDoc[]>([
    {
      id: "SYL-01",
      className: "Class 10th",
      subject: "Mathematics (NCERT / CBSE)",
      academicYear: "2026-2027",
      fileName: "Class_10_Maths_Syllabus_2026_27.pdf",
      fileSize: "2.4 MB",
      uploadedBy: "Kailash Bishnoi",
      uploadedDate: "2026-07-15"
    },
    {
      id: "SYL-02",
      className: "Class 10th",
      subject: "Science & Technology",
      academicYear: "2026-2027",
      fileName: "Class_10_Science_Curriculum.pdf",
      fileSize: "3.1 MB",
      uploadedBy: "Dr. Arvind Rathore",
      uploadedDate: "2026-07-16"
    },
    {
      id: "SYL-03",
      className: "Class 12th",
      subject: "Physics (Theory & Practical)",
      academicYear: "2026-2027",
      fileName: "Class_12_Physics_Syllabus.pdf",
      fileSize: "4.2 MB",
      uploadedBy: "Bhawani Singh",
      uploadedDate: "2026-07-20"
    }
  ]);

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <BookOpen className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Admin Reports</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Syllabus Files</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Syllabus PDF Repository
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Download or upload official curriculum PDFs accessible by teachers and parent app
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/syllabus-overview"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors"
          >
            ← Pacing Matrix
          </Link>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>+ Upload PDF</span>
          </button>
        </div>
      </div>

      {/* Docs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                  {doc.className}
                </span>
                <span className="text-[10px] text-slate-400">{doc.academicYear}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{doc.subject}</h3>
              <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                <FileText className="w-4 h-4 text-rose-500" />
                <span className="font-mono truncate">{doc.fileName}</span>
                <span className="text-slate-400">({doc.fileSize})</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Uploaded by {doc.uploadedBy}</span>
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
