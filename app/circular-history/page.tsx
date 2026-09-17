"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  Calendar,
  Eye,
  Trash2,
  Printer,
  Download,
  Filter,
  PlusCircle,
  FileText
} from "lucide-react";

interface CircularRecord {
  id: string;
  circularNo: string;
  date: string;
  title: string;
  targetAudience: string;
  channels: ("App" | "SMS" | "Portal")[];
  sentBy: string;
  readsCount: number;
  totalRecipients: number;
  attachmentName?: string;
  status: "Delivered" | "Pending" | "Draft";
}

export default function CircularHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [targetFilter, setTargetFilter] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState<CircularRecord | null>(null);

  const CIRCULARS: CircularRecord[] = [
    {
      id: "CIR-104",
      circularNo: "SPSS/CIR/2026/089",
      date: "2026-09-15",
      title: "Notice: Revision Assessment Schedule for Classes 9th & 10th",
      targetAudience: "Classes: 9th, 10th",
      channels: ["App", "Portal"],
      sentBy: "Mahendra Parihar (Admin)",
      readsCount: 284,
      totalRecipients: 310,
      attachmentName: "Revision_Schedule_Sept_2026.pdf",
      status: "Delivered"
    },
    {
      id: "CIR-103",
      circularNo: "SPSS/CIR/2026/088",
      date: "2026-09-14",
      title: "School Timing Change Announcement for Winter Session",
      targetAudience: "Whole School (All Classes)",
      channels: ["App", "SMS", "Portal"],
      sentBy: "Principal Office",
      readsCount: 1640,
      totalRecipients: 1924,
      status: "Delivered"
    },
    {
      id: "CIR-102",
      circularNo: "SPSS/CIR/2026/087",
      date: "2026-09-10",
      title: "Hindi Diwas & Special Assembly Program Participation",
      targetAudience: "Classes: 6th to 12th",
      channels: ["App", "Portal"],
      sentBy: "Pooja Sharma",
      readsCount: 812,
      totalRecipients: 890,
      status: "Delivered"
    },
    {
      id: "CIR-101",
      circularNo: "SPSS/CIR/2026/086",
      date: "2026-09-04",
      title: "Teachers Day Program & Early Dismissal on 5th September",
      targetAudience: "Whole School (All Classes)",
      channels: ["App", "SMS"],
      sentBy: "Mahendra Parihar (Admin)",
      readsCount: 1850,
      totalRecipients: 1924,
      status: "Delivered"
    },
    {
      id: "CIR-100",
      circularNo: "SPSS/CIR/2026/085",
      date: "2026-08-28",
      title: "Bus Route No. 3 Timing Adjustment Due to Road Construction",
      targetAudience: "Transport Students (Route 3)",
      channels: ["App", "SMS"],
      sentBy: "Transport Incharge",
      readsCount: 142,
      totalRecipients: 145,
      status: "Delivered"
    }
  ];

  const filteredCirculars = CIRCULARS.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.circularNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.targetAudience.toLowerCase().includes(searchTerm.toLowerCase());
    if (targetFilter === "school") return matchesSearch && c.targetAudience.includes("Whole School");
    if (targetFilter === "classes") return matchesSearch && !c.targetAudience.includes("Whole School");
    return matchesSearch;
  });

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
            <span className="text-slate-800 font-semibold">View History</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Circular & Notice Audit History
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Complete audit trail of all notices, circulars, and announcements issued to parents and students
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/send-circular-school"
            className="px-3 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Send New Circular</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search circular no., subject, target..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-slate-500 text-[11px] font-semibold">Filter:</span>
          <select
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value)}
            className="p-1.5 border border-slate-300 rounded text-xs bg-white"
          >
            <option value="all">All Audiences</option>
            <option value="school">Whole School</option>
            <option value="classes">Individual Classes</option>
          </select>

          <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded border border-slate-300 flex items-center space-x-1">
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Circulars Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3"># Circular No.</th>
                <th className="p-3">Date</th>
                <th className="p-3">Subject / Title</th>
                <th className="p-3">Target Audience</th>
                <th className="p-3">Channels</th>
                <th className="p-3">Read Rate</th>
                <th className="p-3">Sent By</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCirculars.map((c) => {
                const percent = Math.round((c.readsCount / c.totalRecipients) * 100);
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900">{c.circularNo}</td>
                    <td className="p-3 whitespace-nowrap text-slate-600">{c.date}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{c.title}</div>
                      {c.attachmentName && (
                        <div className="text-xs text-[#26b99a] font-semibold flex items-center space-x-1 mt-0.5">
                          <FileText className="w-3 h-3" />
                          <span>{c.attachmentName}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 text-[11px]">
                        {c.targetAudience}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1">
                        {c.channels.map((ch) => (
                          <span
                            key={ch}
                            className={`px-1.5 py-0.2 rounded text-xs font-bold ${
                              ch === "App"
                                ? "bg-emerald-100 text-emerald-800"
                                : ch === "SMS"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#26b99a] h-full rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="font-bold text-[11px] text-slate-700">{percent}%</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {c.readsCount}/{c.totalRecipients} read
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{c.sentBy}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => setSelectedRecord(c)}
                          title="View Details"
                          className="p-1 text-slate-500 hover:text-[#26b99a] rounded hover:bg-slate-100"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          title="Print Notice"
                          className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete"
                          className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Circular Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-start border-b border-slate-200 pb-2">
              <div>
                <span className="text-xs font-mono text-slate-400 block">{selectedRecord.circularNo}</span>
                <h3 className="font-bold text-sm text-slate-900">{selectedRecord.title}</h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Date Dispatched:</span>
                <span className="font-semibold text-slate-800">{selectedRecord.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Target:</span>
                <span className="font-semibold text-slate-800">{selectedRecord.targetAudience}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Sent By:</span>
                <span className="font-semibold text-slate-800">{selectedRecord.sentBy}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Total Recipients:</span>
                <span className="font-semibold text-slate-800">{selectedRecord.totalRecipients} Students/Parents</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Confirmed Reads:</span>
                <span className="font-semibold text-emerald-600">{selectedRecord.readsCount} reads</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Circular</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
