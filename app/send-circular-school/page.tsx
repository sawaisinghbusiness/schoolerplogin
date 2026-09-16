"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Send, Printer, Upload, CheckCircle2 } from "lucide-react";

export default function SendCircularSchoolPage() {
  const [startDatetime, setStartDatetime] = useState("");
  const [endDatetime, setEndDatetime] = useState("");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [typingLang, setTypingLang] = useState<"english" | "hindi">("english");
  const [message, setMessage] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      alert("Please enter message body.");
      return;
    }
    setIsSent(true);
    setTimeout(() => setIsSent(false), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl pb-16 text-xs text-slate-800">
      <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
        <Link href="/dashboard" className="hover:underline">Home</Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">Circular</span>
      </div>

      <div className="p-3.5 bg-[#59c2a0] text-white font-bold rounded shadow-xs text-sm">
        Send to All Students
      </div>

      {isSent && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded flex items-center space-x-2 font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Circular successfully dispatched to all 1,924 scholars!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded border border-slate-200 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">
          SEND TO WHOLE SCHOOL
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Start Datetime <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={startDatetime}
              onChange={(e) => setStartDatetime(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a]"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              End Datetime <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={endDatetime}
              onChange={(e) => setEndDatetime(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Category <span className="text-rose-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded bg-slate-50 text-xs font-semibold focus:ring-1 focus:ring-[#26b99a]"
            required
          >
            <option value="">Select Category</option>
            <option value="Academic">Academic Notice</option>
            <option value="Holiday">Holiday Declaration</option>
            <option value="Fee">Fee Notice</option>
            <option value="Exam">Examination Schedule</option>
            <option value="Event">Sports &amp; Cultural Event</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Subject <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a]"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block font-bold text-slate-700">
            Message (Select typing language) <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center space-x-4 pb-1">
            <label className="flex items-center space-x-1.5 cursor-pointer font-semibold">
              <input
                type="radio"
                name="lang"
                checked={typingLang === "english"}
                onChange={() => setTypingLang("english")}
                className="text-[#26b99a]"
              />
              <span>English</span>
            </label>
            <label className="flex items-center space-x-1.5 cursor-pointer font-semibold">
              <input
                type="radio"
                name="lang"
                checked={typingLang === "hindi"}
                onChange={() => setTypingLang("hindi")}
                className="text-[#26b99a]"
              />
              <span>Hindi</span>
            </label>
          </div>

          <textarea
            rows={5}
            placeholder={typingLang === "hindi" ? "संदेश यहाँ लिखें..." : "Enter Message..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 border border-[#59c2a0] rounded text-xs focus:ring-1 focus:ring-[#26b99a]"
            required
          />
          <div className="text-[11px] text-slate-400 font-mono">
            Length: {message.length}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block font-bold text-slate-700">Attachments</label>
          <input
            type="file"
            multiple
            className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-slate-300 file:bg-slate-100 file:text-xs file:font-semibold hover:file:bg-slate-200"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => alert(`Previewing Circular:\nSubject: ${subject}\n\n${message}`)}
            className="px-5 py-2 border-2 border-[#e67e22] text-[#e67e22] hover:bg-orange-50 font-bold rounded uppercase tracking-wider text-[11px] transition-colors"
          >
            PRINT PREVIEW
          </button>
          <button
            type="submit"
            className="px-6 py-2 border-2 border-[#3498db] text-[#3498db] hover:bg-blue-50 font-bold rounded uppercase tracking-wider text-[11px] transition-colors"
          >
            SEND
          </button>
        </div>
      </form>
    </div>
  );
}
