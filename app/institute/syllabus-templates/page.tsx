"use client";

import React from "react";
import { FileText, Download, Plus, CheckCircle2, BookOpen } from "lucide-react";

export default function SyllabusTemplatesPage() {
  const templates = [
    { title: "CBSE Senior Secondary Term 1 Syllabus", class: "Class 11 - 12", chapters: 18, updated: "10 Aug 2026", status: "Published" },
    { title: "CBSE Secondary Board Syllabus 2026-27", class: "Class 9 - 10", chapters: 24, updated: "01 Sep 2026", status: "Published" },
    { title: "Middle Wing Integrated Curriculum Scheme", class: "Class 6 - 8", chapters: 32, updated: "25 Aug 2026", status: "Draft" },
    { title: "Foundational & Primary Stage Learning Units", class: "Class 1 - 5", chapters: 16, updated: "15 Jul 2026", status: "Published" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Institute Details</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Syllabus Templates</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Academic Syllabus Schemes & Templates
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage unit blueprints, term divisions, and teacher lesson planning structures
          </p>
        </div>

        <button
          onClick={() => alert("Creating new curriculum syllabus template...")}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload New Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tpl, i) => (
          <div key={i} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 font-mono">{tpl.class}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  tpl.status === "Published" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {tpl.status}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">{tpl.title}</h3>
              <p className="text-xs text-slate-500">{tpl.chapters} Units / Learning Outcomes mapped.</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Updated: {tpl.updated}</span>
              <button
                onClick={() => alert(`Downloading ${tpl.title} PDF scheme...`)}
                className="inline-flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Schema</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
