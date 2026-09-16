"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Heart,
  Send,
  Calendar,
  Gift,
  CheckCircle2,
  Phone,
  Printer,
  Sparkles
} from "lucide-react";

interface BirthdayRecord {
  id: string;
  type: "Student" | "Staff";
  name: string;
  roleOrClass: string;
  dob: string;
  age: number;
  contact: string;
  isToday: boolean;
  smsSent: boolean;
}

export default function ListBirthdayPage() {
  const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "staff">("today");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [records, setRecords] = useState<BirthdayRecord[]>([
    {
      id: "BD-01",
      type: "Student",
      name: "Tanmay Solanki",
      roleOrClass: "Class 5th - A (Roll: 14)",
      dob: "16 Sept 2015",
      age: 11,
      contact: "9829012345",
      isToday: true,
      smsSent: false
    },
    {
      id: "BD-02",
      type: "Student",
      name: "Khushi Joshi",
      roleOrClass: "Class 10th - B (Roll: 09)",
      dob: "16 Sept 2010",
      age: 16,
      contact: "9414234567",
      isToday: true,
      smsSent: true
    },
    {
      id: "BD-03",
      type: "Staff",
      name: "Pooja Sharma",
      roleOrClass: "TGT English Literature",
      dob: "16 Sept 1988",
      age: 38,
      contact: "9876543210",
      isToday: true,
      smsSent: true
    },
    {
      id: "BD-04",
      type: "Student",
      name: "Daksh Gehlot",
      roleOrClass: "Class 7th - A",
      dob: "18 Sept 2013",
      age: 13,
      contact: "9784112233",
      isToday: false,
      smsSent: false
    },
    {
      id: "BD-05",
      type: "Student",
      name: "Roshni Khatri",
      roleOrClass: "Class 12th - Commerce",
      dob: "20 Sept 2008",
      age: 18,
      contact: "9602445566",
      isToday: false,
      smsSent: false
    }
  ]);

  const sendWish = (id: string, name: string) => {
    setRecords(records.map((r) => (r.id === id ? { ...r, smsSent: true } : r)));
    setSuccessMsg(`Happy Birthday SMS greetings dispatched to ${name}!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const sendAllToday = () => {
    setRecords(records.map((r) => (r.isToday ? { ...r, smsSent: true } : r)));
    setSuccessMsg("Bulk Birthday SMS sent to all celebrants today!");
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const displayRecords = records.filter((r) => {
    if (activeTab === "today") return r.isToday;
    if (activeTab === "upcoming") return !r.isToday;
    if (activeTab === "staff") return r.type === "Staff";
    return true;
  });

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <Gift className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Extra Features</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">View Birthdays</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Birthday Celebrations & Greetings
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Celebrate students & faculty birthdays today and dispatch customized DLT Birthday SMS greetings
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={sendAllToday}
            className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Send All Today Greetings</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("today")}
          className={`px-3 py-1.5 rounded-md font-bold text-xs transition-all ${
            activeTab === "today"
              ? "bg-[#26b99a] text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Today&apos;s Birthdays ({records.filter((r) => r.isToday).length})
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-3 py-1.5 rounded-md font-bold text-xs transition-all ${
            activeTab === "upcoming"
              ? "bg-[#26b99a] text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Upcoming This Week ({records.filter((r) => !r.isToday).length})
        </button>
        <button
          onClick={() => setActiveTab("staff")}
          className={`px-3 py-1.5 rounded-md font-bold text-xs transition-all ${
            activeTab === "staff"
              ? "bg-[#26b99a] text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Staff Birthdays ({records.filter((r) => r.type === "Staff").length})
        </button>
      </div>

      {/* Celebrants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayRecords.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col justify-between space-y-3 relative overflow-hidden"
          >
            {r.isToday && (
              <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 font-black text-[9px] px-2 py-0.5 rounded-bl uppercase tracking-wider">
                Today 🎂
              </div>
            )}

            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    r.type === "Student" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {r.type}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{r.dob}</span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mt-2">{r.name}</h3>
              <p className="text-slate-500 text-[11px] font-semibold">{r.roleOrClass}</p>

              <div className="mt-3 p-2 bg-slate-50 rounded border border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Turning Age:</span>
                <span className="font-bold text-slate-800">{r.age} Years Old</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`tel:${r.contact}`}
                className="text-[11px] font-mono text-[#26b99a] hover:underline flex items-center space-x-1"
              >
                <Phone className="w-3 h-3" />
                <span>{r.contact}</span>
              </a>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => alert(`Printing Birthday Certificate for ${r.name}...`)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                  title="Print Greeting Card"
                >
                  <Printer className="w-4 h-4" />
                </button>
                {r.smsSent ? (
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px] border border-emerald-200">
                    ✓ SMS Sent
                  </span>
                ) : (
                  <button
                    onClick={() => sendWish(r.id, r.name)}
                    className="px-3 py-1 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold text-[10px] shadow-xs flex items-center space-x-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send SMS</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
