"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  CreditCard,
  Search,
  UserCheck2,
  CheckCircle2,
  AlertCircle,
  Printer,
  RotateCcw,
  IndianRupee,
  Bus,
  FileText,
  Clock,
  Sparkles,
  Database,
  ArrowRight,
  ShieldCheck,
  User
} from "lucide-react";
import { studentService } from "@/lib/services/studentService";
import { feeService, FeeTransaction, FeeHeads, numberToWordsIndian } from "@/lib/services/feeService";
import { Student } from "@/data/mockData";
import { FeeReceiptModal } from "@/components/fees/FeeReceiptModal";

export default function CollectFeesPage() {
  // Student Search & Selection State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fee Collection Form State
  const [tuitionFee, setTuitionFee] = useState<string>("0");
  const [examFee, setExamFee] = useState<string>("0");
  const [transportFee, setTransportFee] = useState<string>("0");
  const [lateFine, setLateFine] = useState<string>("0");
  const [paymentMode, setPaymentMode] = useState<"Cash" | "UPI" | "Cheque">("Cash");
  const [transactionId, setTransactionId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [activeTransaction, setActiveTransaction] = useState<FeeTransaction | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Recent Transactions Audit
  const [recentTransactions, setRecentTransactions] = useState<FeeTransaction[]>([]);
  const [isLiveDb, setIsLiveDb] = useState(false);

  // Load initial students & recent transactions
  useEffect(() => {
    async function init() {
      try {
        const studentRes = await studentService.fetchStudents();
        setIsLiveDb(studentRes.isLive);
        if (studentRes.data.length > 0) {
          // Preload first student as initial preview or quick select
          setSearchResults(studentRes.data);
        }
        const txs = await feeService.fetchRecentTransactions(5);
        setRecentTransactions(txs);
      } catch (err) {
        console.error("Init error:", err);
      }
    }
    init();

    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live Debounced Student Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await studentService.fetchStudents({ query: searchQuery });
        setSearchResults(res.data);
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle selecting a student
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearchQuery(`${student.name} (${student.srNo})`);
    setShowDropdown(false);
    setErrorMessage(null);

    // Auto-allocate fee heads based on outstanding dues
    const dues = student.balanceFee || 0;
    if (dues > 0) {
      if (student.transportOpted) {
        // Allocate standard transport fee if opted, rest to tuition
        const transAmt = Math.min(1200, dues);
        setTransportFee(String(transAmt));
        setTuitionFee(String(dues - transAmt));
      } else {
        setTuitionFee(String(dues));
        setTransportFee("0");
      }
    } else {
      setTuitionFee("0");
      setTransportFee("0");
    }
    setExamFee("0");
    setLateFine("0");
  };

  // Calculate Total Payable
  const numTuition = parseFloat(tuitionFee) || 0;
  const numExam = parseFloat(examFee) || 0;
  const numTransport = parseFloat(transportFee) || 0;
  const numLateFine = parseFloat(lateFine) || 0;
  const totalAmount = numTuition + numExam + numTransport + numLateFine;

  // Quick fill helper
  const handlePayFullDues = () => {
    if (!selectedStudent) return;
    const due = selectedStudent.balanceFee || 0;
    if (selectedStudent.transportOpted) {
      const transAmt = Math.min(1200, due);
      setTransportFee(String(transAmt));
      setTuitionFee(String(due - transAmt));
    } else {
      setTuitionFee(String(due));
      setTransportFee("0");
    }
    setExamFee("0");
    setLateFine("0");
  };

  // Submit Payment & Print
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      setErrorMessage("Please search and select a student first.");
      return;
    }

    if (totalAmount <= 0) {
      setErrorMessage("Please enter an amount greater than ₹0 to collect.");
      return;
    }

    if ((paymentMode === "UPI" || paymentMode === "Cheque") && !transactionId.trim()) {
      setErrorMessage(`Please enter the ${paymentMode} reference / transaction ID.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const feeHeads: FeeHeads = {
        tuition_fee: numTuition,
        exam_fee: numExam,
        transport_fee: numTransport,
        late_fine: numLateFine,
      };

      const res = await feeService.recordPayment({
        studentId: selectedStudent.id,
        studentDetails: {
          name: selectedStudent.name,
          sr_no: selectedStudent.srNo,
          admission_no: selectedStudent.admissionNo,
          class_name: selectedStudent.class,
          section: selectedStudent.section,
          father_name: selectedStudent.fatherName,
          contact_phone: selectedStudent.mobile,
        },
        amountPaid: totalAmount,
        feeHeads,
        paymentMode,
        transactionId: transactionId.trim() || undefined,
        currentDue: selectedStudent.balanceFee || 0,
        collectedBy: "Admin Office",
        remarks: remarks.trim() || undefined,
      });

      if (res.success && res.transaction) {
        // Update selected student dues in memory
        setSelectedStudent({
          ...selectedStudent,
          balanceFee: res.newDue,
        });

        // Set active receipt and open modal
        setActiveTransaction(res.transaction);
        setIsReceiptModalOpen(true);

        // Add to recent transactions list
        setRecentTransactions((prev) => [res.transaction!, ...prev.slice(0, 4)]);

        // Reset collection amounts
        setTuitionFee("0");
        setExamFee("0");
        setTransportFee("0");
        setLateFine("0");
        setTransactionId("");
        setRemarks("");
      } else {
        setErrorMessage(res.error || "Failed to record transaction.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fee Management</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Counter Collection</span>
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Counter Fee Collection Desk
            </h1>
            {isLiveDb ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Database className="w-3 h-3 text-emerald-600" />
                <span>Supabase Live</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-300">
                <span>Demo Engine</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Collect school fees, allocate dynamic heads, auto-decrement student balances, and generate printable receipts
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/search-student-advance"
            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold shadow-xs"
          >
            <UserCheck2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Search Student Master</span>
          </Link>
        </div>
      </div>

      {/* Main Form Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Selection & Profile Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Student Search Box */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative" ref={searchContainerRef}>
            <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>Instant Student Auto-Suggest Search</span>
              <span className="text-[10px] text-slate-400 font-normal">Name / SR No / Mobile</span>
            </label>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowDropdown(true);
                }}
                placeholder="Type Aarav, SR-2026-101, or phone..."
                className="w-full pl-9 pr-8 py-2.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedStudent(null);
                    setShowDropdown(false);
                  }}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Dropdown Results */}
            {showDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-300 rounded-lg shadow-xl max-h-64 overflow-y-auto z-30 divide-y divide-slate-100">
                {isSearching ? (
                  <div className="p-3 text-xs text-slate-500 text-center">
                    Searching database...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-3 text-xs text-slate-400 text-center">
                    No students found matching &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : (
                  searchResults.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectStudent(s)}
                      className="w-full p-2.5 text-left hover:bg-emerald-50/70 transition-colors flex items-center space-x-3 text-xs"
                    >
                      <img
                        src={s.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                        alt={s.name}
                        className="w-8 h-8 rounded-full object-cover border shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 truncate">{s.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
                          <span className="font-mono text-emerald-700 font-semibold">{s.srNo}</span>
                          <span>&bull;</span>
                          <span>{s.classSec}</span>
                          <span>&bull;</span>
                          <span>F: {s.fatherName}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.balanceFee > 0
                              ? "bg-rose-100 text-rose-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          Due ₹{s.balanceFee.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected Student Profile Card */}
          {selectedStudent ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-xs">
              <div className="bg-[#1e293b] text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedStudent.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                    alt={selectedStudent.name}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-400 shadow-xs"
                  />
                  <div>
                    <h3 className="font-bold text-sm tracking-tight text-white uppercase">
                      {selectedStudent.name}
                    </h3>
                    <div className="text-[11px] text-slate-300 font-mono">
                      SR: {selectedStudent.srNo} &bull; ADM: {selectedStudent.admissionNo}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudent(null);
                    setSearchQuery("");
                  }}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-semibold"
                >
                  Change
                </button>
              </div>

              <div className="p-4 space-y-3 bg-slate-50/50">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Class & Section</span>
                    <span className="font-bold text-slate-800">{selectedStudent.classSec}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Roll Number</span>
                    <span className="font-mono font-semibold text-slate-800">{selectedStudent.rollNo || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Father&apos;s Name</span>
                    <span className="font-medium text-slate-800">{selectedStudent.fatherName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Mobile Phone</span>
                    <span className="font-mono text-slate-800">{selectedStudent.mobile}</span>
                  </div>
                </div>

                {/* Transport Status Tag */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="flex items-center space-x-1.5 text-slate-600 font-medium">
                    <Bus className="w-3.5 h-3.5 text-blue-600" />
                    <span>School Transport:</span>
                  </span>
                  <span className={`font-bold ${selectedStudent.transportOpted ? "text-blue-700" : "text-slate-500"}`}>
                    {selectedStudent.transportOpted ? (selectedStudent.busRoute || "Opted (Route Active)") : "Not Opted"}
                  </span>
                </div>

                {/* Outstanding Balance Banner */}
                <div
                  className={`p-3 rounded-lg border flex items-center justify-between ${
                    selectedStudent.balanceFee > 0
                      ? "bg-rose-50 border-rose-200 text-rose-900"
                      : "bg-emerald-50 border-emerald-200 text-emerald-900"
                  }`}
                >
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider">
                      Current Outstanding Balance
                    </div>
                    <div className="text-lg font-black font-mono">
                      ₹{selectedStudent.balanceFee.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  {selectedStudent.balanceFee > 0 ? (
                    <button
                      type="button"
                      onClick={handlePayFullDues}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[11px] shadow-2xs"
                    >
                      Pay Full Due
                    </button>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Cleared</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-slate-300 rounded-xl text-center space-y-2 text-slate-400 bg-white">
              <UserCheck2 className="w-8 h-8 mx-auto text-slate-300" />
              <div className="text-xs font-bold text-slate-600">No Student Selected</div>
              <p className="text-[11px]">
                Search by name or SR number above to load the student file &amp; dues balance.
              </p>
            </div>
          )}

          {/* Recent Counter Receipts List */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Today&apos;s Counter Receipts</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Last 5</span>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="text-center py-3 text-slate-400 text-[11px]">
                No fee receipts collected today yet.
              </div>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-lg border border-slate-200 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                        <span className="font-mono text-emerald-700">#{tx.receipt_no}</span>
                        <span>{tx.student?.name || "Student"}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {tx.student?.class_name || "Class"} &bull; {tx.payment_mode}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900">
                        ₹{tx.amount_paid.toLocaleString("en-IN")}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTransaction(tx);
                          setIsReceiptModalOpen(true);
                        }}
                        className="p-1 hover:bg-white text-emerald-700 rounded border border-slate-200 shadow-2xs"
                        title="Reprint Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Fee Breakdown & Collection Form (7 cols) */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Fee Head Breakdown & Payment</h2>
                <p className="text-[11px] text-slate-500">
                  Itemize fee heads; calculations automatically sum into the official receipt
                </p>
              </div>

              {selectedStudent && (
                <button
                  type="button"
                  onClick={handlePayFullDues}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
                >
                  Fill Full Due
                </button>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center space-x-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Fee Heads Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Tuition Fee */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tuition / Composite Academic Fee (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={tuitionFee}
                    onChange={(e) => setTuitionFee(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* 2. Examination Fee */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Examination &amp; Assessment Fee (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={examFee}
                    onChange={(e) => setExamFee(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* 3. Transport Fee */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Transport / Bus Charges (₹)</span>
                  {selectedStudent?.transportOpted && (
                    <span className="text-[10px] text-blue-600 font-semibold">Route Active</span>
                  )}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={transportFee}
                    onChange={(e) => setTransportFee(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* 4. Late Fine / Other */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Late Fine / Other Adjustments (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={lateFine}
                    onChange={(e) => setLateFine(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Total Payable Banner */}
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                  Total Amount to Collect
                </div>
                <div className="text-xs text-emerald-700 italic mt-0.5">
                  {numberToWordsIndian(totalAmount)}
                </div>
              </div>
              <div className="text-2xl font-black font-mono text-emerald-900">
                ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block font-bold text-slate-800">
                Payment Collection Mode
              </label>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMode("Cash")}
                  className={`py-2.5 px-3 rounded-lg border text-center font-bold transition-all text-xs ${
                    paymentMode === "Cash"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  💵 Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode("UPI")}
                  className={`py-2.5 px-3 rounded-lg border text-center font-bold transition-all text-xs ${
                    paymentMode === "UPI"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  📱 UPI / QR Code
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode("Cheque")}
                  className={`py-2.5 px-3 rounded-lg border text-center font-bold transition-all text-xs ${
                    paymentMode === "Cheque"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  📑 Bank Cheque
                </button>
              </div>

              {/* Reference ID input for UPI / Cheque */}
              {(paymentMode === "UPI" || paymentMode === "Cheque") && (
                <div className="animate-fadeIn pt-1">
                  <label className="block font-semibold text-slate-700 mb-1">
                    {paymentMode === "UPI"
                      ? "UPI Transaction Reference / UTR Number *"
                      : "Cheque Number & Bank Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder={
                      paymentMode === "UPI"
                        ? "e.g. 423589102456"
                        : "e.g. CHQ-918234 (SBI Barmer Branch)"
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              )}
            </div>

            {/* Remarks / Internal Note */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Internal Remarks / Narration (Optional)
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Term 1 partial clearance, deposited by father in person"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setTuitionFee("0");
                  setExamFee("0");
                  setTransportFee("0");
                  setLateFine("0");
                  setTransactionId("");
                  setRemarks("");
                }}
                className="px-3 py-2 text-slate-500 hover:text-slate-800 font-medium text-xs"
              >
                Clear Amounts
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !selectedStudent || totalAmount <= 0}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs shadow-md transition-colors"
              >
                {isSubmitting ? (
                  <span>Recording in Supabase...</span>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    <span>
                      Collect ₹{totalAmount.toLocaleString("en-IN")} &amp; Print Receipt
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <FeeReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        transaction={activeTransaction}
        schoolName="St. Paul's Senior Secondary School"
      />
    </div>
  );
}
