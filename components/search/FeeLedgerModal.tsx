"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Student } from "@/data/mockData";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Download,
  PlusCircle,
  FileText
} from "lucide-react";
import { generateFeeReceiptPDF } from "@/lib/pdfGenerator";

interface FeeLedgerModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FeeLedgerModal({
  student,
  isOpen,
  onClose
}: FeeLedgerModalProps) {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("UPI / QR");

  if (!student) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }
    setPaymentSuccess(true);
    // Generate PDF Fee Receipt immediately
    generateFeeReceiptPDF(student, amount, payMode);
    setTimeout(() => {
      setPaymentSuccess(false);
      setPayAmount("");
    }, 4000);
  };

  const handleDownloadHistoricalReceipt = () => {
    generateFeeReceiptPDF(student, 20000, "Online (Razorpay UPI)", "REC-2026-0812");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Institutional Fee Ledger"
      subtitle={`Session 2026-27 | ${student.name} (${student.srNo})`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-xs sm:text-sm">
        {/* Fee Statistics Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[11px] text-slate-500 block uppercase font-bold">
              Total Applicable Fee
            </span>
            <span className="text-base sm:text-lg font-mono font-black text-slate-900">
              ₹{student.totalFee.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
            <span className="text-[11px] text-emerald-700 block uppercase font-bold">
              Total Collected
            </span>
            <span className="text-base sm:text-lg font-mono font-black text-emerald-700">
              ₹{student.paidFee.toLocaleString()}
            </span>
          </div>

          <div className={`p-3 border rounded-lg text-center ${
            student.balanceFee > 0
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50/50 border-emerald-200 text-emerald-800"
          }`}>
            <span className="text-[11px] block uppercase font-bold">
              Outstanding Dues
            </span>
            <span className="text-base sm:text-lg font-mono font-black">
              ₹{student.balanceFee.toLocaleString()}
            </span>
          </div>
        </div>

        {paymentSuccess && (
          <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Payment Recorded & PDF Receipt Generated!</strong> Instant SMS transaction confirmation dispatched to {student.mobile}.
            </span>
          </div>
        )}

        {/* Transaction History Table */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center space-x-1">
              <Receipt className="w-3.5 h-3.5 text-slate-500" />
              <span>Receipt History (Session 2026-27)</span>
            </span>
            <button
              onClick={handleDownloadHistoricalReceipt}
              className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center space-x-1"
            >
              <Download className="w-3 h-3" />
              <span>Download Receipt PDF</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b">
                <tr>
                  <th className="py-2 px-3">Receipt No</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Installment</th>
                  <th className="py-2 px-3">Payment Mode</th>
                  <th className="py-2 px-3 text-right">Amount</th>
                  <th className="py-2 px-3 text-center">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                <tr>
                  <td className="py-2 px-3 font-mono font-semibold">REC-2026-0812</td>
                  <td className="py-2 px-3 text-slate-500">10 Apr 2026</td>
                  <td className="py-2 px-3">Quarter 1 (Tuition + Annual)</td>
                  <td className="py-2 px-3">Online (Razorpay UPI)</td>
                  <td className="py-2 px-3 text-right font-mono font-bold">₹20,000</td>
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={handleDownloadHistoricalReceipt}
                      className="p-1 text-emerald-600 hover:text-emerald-800"
                      title="Download PDF"
                    >
                      <FileText className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  </td>
                </tr>
                {student.paidFee > 20000 && (
                  <tr>
                    <td className="py-2 px-3 font-mono font-semibold">REC-2026-1943</td>
                    <td className="py-2 px-3 text-slate-500">12 Jul 2026</td>
                    <td className="py-2 px-3">Quarter 2 Installment</td>
                    <td className="py-2 px-3">Bank Transfer / Cheque</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      ₹{(student.paidFee - 20000).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() =>
                          generateFeeReceiptPDF(
                            student,
                            student.paidFee - 20000,
                            "Bank Transfer / Cheque",
                            "REC-2026-1943"
                          )
                        }
                        className="p-1 text-emerald-600 hover:text-emerald-800"
                        title="Download PDF"
                      >
                        <FileText className="w-3.5 h-3.5 mx-auto" />
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Fee Collection Form */}
        {student.balanceFee > 0 && (
          <form
            onSubmit={handlePay}
            className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3"
          >
            <div className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Collect Fee Payment, Generate PDF & Send SMS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Amount to Collect (₹)
                </label>
                <input
                  type="number"
                  placeholder={`Max ${student.balanceFee}`}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                  max={student.balanceFee}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Payment Mode
                </label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="UPI / QR Code">UPI / QR Code</option>
                  <option value="Cash Counter">Cash at Counter</option>
                  <option value="Cheque / DD">Cheque / Demand Draft</option>
                  <option value="POS Debit Card">Debit / Credit Card</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Pay & Download PDF</span>
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold"
          >
            Close Ledger
          </button>
        </div>
      </div>
    </Modal>
  );
}
