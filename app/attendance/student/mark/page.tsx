"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Save,
  CheckCircle2,
  Users,
  Search,
  AlertCircle,
  Loader2,
  ChevronDown,
  MessageSquare
} from "lucide-react";
import { MOCK_STUDENTS } from "@/data/mockData";
import { attendanceService } from "@/lib/services/attendanceService";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function MarkStudentAttendancePage() {
  // Extract all unique sections sorted in school order
  const ALL_SECTIONS = useMemo(() => {
    const set = new Set<string>();
    MOCK_STUDENTS.forEach((s) => {
      if (s.classSec) set.add(s.classSec);
    });
    return Array.from(set);
  }, []);

  const [selectedClass, setSelectedClass] = useState<string>("10th - A");
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [searchFilter, setSearchFilter] = useState("");
  const [notifySms, setNotifySms] = useState(true);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedInfo, setLastSavedInfo] = useState<string | null>(null);
  const [reasonMap, setReasonMap] = useState<Record<string, string>>({});
  const [showBatchMenu, setShowBatchMenu] = useState(false);
  const [watiNotice, setWatiNotice] = useState<{ msg: string; type: "success" | "info" | "warning" } | null>(null);
  const batchMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (batchMenuRef.current && !batchMenuRef.current.contains(event.target as Node)) {
        setShowBatchMenu(false);
      }
    }
    if (showBatchMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showBatchMenu]);

  // Get current section students
  const sectionStudents = useMemo(() => {
    return MOCK_STUDENTS.filter((s) => s.classSec === selectedClass);
  }, [selectedClass]);

  // Filtered by search if teacher types roll/name/sr
  const filteredStudents = useMemo(() => {
    if (!searchFilter.trim()) return sectionStudents;
    const q = searchFilter.toLowerCase();
    return sectionStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.rollNo.includes(q) ||
        s.srNo.toLowerCase().includes(q)
    );
  }, [sectionStudents, searchFilter]);

  // Student attendance statuses state (default to Present)
  const [statusMap, setStatusMap] = useState<Record<string, "Present" | "Absent" | "Leave" | "HalfDay">>({});

  // Real-time Database Persistence: Load saved attendance whenever date or class changes
  useEffect(() => {
    let isMounted = true;
    async function fetchSaved() {
      try {
        const savedData = await attendanceService.getSavedSectionAttendance(selectedClass, attendanceDate);
        if (!isMounted) return;

        if (savedData && savedData.statusMap && Object.keys(savedData.statusMap).length > 0) {
          setStatusMap(savedData.statusMap);
          setReasonMap(savedData.reasonMap || {});
          const timeFormatted = new Date(savedData.savedAt).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          });
          setLastSavedInfo(`Saved in Database (${timeFormatted})`);
        } else {
          // Fresh unmarked day: default all students to Present
          setStatusMap({});
          setReasonMap({});
          setLastSavedInfo(null);
        }
      } catch (err) {
        console.warn("Could not load attendance:", err);
      }
    }

    fetchSaved();
    return () => {
      isMounted = false;
    };
  }, [selectedClass, attendanceDate]);

  const getStatus = (studentId: string): "Present" | "Absent" | "Leave" | "HalfDay" => {
    return statusMap[studentId] || "Present";
  };

  const setStatus = (studentId: string, status: "Present" | "Absent" | "Leave" | "HalfDay") => {
    setStatusMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const setAll = (status: "Present" | "Absent" | "Leave" | "HalfDay") => {
    const updated: Record<string, "Present" | "Absent" | "Leave" | "HalfDay"> = { ...statusMap };
    sectionStudents.forEach((s) => {
      updated[s.id] = status;
    });
    setStatusMap(updated);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const res = await attendanceService.saveSectionAttendance({
        classSec: selectedClass,
        date: attendanceDate,
        statusMap,
        reasonMap,
        students: sectionStudents,
      });

      setSaved(true);
      const timeStr = new Date(res.savedAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setLastSavedInfo(`Saved in Database (${timeStr})`);
      setTimeout(() => setSaved(false), 5000);

      // Trigger WATI WhatsApp absent alerts if notification checkbox is enabled
      if (notifySms) {
        const absentees = sectionStudents
          .filter((s) => (statusMap[s.id] || "Present") === "Absent")
          .map((s) => ({
            studentId: s.id,
            studentName: s.name,
            rollNo: s.rollNo,
            classSec: s.classSec,
            mobile: s.mobile,
            date: attendanceDate,
          }));

        if (absentees.length > 0) {
          try {
            const resp = await fetch("/api/attendance/send-absent-whatsapp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ students: absentees }),
            });
            const notifyRes = await resp.json();
            if (notifyRes.success && notifyRes.successCount > 0) {
              setWatiNotice({
                msg: `WhatsApp alerts sent to ${notifyRes.successCount} parents via WATI!`,
                type: "success",
              });
            } else if (notifyRes.results?.[0]?.error) {
              setWatiNotice({
                msg: `WATI: ${notifyRes.results[0].error}`,
                type: "warning",
              });
            }
            setTimeout(() => setWatiNotice(null), 8000);
          } catch (notifErr: any) {
            console.warn("WATI notification dispatch error:", notifErr);
          }
        }
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Live count computations for the current section
  const totalStudents = sectionStudents.length;
  const presentCount = sectionStudents.filter((s) => getStatus(s.id) === "Present").length;
  const absentCount = sectionStudents.filter((s) => getStatus(s.id) === "Absent").length;
  const leaveCount = sectionStudents.filter((s) => getStatus(s.id) === "Leave").length;
  const halfDayCount = sectionStudents.filter((s) => getStatus(s.id) === "HalfDay").length;
  const turnoutPercent = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 100;

  return (
    <div className="space-y-3 animate-fadeIn max-w-7xl pb-16 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Class {selectedClass} Attendance
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            St. Paul&apos;s Senior Secondary School &bull; Academic Session 2026-27 &bull; {totalStudents} Enrolled
          </p>
        </div>

        {/* Action Confirmation Banner */}
        {saved && (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-medium animate-fadeIn shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Attendance permanently saved for {selectedClass} on {attendanceDate} ({presentCount} Present, {absentCount} Absent).</span>
          </div>
        )}
      </div>

      {/* 1. Slim Summary Bar (Replaces the 6 giant cards) */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-2 px-4 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 shadow-2xs">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>Total: <strong className="text-slate-900 font-semibold">{totalStudents}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>Present: <strong className="text-emerald-700 font-semibold">{presentCount}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
          <span>Absent: <strong className="text-rose-700 font-semibold">{absentCount}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
          <span>On Leave: <strong className="text-amber-700 font-semibold">{leaveCount}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
          <span>Half Day: <strong className="text-sky-700 font-semibold">{halfDayCount}</strong></span>
        </div>
        <div className="hidden sm:block text-slate-300">|</div>
        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          <span>Turnout Rate: <strong className="text-slate-900 font-semibold">{turnoutPercent}%</strong></span>
          <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden md:block">
            <div
              className={`h-full transition-all duration-300 ${
                turnoutPercent >= 90
                  ? "bg-emerald-500"
                  : turnoutPercent >= 75
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${turnoutPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* WATI WhatsApp Alert Status Notice */}
      {watiNotice && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center justify-between animate-fadeIn ${
            watiNotice.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : watiNotice.type === "warning"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{watiNotice.msg}</span>
          </div>
          <button
            type="button"
            onClick={() => setWatiNotice(null)}
            className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Form & Table Container */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 shadow-xs">
        {/* Integrated Action Toolbar */}
        <div className="p-3 border-b border-slate-200 bg-white rounded-t-xl flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Class Selector */}
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">
                Class:
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSearchFilter("");
                }}
                className="text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
              >
                {ALL_SECTIONS.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec} ({MOCK_STUDENTS.filter((s) => s.classSec === sec).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">
                Date:
              </label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="text-xs font-mono font-medium text-slate-800 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search student, roll, SR..."
                className="text-xs pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 w-36 sm:w-56 text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Batch Actions & Save */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Split Button: Mark All Present with arrow for Mark All Absent */}
            <div className="relative inline-flex items-stretch rounded-md shadow-xs bg-[#26b99a]" ref={batchMenuRef}>
              {/* Dropdown / Popover Badge Appearing Above */}
              {showBatchMenu && (
                <div className="absolute bottom-full mb-1.5 left-0 right-0 z-30 flex flex-col">
                  <button
                    type="button"
                    onClick={() => {
                      setAll("Absent");
                      setShowBatchMenu(false);
                    }}
                    className="w-full inline-flex items-center justify-center px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-bold shadow-md transition-colors cursor-pointer whitespace-nowrap"
                    title="Mark all students in this section absent"
                  >
                    <span>Mark All Absent</span>
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setAll("Present");
                  setShowBatchMenu(false);
                }}
                className="inline-flex items-center px-3.5 py-1.5 hover:bg-[#209b81] text-white rounded-l-md text-xs font-bold transition-colors cursor-pointer"
                title="Mark all students in this section present"
              >
                <span>Mark All Present</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBatchMenu((prev) => !prev);
                }}
                className="inline-flex items-center justify-center px-2 py-1.5 hover:bg-[#209b81] text-white border-l border-[#1fa085] rounded-r-md transition-colors cursor-pointer"
                title="More attendance options"
                aria-label="Attendance options"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    showBatchMenu ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tactile Table & Attendance Controls */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            {/* Soft enterprise header */}
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200">
              <tr>
                  <th className="py-2.5 px-3 w-16 text-center">Roll</th>
                  <th className="py-2.5 px-4 min-w-[200px]">Student</th>
                  <th className="py-2.5 px-3 hidden md:table-cell min-w-[140px]">Father&apos;s Name</th>
                  <th className="py-2.5 px-3 hidden sm:table-cell min-w-[110px]">Contact</th>
                  <th className="py-2.5 px-3 text-center min-w-[180px]">Attendance</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                      No students found in {selectedClass} matching &ldquo;{searchFilter}&rdquo;.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const currentStatus = getStatus(student.id);
                    const isAbsent = currentStatus === "Absent";
                    const isLeave = currentStatus === "Leave";

                    return (
                      <tr
                        key={student.id}
                        className={`transition-colors ${
                          isAbsent
                            ? "bg-rose-50/40 hover:bg-rose-50/70"
                            : isLeave
                            ? "bg-amber-50/30 hover:bg-amber-50/60"
                            : "hover:bg-slate-50/80"
                        }`}
                      >
                        {/* Roll Number Badge */}
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-block font-mono font-bold text-xs text-slate-700 bg-slate-100 border border-slate-200/80 rounded px-1.5 py-0.5 min-w-[24px]">
                            {student.rollNo}
                          </span>
                        </td>

                        {/* Student Column with Avatar */}
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200/80">
                              {getInitials(student.name)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5 truncate">
                                <span className="truncate">{student.name}</span>
                                {student.transportOpted && (
                                  <span className="text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-1 py-0.2 rounded shrink-0">
                                    Bus
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                SR: {student.srNo} &bull; Adm: {student.admissionNo}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Father's Name */}
                        <td className="py-2.5 px-3 hidden md:table-cell text-slate-600">
                          {student.fatherName}
                        </td>

                        {/* Parent Phone */}
                        <td className="py-2.5 px-3 hidden sm:table-cell font-mono text-slate-600">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{student.mobile}</span>
                            {isAbsent && (
                              <a
                                href={`https://wa.me/91${student.mobile.replace(/\D/g, "")}?text=${encodeURIComponent(
                                  `Dear Parent, your ward ${student.name} (Class: ${selectedClass}, Roll: ${student.rollNo}) is marked ABSENT today (${attendanceDate}). Mother Teresa Nobles Academy, Barmer.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open WhatsApp chat with parent"
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded transition-colors"
                              >
                                <MessageSquare className="w-2.5 h-2.5 text-emerald-600" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Tactile Hardware Toggle Switches */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 gap-0.5 shadow-2xs">
                            {/* Present Button */}
                            <button
                              type="button"
                              onClick={() => setStatus(student.id, "Present")}
                              className={`px-2.5 py-1 rounded text-xs transition-all ${
                                currentStatus === "Present"
                                  ? "bg-emerald-600 text-white font-bold shadow-xs"
                                  : "text-slate-600 hover:text-slate-900 hover:bg-white/80 font-medium"
                              }`}
                              title="Present"
                            >
                              P
                            </button>

                            {/* Absent Button */}
                            <button
                              type="button"
                              onClick={() => setStatus(student.id, "Absent")}
                              className={`px-2.5 py-1 rounded text-xs transition-all ${
                                currentStatus === "Absent"
                                  ? "bg-rose-600 text-white font-bold shadow-xs"
                                  : "text-slate-600 hover:text-slate-900 hover:bg-white/80 font-medium"
                              }`}
                              title="Absent"
                            >
                              A
                            </button>

                            {/* Leave Button */}
                            <button
                              type="button"
                              onClick={() => setStatus(student.id, "Leave")}
                              className={`px-2.5 py-1 rounded text-xs transition-all ${
                                currentStatus === "Leave"
                                  ? "bg-amber-500 text-white font-bold shadow-xs"
                                  : "text-slate-600 hover:text-slate-900 hover:bg-white/80 font-medium"
                              }`}
                              title="On Leave"
                            >
                              L
                            </button>

                            {/* Half Day Button */}
                            <button
                              type="button"
                              onClick={() => setStatus(student.id, "HalfDay")}
                              className={`px-2.5 py-1 rounded text-xs transition-all ${
                                currentStatus === "HalfDay"
                                  ? "bg-sky-600 text-white font-bold shadow-xs"
                                  : "text-slate-600 hover:text-slate-900 hover:bg-white/80 font-medium"
                              }`}
                              title="Half Day"
                            >
                              HD
                            </button>
                          </div>
                        </td>

                        {/* Ghost Input for Remarks */}
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={reasonMap[student.id] || ""}
                            onChange={(e) =>
                              setReasonMap({ ...reasonMap, [student.id]: e.target.value })
                            }
                            placeholder="Add note..."
                            className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-slate-300 rounded px-2 py-1 text-xs text-slate-700 transition-colors placeholder:text-slate-400 focus:outline-none"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Bar */}
          <div className="py-3 px-4 bg-slate-50/60 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notifySms"
                checked={notifySms}
                onChange={(e) => setNotifySms(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-slate-900 focus:ring-slate-400 border-slate-300 cursor-pointer"
              />
              <label htmlFor="notifySms" className="text-slate-600 cursor-pointer select-none">
                Send automated WhatsApp absent alert via WATI ({absentCount} marked absent)
              </label>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-slate-400 text-[11px]">
                Showing {filteredStudents.length} of {totalStudents} students
              </span>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Attendance</span>
                  </>
                )}
              </button>
            </div>
          </div>
      </form>
    </div>
  );
}

