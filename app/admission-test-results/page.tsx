"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Search,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  UserPlus
} from "lucide-react";

interface CandidateResult {
  id: string;
  applicantNo: string;
  name: string;
  fatherName: string;
  contact: string;
  testName: string;
  classApplied: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  status: "Selected" | "Waitlisted" | "Not Qualified";
  admissionOffered: boolean;
}

export default function AdmissionTestResultsPage() {
  const [selectedTest, setSelectedTest] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [candidates, setCandidates] = useState<CandidateResult[]>([
    {
      id: "CAN-01",
      applicantNo: "APP-2026-081",
      name: "Yashvardhan Singh",
      fatherName: "Kuber Singh",
      contact: "9829011223",
      testName: "Standard 9th Science & Math Entrance Assessment",
      classApplied: "Class 9th",
      marksObtained: 88,
      totalMarks: 100,
      percentage: 88,
      status: "Selected",
      admissionOffered: true
    },
    {
      id: "CAN-02",
      applicantNo: "APP-2026-082",
      name: "Tanya Sharma",
      fatherName: "Mahesh Sharma",
      contact: "9414255667",
      testName: "Standard 9th Science & Math Entrance Assessment",
      classApplied: "Class 9th",
      marksObtained: 74,
      totalMarks: 100,
      percentage: 74,
      status: "Selected",
      admissionOffered: false
    },
    {
      id: "CAN-03",
      applicantNo: "APP-2026-083",
      name: "Deepak Mali",
      fatherName: "Bheekha Ram Mali",
      contact: "9784112233",
      testName: "Standard 9th Science & Math Entrance Assessment",
      classApplied: "Class 9th",
      marksObtained: 46,
      totalMarks: 100,
      percentage: 46,
      status: "Waitlisted",
      admissionOffered: false
    },
    {
      id: "CAN-04",
      applicantNo: "APP-2026-084",
      name: "Sanjay Kumar",
      fatherName: "Tarachand",
      contact: "9602445566",
      testName: "Standard 9th Science & Math Entrance Assessment",
      classApplied: "Class 9th",
      marksObtained: 32,
      totalMarks: 100,
      percentage: 32,
      status: "Not Qualified",
      admissionOffered: false
    }
  ]);

  const handleOfferAdmission = (id: string) => {
    setCandidates(
      candidates.map((c) =>
        c.id === id ? { ...c, admissionOffered: true } : c
      )
    );
    setSuccessMsg(`Admission offer initiated for candidate ${id}. Notification sent.`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.applicantNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.fatherName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <Award className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Offline Admission Test</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Test Results & Merit</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Admission Test Results & Merit Ranking
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            View evaluated scores, generate merit lists, and convert qualified candidates directly into enrolled students
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/list-offline-admission-test"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors"
          >
            ← Back to Tests Schedule
          </Link>
          <button className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1">
            <Printer className="w-3.5 h-3.5" />
            <span>Print Merit List</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate name, app no., father..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-slate-500 text-[11px] font-semibold">Select Test:</span>
          <select
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
            className="p-1.5 border border-slate-300 rounded text-xs bg-white"
          >
            <option value="all">All Tests</option>
            <option value="OAT-101">Standard 9th Science & Math Assessment</option>
            <option value="OAT-102">Standard 11th Science Stream Test</option>
          </select>

          <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded border border-slate-300 flex items-center space-x-1">
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3">Rank / # App No.</th>
                <th className="p-3">Candidate Name</th>
                <th className="p-3">Father&apos;s Name</th>
                <th className="p-3">Class Applied</th>
                <th className="p-3">Marks Obtained</th>
                <th className="p-3">Percentage</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Admission Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCandidates.map((c, idx) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 whitespace-nowrap">
                    <span className="font-mono font-bold text-slate-900 mr-2">#{idx + 1}</span>
                    <span className="text-[10px] font-mono text-slate-400">({c.applicantNo})</span>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{c.name}</div>
                    <div className="text-[10px] text-slate-400">{c.contact}</div>
                  </td>
                  <td className="p-3 font-semibold text-slate-700">{c.fatherName}</td>
                  <td className="p-3">{c.classApplied}</td>
                  <td className="p-3 font-mono">
                    <span className="font-bold text-slate-900">{c.marksObtained}</span>
                    <span className="text-slate-400"> / {c.totalMarks}</span>
                  </td>
                  <td className="p-3 font-bold text-[#26b99a]">{c.percentage}%</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === "Selected"
                          ? "bg-emerald-100 text-emerald-800"
                          : c.status === "Waitlisted"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {c.status === "Selected" ? (
                      c.admissionOffered ? (
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-bold text-[10px]">
                          ✓ Enrolled / Offered
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOfferAdmission(c.id)}
                          className="px-2.5 py-1 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold text-[10px] transition-colors inline-flex items-center space-x-1 shadow-xs"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>Offer Admission</span>
                        </button>
                      )
                    ) : (
                      <span className="text-slate-400 text-[10px] italic">Not Applicable</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
