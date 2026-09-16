"use client";

import React, { useState } from "react";
import { Trash2, ShieldAlert, KeyRound, CheckCircle2 } from "lucide-react";

export default function RemovedStudentsPage() {
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");
  const [directorOtp, setDirectorOtp] = useState("");
  const [removalReason, setRemovalReason] = useState("Tc Issued");
  const [verified, setVerified] = useState(false);

  const mockRemoved = [
    { name: "Pankaj Sharma", srNo: "SR-2023-019", class: "Class 10-A", reason: "Tc Issued", removedBy: "MAHENDRA PARIHAR", date: "10-07-2026" },
    { name: "Suresh Bishnoi", srNo: "SR-2022-114", class: "Class 8-B", reason: "LONG ABSENT", removedBy: "MAHENDRA PARIHAR", date: "02-08-2026" },
    { name: "Ravi Kumar", srNo: "SR-2024-009", class: "Class 11-Arts", reason: "Tc Issued", removedBy: "MAHENDRA PARIHAR", date: "15-08-2026" },
  ];

  const handleVerifyAndPurge = () => {
    if (!accountPassword) {
      alert("Please enter your account login password.");
      return;
    }
    if (!directorOtp) {
      alert("Please enter the 6-digit Director SMS OTP sent to 8769444584.");
      return;
    }
    setVerified(true);
    setIsOtpModalOpen(false);
    alert("2FA Authorization Successful! Scholar permanently deleted from official school register.");
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-16 text-xs text-slate-800">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Removed Students</h1>
            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[11px]">
              2FA Protected
            </span>
          </div>
          <p className="text-slate-500 text-[11px]">
            Audit history of deleted/relieved students. Deletions require Director SMS OTP verification (8769444584)
          </p>
        </div>

        <button
          onClick={() => setIsOtpModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold shadow-xs transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove Scholar (2FA OTP)</span>
        </button>
      </div>

      {/* Removed Students Table */}
      <div className="bg-white rounded border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <th className="p-3">#</th>
              <th className="p-3">SR No</th>
              <th className="p-3">Student Name</th>
              <th className="p-3">Class</th>
              <th className="p-3">Removal Reason</th>
              <th className="p-3">Removed By</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {mockRemoved.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-3 text-slate-400">{idx + 1}</td>
                <td className="p-3 font-mono font-bold text-slate-700">{item.srNo}</td>
                <td className="p-3 font-bold text-slate-900">{item.name}</td>
                <td className="p-3">{item.class}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.reason === "Tc Issued" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                  }`}>
                    {item.reason}
                  </span>
                </td>
                <td className="p-3 text-slate-600">{item.removedBy}</td>
                <td className="p-3 text-slate-500 font-mono">{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2FA Security Modal */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl border-t-4 border-rose-600">
            <div className="flex items-center space-x-2 text-rose-600">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-black text-base text-slate-900">Director 2FA Authorization Required</h3>
            </div>
            <p className="text-slate-500 text-xs">
              Deleting a student permanently purges fees, marks, and attendance history. Enter credentials and the Director OTP sent to <strong>8769444584</strong>.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Removal *</label>
                <select
                  value={removalReason}
                  onChange={(e) => setRemovalReason(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-bold"
                >
                  <option value="Tc Issued">Tc Issued</option>
                  <option value="LONG ABSENT">LONG ABSENT</option>
                  <option value="Fee Defaulter Drop">Fee Defaulter Drop</option>
                  <option value="Parent Relocation">Parent Relocation</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Account Password *</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700">Director SMS OTP (8769444584) *</label>
                  <button
                    onClick={() => alert("OTP dispatched to Director mobile: 8769444584")}
                    className="text-[10px] text-emerald-700 font-bold hover:underline"
                  >
                    Resend OTP
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={directorOtp}
                  onChange={(e) => setDirectorOtp(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-mono font-bold text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsOtpModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded text-slate-700 font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyAndPurge}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded shadow-xs"
              >
                Verify &amp; Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
