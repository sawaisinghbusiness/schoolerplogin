"use client";

import React, { useState } from "react";
import { Printer, Download, CheckCircle2 } from "lucide-react";

export default function BulkPrintPage() {
  const [selectedDoc, setSelectedDoc] = useState("Student ID Cards");
  const [selectedClass, setSelectedClass] = useState("10th - A");

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl pb-10">
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
          <Printer className="w-3.5 h-3.5 text-emerald-600" />
          <span>Manage Students</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-semibold">Bulk Print Center</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Institutional Document Bulk Print Station
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate print-ready PDFs for student identity cards, admit cards, bus passes, and attendance registers
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Document Format</label>
            <select
              value={selectedDoc}
              onChange={(e) => setSelectedDoc(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800"
            >
              <option value="Student ID Cards">Student RFID Identity Cards (CR80 PVC)</option>
              <option value="Examination Admit Cards">Term 1 Examination Admit Cards</option>
              <option value="Bus Passes">Institutional Bus Commuter Passes</option>
              <option value="Attendance Sheets">Monthly Attendance Master Register</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Class & Section</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800"
            >
              <option value="12th - PCM">12th - PCM (48 Students)</option>
              <option value="12th - COMM">12th - COMM (42 Students)</option>
              <option value="10th - A">10th - A (54 Students)</option>
              <option value="10th - B">10th - B (52 Students)</option>
              <option value="All">Entire School (1,924 Students)</option>
            </select>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-slate-600">
          <div className="font-bold text-slate-800 text-xs">Print Layout Specifications:</div>
          <p className="text-[11px]">
            Generated PDF will be formatted with 8 student badges per A4 sheet (300 DPI high resolution) featuring barcode, school crest, and emergency guardian numbers.
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => alert(`Generating printable PDF for ${selectedDoc} (${selectedClass})...`)}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs shadow-xs flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generate Printable PDF Batch</span>
          </button>
        </div>
      </div>
    </div>
  );
}
