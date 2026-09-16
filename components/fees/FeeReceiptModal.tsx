"use client";

import React, { useRef } from "react";
import { Printer, X, CheckCircle2, Download, School } from "lucide-react";
import { FeeTransaction, numberToWordsIndian } from "@/lib/services/feeService";

interface FeeReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: FeeTransaction | null;
  schoolName?: string;
}

export function FeeReceiptModal({
  isOpen,
  onClose,
  transaction,
  schoolName = "St. Paul's Senior Secondary School",
}: FeeReceiptModalProps) {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const student = transaction.student;
  const heads = transaction.fee_heads || {
    tuition_fee: transaction.amount_paid,
    exam_fee: 0,
    transport_fee: 0,
    late_fine: 0,
  };

  const formattedDate = new Date(transaction.payment_date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const formattedTime = new Date(transaction.payment_date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const words = numberToWordsIndian(transaction.amount_paid);

  return (
    <>
      {/* Dedicated Print Stylesheet: Ensures ONLY the receipt container prints cleanly */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-fee-receipt,
          #printable-fee-receipt * {
            visibility: visible !important;
          }
          #printable-fee-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Screen Modal Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
        <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-3xl overflow-hidden flex flex-col my-4 max-h-[92vh]">
          {/* Modal Toolbar (hidden on print) */}
          <div className="no-print bg-[#1e282c] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#26b99a]/30">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-tight">
                  Fee Payment Successfully Recorded
                </h2>
                <p className="text-[11px] text-slate-400">
                  Official Receipt #{transaction.receipt_no} &bull; St. Paul&apos;s Senior Secondary School
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209e83] text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
                title="Print Receipt via System Dialog"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Receipt Body */}
          <div className="p-4 sm:p-6 overflow-y-auto bg-slate-100 flex-1">
            <div
              id="printable-fee-receipt"
              className="bg-white p-5 sm:p-7 rounded-lg shadow-sm border border-slate-300 text-slate-900 space-y-6 max-w-2xl mx-auto font-sans"
            >
              {/* SLIP 1: PARENT / STUDENT COPY */}
              <ReceiptSlip
                copyType="PARENT / STUDENT COPY"
                schoolName={schoolName}
                transaction={transaction}
                student={student}
                heads={heads}
                formattedDate={formattedDate}
                formattedTime={formattedTime}
                words={words}
              />

              {/* Perforation Line for dual copy */}
              <div className="border-t-2 border-dashed border-slate-400 my-4 relative text-center">
                <span className="bg-white px-3 text-[10px] text-slate-600 font-mono absolute -top-2.5 left-1/2 -translate-x-1/2 uppercase tracking-wider">
                  ✂ Tear along perforation &bull; School Office Copy below
                </span>
              </div>

              {/* SLIP 2: SCHOOL OFFICE COPY */}
              <ReceiptSlip
                copyType="SCHOOL OFFICE COPY"
                schoolName={schoolName}
                transaction={transaction}
                student={student}
                heads={heads}
                formattedDate={formattedDate}
                formattedTime={formattedTime}
                words={words}
              />
            </div>
          </div>

          {/* Screen Footer Buttons */}
          <div className="no-print bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Receipt #{transaction.receipt_no} stored permanently in database.
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print (A4/Thermal)</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold text-xs"
              >
                Close & Next Student
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface SlipProps {
  copyType: string;
  schoolName: string;
  transaction: FeeTransaction;
  student?: any;
  heads: any;
  formattedDate: string;
  formattedTime: string;
  words: string;
}

function ReceiptSlip({
  copyType,
  schoolName,
  transaction,
  student,
  heads,
  formattedDate,
  formattedTime,
  words,
}: SlipProps) {
  return (
    <div className="border border-slate-800 p-4 sm:p-5 rounded space-y-4">
      {/* Header Banner */}
      <div className="text-center border-b border-slate-700 pb-3 relative">
        <div className="absolute top-0 right-0 text-[10px] font-mono font-bold px-2 py-0.5 border border-slate-800 rounded bg-slate-50 uppercase tracking-wide">
          {copyType}
        </div>
        <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 uppercase">
          {schoolName}
        </h1>
        <p className="text-[11px] text-slate-600 font-medium">
          CBSE Affiliated Sr. Sec. Institution &bull; Ram Nagar, Barmer (Raj.) &bull; Phone: 8769444584
        </p>
        <div className="inline-block mt-1 px-3 py-0.5 text-xs font-black tracking-wider uppercase border-y border-slate-800 bg-slate-100">
          OFFICIAL FEE RECEIPT
        </div>
      </div>

      {/* Meta Grid: Receipt No, Date, Student info */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs border-b border-slate-200 pb-3">
        <div className="flex">
          <span className="w-28 font-bold text-slate-700">Receipt No:</span>
          <span className="font-mono font-black text-slate-900">
            #{transaction.receipt_no}
          </span>
        </div>
        <div className="flex">
          <span className="w-28 font-bold text-slate-700">Date & Time:</span>
          <span className="font-medium text-slate-900">
            {formattedDate} {formattedTime}
          </span>
        </div>
        <div className="flex">
          <span className="w-28 font-bold text-slate-700">Student Name:</span>
          <span className="font-bold text-slate-900 uppercase">
            {student?.name || "Student"}
          </span>
        </div>
        <div className="flex">
          <span className="w-28 font-bold text-slate-700">Father&apos;s Name:</span>
          <span className="font-medium text-slate-900">
            {student?.father_name || "—"}
          </span>
        </div>
        <div className="flex">
          <span className="w-28 font-bold text-slate-700">SR Number:</span>
          <span className="font-mono font-bold text-slate-900">
            {student?.sr_no || "—"}
          </span>
        </div>
        <div className="flex">
          <span className="w-28 font-bold text-slate-700">Class & Section:</span>
          <span className="font-bold text-slate-900">
            {student?.class_name || "Class"} - {student?.section || "A"}
          </span>
        </div>
        <div className="flex">
          <span className="w-28 font-bold text-slate-700">Payment Mode:</span>
          <span className="font-bold text-emerald-800">
            {transaction.payment_mode}
            {transaction.transaction_id ? ` (Ref: ${transaction.transaction_id})` : ""}
          </span>
        </div>
        <div className="flex">
          <span className="w-28 font-bold text-slate-700">Cashier:</span>
          <span className="text-slate-800">{transaction.collected_by}</span>
        </div>
      </div>

      {/* Itemized Fee Breakdown Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
              <th className="py-1.5 px-3 border-r border-slate-300 w-12 text-center">S.N.</th>
              <th className="py-1.5 px-3 border-r border-slate-300">Fee Head / Description</th>
              <th className="py-1.5 px-3 text-right w-32">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {heads.tuition_fee > 0 && (
              <tr>
                <td className="py-1 px-3 text-center border-r border-slate-300 font-mono">1</td>
                <td className="py-1 px-3 border-r border-slate-300 font-medium">
                  Tuition Fee / Composite Academic Fee
                </td>
                <td className="py-1 px-3 text-right font-mono font-semibold">
                  ₹{Number(heads.tuition_fee).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            )}
            {heads.exam_fee > 0 && (
              <tr>
                <td className="py-1 px-3 text-center border-r border-slate-300 font-mono">2</td>
                <td className="py-1 px-3 border-r border-slate-300 font-medium">
                  Examination Fee & Term Assessment
                </td>
                <td className="py-1 px-3 text-right font-mono font-semibold">
                  ₹{Number(heads.exam_fee).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            )}
            {heads.transport_fee > 0 && (
              <tr>
                <td className="py-1 px-3 text-center border-r border-slate-300 font-mono">3</td>
                <td className="py-1 px-3 border-r border-slate-300 font-medium">
                  School Bus / Transportation Charges
                </td>
                <td className="py-1 px-3 text-right font-mono font-semibold">
                  ₹{Number(heads.transport_fee).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            )}
            {heads.late_fine && heads.late_fine > 0 ? (
              <tr>
                <td className="py-1 px-3 text-center border-r border-slate-300 font-mono">4</td>
                <td className="py-1 px-3 border-r border-slate-300 font-medium">
                  Late Fine / Other Charges
                </td>
                <td className="py-1 px-3 text-right font-mono font-semibold">
                  ₹{Number(heads.late_fine).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ) : null}
            <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-400">
              <td colSpan={2} className="py-2 px-3 text-right uppercase border-r border-slate-300">
                Total Amount Paid
              </td>
              <td className="py-2 px-3 text-right font-mono text-sm">
                ₹{Number(transaction.amount_paid).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Amount in words */}
      <div className="p-2 bg-slate-50 border border-slate-200 rounded text-xs">
        <span className="font-bold text-slate-700">Amount in Words: </span>
        <span className="font-semibold italic text-slate-900">{words}</span>
      </div>

      {/* Footer Signatures */}
      <div className="pt-6 flex items-end justify-between text-xs text-slate-700">
        <div className="text-center">
          <div className="w-32 border-t border-slate-800 pt-1 font-semibold">
            Parent / Depositor
          </div>
        </div>
        <div className="text-center">
          <div className="w-40 border-t border-slate-800 pt-1 font-bold text-slate-900">
            Cashier / Authorized Signatory
          </div>
          <span className="text-[9px] text-slate-500">School Office Seal</span>
        </div>
      </div>
    </div>
  );
}
