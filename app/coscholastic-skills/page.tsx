"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";

interface Skill {
  id: string;
  category: "Work Education" | "Art Education" | "Health & Physical Education" | "Discipline";
  skillName: string;
  description: string;
}

export default function CoscholasticSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([
    { id: "SK-01", category: "Work Education", skillName: "Cookery & Gardening Skills", description: "Participation in campus green drive and practical gardening." },
    { id: "SK-02", category: "Art Education", skillName: "Visual & Performing Arts", description: "Drawing, painting, and cultural stage performances." },
    { id: "SK-03", category: "Health & Physical Education", skillName: "Physical Fitness & Sportsmanship", description: "Track & field, team sports, yoga, and physical endurance." },
    { id: "SK-04", category: "Discipline", skillName: "Attendance & Punctuality", description: "Adherence to school uniform code, punctuality, and behavior." }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [skillName, setSkillName] = useState("");
  const [category, setCategory] = useState<Skill["category"]>("Work Education");
  const [desc, setDesc] = useState("");
  const [success, setSuccess] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newS: Skill = {
      id: `SK-${Date.now()}`,
      category,
      skillName,
      description: desc
    };
    setSkills([...skills, newS]);
    setShowModal(false);
    setSkillName("");
    setDesc("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <Award className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Manage Exams</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Co-Scholastic Skills</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Co-Scholastic Skills & Competencies Setup
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Configure CBSE 3-point scale evaluation areas (Work Education, Art Education, Health & Physical Education, Discipline)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/coscholastic-grades"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors"
          >
            Enter Grades Matrix &rarr;
          </Link>
          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Skill Area</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Skill area added to CBSE Report Card template!</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800">
                  {s.category}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{s.id}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-2">{s.skillName}</h3>
              <p className="text-slate-600 text-xs mt-1">{s.description}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Grading: 3-Point Scale (A, B, C)</span>
              <button
                onClick={() => setSkills(skills.filter((x) => x.id !== s.id))}
                className="p-1 text-slate-400 hover:text-red-600 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-slate-900">Add Skill / Activity</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                >
                  <option value="Work Education">Work Education</option>
                  <option value="Art Education">Art Education</option>
                  <option value="Health & Physical Education">Health & Physical Education</option>
                  <option value="Discipline">Discipline</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Skill Area Name *</label>
                <input
                  type="text"
                  required
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g. Environmental Ethics & Cleanliness"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Evaluation Description</label>
                <textarea
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
