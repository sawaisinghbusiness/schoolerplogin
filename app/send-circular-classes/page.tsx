"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Send,
  FileText,
  Upload,
  CheckCircle2,
  Calendar,
  Layers,
  Users,
  AlertCircle
} from "lucide-react";

export default function SendCircularClassesPage() {
  const [success, setSuccess] = useState(false);
  const [targetType, setTargetType] = useState<"classes" | "sections">("classes");
  const [languageMode, setLanguageMode] = useState<"en" | "hi">("en");
  const [notifyApp, setNotifyApp] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [postNotice, setPostNotice] = useState(true);

  // Selected classes
  const [selectedClasses, setSelectedClasses] = useState<string[]>([
    "10th",
    "12th - Science",
    "12th - Commerce"
  ]);

  const ALL_CLASSES = [
    "Playgroup",
    "Nursery",
    "LKG",
    "UKG",
    "1st",
    "2nd",
    "3rd",
    "4th",
    "5th",
    "6th",
    "7th",
    "8th",
    "9th",
    "10th",
    "11th - Science",
    "11th - Commerce",
    "11th - Arts",
    "12th - Science",
    "12th - Commerce",
    "12th - Arts",
  ];

  const [title, setTitle] = useState("Pre-Board Exam Timetable & Guidelines Notification");
  const [message, setMessage] = useState(
    "Dear Parents, Please note that the Pre-Board examinations for Classes 10th and 12th will commence from Monday, 22nd September. Detailed timetable is attached below. Students must arrive in proper school uniform by 7:45 AM. - Mother Teresa Nobles Academy"
  );

  const toggleClass = (cls: string) => {
    if (selectedClasses.includes(cls)) {
      setSelectedClasses(selectedClasses.filter((c) => c !== cls));
    } else {
      setSelectedClasses([...selectedClasses, cls]);
    }
  };

  const selectAll = () => setSelectedClasses([...ALL_CLASSES]);
  const clearAll = () => setSelectedClasses([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClasses.length === 0) {
      alert("Please select at least one class.");
      return;
    }
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <Bell className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Circular</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Individual Classes</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Send Circular to Selected Classes
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Target specific standards and sections with announcements, homework circulars, or event notices
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/circular-history"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors flex items-center space-x-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Circular History</span>
          </Link>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Circular successfully dispatched to {selectedClasses.length} classes via selected channels!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Form Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Class Selection Box */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#26b99a]" />
                <span className="font-bold text-slate-900">1. Select Target Classes</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {selectedClasses.length} Selected
                </span>
              </div>

              <div className="space-x-2 text-[11px]">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-[#26b99a] font-bold hover:underline"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-slate-500 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1">
              {ALL_CLASSES.map((cls) => {
                const isSelected = selectedClasses.includes(cls);
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => toggleClass(cls)}
                    className={`px-3 py-1.5 rounded-md font-medium text-xs transition-all border ${
                      isSelected
                        ? "bg-[#26b99a] text-white border-[#26b99a] shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {cls}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Circular Details */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-900">2. Circular Content</span>
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="text-slate-500">Typing Mode:</span>
                <label className="inline-flex items-center space-x-1 cursor-pointer">
                  <input
                    type="radio"
                    name="lang"
                    checked={languageMode === "en"}
                    onChange={() => setLanguageMode("en")}
                    className="text-[#26b99a] focus:ring-[#26b99a]"
                  />
                  <span>English</span>
                </label>
                <label className="inline-flex items-center space-x-1 cursor-pointer">
                  <input
                    type="radio"
                    name="lang"
                    checked={languageMode === "hi"}
                    onChange={() => setLanguageMode("hi")}
                    className="text-[#26b99a] focus:ring-[#26b99a]"
                  />
                  <span>हिंदी</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Circular Title / Subject *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
                placeholder="e.g. Schedule of Practical Examinations"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700">
                  Circular Message / Body *
                </label>
                <span className="text-[10px] text-slate-400">
                  {message.length} chars (Approx {Math.ceil(message.length / 160)} SMS parts)
                </span>
              </div>
              <textarea
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#26b99a] focus:outline-none leading-relaxed"
                placeholder="Write the full circular notice here..."
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Attach PDF / Image Notice (Optional)
              </label>
              <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-lg p-3 text-center cursor-pointer bg-slate-50 transition-colors">
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span className="text-slate-600 font-semibold text-xs">
                  Click to attach file or drag & drop (Max: 5MB)
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">Supports PDF, JPG, PNG</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Channels & Dispatch */}
        <div className="space-y-5">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <span className="font-bold text-slate-900 block border-b border-slate-100 pb-2">
              3. Delivery Channels
            </span>

            <div className="space-y-3">
              <label className="flex items-start space-x-2.5 p-2 rounded bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyApp}
                  onChange={(e) => setNotifyApp(e.target.checked)}
                  className="mt-0.5 text-[#26b99a] rounded focus:ring-[#26b99a]"
                />
                <div>
                  <span className="font-bold text-slate-800 block">Mobile App Notification</span>
                  <span className="text-[11px] text-slate-500">Free instant push notification to Parent App</span>
                </div>
              </label>

              <label className="flex items-start space-x-2.5 p-2 rounded bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={postNotice}
                  onChange={(e) => setPostNotice(e.target.checked)}
                  className="mt-0.5 text-[#26b99a] rounded focus:ring-[#26b99a]"
                />
                <div>
                  <span className="font-bold text-slate-800 block">Digital Notice Board</span>
                  <span className="text-[11px] text-slate-500">Pin to Student & Staff Web Portal Dashboard</span>
                </div>
              </label>

              <label className="flex items-start space-x-2.5 p-2 rounded bg-amber-50 border border-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifySms}
                  onChange={(e) => setNotifySms(e.target.checked)}
                  className="mt-0.5 text-amber-600 rounded focus:ring-amber-500"
                />
                <div>
                  <span className="font-bold text-amber-900 block">Government DLT SMS</span>
                  <span className="text-[11px] text-amber-700">Consumes SMS balance (Current balance: 5,153 SMS)</span>
                </div>
              </label>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-[11px] flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
              <span>
                Circulars sent will also be visible in the parent app timeline with download options.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#26b99a] hover:bg-[#209b81] text-white font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Publish & Send Circular</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
