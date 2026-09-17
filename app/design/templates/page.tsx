"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sliders,
  FileText,
  Printer,
  Eye,
  CheckCircle2,
  Settings,
  Layers,
  Sparkles
} from "lucide-react";

interface StudioTemplate {
  id: string;
  templateType: "Transfer Certificate (TC)" | "Character Certificate (CC)" | "Gate Pass" | "Student ID Card";
  templateName: string;
  headerStyle: "Standard Gold Seal" | "CBSE Header" | "Minimal Modern";
  includeWatermark: boolean;
  includeQrCode: boolean;
  signatures: string[];
  paperSize: "A4 Portrait" | "A4 Landscape" | "ID Card (CR80)";
}

export default function DesignTemplatesPage() {
  const [templates, setTemplates] = useState<StudioTemplate[]>([
    {
      id: "TPL-01",
      templateType: "Transfer Certificate (TC)",
      templateName: "Official CBSE Transfer Certificate with State Seal",
      headerStyle: "CBSE Header",
      includeWatermark: true,
      includeQrCode: true,
      signatures: ["Class Teacher", "Office Supdt", "Principal"],
      paperSize: "A4 Portrait"
    },
    {
      id: "TPL-02",
      templateType: "Character Certificate (CC)",
      templateName: "Merit & Character Certificate with School Crest",
      headerStyle: "Standard Gold Seal",
      includeWatermark: true,
      includeQrCode: false,
      signatures: ["Principal"],
      paperSize: "A4 Landscape"
    },
    {
      id: "TPL-03",
      templateType: "Gate Pass",
      templateName: "Early Departure Student & Guardian Gate Slip",
      headerStyle: "Minimal Modern",
      includeWatermark: false,
      includeQrCode: true,
      signatures: ["Class Teacher", "Security Gate Officer"],
      paperSize: "A4 Portrait"
    },
    {
      id: "TPL-04",
      templateType: "Student ID Card",
      templateName: "Plastic Smart Barcode RFID ID Card Format",
      headerStyle: "Standard Gold Seal",
      includeWatermark: false,
      includeQrCode: true,
      signatures: ["Principal"],
      paperSize: "ID Card (CR80)"
    }
  ]);

  const [activePreview, setActivePreview] = useState<StudioTemplate | null>(null);

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <Sliders className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Design Studio</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Templates</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Certificate & Documents Design Studio
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Configure certificate layouts, official signatures, digital QR verification stamps, and paper dimensions
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/bulk-certificate"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors"
          >
            Bulk Certificate Print
          </Link>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700">
                  {tpl.templateType}
                </span>
                <span className="text-xs font-mono text-slate-400">{tpl.paperSize}</span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm mt-2">{tpl.templateName}</h3>

              <div className="mt-3 p-2.5 bg-slate-50 rounded border border-slate-100 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span className="font-bold">Header Theme:</span>
                  <span>{tpl.headerStyle}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-bold">Security QR Code:</span>
                  <span className={tpl.includeQrCode ? "text-emerald-600 font-bold" : "text-slate-400"}>
                    {tpl.includeQrCode ? "Enabled (Digital Hash)" : "Disabled"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-bold">Background Watermark:</span>
                  <span className={tpl.includeWatermark ? "text-emerald-600 font-bold" : "text-slate-400"}>
                    {tpl.includeWatermark ? "School Emblem Crest" : "None"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-bold">Signatories:</span>
                  <span>{tpl.signatures.join(" • ")}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                onClick={() => setActivePreview(tpl)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-xs flex items-center space-x-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>
              <button
                onClick={() => alert(`Customizing ${tpl.templateName}...`)}
                className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold text-xs shadow-xs flex items-center space-x-1"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configure</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-start border-b border-slate-200 pb-2">
              <div>
                <span className="text-xs text-slate-400 font-mono">{activePreview.templateType}</span>
                <h3 className="font-bold text-sm text-slate-900">{activePreview.templateName}</h3>
              </div>
              <button
                onClick={() => setActivePreview(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base"
              >
                ✕
              </button>
            </div>

            {/* Visual Certificate Sample */}
            <div className="border-4 border-double border-slate-400 p-6 rounded bg-amber-50/20 text-center space-y-3 font-serif relative overflow-hidden">
              {activePreview.includeWatermark && (
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none text-6xl font-black font-sans">
                  SPSS BARMER
                </div>
              )}

              <h2 className="text-base font-black uppercase text-slate-900 tracking-wider">
                St. Paul&apos;s Senior Secondary School
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                Senior Secondary English Medium Co-Educational School, Barmer (Raj.)
              </p>
              <div className="border-t border-b border-slate-300 py-1 font-bold text-xs uppercase text-slate-800 tracking-wide">
                {activePreview.templateType}
              </div>

              <div className="text-left text-xs space-y-2 pt-2 text-slate-700 leading-relaxed font-sans">
                <div className="flex justify-between">
                  <span>Serial No: <strong>SPSS/TC/2026/012</strong></span>
                  <span>Admission No: <strong>ADM-9102</strong></span>
                </div>
                <p>
                  This is to certify that <strong>AARAV SHARMA</strong>, Son of Shri <strong>RAJESH SHARMA</strong>, 
                  was a bonafide student of Class <strong>10th</strong> in this institution. All school dues have been 
                  cleared up to the current session.
                </p>
              </div>

              <div className="pt-6 flex justify-between items-end text-xs font-sans">
                {activePreview.signatures.map((sig, idx) => (
                  <div key={idx} className="text-center">
                    <div className="border-t border-slate-400 pt-1 w-24 mx-auto font-bold text-slate-800">
                      {sig}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setActivePreview(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 font-bold rounded text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white font-bold rounded flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Test Print</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
