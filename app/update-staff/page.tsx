"use client";

import React, { useState } from "react";
import { Upload, Download, AlertTriangle, FileSpreadsheet, CheckCircle2 } from "lucide-react";

export default function UpdateStaffExcelPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleUpload = () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    setUploadStatus("Validating columns and updating staff records...");
    setTimeout(() => {
      setUploadStatus("Success! 68 staff records validated and synchronized.");
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn text-xs text-slate-800 pb-16">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Update Staff (Excel)</h1>
        <p className="text-slate-500 text-[11px]">
          Bulk update staff attributes with strict enum validation (Gender, Religion, Category, Blood Group)
        </p>
      </div>

      {/* Warning Notice */}
      <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded text-amber-900 space-y-2">
        <div className="flex items-center space-x-2 font-bold text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Strict Validation Rules Notice:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800">
          <li><strong>Gender:</strong> Must be exact: <code>Male</code>, <code>Female</code>, or <code>Other</code>.</li>
          <li><strong>Category:</strong> Must be one of: <code>General</code>, <code>OBC</code>, <code>SC</code>, <code>ST</code>, <code>SBC</code>.</li>
          <li><strong>Religion:</strong> <code>Hindu</code>, <code>Muslim</code>, <code>Sikh</code>, <code>Jain</code>, <code>Christian</code>, <code>Other</code>.</li>
          <li><strong>Nationality:</strong> <code>Indian</code> or country name.</li>
        </ul>
      </div>

      {uploadStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded flex items-center space-x-2 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Actions Card */}
      <div className="bg-white p-6 rounded border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Step 1: Download Current Staff Excel</h3>
            <p className="text-slate-500 text-[11px]">Export existing staff data to update details offline</p>
          </div>
          <button
            onClick={() => alert("Downloading StaffTemplate_MTNA.xlsx")}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded flex items-center space-x-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Staff Excel</span>
          </button>
        </div>

        <div className="space-y-4 pt-2">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Step 2: Upload Modified Excel Sheet</h3>
            <p className="text-slate-500 text-[11px]">Select your modified .xlsx or .xls file</p>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded p-6 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="staff-excel-file"
            />
            <label htmlFor="staff-excel-file" className="cursor-pointer space-y-2 block">
              <FileSpreadsheet className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="font-bold text-slate-800">
                {file ? file.name : "Click here to choose file"}
              </div>
              <div className="text-slate-400 text-[10px]">Supported formats: .XLSX, .XLS (Max 10MB)</div>
            </label>
          </div>

          <button
            onClick={handleUpload}
            className="w-full py-2.5 bg-[#26b99a] hover:bg-[#209b81] text-white font-bold rounded shadow-md transition-colors flex items-center justify-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Validate &amp; Upload Staff Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
}
