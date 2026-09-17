"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Search,
  Download,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Eye,
  Edit2
} from "lucide-react";

interface VerificationStudent {
  id: string;
  name: string;
  srNo: string;
  classSec: string;
  fatherName: string;
  contact: string;
  hasPhoto: boolean;
  hasAadhaar: boolean;
  hasPenNo: boolean;
  hasDobCertificate: boolean;
  hasBankDetails: boolean;
}

export default function VerificationListPage() {
  const [filterMissing, setFilterMissing] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [students, setStudents] = useState<VerificationStudent[]>([
    {
      id: "STU-001",
      name: "Aarav Sharma",
      srNo: "SR-2024-001",
      classSec: "10th - A",
      fatherName: "Rajesh Sharma",
      contact: "9876543210",
      hasPhoto: true,
      hasAadhaar: true,
      hasPenNo: true,
      hasDobCertificate: true,
      hasBankDetails: true
    },
    {
      id: "STU-002",
      name: "Diya Rathore",
      srNo: "SR-2024-002",
      classSec: "9th - B",
      fatherName: "Kalyan Singh Rathore",
      contact: "9829012345",
      hasPhoto: true,
      hasAadhaar: false,
      hasPenNo: true,
      hasDobCertificate: true,
      hasBankDetails: false
    },
    {
      id: "STU-003",
      name: "Vikram Choudhary",
      srNo: "SR-2023-114",
      classSec: "12th - PCM",
      fatherName: "Hanuman Ram Choudhary",
      contact: "9414156789",
      hasPhoto: false,
      hasAadhaar: true,
      hasPenNo: false,
      hasDobCertificate: true,
      hasBankDetails: true
    },
    {
      id: "STU-004",
      name: "Ananya Meena",
      srNo: "SR-2024-045",
      classSec: "8th - A",
      fatherName: "Ramesh Chand Meena",
      contact: "9784321987",
      hasPhoto: true,
      hasAadhaar: false,
      hasPenNo: false,
      hasDobCertificate: false,
      hasBankDetails: false
    }
  ]);

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.srNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.fatherName.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterMissing === "photo") return matchesSearch && !s.hasPhoto;
    if (filterMissing === "aadhaar") return matchesSearch && !s.hasAadhaar;
    if (filterMissing === "pen") return matchesSearch && !s.hasPenNo;
    if (filterMissing === "bank") return matchesSearch && !s.hasBankDetails;
    return matchesSearch;
  });

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <CheckSquare className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Extra Features</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Data Verification</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Student Data Audit & Compliance Checklist
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Identify records missing Government Aadhaar, UDISE PEN number, student photographs, or DOB certificates
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1">
            <Download className="w-3.5 h-3.5" />
            <span>Export Defaulter List</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, SR no., father..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-slate-500 text-[11px] font-semibold">Missing Field:</span>
          <select
            value={filterMissing}
            onChange={(e) => setFilterMissing(e.target.value)}
            className="p-1.5 border border-slate-300 rounded text-xs bg-white"
          >
            <option value="all">Show All Students</option>
            <option value="photo">Missing Photo</option>
            <option value="aadhaar">Missing Aadhaar</option>
            <option value="pen">Missing PEN No.</option>
            <option value="bank">Missing Bank Details</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3"># SR No.</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Class</th>
                <th className="p-3">Father Name</th>
                <th className="p-3 text-center">Photo</th>
                <th className="p-3 text-center">Aadhaar</th>
                <th className="p-3 text-center">PEN No.</th>
                <th className="p-3 text-center">DOB Proof</th>
                <th className="p-3 text-center">Bank</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-700">{s.srNo}</td>
                  <td className="p-3 font-bold text-slate-900">{s.name}</td>
                  <td className="p-3 font-semibold text-slate-700">{s.classSec}</td>
                  <td className="p-3 text-slate-600">{s.fatherName}</td>
                  <td className="p-3 text-center">
                    {s.hasPhoto ? (
                      <span className="text-emerald-600 font-bold">✓</span>
                    ) : (
                      <span className="text-rose-600 font-bold">✕</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {s.hasAadhaar ? (
                      <span className="text-emerald-600 font-bold">✓</span>
                    ) : (
                      <span className="text-rose-600 font-bold">✕</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {s.hasPenNo ? (
                      <span className="text-emerald-600 font-bold">✓</span>
                    ) : (
                      <span className="text-rose-600 font-bold">✕</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {s.hasDobCertificate ? (
                      <span className="text-emerald-600 font-bold">✓</span>
                    ) : (
                      <span className="text-rose-600 font-bold">✕</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {s.hasBankDetails ? (
                      <span className="text-emerald-600 font-bold">✓</span>
                    ) : (
                      <span className="text-rose-600 font-bold">✕</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => alert(`Opening update form for ${s.name}...`)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-[#26b99a] hover:text-white rounded font-bold text-[10px] text-slate-700 transition-colors"
                    >
                      Update
                    </button>
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
