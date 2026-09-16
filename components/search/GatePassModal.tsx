"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Student } from "@/data/mockData";
import {
  Ticket,
  Clock,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Download
} from "lucide-react";
import { generateGatePassPDF } from "@/lib/pdfGenerator";

interface GatePassModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GatePassModal({
  student,
  isOpen,
  onClose
}: GatePassModalProps) {
  const [reason, setReason] = useState("Medical indisposition / clinic visit");
  const [escortedBy, setEscortedBy] = useState("Father (Rajesh Sharma)");
  const [customEscort, setCustomEscort] = useState("");
  const [issuedPass, setIssuedPass] = useState<any | null>(null);

  if (!student) return null;

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    const passData = {
      passId: `GP-${Math.floor(100000 + Math.random() * 900000)}`,
      time: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }),
      reason,
      escort: escortedBy === "Other" ? customEscort : escortedBy
    };
    setIssuedPass(passData);
    // Auto generate Gate Pass PDF
    generateGatePassPDF(student, passData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIssuedPass(null);
        onClose();
      }}
      title="Institutional Gate Pass Dispatch"
      subtitle={`Security Clearance for Early Student Exit - ${student.name}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4 text-xs sm:text-sm">
        {issuedPass ? (
          /* Issued Pass Printable Card View */
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-emerald-50/80 border-2 border-dashed border-emerald-400 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <div>
                  <div className="text-xs font-black text-emerald-900 uppercase tracking-wider">
                    Mother Teresa Nobles Academy
                  </div>
                  <div className="text-[10px] text-emerald-700">
                    Official Early Departure Gate Clearance Pass
                  </div>
                </div>
                <div className="px-2 py-0.5 bg-emerald-700 text-white rounded font-mono font-bold text-xs">
                  {issuedPass.passId}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Student Name:</span>
                  <strong className="text-slate-900">{student.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Class & Section:</span>
                  <strong className="text-slate-900">{student.classSec} (Roll {student.rollNo})</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Departure Time:</span>
                  <span className="font-mono font-bold text-slate-800">{issuedPass.time} ({issuedPass.date})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Escorted By:</span>
                  <strong className="text-slate-900">{issuedPass.escort || student.fatherName}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px]">Reason for Departure:</span>
                  <span className="italic text-slate-800">{issuedPass.reason}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-[10px] text-emerald-800">
                <span>Security Gate Verification: <strong>APPROVED</strong></span>
                <span>SMS Alert: Sent to {student.mobile}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => generateGatePassPDF(student, issuedPass)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Gate Slip PDF</span>
              </button>
              <button
                onClick={() => {
                  setIssuedPass(null);
                  onClose();
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Issuance Form */
          <form onSubmit={handleIssue} className="space-y-3.5">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Student Selected:</span>
                <span className="font-bold text-slate-800 text-sm">{student.name}</span>
                <span className="text-xs text-slate-500 ml-1">({student.classSec})</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Parent Phone:</span>
                <span className="font-mono font-bold text-slate-700">{student.mobile}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Early Exit *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Medical indisposition / clinic visit">Medical indisposition / clinic visit</option>
                <option value="Parent emergency request">Parent emergency request</option>
                <option value="Interschool sports / cultural event participation">Interschool sports / cultural event</option>
                <option value="Family function / scheduled travel">Family function / scheduled travel</option>
                <option value="Special permission from Principal">Special permission from Principal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Accompanied / Escorted By *
              </label>
              <select
                value={escortedBy}
                onChange={(e) => setEscortedBy(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value={`Father (${student.fatherName})`}>Father ({student.fatherName})</option>
                <option value={`Mother (${student.motherName})`}>Mother ({student.motherName})</option>
                <option value={`Guardian (${student.guardianName})`}>Guardian ({student.guardianName})</option>
                <option value="Self (Senior student with parent phone consent)">Self (Authorized exit)</option>
                <option value="Other">Other Escort Person</option>
              </select>
            </div>

            {escortedBy === "Other" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specify Escort Person Name & Relation *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Uncle / Driver with ID proof"
                  value={customEscort}
                  onChange={(e) => setCustomEscort(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            )}

            <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-800 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Automatic instant SMS notification will be dispatched to <strong>{student.mobile}</strong> upon generating gate pass.
              </span>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 border border-slate-300 text-slate-600 hover:bg-slate-100 rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Authorize, Download PDF & Send SMS</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
