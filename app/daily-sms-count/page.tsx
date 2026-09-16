"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, RefreshCw, Printer, Send, Calendar } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

const MOCK_SMS_DAILY = [
  { date: "01 Sep", count: 309 },
  { date: "02 Sep", count: 274 },
  { date: "03 Sep", count: 236 },
  { date: "04 Sep", count: 167 },
  { date: "05 Sep", count: 102 },
  { date: "06 Sep", count: 26 },
  { date: "07 Sep", count: 281 },
  { date: "08 Sep", count: 198 },
  { date: "09 Sep", count: 247 },
  { date: "10 Sep", count: 248 },
  { date: "11 Sep", count: 249 },
  { date: "12 Sep", count: 249 },
  { date: "13 Sep", count: 27 },
  { date: "14 Sep", count: 406 },
  { date: "15 Sep", count: 234 },
];

export default function DailySmsCountPage() {
  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2026-09-15");

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-16 text-xs text-slate-800">
      {/* Top Banner */}
      <div className="p-4 bg-[#59c2a0] text-white font-bold rounded flex items-center justify-between shadow-xs">
        <h1 className="text-base tracking-wide uppercase">Daily SMS Chart</h1>
        <Link
          href="/send-notifications"
          className="px-3 py-1 bg-white text-[#16a085] hover:bg-slate-100 font-bold rounded flex items-center space-x-1.5 shadow-xs transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          <span>SEND SMS</span>
        </Link>
      </div>

      {/* Filter Row & Stat Badge */}
      <div className="bg-white p-4 rounded border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-1.5 border border-slate-300 rounded font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-1.5 border border-slate-300 rounded font-mono text-xs"
            />
          </div>
          <button
            onClick={() => window.print()}
            className="mt-5 px-4 py-1.5 bg-[#3498db] hover:bg-[#2980b9] text-white font-bold rounded shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT REPORT</span>
          </button>
        </div>

        <div className="p-3 bg-[#2ecc71]/15 border border-[#2ecc71]/40 rounded-md flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#2ecc71] text-white flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-[#27ae60]">TOTAL SMS SENT</div>
            <div className="text-xl font-black text-slate-900 font-mono">2,844</div>
          </div>
        </div>
      </div>

      {/* Spline Area Chart (Exact match to media_1789476395922.png) */}
      <div className="bg-white p-5 rounded border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">Daily SMS Count (2026)</h2>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-[#9b59b6] rounded-xs"></span>
            <span className="font-bold text-slate-600">SMS Volume</span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_SMS_DAILY} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="smsColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9b59b6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#9b59b6" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" domain={[0, 450]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#fff", borderRadius: "6px", fontSize: "11px" }}
              />
              <Area type="monotone" dataKey="count" stroke="#9b59b6" strokeWidth={2.5} fillOpacity={1} fill="url(#smsColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
