"use client";

import React, { useState } from "react";
import { Search, UserPlus, Phone, Calendar, CheckCircle2 } from "lucide-react";

export default function SearchEnquiryPage() {
  const [searchBy, setSearchBy] = useState("Name");
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  const mockEnquiries = [
    { token: "ENQ-2026-081", name: "Rohan Parihar", father: "Mahendra Parihar", phone: "8003911792", standard: "Class 11 - Science", date: "12-08-2026", status: "Active Token" },
    { token: "ENQ-2026-092", name: "Kavya Choudhary", father: "Ramesh Choudhary", phone: "9414123456", standard: "Class 9", date: "15-08-2026", status: "Form Submitted" },
    { token: "ENQ-2026-104", name: "Aaditya Soni", father: "Dinesh Soni", phone: "9829098765", standard: "Class 6", date: "20-08-2026", status: "Interview Pending" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-16 text-xs text-slate-800">
      <div className="pb-2 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Activate Enquiry / Prospective Admission</h1>
          <p className="text-slate-500 text-[11px]">
            Search admission inquiries by token, student name, or mobile number
          </p>
        </div>
      </div>

      <div className="bg-white p-5 rounded border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            className="p-2 border border-slate-300 rounded font-bold text-xs bg-slate-50 w-48"
          >
            <option value="Token">Enquiry Token</option>
            <option value="Name">Student Name</option>
            <option value="Father">Father Name</option>
            <option value="Contact">Contact Number</option>
          </select>

          <input
            type="text"
            placeholder={`Enter ${searchBy}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a]"
          />

          <button
            onClick={() => setSearched(true)}
            className="px-6 py-2 bg-[#26b99a] hover:bg-[#209b81] text-white font-bold rounded shadow-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </div>

        {searched && (
          <div className="pt-4 border-t border-slate-100 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-2.5">Token No</th>
                  <th className="p-2.5">Student Name</th>
                  <th className="p-2.5">Father Name</th>
                  <th className="p-2.5">Standard</th>
                  <th className="p-2.5">Contact</th>
                  <th className="p-2.5">Enquiry Date</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {mockEnquiries.map((enq, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono font-bold text-emerald-700">{enq.token}</td>
                    <td className="p-2.5 font-bold text-slate-900">{enq.name}</td>
                    <td className="p-2.5 text-slate-700">{enq.father}</td>
                    <td className="p-2.5">{enq.standard}</td>
                    <td className="p-2.5 font-mono">{enq.phone}</td>
                    <td className="p-2.5 text-slate-500">{enq.date}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {enq.status}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <button
                        onClick={() => alert(`Converting enquiry ${enq.token} to formal admission...`)}
                        className="px-2.5 py-1 bg-[#26b99a] text-white rounded font-bold text-[10px] hover:bg-[#209b81]"
                      >
                        Convert Admission
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
