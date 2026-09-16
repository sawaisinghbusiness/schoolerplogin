"use client";

import React, { useState } from "react";
import { FolderPlus, Trash2, CheckCircle2 } from "lucide-react";

export default function StudentProfileSettingsPage() {
  const [categories, setCategories] = useState([
    { id: 1, name: "T. C.", count: 48 },
    { id: 2, name: "AADHAR CARD", count: 1920 },
    { id: 3, name: "MARKSHEET", count: 1840 },
    { id: 4, name: "BIRTH CERTIFICATE", count: 1560 },
  ]);
  const [newCat, setNewCat] = useState("");

  const handleAdd = () => {
    if (!newCat.trim()) return;
    setCategories([...categories, { id: Date.now(), name: newCat.toUpperCase().trim(), count: 0 }]);
    setNewCat("");
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl pb-16 text-xs text-slate-800">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Student Profile Settings</h1>
        <p className="text-slate-500 text-[11px]">
          Configure official document categories for student digital dossiers
        </p>
      </div>

      <div className="bg-white p-5 rounded border border-slate-200 shadow-xs space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Category Name (e.g. CASTE CERTIFICATE)..."
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            className="flex-1 p-2 border border-slate-300 rounded font-semibold text-xs focus:ring-1 focus:ring-[#26b99a]"
          />
          <button
            onClick={handleAdd}
            className="px-5 py-2 bg-[#26b99a] hover:bg-[#209b81] text-white font-bold rounded shadow-xs"
          >
            Create Category
          </button>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-100 rounded">
          {categories.map((cat) => (
            <div key={cat.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
              <div>
                <span className="font-bold text-slate-900">{cat.name}</span>
                <span className="ml-2 text-slate-400 font-mono text-[11px]">({cat.count} documents uploaded)</span>
              </div>
              <button
                onClick={() => setCategories(categories.filter((c) => c.id !== cat.id))}
                className="text-slate-400 hover:text-rose-600 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
