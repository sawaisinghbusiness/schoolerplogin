"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Edit3,
  Plus,
  Search,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Users,
  Award,
  ChevronRight
} from "lucide-react";

interface OfflineTest {
  id: string;
  testName: string;
  classApplicable: string;
  testDate: string;
  timing: string;
  maxMarks: number;
  passingMarks: number;
  applicantsCount: number;
  venue: string;
  status: "Scheduled" | "Completed" | "Evaluating";
}

export default function ListOfflineAdmissionTestPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [success, setSuccess] = useState(false);

  const [tests, setTests] = useState<OfflineTest[]>([
    {
      id: "OAT-101",
      testName: "Standard 9th Science & Math Entrance Assessment",
      classApplicable: "Class 9th",
      testDate: "2026-09-22",
      timing: "09:00 AM - 11:30 AM",
      maxMarks: 100,
      passingMarks: 40,
      applicantsCount: 42,
      venue: "Hall A (Main Academic Block)",
      status: "Scheduled"
    },
    {
      id: "OAT-102",
      testName: "Standard 11th Science Stream Entrance Test",
      classApplicable: "Class 11th - Science",
      testDate: "2026-09-24",
      timing: "10:00 AM - 01:00 PM",
      maxMarks: 150,
      passingMarks: 60,
      applicantsCount: 68,
      venue: "Senior Lab Block (Room 102-104)",
      status: "Scheduled"
    },
    {
      id: "OAT-103",
      testName: "Class 1st to 5th Basic Aptitude Screening",
      classApplicable: "Primary (1st to 5th)",
      testDate: "2026-09-10",
      timing: "09:30 AM - 11:00 AM",
      maxMarks: 50,
      passingMarks: 20,
      applicantsCount: 35,
      venue: "Primary Activity Center",
      status: "Completed"
    }
  ]);

  // Form states
  const [testName, setTestName] = useState("");
  const [classApplicable, setClassApplicable] = useState("Class 1st");
  const [testDate, setTestDate] = useState("2026-09-25");
  const [timing, setTiming] = useState("09:00 AM - 11:00 AM");
  const [maxMarks, setMaxMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(40);
  const [venue, setVenue] = useState("Main Hall");

  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault();
    const newT: OfflineTest = {
      id: `OAT-${Date.now()}`,
      testName,
      classApplicable,
      testDate,
      timing,
      maxMarks,
      passingMarks,
      applicantsCount: 0,
      venue,
      status: "Scheduled"
    };
    setTests([newT, ...tests]);
    setShowAddModal(false);
    setTestName("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const filteredTests = tests.filter((t) =>
    t.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.classApplicable.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <Edit3 className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Offline Admission Test</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Test Schedule</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Offline Admission Tests Schedule
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Conduct entrance tests for prospective students, allot exam halls, and prepare evaluation sheets
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/admission-test-results"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors flex items-center space-x-1"
          >
            <Award className="w-3.5 h-3.5" />
            <span>View Test Results & Merit</span>
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Schedule Offline Test</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Offline entrance test scheduled successfully!</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search test name, class, venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded border border-slate-300 flex items-center space-x-1">
            <Download className="w-3.5 h-3.5" />
            <span>Export Test Schedule</span>
          </button>
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3"># Test ID</th>
                <th className="p-3">Test Title</th>
                <th className="p-3">Class</th>
                <th className="p-3">Exam Date & Timing</th>
                <th className="p-3">Total / Passing</th>
                <th className="p-3">Applicants</th>
                <th className="p-3">Venue</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTests.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-700">{t.id}</td>
                  <td className="p-3 font-bold text-slate-900">{t.testName}</td>
                  <td className="p-3 font-semibold text-slate-700">{t.classApplicable}</td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-800">{t.testDate}</div>
                    <div className="text-[10px] text-slate-400">{t.timing}</div>
                  </td>
                  <td className="p-3 font-mono">
                    <span className="font-bold text-slate-800">{t.maxMarks}</span>
                    <span className="text-slate-400"> / {t.passingMarks} pass</span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px]">
                      {t.applicantsCount} Candidates
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{t.venue}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === "Scheduled"
                          ? "bg-amber-100 text-amber-800"
                          : t.status === "Completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <Link
                      href={`/admission-test-results?testId=${t.id}`}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-[#26b99a] hover:text-white rounded font-bold text-[11px] text-slate-700 transition-colors inline-flex items-center space-x-1"
                    >
                      <span>Enter Marks</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-slate-900">Schedule Offline Entrance Test</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTest} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Test Title *</label>
                <input
                  type="text"
                  required
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="e.g. Standard 6th Entrance Assessment"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Class *</label>
                  <select
                    value={classApplicable}
                    onChange={(e) => setClassApplicable(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option>Playgroup</option>
                    <option>LKG</option>
                    <option>UKG</option>
                    <option>Class 1st</option>
                    <option>Class 2nd</option>
                    <option>Class 3rd</option>
                    <option>Class 4th</option>
                    <option>Class 5th</option>
                    <option>Class 6th</option>
                    <option>Class 7th</option>
                    <option>Class 8th</option>
                    <option>Class 9th</option>
                    <option>Class 10th</option>
                    <option>Class 11th - Science</option>
                    <option>Class 11th - Commerce</option>
                    <option>Class 11th - Arts</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Exam Date *</label>
                  <input
                    type="date"
                    required
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time Duration</label>
                  <input
                    type="text"
                    value={timing}
                    onChange={(e) => setTiming(e.target.value)}
                    placeholder="09:00 AM - 11:00 AM"
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Exam Hall / Venue</label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Main Exam Hall"
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Marks *</label>
                  <input
                    type="number"
                    required
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Passing Threshold *</label>
                  <input
                    type="number"
                    required
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
