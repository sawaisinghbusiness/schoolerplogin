"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, Send, CheckCircle2, MessageSquare, ShieldAlert } from "lucide-react";

export default function SendNotificationsPage() {
  const [targetAudience, setTargetAudience] = useState("All Active Students (1,924)");
  const [template, setTemplate] = useState("General Announcement");
  const [message, setMessage] = useState(
    "Dear Parent, This is to inform you that the school will observe a holiday tomorrow on account of local festival. Regards, Mother Teresa Nobles Academy."
  );
  const [isSent, setIsSent] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => setIsSent(false), 5000);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
          <Bell className="w-3.5 h-3.5 text-emerald-600" />
          <span>Communications</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-semibold">Bulk SMS & WhatsApp Gateway</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Dispatch Notifications
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Send institutional SMS / WhatsApp alerts directly using your available credit balance (5,153 SMS remaining).
        </p>
      </div>

      {isSent && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-sm">Campaign Queued Successfully!</div>
            <div>
              Broadcast dispatched to {targetAudience}. Delivery report will update in your dashboard.
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSend} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Target Audience
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="All Active Students (1,924)">All Active Students (1,924)</option>
              <option value="Absentees of Today (54)">Absentees of Today (54)</option>
              <option value="Bus Commuter Students (458)">Bus Commuter Students (458)</option>
              <option value="All Teaching Staff (68)">All Teaching Staff (68)</option>
              <option value="Fee Defaulters">Fee Defaulters (Balance &gt; 0)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              DLT Approved Template
            </label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="General Announcement">General Announcement</option>
              <option value="Attendance Absent Alert">Attendance Absent Alert</option>
              <option value="Fee Due Reminder">Fee Due Reminder</option>
              <option value="Examination Schedule Alert">Examination Schedule Alert</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            SMS Message Content
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded text-slate-800 focus:ring-1 focus:ring-emerald-500 text-xs"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>Character Count: {message.length} (1 SMS credit per 160 characters)</span>
            <span>DLT Entity ID: 1401568294901</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <Link
            href="/dashboard/admin"
            className="text-slate-500 hover:text-slate-800 font-semibold"
          >
            &larr; Back to Dashboard
          </Link>
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Notification Now</span>
          </button>
        </div>
      </form>
    </div>
  );
}
