"use client";

import React, { useState } from "react";
import { Building, Plus, Users, CheckCircle2 } from "lucide-react";

export default function StaffDepartmentsPage() {
  const [departments, setDepartments] = useState([
    { name: "Administration & Leadership", hod: "Dr. K. S. Rathore", facultyCount: 6, code: "DEPT-ADM" },
    { name: "Mathematics & Applied Statistics", hod: "Mrs. Sunita Sharma", facultyCount: 12, code: "DEPT-MATH" },
    { name: "Science (Physics, Chem, Bio)", hod: "Mr. Vikram Verma", facultyCount: 15, code: "DEPT-SCI" },
    { name: "Languages & Humanities", hod: "Ms. Rekha Choudhary", facultyCount: 14, code: "DEPT-LANG" },
    { name: "Finance & Accounts Office", hod: "Mr. Ramesh Bhati", facultyCount: 4, code: "DEPT-FIN" },
    { name: "Physical Education & Sports", hod: "Mr. Mahendra Singh", facultyCount: 5, code: "DEPT-SPORTS" },
    { name: "Information Technology & Labs", hod: "Er. Deepak Jain", facultyCount: 6, code: "DEPT-IT" },
    { name: "Transport & Logistics Fleet", hod: "Mr. Shrawan Ram", facultyCount: 6, code: "DEPT-LOG" },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Building className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manage Staff</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Faculty Departments</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Academic & Administrative Departments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize institutional divisions, designate Heads of Department (HOD), and assign teacher quotas
          </p>
        </div>

        <button
          onClick={() => {
            const name = prompt("Enter new department name:");
            if (name) {
              setDepartments([...departments, { name, hod: "Pending Designation", facultyCount: 1, code: `DEPT-${Date.now().toString().slice(-4)}` }]);
            }
          }}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Department</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments.map((dept, idx) => (
          <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400">{dept.code}</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">
                  {dept.facultyCount} Faculty Staff
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">{dept.name}</h3>
              <p className="text-xs text-slate-600">
                Designated HOD: <strong className="text-slate-800">{dept.hod}</strong>
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Authorized for Session 2026-27</span>
              <button
                onClick={() => alert(`Opening faculty list for ${dept.name}...`)}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                View Members &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
