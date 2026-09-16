"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Download,
  Phone,
  Home,
  CheckCircle2,
  FileText
} from "lucide-react";

interface SiblingFamily {
  familyId: string;
  fatherName: string;
  motherName: string;
  contact: string;
  address: string;
  siblings: {
    id: string;
    name: string;
    srNo: string;
    classSec: string;
    rollNo: string;
    discountPercent: number;
    balanceFee: number;
  }[];
}

export default function ListSiblingsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const FAMILIES: SiblingFamily[] = [
    {
      familyId: "FAM-01",
      fatherName: "Rajesh Sharma",
      motherName: "Sunita Sharma",
      contact: "9876543210",
      address: "Plot 42, Civil Lines, Barmer, Rajasthan",
      siblings: [
        { id: "STU-001", name: "Aarav Sharma", srNo: "SR-2024-001", classSec: "10th - A", rollNo: "12", discountPercent: 0, balanceFee: 7000 },
        { id: "STU-007", name: "Aanya Sharma", srNo: "SR-2024-009", classSec: "5th - B", rollNo: "04", discountPercent: 25, balanceFee: 3200 }
      ]
    },
    {
      familyId: "FAM-02",
      fatherName: "Kalyan Singh Rathore",
      motherName: "Meenakshi Rathore",
      contact: "9829012345",
      address: "Opp. Collectorate, Mahaveer Nagar, Barmer",
      siblings: [
        { id: "STU-002", name: "Diya Rathore", srNo: "SR-2024-002", classSec: "9th - B", rollNo: "05", discountPercent: 0, balanceFee: 0 },
        { id: "STU-011", name: "Devendra Singh Rathore", srNo: "SR-2024-018", classSec: "6th - A", rollNo: "11", discountPercent: 25, balanceFee: 0 }
      ]
    },
    {
      familyId: "FAM-03",
      fatherName: "Hanuman Ram Choudhary",
      motherName: "Geeta Devi",
      contact: "9414156789",
      address: "Baldev Nagar, Near Ratan Singh Circle, Barmer",
      siblings: [
        { id: "STU-003", name: "Vikram Choudhary", srNo: "SR-2023-114", classSec: "12th - PCM", rollNo: "21", discountPercent: 0, balanceFee: 10000 },
        { id: "STU-015", name: "Pooja Choudhary", srNo: "SR-2024-055", classSec: "10th - A", rollNo: "14", discountPercent: 25, balanceFee: 5000 },
        { id: "STU-022", name: "Ramesh Choudhary", srNo: "SR-2025-012", classSec: "4th - A", rollNo: "18", discountPercent: 50, balanceFee: 2000 }
      ]
    }
  ];

  const filteredFamilies = FAMILIES.filter(
    (f) =>
      f.fatherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.contact.includes(searchTerm) ||
      f.siblings.some((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <Users className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Admin Reports</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Siblings List</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Family & Siblings Audit Directory
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Identify enrolled sibling pairs, verify family fee concession brackets, and combine parent communication
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1">
            <Download className="w-3.5 h-3.5" />
            <span>Export Siblings Excel</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search parent name, student, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
          />
        </div>

        <div className="text-[11px] text-slate-500 font-semibold">
          Total Sibling Families Identified: <span className="text-slate-900 font-bold">{FAMILIES.length}</span>
        </div>
      </div>

      {/* Sibling Cards */}
      <div className="space-y-4">
        {filteredFamilies.map((fam) => {
          const totalFamilyDue = fam.siblings.reduce((acc, s) => acc + s.balanceFee, 0);

          return (
            <div
              key={fam.familyId}
              className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Family Header */}
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{fam.fatherName}</span>
                    <span className="text-slate-400">/</span>
                    <span className="text-slate-600 font-medium">{fam.motherName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 text-slate-700 font-bold">
                      {fam.familyId}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-[#26b99a]" />
                      <span className="font-mono">{fam.contact}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Home className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-xs">{fam.address}</span>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                    Total Family Outstanding
                  </span>
                  <span className="font-mono font-black text-rose-600 text-sm">
                    ₹{totalFamilyDue.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Siblings Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-2.5 pl-4">Student Name</th>
                      <th className="p-2.5">SR No.</th>
                      <th className="p-2.5">Class & Sec</th>
                      <th className="p-2.5">Roll No.</th>
                      <th className="p-2.5">Sibling Concession</th>
                      <th className="p-2.5 pr-4 text-right">Balance Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fam.siblings.map((sib, sIdx) => (
                      <tr key={sib.id} className="hover:bg-slate-50/50">
                        <td className="p-2.5 pl-4 font-bold text-slate-900">
                          {sIdx === 0 ? "1st Child: " : sIdx === 1 ? "2nd Child: " : "3rd Child: "}
                          {sib.name}
                        </td>
                        <td className="p-2.5 font-mono text-slate-600">{sib.srNo}</td>
                        <td className="p-2.5 font-semibold text-slate-700">{sib.classSec}</td>
                        <td className="p-2.5 font-mono text-slate-600">Roll {sib.rollNo}</td>
                        <td className="p-2.5">
                          {sib.discountPercent > 0 ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              {sib.discountPercent}% Sibling Waiver
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Standard Fee (0%)</span>
                          )}
                        </td>
                        <td className="p-2.5 pr-4 text-right font-mono font-bold text-slate-800">
                          ₹{sib.balanceFee.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
