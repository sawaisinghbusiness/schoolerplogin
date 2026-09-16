"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Send,
  Upload,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  AlertCircle
} from "lucide-react";

export default function HomeworkPage() {
  const [selectedClass, setSelectedClass] = useState("10th - A");
  const [subject, setSubject] = useState("Mathematics");
  const [dueDate, setDueDate] = useState("2026-09-17");
  const [languageMode, setLanguageMode] = useState<"en" | "hi">("en");
  const [description, setDescription] = useState(
    "Complete NCERT Chapter 6 (Triangles) Exercise 6.3 questions 1 to 8 in mathematics homework register. Draw labeled geometric figures with proper scale."
  );
  const [notifySms, setNotifySms] = useState(false);
  const [success, setSuccess] = useState(false);

  const CLASSES = [
    "10th - A", "10th - B", "9th - A", "9th - B",
    "8th - A", "8th - B", "12th - PCM", "12th - Commerce", "11th - Science"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3500);
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <BookOpen className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>School Teacher</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Add Homework</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Assign Daily Class Homework
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Post subject homework, assign submission deadlines, attach PDF worksheets, and sync to student mobile app
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/show-homework"
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors flex items-center space-x-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Published Homework</span>
          </Link>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Homework successfully posted to {selectedClass} ({subject})! Push notification sent to student app.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Class Pills */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-2">
          <span className="font-bold text-slate-700 text-xs block">
            1. Select Target Class & Section:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {CLASSES.map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1.5 rounded-md font-bold text-xs transition-all ${
                  selectedClass === cls
                    ? "bg-[#26b99a] text-white shadow-xs"
                    : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-900 text-xs">2. Homework Details</span>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="text-slate-500">Typing Mode:</span>
              <label className="inline-flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="hw_lang"
                  checked={languageMode === "en"}
                  onChange={() => setLanguageMode("en")}
                  className="text-[#26b99a] focus:ring-[#26b99a]"
                />
                <span>English</span>
              </label>
              <label className="inline-flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="hw_lang"
                  checked={languageMode === "hi"}
                  onChange={() => setLanguageMode("hi")}
                  className="text-[#26b99a] focus:ring-[#26b99a]"
                />
                <span>हिंदी</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Subject *</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded font-bold bg-white"
              >
                <option>Mathematics</option>
                <option>Science</option>
                <option>English Core</option>
                <option>Hindi</option>
                <option>Social Science</option>
                <option>Computer Science</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Submission Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Homework Description & Instructions *
            </label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write the assignment questions or reading tasks..."
              className="w-full p-3 border border-slate-300 rounded focus:ring-1 focus:ring-[#26b99a] focus:outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Attach Worksheet / Question Paper (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-lg p-3.5 text-center cursor-pointer bg-slate-50 transition-colors">
              <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <span className="text-slate-600 font-semibold text-xs">
                Upload Worksheet PDF or Image (Max 5MB)
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifySms}
                onChange={(e) => setNotifySms(e.target.checked)}
                className="text-[#26b99a] rounded focus:ring-[#26b99a]"
              />
              <span className="font-semibold text-slate-700">
                Send SMS Alert to parents (Consumes SMS balance)
              </span>
            </label>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#26b99a] hover:bg-[#209b81] text-white font-bold rounded-lg shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Publish Homework</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
