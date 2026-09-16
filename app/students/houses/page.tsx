"use client";

import React, { useState } from "react";
import { Award, Users, Trophy } from "lucide-react";

export default function StudentHousesPage() {
  const [houses, setHouses] = useState([
    { name: "Tagore House", color: "#e74c3c", colorName: "Ruby Red", mentor: "Mrs. Sunita Sharma", points: 420, students: 485 },
    { name: "Ashoka House", color: "#2ecc71", colorName: "Emerald Green", mentor: "Mr. Vikram Verma", points: 395, students: 480 },
    { name: "Shivaji House", color: "#f39c12", colorName: "Golden Saffron", mentor: "Mr. Mahendra Singh", points: 450, students: 479 },
    { name: "Raman House", color: "#3498db", colorName: "Sapphire Blue", mentor: "Ms. Rekha Choudhary", points: 410, students: 480 },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
          <Award className="w-3.5 h-3.5 text-emerald-600" />
          <span>Manage Students</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-semibold">House System & Co-Scholastic Points</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          School House System & Inter-House Leaderboard
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Four institutional houses fostering leadership, co-scholastic competitions, sports meets, and discipline points
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {houses.map((h, i) => (
          <div
            key={i}
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3"
            style={{ borderLeft: `6px solid ${h.color}` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: h.color }} />
                <h3 className="font-bold text-base text-slate-900">{h.name}</h3>
              </div>
              <div className="flex items-center space-x-1 text-amber-500 font-bold text-xs">
                <Trophy className="w-4 h-4" />
                <span>{h.points} Pts</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>House Color: <strong>{h.colorName}</strong></div>
              <div>House Faculty Mentor: <strong>{h.mentor}</strong></div>
              <div>Scholars Assigned: <strong className="font-mono text-slate-800">{h.students} Students</strong></div>
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <button
                onClick={() => {
                  const add = Number(prompt(`Add Activity Points to ${h.name}:`, "10"));
                  if (add) {
                    setHouses(houses.map((house, idx) => idx === i ? { ...house, points: house.points + add } : house));
                  }
                }}
                className="text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                + Award Points
              </button>
              <button
                onClick={() => alert(`Opening student roster for ${h.name}...`)}
                className="text-slate-500 hover:text-slate-800 font-semibold"
              >
                View House Students &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
