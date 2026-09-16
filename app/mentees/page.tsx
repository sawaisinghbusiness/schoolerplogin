"use client";

import React from "react";
import Link from "next/link";
import { UserCheck2, Users, ChevronRight, Phone, Mail, Award } from "lucide-react";
import { MOCK_STUDENTS } from "@/data/mockData";

export default function MenteesPage() {
  const mentees = MOCK_STUDENTS.slice(0, 4);

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl">
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
          <UserCheck2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>School Teacher</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-semibold">Mentorship Roster</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          My Assigned Mentees
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Dedicated student guidance, behavioral logs, and performance tracking under your mentorship
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mentees.map((student) => (
          <div
            key={student.id}
            className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div className="flex items-start space-x-3">
              <img
                src={student.photoUrl}
                alt={student.name}
                className="w-12 h-12 rounded-full object-cover border border-slate-200"
              />
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900 text-sm">{student.name}</div>
                <div className="text-xs text-slate-500">{student.classSec} • Roll No: {student.rollNo}</div>
                <div className="text-[11px] text-slate-400 font-mono">SR: {student.srNo}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-slate-600">
                <Phone className="w-3 h-3 text-emerald-600" />
                <span>{student.mobile}</span>
              </div>
              <Link
                href="/search-student"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Full Academic File &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
