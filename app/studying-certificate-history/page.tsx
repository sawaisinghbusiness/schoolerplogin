"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Download,
  Printer,
  Calendar,
  Eye,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";

interface CertificateRecord {
  id: string;
  certificateNo: string;
  issueDate: string;
  studentName: string;
  fatherName: string;
  srNo: string;
  classSec: string;
  purpose: string;
  issuedBy: string;
}

export default function StudyingCertificateHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCert, setSelectedCert] = useState<CertificateRecord | null>(null);

  const [certificates, setCertificates] = useState<CertificateRecord[]>([
    {
      id: "CERT-01",
      certificateNo: "MTNA/SC/2026/045",
      issueDate: "2026-09-14",
      studentName: "Aarav Sharma",
      fatherName: "Rajesh Sharma",
      srNo: "SR-2024-001",
      classSec: "Class 10th - A",
      purpose: "Passport Application & Identity Verification",
      issuedBy: "Mahendra Parihar (Principal)"
    },
    {
      id: "CERT-02",
      certificateNo: "MTNA/SC/2026/044",
      issueDate: "2026-09-10",
      studentName: "Diya Rathore",
      fatherName: "Kalyan Singh Rathore",
      srNo: "SR-2024-002",
      classSec: "Class 9th - B",
      purpose: "State Government Talent Search Scholarship Scheme",
      issuedBy: "Mahendra Parihar (Principal)"
    },
    {
      id: "CERT-03",
      certificateNo: "MTNA/SC/2026/043",
      issueDate: "2026-09-05",
      studentName: "Vikram Choudhary",
      fatherName: "Hanuman Ram Choudhary",
      srNo: "SR-2023-114",
      classSec: "Class 12th - PCM",
      purpose: "Bank Education Loan Processing",
      issuedBy: "Administrative Office"
    }
  ]);

  const filtered = certificates.filter(
    (c) =>
      c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.certificateNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.srNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <FileText className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Admin Reports</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Studying Certificate History</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Bonafide / Studying Certificates Log
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Audit history of official studying certificates issued to students for passport, visa, bank loan or scholarship verification
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/bulk-certificate"
            className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <span>+ Issue New Certificate</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search certificate no., student, SR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded border border-slate-300 flex items-center space-x-1">
            <Download className="w-3.5 h-3.5" />
            <span>Export Certificate Register</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3"># Certificate No.</th>
                <th className="p-3">Issue Date</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Class & SR No.</th>
                <th className="p-3">Father&apos;s Name</th>
                <th className="p-3">Purpose Mentioned</th>
                <th className="p-3">Issued By</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-900">{c.certificateNo}</td>
                  <td className="p-3 whitespace-nowrap text-slate-600">{c.issueDate}</td>
                  <td className="p-3 font-bold text-slate-900">{c.studentName}</td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-700 block">{c.classSec}</span>
                    <span className="text-[10px] font-mono text-slate-400">{c.srNo}</span>
                  </td>
                  <td className="p-3 text-slate-600">{c.fatherName}</td>
                  <td className="p-3 max-w-xs text-slate-700 leading-snug">{c.purpose}</td>
                  <td className="p-3 text-slate-600">{c.issuedBy}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedCert(c)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-[#26b99a] hover:text-white rounded font-bold text-[10px] text-slate-700 transition-colors inline-flex items-center space-x-1"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Reprint</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reprint Modal */}
      {selectedCert && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-start border-b border-slate-200 pb-2">
              <div>
                <span className="text-[10px] font-mono text-slate-400">{selectedCert.certificateNo}</span>
                <h3 className="font-bold text-sm text-slate-900">Official Bonafide Certificate Preview</h3>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="border border-slate-300 p-6 rounded bg-amber-50/20 text-center space-y-3 font-serif">
              <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                Mother Teresa Nobles Academy Sr. Sec. School
              </h2>
              <p className="text-[10px] text-slate-500 font-sans">
                Ram Nagar, Barmer (Rajasthan) 344001 • Affiliation Code: 1040211
              </p>
              <div className="border-t border-b border-slate-200 py-1 font-bold text-xs uppercase text-slate-800">
                To Whom It May Concern / Studying Certificate
              </div>
              <p className="text-xs text-slate-700 text-left leading-relaxed pt-2">
                This is to certify that Master/Miss <strong>{selectedCert.studentName}</strong>, Son/Daughter of 
                Mr. <strong>{selectedCert.fatherName}</strong> is a bonafide student of this institution, currently 
                studying in <strong>{selectedCert.classSec}</strong> during the academic session 2026-2027 under SR No. 
                <strong>{selectedCert.srNo}</strong>. As per school records, his/her character and conduct are exemplary.
              </p>
              <p className="text-xs text-slate-600 text-left">
                This certificate is issued on request for <em>{selectedCert.purpose}</em>.
              </p>
              <div className="pt-8 flex justify-between items-end text-xs font-sans">
                <span className="text-slate-500">Date: {selectedCert.issueDate}</span>
                <div className="text-center">
                  <div className="font-bold text-slate-900">Principal</div>
                  <div className="text-[10px] text-slate-400">Mother Teresa Nobles Academy</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Duplicate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
