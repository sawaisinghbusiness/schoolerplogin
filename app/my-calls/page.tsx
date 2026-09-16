"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PhoneCall,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Calendar,
  Save,
  MessageSquare,
  User,
  Filter
} from "lucide-react";

interface CallTask {
  id: string;
  studentName: string;
  srNo: string;
  classSec: string;
  fatherName: string;
  contact: string;
  balanceFee: number;
  lastCallDate?: string;
  disposition: string;
  followupDate?: string;
  remarks?: string;
  isCompleted: boolean;
}

export default function MyCallsPage() {
  const [tasks, setTasks] = useState<CallTask[]>([
    {
      id: "TSK-01",
      studentName: "Aarav Sharma",
      srNo: "SR-2024-001",
      classSec: "10th - A",
      fatherName: "Rajesh Sharma",
      contact: "9876543210",
      balanceFee: 7000,
      lastCallDate: "2026-09-10",
      disposition: "Payment Promised by Date",
      followupDate: "2026-09-20",
      remarks: "Father promised to deposit ₹7,000 on 20th September after salary credit.",
      isCompleted: true
    },
    {
      id: "TSK-02",
      studentName: "Vikram Choudhary",
      srNo: "SR-2023-114",
      classSec: "12th - PCM",
      fatherName: "Hanuman Ram Choudhary",
      contact: "9414156789",
      balanceFee: 10000,
      lastCallDate: "2026-09-14",
      disposition: "Call Later / Parent Busy",
      followupDate: "2026-09-17",
      remarks: "Father in agricultural mandi, asked to call back Wednesday evening.",
      isCompleted: false
    },
    {
      id: "TSK-03",
      studentName: "Ananya Meena",
      srNo: "SR-2024-045",
      classSec: "8th - A",
      fatherName: "Ramesh Chand Meena",
      contact: "9784321987",
      balanceFee: 12000,
      disposition: "Pending Call",
      isCompleted: false
    },
    {
      id: "TSK-04",
      studentName: "Karan Soni",
      srNo: "SR-2022-098",
      classSec: "11th - Commerce",
      fatherName: "Gopal Soni",
      contact: "9414122334",
      balanceFee: 8500,
      disposition: "Pending Call",
      isCompleted: false
    }
  ]);

  const [activeTask, setActiveTask] = useState<CallTask | null>(null);
  const [selectedDisposition, setSelectedDisposition] = useState("Payment Promised by Date");
  const [followupDateInput, setFollowupDateInput] = useState("2026-09-20");
  const [notesInput, setNotesInput] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenCall = (task: CallTask) => {
    setActiveTask(task);
    setSelectedDisposition(task.disposition === "Pending Call" ? "Payment Promised by Date" : task.disposition);
    setFollowupDateInput(task.followupDate || "2026-09-20");
    setNotesInput(task.remarks || "");
  };

  const handleSaveDisposition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask) return;

    setTasks(
      tasks.map((t) =>
        t.id === activeTask.id
          ? {
              ...t,
              disposition: selectedDisposition,
              followupDate: followupDateInput,
              remarks: notesInput,
              lastCallDate: "2026-09-16",
              isCompleted: true
            }
          : t
      )
    );

    setActiveTask(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const totalAssigned = tasks.length;
  const totalDone = tasks.filter((t) => t.isCompleted).length;
  const totalPending = totalAssigned - totalDone;
  const totalFollowups = tasks.filter((t) => t.followupDate).length;

  const filteredTasks = tasks.filter(
    (t) =>
      t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.fatherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.classSec.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.contact.includes(searchTerm)
  );

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <PhoneCall className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Call List</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">My Calls Queue</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            My Telecalling Queue & Call Dispositions
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Assigned calls roster for Mahendra Parihar (Staff). Dial parents, update outcomes, and log follow-up reminders
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/list-followup"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors flex items-center space-x-1"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Scheduled Followups</span>
          </Link>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Call record saved and follow-up scheduled!</span>
        </div>
      )}

      {/* 4 KPI Disposition Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-slate-500 text-[11px] font-bold uppercase">Total Assigned</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalAssigned}</div>
          <span className="text-[10px] text-slate-400">Quarter 2 Recovery List</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-emerald-700 text-[11px] font-bold uppercase">Calls Completed</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{totalDone}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">
            {Math.round((totalDone / totalAssigned) * 100)}% Finished
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-rose-700 text-[11px] font-bold uppercase">Calls Remaining</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{totalPending}</div>
          <span className="text-[10px] text-slate-400">Pending dialing</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-amber-700 text-[11px] font-bold uppercase">Follow-ups Set</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{totalFollowups}</div>
          <span className="text-[10px] text-slate-400">Callback required</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, father, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
          />
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3">Student Name</th>
                <th className="p-3">Class - Sec</th>
                <th className="p-3">Father & Mobile</th>
                <th className="p-3">Due Amount</th>
                <th className="p-3">Disposition / Status</th>
                <th className="p-3">Follow-up Date</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTasks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{t.studentName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{t.srNo}</div>
                  </td>
                  <td className="p-3 font-semibold text-slate-700">{t.classSec}</td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-800">{t.fatherName}</div>
                    <a
                      href={`tel:${t.contact}`}
                      className="text-[11px] font-mono font-bold text-[#26b99a] hover:underline flex items-center space-x-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{t.contact}</span>
                    </a>
                  </td>
                  <td className="p-3 font-mono font-bold text-rose-600">
                    ₹{t.balanceFee.toLocaleString("en-IN")}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.disposition === "Pending Call"
                          ? "bg-slate-100 text-slate-600"
                          : t.disposition === "Payment Promised by Date"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {t.disposition}
                    </span>
                    {t.remarks && (
                      <p className="text-[10px] text-slate-500 italic mt-0.5 max-w-xs truncate">
                        {t.remarks}
                      </p>
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap text-slate-600">
                    {t.followupDate || "—"}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleOpenCall(t)}
                      className="px-3 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold text-[11px] shadow-xs transition-colors flex items-center space-x-1 mx-auto"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{t.isCompleted ? "Update" : "Call"}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Call Disposition Modal */}
      {activeTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-start border-b border-slate-200 pb-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Update Call: {activeTask.studentName}
                </h3>
                <span className="text-[10px] text-slate-500">
                  Father: {activeTask.fatherName} ({activeTask.contact}) • Due: ₹{activeTask.balanceFee}
                </span>
              </div>
              <button
                onClick={() => setActiveTask(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDisposition} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Call Disposition Outcome *</label>
                <select
                  value={selectedDisposition}
                  onChange={(e) => setSelectedDisposition(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                >
                  <option value="Payment Promised by Date">Payment Promised by Date</option>
                  <option value="Call Later / Parent Busy">Call Later / Parent Busy</option>
                  <option value="Phone Switched Off / Out of Reach">Phone Switched Off / Out of Reach</option>
                  <option value="Parent Will Visit School Personally">Parent Will Visit School Personally</option>
                  <option value="Fee Dispute / Concession Requested">Fee Dispute / Concession Requested</option>
                  <option value="Wrong / Invalid Mobile Number">Wrong / Invalid Mobile Number</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Next Follow-up Reminder Date</label>
                <input
                  type="date"
                  value={followupDateInput}
                  onChange={(e) => setFollowupDateInput(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Discussion Notes / Remarks *</label>
                <textarea
                  rows={3}
                  required
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Record summary of what parent discussed or agreed upon..."
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTask(null)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold"
                >
                  Save Call Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
