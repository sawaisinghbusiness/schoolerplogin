"use client";

import React, { useState } from "react";
import { BookOpen, Plus, Trash2, Edit2, CheckCircle2, Layers } from "lucide-react";

interface ClassItem {
  id: string;
  name: string;
  sections: string[];
  subjects: string[];
  stream?: string;
}

export default function ClassesSubjectsPage() {
  const [classes, setClasses] = useState<ClassItem[]>([
    { id: "1", name: "Class 12", sections: ["A", "B", "PCM", "PCB", "COMMERCE"], subjects: ["Physics", "Chemistry", "Mathematics", "English", "Economics", "Accounts"], stream: "Science & Commerce" },
    { id: "2", name: "Class 11", sections: ["A", "B", "PCM", "COMMERCE"], subjects: ["Physics", "Chemistry", "Mathematics", "English", "Business Studies"], stream: "Science & Commerce" },
    { id: "3", name: "Class 10", sections: ["A", "B", "C"], subjects: ["English", "Hindi", "Mathematics", "Science", "Social Science", "IT"] },
    { id: "4", name: "Class 9", sections: ["A", "B", "C"], subjects: ["English", "Hindi", "Mathematics", "Science", "Social Science", "IT"] },
    { id: "5", name: "Class 8", sections: ["A", "B"], subjects: ["English", "Hindi", "Sanskrit", "Mathematics", "General Science", "Social Studies"] },
  ]);

  const [newClassName, setNewClassName] = useState("");
  const [newSection, setNewSection] = useState("");
  const [newSubject, setNewSubject] = useState("");

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Institute Details</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Classes & Subjects</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Manage Classes & Curriculum Subjects
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure active classes, section allocations, and mapped subject streams for Session 2026-27
          </p>
        </div>

        <button
          onClick={() => {
            const name = prompt("Enter Class Name (e.g. Class 7):");
            if (name) {
              setClasses([...classes, { id: String(Date.now()), name, sections: ["A"], subjects: ["General"] }]);
            }
          }}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Class</span>
        </button>
      </div>

      <div className="space-y-4">
        {classes.map((cls) => (
          <div key={cls.id} className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-slate-900">{cls.name}</span>
                {cls.stream && (
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded">
                    {cls.stream}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {cls.sections.length} Sections | {cls.subjects.length} Subjects
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block uppercase mb-1">
                  Active Sections:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cls.sections.map((sec, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded font-mono font-semibold text-[11px]">
                      Section {sec}
                    </span>
                  ))}
                  <button
                    onClick={() => {
                      const sec = prompt("Add new section letter:");
                      if (sec) {
                        setClasses(classes.map(c => c.id === cls.id ? { ...c, sections: [...c.sections, sec.toUpperCase()] } : c));
                      }
                    }}
                    className="px-2 py-0.5 text-emerald-600 hover:bg-emerald-50 rounded border border-dashed border-emerald-300 text-[10px] font-bold"
                  >
                    + Add Section
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 block uppercase mb-1">
                  Mapped Subjects:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cls.subjects.map((sub, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-medium text-[11px]">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
