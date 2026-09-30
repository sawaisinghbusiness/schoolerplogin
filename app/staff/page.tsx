"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Phone,
  Mail,
  UserPlus,
  FileSpreadsheet,
  Edit,
  Trash2,
  RefreshCw,
  LayoutGrid,
  List,
  Download,
  Clock,
  RotateCcw,
  Calendar,
  X,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { staffService, StaffMember } from "@/lib/services/staffService";
import { Modal } from "@/components/ui/modal";

// 8 Periods Definition with School Timings
interface PeriodSlot {
  period: number;
  label: string;
  time: string;
}

const PERIOD_SLOTS: PeriodSlot[] = [
  { period: 1, label: "Period 1", time: "08:30 - 09:15 AM" },
  { period: 2, label: "Period 2", time: "09:15 - 10:00 AM" },
  { period: 3, label: "Period 3", time: "10:00 - 10:45 AM" },
  { period: 4, label: "Period 4", time: "11:00 - 11:45 AM" },
  { period: 5, label: "Period 5", time: "11:45 - 12:30 PM" },
  { period: 6, label: "Period 6", time: "01:00 - 01:45 PM" },
  { period: 7, label: "Period 7", time: "01:45 - 02:30 PM" },
  { period: 8, label: "Period 8", time: "02:30 - 03:15 PM" },
];

export interface PeriodDetail {
  mainWork: string;
  subWork: string;
}

export type StaffSchedule = Record<number, PeriodDetail>;
export type AllSchedules = Record<string, StaffSchedule>;

// Contextual sub-options mapping based on the main selection
const SUB_OPTIONS: Record<string, string[]> = {
  class: [
    "Mathematics",
    "Science",
    "English",
    "Hindi",
    "Social Studies",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer / IT",
    "Sanskrit",
    "Revision & Test",
    "Doubt Clearing",
  ],
  "Library Duty": [
    "Book Issue & Return",
    "Reading Hall Supervision",
    "Book Cataloging",
    "Quiet Study Supervision",
  ],
  "Substitution / Proxy": [
    "Class Discipline & Silence",
    "Subject Revision",
    "Supervised Self-Study",
    "Homework Completion",
  ],
  "Exam Invigilation": [
    "Examination Hall Duty",
    "Question Paper Distribution",
    "Copy Collection & Attendance",
    "Corridor Supervision",
  ],
  "Lab Practical": [
    "Physics Lab Practical",
    "Chemistry Lab Experiment",
    "Biology Specimen Study",
    "Lab Viva & Project Work",
  ],
  "Copy Checking": [
    "Notebook Checking",
    "Unit Test Paper Grading",
    "Homework Diary Check",
    "Assignment Review",
  ],
  "Sports Drill": [
    "Morning PT & Drill",
    "Athletics Training",
    "Football / Cricket Coaching",
    "Free Play & Games",
  ],
  "Computer Lab": [
    "Practical Coding Session",
    "Computer Basics & Typing",
    "Project Work",
    "AV Presentation",
  ],
  "Office Admin": [
    "Admissions Desk",
    "Fee Records & Dues Check",
    "Student Files & Registers",
    "Meeting with Principal",
  ],
  "Gate Dispersal": [
    "Main Gate Supervision",
    "School Bus Boarding",
    "Walker Student Departure",
  ],
  "Free Period": [
    "Lesson Planning",
    "Question Paper Setting",
    "Personal Rest & Tea",
    "Staff Room Study",
  ],
  "Lunch Break": [
    "Staff Dining",
    "Lunch & Refreshment",
  ],
};

function getSubOptions(mainWork: string): string[] {
  if (mainWork.startsWith("Class")) {
    return SUB_OPTIONS["class"];
  }
  return SUB_OPTIONS[mainWork] || ["General Task", "Other Work"];
}

function getDefaultSubWork(mainWork: string): string {
  if (mainWork.startsWith("Class")) return "Mathematics";
  switch (mainWork) {
    case "Library Duty":
      return "Book Issue & Return";
    case "Substitution / Proxy":
      return "Class Discipline & Silence";
    case "Exam Invigilation":
      return "Examination Hall Duty";
    case "Lab Practical":
      return "Physics Lab Practical";
    case "Copy Checking":
      return "Notebook Checking";
    case "Sports Drill":
      return "Morning PT & Drill";
    case "Computer Lab":
      return "Practical Coding Session";
    case "Office Admin":
      return "Admissions Desk";
    case "Gate Dispersal":
      return "Main Gate Supervision";
    case "Free Period":
      return "Lesson Planning";
    case "Lunch Break":
      return "Staff Dining";
    case "Custom Duty":
      return "";
    default:
      return "General Task";
  }
}

// Generate realistic default timetable for staff member based on department
function getDefaultScheduleForStaff(dept: string): StaffSchedule {
  const d = (dept || "").toLowerCase();

  if (d.includes("math")) {
    return {
      1: { mainWork: "Class 10-A", subWork: "Mathematics" },
      2: { mainWork: "Class 9-B", subWork: "Mathematics" },
      3: { mainWork: "Free Period", subWork: "Lesson Planning" },
      4: { mainWork: "Class 8-A", subWork: "Mathematics" },
      5: { mainWork: "Copy Checking", subWork: "Notebook Checking" },
      6: { mainWork: "Class 7-A", subWork: "Mathematics" },
      7: { mainWork: "Substitution / Proxy", subWork: "Subject Revision" },
      8: { mainWork: "Free Period", subWork: "Question Paper Setting" },
    };
  }

  if (d.includes("science")) {
    return {
      1: { mainWork: "Class 10-B", subWork: "Physics" },
      2: { mainWork: "Lab Practical", subWork: "Physics Lab Practical" },
      3: { mainWork: "Class 9-A", subWork: "Chemistry" },
      4: { mainWork: "Free Period", subWork: "Lesson Planning" },
      5: { mainWork: "Class 8-B", subWork: "Biology" },
      6: { mainWork: "Class 6-A", subWork: "Science" },
      7: { mainWork: "Copy Checking", subWork: "Notebook Checking" },
      8: { mainWork: "Free Period", subWork: "Personal Rest & Tea" },
    };
  }

  if (d.includes("lang")) {
    return {
      1: { mainWork: "Class 10-A", subWork: "English" },
      2: { mainWork: "Class 9-A", subWork: "Hindi" },
      3: { mainWork: "Free Period", subWork: "Lesson Planning" },
      4: { mainWork: "Class 8-A", subWork: "English" },
      5: { mainWork: "Class 7-A", subWork: "Hindi" },
      6: { mainWork: "Copy Checking", subWork: "Notebook Checking" },
      7: { mainWork: "Library Duty", subWork: "Reading Hall Supervision" },
      8: { mainWork: "Free Period", subWork: "Personal Rest & Tea" },
    };
  }

  if (d.includes("admin") || d.includes("finance")) {
    return {
      1: { mainWork: "Office Admin", subWork: "Admissions Desk" },
      2: { mainWork: "Office Admin", subWork: "Fee Records & Dues Check" },
      3: { mainWork: "Office Admin", subWork: "Student Files & Registers" },
      4: { mainWork: "Free Period", subWork: "Personal Rest & Tea" },
      5: { mainWork: "Office Admin", subWork: "Meeting with Principal" },
      6: { mainWork: "Office Admin", subWork: "Admissions Desk" },
      7: { mainWork: "Office Admin", subWork: "Fee Records & Dues Check" },
      8: { mainWork: "Gate Dispersal", subWork: "Main Gate Supervision" },
    };
  }

  if (d.includes("sport")) {
    return {
      1: { mainWork: "Sports Drill", subWork: "Morning PT & Drill" },
      2: { mainWork: "Sports Drill", subWork: "Athletics Training" },
      3: { mainWork: "Free Period", subWork: "Personal Rest & Tea" },
      4: { mainWork: "Sports Drill", subWork: "Football / Cricket Coaching" },
      5: { mainWork: "Sports Drill", subWork: "Free Play & Games" },
      6: { mainWork: "Sports Drill", subWork: "Athletics Training" },
      7: { mainWork: "Sports Drill", subWork: "Morning PT & Drill" },
      8: { mainWork: "Gate Dispersal", subWork: "School Bus Boarding" },
    };
  }

  if (d.includes("it") || d.includes("lab")) {
    return {
      1: { mainWork: "Computer Lab", subWork: "Practical Coding Session" },
      2: { mainWork: "Computer Lab", subWork: "Computer Basics & Typing" },
      3: { mainWork: "Class 9-A", subWork: "Computer / IT" },
      4: { mainWork: "Free Period", subWork: "Lesson Planning" },
      5: { mainWork: "Class 8-A", subWork: "Computer / IT" },
      6: { mainWork: "Computer Lab", subWork: "Project Work" },
      7: { mainWork: "Free Period", subWork: "Personal Rest & Tea" },
      8: { mainWork: "Office Admin", subWork: "Student Files & Registers" },
    };
  }

  return {
    1: { mainWork: "Class 6-A", subWork: "English" },
    2: { mainWork: "Class 7-A", subWork: "Mathematics" },
    3: { mainWork: "Free Period", subWork: "Lesson Planning" },
    4: { mainWork: "Class 8-A", subWork: "Social Studies" },
    5: { mainWork: "Copy Checking", subWork: "Notebook Checking" },
    6: { mainWork: "Substitution / Proxy", subWork: "Class Discipline & Silence" },
    7: { mainWork: "Free Period", subWork: "Personal Rest & Tea" },
    8: { mainWork: "Gate Dispersal", subWork: "Walker Student Departure" },
  };
}

function parseStoredPeriod(val: unknown): PeriodDetail {
  if (!val) return { mainWork: "Free Period", subWork: "Lesson Planning" };
  if (typeof val === "object" && val !== null) {
    const obj = val as Record<string, unknown>;
    if ("mainWork" in obj && typeof obj.mainWork === "string") {
      return {
        mainWork: obj.mainWork,
        subWork: typeof obj.subWork === "string" ? obj.subWork : getDefaultSubWork(obj.mainWork),
      };
    }
    if ("work" in obj && typeof obj.work === "string") {
      return parseStringWork(obj.work);
    }
  }
  if (typeof val === "string") {
    return parseStringWork(val);
  }
  return { mainWork: "Free Period", subWork: "Lesson Planning" };
}

function parseStringWork(str: string): PeriodDetail {
  if (str.startsWith("Class")) {
    const match = str.match(/(Class\s+\d+-[A-Z]|Class\s+\d+)(?:\s*\((.*?)\))?/);
    if (match) {
      return {
        mainWork: match[1],
        subWork: match[2] || "Mathematics",
      };
    }
    return { mainWork: str, subWork: "Mathematics" };
  }
  if (str.includes("Library")) return { mainWork: "Library Duty", subWork: "Book Issue & Return" };
  if (str.includes("Exam") || str.includes("Invigilation")) return { mainWork: "Exam Invigilation", subWork: "Examination Hall Duty" };
  if (str.includes("Copy") || str.includes("Checking")) return { mainWork: "Copy Checking", subWork: "Notebook Checking" };
  if (str.includes("Lab") || str.includes("Practical")) return { mainWork: "Lab Practical", subWork: "Physics Lab Practical" };
  if (str.includes("Computer")) return { mainWork: "Computer Lab", subWork: "Practical Coding Session" };
  if (str.includes("Proxy") || str.includes("Substitution")) return { mainWork: "Substitution / Proxy", subWork: "Class Discipline & Silence" };
  if (str.includes("Sports") || str.includes("Drill")) return { mainWork: "Sports Drill", subWork: "Morning PT & Drill" };
  if (str.includes("Admin") || str.includes("Office")) return { mainWork: "Office Admin", subWork: "Admissions Desk" };
  if (str.includes("Gate") || str.includes("Dispersal")) return { mainWork: "Gate Dispersal", subWork: "Main Gate Supervision" };
  if (str.includes("Lunch")) return { mainWork: "Lunch Break", subWork: "Staff Dining" };
  return { mainWork: "Free Period", subWork: "Lesson Planning" };
}

export default function AllStaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Left">("All");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [notification, setNotification] = useState<string | null>(null);

  // Slide-Over Drawer State
  const [drawerStaff, setDrawerStaff] = useState<StaffMember | null>(null);
  const [schedules, setSchedules] = useState<AllSchedules>({});

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    staff: StaffMember | null;
  }>({
    isOpen: false,
    staff: null,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await staffService.fetchStaff();
      setStaffList(res.data);
    } catch (err) {
      console.error("Error fetching staff:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Load saved schedules from backend API
    const loadSchedules = async () => {
      try {
        const res = await staffService.fetchStaffSchedules();
        if (res.data && Object.keys(res.data).length > 0) {
          setSchedules(res.data);
        }
      } catch (e) {
        console.error("Failed to load schedules from backend:", e);
      }
    };

    loadSchedules();
  }, []);

  // ESC Key Listener for Slide-Over Drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerStaff(null);
    };

    if (drawerStaff) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawerStaff]);

  // Helper to get schedule for a staff member (with backward compatible parsing)
  const getStaffSchedule = (staff: StaffMember): StaffSchedule => {
    const saved = schedules[staff.id];
    if (saved) {
      const normalized: StaffSchedule = {};
      for (let i = 1; i <= 8; i++) {
        normalized[i] = parseStoredPeriod(saved[i]);
      }
      return normalized;
    }
    return getDefaultScheduleForStaff(staff.dept);
  };

  // Helper to compute summary workload counts
  const getScheduleSummary = (schedule: StaffSchedule) => {
    let classesCount = 0;
    let dutiesCount = 0;
    let freeCount = 0;

    Object.values(schedule).forEach((p) => {
      if (p.mainWork.startsWith("Class")) {
        classesCount++;
      } else if (p.mainWork === "Free Period" || p.mainWork === "Lunch Break") {
        freeCount++;
      } else {
        dutiesCount++;
      }
    });

    return { classesCount, dutiesCount, freeCount };
  };

  // Save schedule state and persist directly to backend with instant UI sync
  const saveSchedule = async (staff: StaffMember, updatedStaffSchedule: StaffSchedule, toastMsg?: string) => {
    const updatedAll: AllSchedules = {
      ...schedules,
      [staff.id]: updatedStaffSchedule,
    };
    // Instant row state sync
    setSchedules(updatedAll);

    // Persist to backend server and Supabase
    try {
      await staffService.updateStaffSchedule(staff.id, updatedStaffSchedule);
    } catch (e) {
      console.error("Could not save to backend:", e);
    }

    if (toastMsg) {
      setNotification(`${toastMsg} (Saved to backend)`);
      setTimeout(() => setNotification(null), 2500);
    }
  };

  // Drawer Selector Handlers
  const handleMainWorkChange = (staff: StaffMember, periodNum: number, newMainWork: string) => {
    const current = getStaffSchedule(staff);
    const currentPeriod = current[periodNum] || { mainWork: "Free Period", subWork: "Lesson Planning" };

    let newSubWork = currentPeriod.subWork;
    const validSubOptions = getSubOptions(newMainWork);

    if (newMainWork === "Custom Duty") {
      newSubWork = currentPeriod.subWork && !validSubOptions.includes(currentPeriod.subWork)
        ? currentPeriod.subWork
        : "";
    } else if (!validSubOptions.includes(newSubWork)) {
      newSubWork = getDefaultSubWork(newMainWork);
    }

    const updatedStaffSchedule: StaffSchedule = {
      ...current,
      [periodNum]: {
        mainWork: newMainWork,
        subWork: newSubWork,
      },
    };

    saveSchedule(
      staff,
      updatedStaffSchedule,
      `Period ${periodNum} set to "${newMainWork}${newSubWork ? ` - ${newSubWork}` : ""}"`
    );
  };

  const handleSubWorkChange = (staff: StaffMember, periodNum: number, newSubWork: string) => {
    const current = getStaffSchedule(staff);
    const currentPeriod = current[periodNum] || { mainWork: "Free Period", subWork: "Lesson Planning" };

    const updatedStaffSchedule: StaffSchedule = {
      ...current,
      [periodNum]: {
        ...currentPeriod,
        subWork: newSubWork,
      },
    };

    saveSchedule(
      staff,
      updatedStaffSchedule,
      `Period ${periodNum}: ${currentPeriod.mainWork} → "${newSubWork}"`
    );
  };

  // Reset staff schedule to defaults
  const handleResetStaffSchedule = async (staff: StaffMember) => {
    const defaultSchedule = getDefaultScheduleForStaff(staff.dept);
    const updatedAll: AllSchedules = {
      ...schedules,
      [staff.id]: defaultSchedule,
    };
    setSchedules(updatedAll);

    try {
      await staffService.updateStaffSchedule(staff.id, defaultSchedule);
    } catch (e) {
      console.error("Could not reset on backend:", e);
    }

    setNotification(`Schedule reset to defaults for ${staff.name} (Saved to backend)`);
    setTimeout(() => setNotification(null), 2500);
  };

  const totalCount = staffList.length;
  const activeCount = staffList.filter((s) => s.status === "Active").length;
  const leftCount = staffList.filter((s) => s.status === "Left").length;
  const presentTodayCount = staffList.filter((s) => s.attendance === "Present").length;

  const filtered = staffList.filter((s) => {
    const q = query.toLowerCase();
    const matchQ =
      s.name.toLowerCase().includes(q) ||
      s.mobile.includes(q) ||
      s.id.toLowerCase().includes(q) ||
      (s.email && s.email.toLowerCase().includes(q));

    const matchDept = selectedDept === "All" || s.dept === selectedDept;

    let matchStatus = true;
    if (statusFilter === "Active") matchStatus = s.status === "Active";
    else if (statusFilter === "Left") matchStatus = s.status === "Left";

    return matchQ && matchDept && matchStatus;
  });

  const handleExportCSV = () => {
    const headers = ["Employee Code", "Name", "Department", "Designation", "Mobile", "Email", "Status", "Today Attendance"];
    const rows = filtered.map((s) => [
      `"${s.id}"`,
      `"${s.name}"`,
      `"${s.dept}"`,
      `"${s.designation}"`,
      `"${s.mobile}"`,
      `"${s.email || `${s.name.toLowerCase().replace(/[^a-z]/g, "")}@mtnabarmer.edu.in`}"`,
      `"${s.status}"`,
      `"${s.attendance}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Staff_Directory_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setNotification("Staff directory exported successfully!");
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-5 max-w-7xl pb-12 font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="alert alert-emerald animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{notification}</span>
        </div>
      )}

      {/* Header & Main Page Actions Toolbar */}
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manage Staff</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 font-semibold">Staff Directory</span>
          </div>
          <h1 className="page-title">
            Staff Directory
          </h1>
          <p className="page-subtitle">
            Institutional faculty roster &amp; daily 8-period teaching allocations • St. Paul School, Barmer
          </p>
        </div>

        {/* Action Buttons: Add Staff, Export */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/staff/new"
            className="btn btn-primary btn-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Staff</span>
          </Link>

          <button
            onClick={handleExportCSV}
            className="btn btn-dark btn-sm"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Slim Single-Line KPI Header */}
      <div className="panel flex flex-wrap items-center gap-x-6 gap-y-2 py-2.5 px-4 text-xs text-slate-600 font-medium">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          <span className="text-slate-500">Total Staff:</span>
          <span className="font-bold text-slate-900 font-mono text-sm">{totalCount}</span>
        </div>
        <div className="h-3.5 w-px bg-slate-200 hidden sm:block"></div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-slate-500">Active:</span>
          <span className="font-bold text-emerald-700 font-mono text-sm">{activeCount}</span>
        </div>
        <div className="h-3.5 w-px bg-slate-200 hidden sm:block"></div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span className="text-slate-500">Present Today:</span>
          <span className="font-bold text-slate-900 font-mono text-sm">{presentTodayCount || totalCount}</span>
        </div>
        <div className="h-3.5 w-px bg-slate-200 hidden sm:block"></div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span className="text-slate-500">On Leave:</span>
          <span className="font-bold text-slate-700 font-mono text-sm">{leftCount || 0}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card p-3 sm:p-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search faculty by name, code (EMP-001) or mobile..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="field field-sm w-full pl-9 pr-4"
          />
        </div>

        {/* Filter Controls: Department, Status Tabs, View Switcher */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Department Select */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="field field-sm"
          >
            <option value="All">All Departments</option>
            <option value="Administration">Administration</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="Languages">Languages</option>
            <option value="Social Science">Social Science</option>
            <option value="Commerce">Commerce &amp; Accounts</option>
            <option value="Physical Education">Physical Education &amp; Sports</option>
            <option value="Primary Wing">Primary Wing</option>
            <option value="Fine Arts">Fine Arts &amp; Music</option>
            <option value="IT & Labs">IT &amp; Labs</option>
          </select>

          {/* Status Tabs */}
          <div className="panel inline-flex p-0.5 text-xs">
            <button
              onClick={() => setStatusFilter("All")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                statusFilter === "All"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("Active")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                statusFilter === "Active"
                  ? "bg-white text-emerald-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("Left")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                statusFilter === "Left"
                  ? "bg-white text-rose-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Left
            </button>
          </div>

          {/* View Toggle */}
          <div className="panel inline-flex p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "table" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "cards" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={loadData}
            className="p-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "table" ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              {/* Neutral Modern Table Header */}
              <thead className="table-head">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Department &amp; Role</th>
                  <th className="py-3 px-4">8-Period Workload</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading && staffList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                      <span>Loading faculty directory...</span>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No staff records match the search filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((st) => {
                    const schedule = getStaffSchedule(st);
                    const { classesCount, dutiesCount, freeCount } = getScheduleSummary(schedule);

                    // Compute clean initials for avatar
                    const initials = st.name
                      .replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Er\.|Sister|Pandit|Yogi|Ustad)\s+/i, "")
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "ST";

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Staff Member: Circular Avatar + Name + Code */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div
                                onClick={() => setDrawerStaff(st)}
                                className="font-semibold text-slate-900 text-sm hover:text-emerald-700 cursor-pointer transition-colors"
                              >
                                {st.name}
                              </div>
                              <div className="text-[11px] font-mono text-slate-400">
                                {st.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Department & Role */}
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800 text-xs">{st.designation}</div>
                          <span className="badge badge-slate mt-0.5">
                            {st.dept}
                          </span>
                        </td>

                        {/* 8-Period Workload Status Chip with Live State Sync */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setDrawerStaff(st)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100/90 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 border border-slate-200/80 transition-all cursor-pointer"
                            title="Click to view or edit 8 periods"
                          >
                            <span>
                              <strong className="text-blue-700 font-bold">{classesCount}</strong> Classes •{" "}
                              <strong className="text-amber-700 font-bold">{dutiesCount}</strong> Duties •{" "}
                              <strong className="text-emerald-700 font-bold">{freeCount}</strong> Free
                            </span>
                            <ChevronRight className="w-3 h-3 text-slate-400 ml-0.5" />
                          </button>
                        </td>

                        {/* Contact */}
                        <td className="py-3 px-4">
                          <div className="font-mono text-slate-700 text-xs">{st.mobile}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[170px]">
                            {st.email || `${st.name.toLowerCase().replace(/[^a-z]/g, "")}@mtnabarmer.edu.in`}
                          </div>
                        </td>

                        {/* Status & Attendance: Soft Green Dot Pill */}
                        <td className="py-3 px-4">
                          {st.status === "Active" ? (
                            <span className="badge badge-emerald gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="badge badge-rose gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              <span>{st.status}</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => setDrawerStaff(st)}
                              className="btn btn-soft btn-sm"
                              title="Assign 8-Period Schedule"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span className="hidden md:inline">Schedule</span>
                            </button>

                            <button
                              onClick={() => setDrawerStaff(st)}
                              className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded transition-colors"
                              title="Configure Schedule"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setDeleteModal({ isOpen: true, staff: st })}
                              className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Remove Staff"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((staff) => {
            const schedule = getStaffSchedule(staff);
            const { classesCount, dutiesCount, freeCount } = getScheduleSummary(schedule);

            const initials = staff.name
              .replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Er\.|Sister|Pandit|Yogi|Ustad)\s+/i, "")
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase() || "ST";

            return (
              <div
                key={staff.id}
                className="card card-hover p-4 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{staff.name}</h3>
                        <div className="text-[11px] text-slate-500">
                          {staff.designation} • <span className="font-mono text-emerald-700">{staff.id}</span>
                        </div>
                      </div>
                    </div>

                    <span className="badge badge-emerald gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Active</span>
                    </span>
                  </div>

                  <div className="panel mt-3 text-xs space-y-1 text-slate-600 p-2.5">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-mono">{staff.mobile}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {staff.email || `${staff.name.toLowerCase().replace(/[^a-z]/g, "")}@mtnabarmer.edu.in`}
                      </span>
                    </div>
                    <div className="pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                      Dept: <strong className="text-slate-800">{staff.dept}</strong>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setDrawerStaff(staff)}
                    className="btn btn-soft btn-sm"
                  >
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {classesCount} Classes • {dutiesCount} Duties
                    </span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setDrawerStaff(staff)}
                      className="p-1 hover:bg-slate-100 text-slate-600 rounded transition-colors"
                      title="Configure Schedule"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, staff })}
                      className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================================== */}
      {/* SLIDE-OVER DRAWER (SHEET): Full Vertical Space for 8 Periods Allocation         */}
      {/* ============================================================================== */}
      {drawerStaff && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
          {/* Backdrop with Blur & Click-to-Dismiss */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerStaff(null)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200 z-10 animate-in slide-in-from-right duration-300">
              {/* Fixed Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center shrink-0">
                    {drawerStaff.name
                      .replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Er\.|Sister|Pandit|Yogi|Ustad)\s+/i, "")
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "ST"}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-tight">
                      {drawerStaff.name}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-0.5">
                      <span className="font-mono text-emerald-700 font-semibold">{drawerStaff.id}</span>
                      <span>•</span>
                      <span>{drawerStaff.designation}</span>
                      <span>•</span>
                      <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[10px] font-medium">
                        {drawerStaff.dept}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setDrawerStaff(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-full transition-colors"
                  aria-label="Close drawer"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Drawer Body with Full Vertical Space */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-50/50">
                {/* Quick Info & Summary Strip */}
                {(() => {
                  const schedule = getStaffSchedule(drawerStaff);
                  const { classesCount, dutiesCount, freeCount } = getScheduleSummary(schedule);
                  return (
                    <div className="card p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3 font-medium text-slate-700">
                        <span>Classes: <strong className="text-blue-600 font-bold">{classesCount}</strong></span>
                        <span>•</span>
                        <span>Duties: <strong className="text-amber-600 font-bold">{dutiesCount}</strong></span>
                        <span>•</span>
                        <span>Free: <strong className="text-emerald-600 font-bold">{freeCount}</strong></span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Auto-syncs to Backend
                      </span>
                    </div>
                  );
                })()}

                {/* 8 Periods Vertical Stack */}
                {PERIOD_SLOTS.map((slot) => {
                  const schedule = getStaffSchedule(drawerStaff);
                  const periodDetail = schedule[slot.period] || {
                    mainWork: "Free Period",
                    subWork: "Lesson Planning",
                  };
                  const isClass = periodDetail.mainWork.startsWith("Class");
                  const isCustom = periodDetail.mainWork === "Custom Duty";
                  const isFree = periodDetail.mainWork === "Free Period" || periodDetail.mainWork === "Lunch Break";
                  const subOptions = getSubOptions(periodDetail.mainWork);

                  return (
                    <div
                      key={slot.period}
                      className="card card-hover p-3.5 space-y-2.5"
                    >
                      {/* Period Slot Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            isClass
                              ? "bg-blue-100 text-blue-800"
                              : isFree
                              ? "bg-emerald-100 text-emerald-800"
                              : isCustom
                              ? "bg-purple-100 text-purple-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {slot.label}
                          </span>
                          <span className="text-xs font-mono text-slate-400 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{slot.time}</span>
                          </span>
                        </div>

                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {isClass ? "Teaching" : isFree ? "Free" : "Duty"}
                        </span>
                      </div>

                      {/* Selectors Grid: Top Duty Picker + Bottom Contextual Subject/Task Picker */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {/* 1st Selector: Activity / Class / Duty */}
                        <div>
                          <label className="field-label">
                            Assigned Duty / Class
                          </label>
                          <select
                            value={periodDetail.mainWork}
                            onChange={(e) => handleMainWorkChange(drawerStaff, slot.period, e.target.value)}
                            className="field field-sm w-full font-semibold"
                          >
                            <optgroup label="Free & Breaks">
                              <option value="Free Period">Free Period</option>
                              <option value="Lunch Break">Lunch Break</option>
                            </optgroup>

                            <optgroup label="Academic Classes">
                              <option value="Class 10-A">Class 10-A</option>
                              <option value="Class 10-B">Class 10-B</option>
                              <option value="Class 9-A">Class 9-A</option>
                              <option value="Class 9-B">Class 9-B</option>
                              <option value="Class 8-A">Class 8-A</option>
                              <option value="Class 8-B">Class 8-B</option>
                              <option value="Class 7-A">Class 7-A</option>
                              <option value="Class 6-A">Class 6-A</option>
                              <option value="Class 11">Class 11</option>
                              <option value="Class 12">Class 12</option>
                            </optgroup>

                            <optgroup label="Duties & Supervision">
                              <option value="Library Duty">Library Duty</option>
                              <option value="Substitution / Proxy">Substitution / Proxy</option>
                              <option value="Exam Invigilation">Exam Invigilation</option>
                              <option value="Copy Checking">Copy Checking</option>
                              <option value="Lab Practical">Lab Practical</option>
                              <option value="Computer Lab">Computer Lab</option>
                              <option value="Sports Drill">Sports Drill</option>
                              <option value="Gate Dispersal">Gate Dispersal</option>
                              <option value="Office Admin">Office Admin</option>
                            </optgroup>

                            <optgroup label="Other">
                              <option value="Custom Duty">Custom Duty</option>
                            </optgroup>
                          </select>
                        </div>

                        {/* 2nd Selector or Custom Input: Contextual Subject / Specific Task */}
                        <div>
                          <label
                            className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                              isClass
                                ? "text-blue-600"
                                : isCustom
                                ? "text-purple-600"
                                : isFree
                                ? "text-emerald-600"
                                : "text-amber-700"
                            }`}
                          >
                            {isClass ? "Teaching Subject" : isCustom ? "Custom Task Name" : "Specific Task"}
                          </label>

                          {isCustom ? (
                            <input
                              type="text"
                              placeholder="Type custom task..."
                              value={periodDetail.subWork}
                              onChange={(e) => handleSubWorkChange(drawerStaff, slot.period, e.target.value)}
                              className="field field-sm w-full bg-purple-50/50 font-medium text-purple-900"
                            />
                          ) : (
                            <select
                              value={periodDetail.subWork}
                              onChange={(e) => handleSubWorkChange(drawerStaff, slot.period, e.target.value)}
                              className={`w-full py-1.5 px-2 border rounded-lg font-medium focus:ring-2 focus:outline-none cursor-pointer ${
                                isClass
                                  ? "bg-blue-50/60 hover:bg-blue-50 border-blue-200 text-blue-900 focus:ring-blue-500"
                                  : isFree
                                  ? "bg-emerald-50/60 hover:bg-emerald-50 border-emerald-200 text-emerald-900 focus:ring-emerald-500"
                                  : "bg-amber-50/60 hover:bg-amber-50 border-amber-200 text-amber-900 focus:ring-amber-500"
                              }`}
                            >
                              {subOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fixed Drawer Footer Always Visible */}
              <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => handleResetStaffSchedule(drawerStaff)}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                  title="Reset this teacher to department defaults"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset to Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDrawerStaff(null)}
                  className="btn btn-dark"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Staff Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, staff: null })}
        title="Remove Staff Member"
        subtitle="Deactivate faculty account and records"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Are you sure you want to remove <strong className="text-slate-900 font-bold">{deleteModal.staff?.name}</strong> ({deleteModal.staff?.designation}) from the staff registry?
          </p>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
            This will archive their employee profile and deactivate their institutional permissions.
          </div>
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDeleteModal({ isOpen: false, staff: null })}
              className="px-4 py-2 border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!deleteModal.staff) return;
                await staffService.deleteStaff(deleteModal.staff.id);
                setStaffList((prev) => prev.filter((s) => s.id !== deleteModal.staff?.id));
                setNotification(`Staff member "${deleteModal.staff.name}" removed successfully.`);
                setDeleteModal({ isOpen: false, staff: null });
                setTimeout(() => setNotification(null), 3500);
              }}
              className="btn btn-danger"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Staff</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
