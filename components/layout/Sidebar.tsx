"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Gauge,
  Layers,
  Users,
  GraduationCap,
  Bell,
  CalendarCheck,
  ClipboardList,
  FileText,
  Wifi,
  Award,
  Calendar,
  ChevronRight,
  User,
  Sliders,
  CheckCircle2,
  BookOpen,
  Image,
  Clock,
  PhoneCall,
  Edit3,
  CheckSquare,
  Shield,
  HelpCircle,
  BarChart2,
  CreditCard
} from "lucide-react";


interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<"erp" | "account">("erp");
  const [filterQuery, setFilterQuery] = useState("");
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    "Institute Details": false,
    "Manage Staff": false,
    "Manage Students": false,
    "Student Attendance": false,
    "Staff Attendance": false,
    "Admin Reports": false,
    "Manage Exams": false,
    "Circular": false,
    "Leave App.": false,
    "Offline Admission Test": false,
    "Call List": false,
    "Manage Syllabus": false,
    "Copy Check": false,
    "Homework": false,
    "Manage Mentors": false,
  });

  const toggleAccordion = (title: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const SCHOOL_ADMIN_ITEMS = [
    {
      title: "Search Student",
      href: "/search-student-advance",
      icon: Search,
    },
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Gauge,
    },
    {
      title: "Fee Collection",
      href: "/collect-fees",
      icon: CreditCard,
    },
    {
      title: "Institute Details",
      icon: Layers,
      children: [
        { title: "Basic Details", href: "/school-details" },
        { title: "Classes & Subjects", href: "/classes-subjects" },
        { title: "Syllabus Templates", href: "/list-syllabus-chapters-template" },
        { title: "Active Sessions", href: "/active-sessions" },
        { title: "Custom Settings", href: "/school-settings", badge: "30" },
      ],
    },
    {
      title: "Manage Staff",
      icon: Users,
      children: [
        { title: "Search Staff", href: "/search-staff" },
        { title: "Add Staff", href: "/add-staff" },
        { title: "List Staff", href: "/staffs" },
        { title: "Assign Subjects", href: "/assign-teacher-subjects" },
        { title: "Class Teacher", href: "/class-teacher" },
        { title: "Staff Excel", href: "/staff-list" },
        { title: "Profile Settings", href: "/staff-profile-settings" },
        { title: "Update staff (Excel)", href: "/update-staff" },
        { title: "Left Staff", href: "/left-staff" },
      ],
    },
    {
      title: "Manage Students",
      icon: GraduationCap,
      children: [
        { title: "Add Students", href: "/add-students" },
        { title: "List Students", href: "/list-students" },
        { title: "Filter Students (Beta)", href: "/list-students-beta" },
        { title: "Move Students", href: "/move-students" },
        { title: "Upload Photos", href: "/upload-student-pics" },
        { title: "Activate Enquiry", href: "/search-enquiry" },
        { title: "New Admission", href: "/new-admissions" },
        { title: "Promote Students", href: "/promote-students" },
        { title: "Removed Students", href: "/removed-students" },
        { title: "Profile Settings", href: "/student-profile-settings" },
        { title: "Student Documents", href: "/student-documents" },
        { title: "Bulk Print", href: "/bulk-print" },
        { title: "Bulk Certificates", href: "/bulk-certificate" },
      ],
    },
    {
      title: "Notifications / SMS",
      href: "/send-notifications",
      icon: Bell,
    },
    {
      title: "Student Attendance",
      icon: CalendarCheck,
      children: [
        { title: "Mark Attendance", href: "/mark-attendance" },
        { title: "Daily Attendance Report", href: "/daily-attendance-report" },
        { title: "Daily Sections Report", href: "/daily-section-attendance-report" },
        { title: "Attendance Slots", href: "/attendance-slots" },
      ],
    },
    {
      title: "Staff Attendance",
      icon: ClipboardList,
      children: [
        { title: "Mark Staff Attendance", href: "/mark-staff-attendance" },
        { title: "Daily Staff Attendance", href: "/daily-staff-attendance" },
        { title: "Staff Attendance Slots", href: "/staff-attendance-slots" },
      ],
    },
    {
      title: "Admin Reports",
      icon: FileText,
      children: [
        { title: "View Homework", href: "/show-homework" },
        { title: "Siblings List", href: "/list-siblings" },
        { title: "Studying Certificate History", href: "/studying-certificate-history" },
        { title: "Teacher Performance", href: "/teacher-performance" },
        { title: "Timetable Files", href: "/timetablefile" },
        { title: "Syllabus Files", href: "/syllabus-file" },
      ],
    },
    {
      title: "Biometric Devices",
      href: "/biometric",
      icon: Wifi,
    },
    {
      title: "Manage Exams",
      icon: Award,
      children: [
        { title: "Manage Terms", href: "/list-terms" },
        { title: "Add Exams", href: "/add-exam" },
        { title: "View Exams", href: "/exam-schedule" },
        { title: "View Results", href: "/view-result" },
        { title: "Grade Setting", href: "/grade-setting" },
        { title: "Co-Scholastic Skills", href: "/coscholastic-skills" },
        { title: "Co-Scholastic Grades", href: "/coscholastic-grades" },
        { title: "Report Card", href: "/report-card" },
        { title: "Class Test Report Card", href: "/class-test-report-card" },
        { title: "ICSE Report Card", href: "/icse-report-card" },
        { title: "Report Card Extra Fields", href: "/report-card-keys" },
      ],
    },
    {
      title: "Manage Timetable",
      href: "/add-timetable",
      icon: Calendar,
    },
    {
      title: "Data Verification",
      href: "/verification-list",
      icon: CheckSquare,
    },
    {
      title: "View Birthdays",
      href: "/list-birthday",
      icon: Clock,
    },
    {
      title: "Calendar Events",
      href: "/event-holidays",
      icon: Calendar,
    },
    {
      title: "Circular",
      icon: Bell,
      children: [
        { title: "Whole School", href: "/send-circular-school" },
        { title: "Individual Classes", href: "/send-circular-classes" },
        { title: "View History", href: "/circular-history" },
      ],
    },
    {
      title: "Leave App.",
      icon: CalendarCheck,
      children: [
        { title: "Pending", href: "/pending-leaves" },
        { title: "Approved/Rejected", href: "/approved-leaves" },
      ],
    },
    {
      title: "Gallery",
      href: "/gallery",
      icon: Image,
    },
    {
      title: "Followup Reports",
      href: "/list-followup",
      icon: BarChart2,
    },
    {
      title: "Offline Admission Test",
      icon: Edit3,
      children: [
        { title: "List Offline Tests", href: "/list-offline-admission-test" },
        { title: "Admission Tests Results", href: "/admission-test-results" },
      ],
    },
    {
      title: "Teacher Request",
      href: "/teacher-request",
      icon: User,
    },
    {
      title: "Call List",
      icon: PhoneCall,
      children: [
        { title: "Call list", href: "/call-list" },
        { title: "Call list reason", href: "/call-list-reasons" },
        { title: "My calls", href: "/my-calls" },
      ],
    },
    {
      title: "Manage Syllabus",
      icon: BookOpen,
      children: [
        { title: "Syllabus Plan", href: "/syllabus-overview" },
        { title: "Lessons", href: "/syllabus-progress" },
      ],
    },
    {
      title: "My Followups",
      href: "/list-followup",
      icon: CheckCircle2,
    },
    {
      title: "Design Studio",
      href: "/design/templates",
      icon: Sliders,
    },
    {
      title: "UDISE Report",
      href: "/udise-report",
      icon: FileText,
    },
    {
      title: "Exams (Beta)",
      href: "/v2/exams",
      icon: Award,
    },
    {
      title: "Copy Check",
      icon: CheckSquare,
      children: [
        { title: "Add Copy Checks", href: "/add-copy-check" },
        { title: "Copy Check Report", href: "/copy-check" },
        { title: "Custom Remark", href: "/copy-check-remark-type" },
      ],
    },
    {
      title: "Help / Contact",
      href: "#",
      icon: HelpCircle,
    },
  ];

  const SCHOOL_TEACHER_ITEMS = [
    {
      title: "Homework",
      icon: BookOpen,
      children: [
        { title: "Add Homework", href: "/homework" },
        { title: "View Homework", href: "/show-homework" },
      ],
    },
    {
      title: "My Mentees",
      href: "/mentees",
      icon: Users,
    },
  ];

  const EXAM_CELL_ITEMS = [
    {
      title: "Manage Mentors",
      icon: Users,
      children: [
        { title: "Assign Mentor", href: "/assign-mentor" },
        { title: "List Mentors", href: "/assign-mentor" },
      ],
    },
  ];

  const EXTRA_FEATURE_ITEMS = [
    {
      title: "Support Access",
      href: "#",
      icon: Shield,
    },
    {
      title: "My calls",
      href: "/my-calls",
      icon: PhoneCall,
    },
    {
      title: "Daily SMS Count",
      href: "/daily-sms-count",
      icon: BarChart2,
    },
  ];

  const filterSection = (items: typeof SCHOOL_ADMIN_ITEMS) => {
    return items.filter((item) => {
      const q = filterQuery.toLowerCase().trim();
      if (!q) return true;
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchChild = item.children?.some((c) => c.title.toLowerCase().includes(q));
      return matchTitle || matchChild;
    });
  };

  const filteredAdmin = filterSection(SCHOOL_ADMIN_ITEMS);
  const filteredTeacher = filterSection(SCHOOL_TEACHER_ITEMS);
  const filteredExamCell = filterSection(EXAM_CELL_ITEMS);
  const filteredExtra = filterSection(EXTRA_FEATURE_ITEMS);

  const renderNavGroup = (items: typeof SCHOOL_ADMIN_ITEMS, groupTitle: string) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-3">
        <div className="px-4 pt-3 pb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
          {groupTitle}
        </div>
        {items.map((item, idx) => {
          const Icon = item.icon;
          const hasChildren = Boolean(item.children && item.children.length > 0);
          const isAccordionOpen = openAccordions[item.title] || Boolean(filterQuery);
          const isActive = item.href ? pathname === item.href : false;

          if (!hasChildren) {
            return (
              <Link
                key={idx}
                href={item.href || "#"}
                onClick={onClose}
                className={`relative flex items-center justify-between px-4 py-2 text-sm transition-colors rounded-r-lg mr-2 ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 font-semibold border-r-2 border-emerald-500"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  <span className="truncate">{item.title}</span>
                </div>
              </Link>
            );
          }

          return (
            <div key={idx}>
              <button
                onClick={() => toggleAccordion(item.title)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                  <span className="truncate">{item.title}</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 text-slate-500 transition-transform ${
                    isAccordionOpen ? "rotate-90" : ""
                  }`}
                />
              </button>

              {isAccordionOpen && item.children && (
                <div className="bg-slate-950/40 border-l border-slate-800 ml-5 pl-2 my-1 space-y-0.5 py-1">
                  {item.children.map((child, cIdx) => {
                    const isChildActive = child.href !== "#" && pathname === child.href;
                    return (
                      <Link
                        key={cIdx}
                        href={child.href}
                        onClick={onClose}
                        className={`flex items-center justify-between px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          isChildActive
                            ? "text-emerald-400 font-semibold bg-emerald-500/10"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                        }`}
                      >
                        <span className="truncate">{child.title}</span>
                        {child.badge && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                            {child.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 z-30 md:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`w-64 shrink-0 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-full z-40 select-none transition-transform duration-200 ease-in-out fixed inset-y-0 left-0 md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Bar in Sidebar Header */}
        <div className="flex items-center space-x-3 px-4 h-14 border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            MT
          </div>
          <div className="overflow-hidden leading-tight">
            <div className="text-sm font-bold text-white tracking-tight truncate">
              MTNA SchoolDesk
            </div>
            <div className="text-xs text-slate-400 font-mono">
              SLRJ0402749
            </div>
          </div>
        </div>

        {/* Top Two-Tab Switcher */}
        <div className="flex bg-slate-950/60 border-b border-slate-800 h-10 shrink-0">
          <button
            onClick={() => setActiveTab("erp")}
            className={`flex-1 flex items-center justify-center space-x-2 text-xs font-semibold transition-colors ${
              activeTab === "erp"
                ? "text-emerald-400 bg-slate-900 border-b-2 border-emerald-500"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="ERP Modules Navigation"
          >
            <Layers className="w-4 h-4" />
            <span>Modules</span>
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`flex-1 flex items-center justify-center space-x-2 text-xs font-semibold transition-colors ${
              activeTab === "account"
                ? "text-emerald-400 bg-slate-900 border-b-2 border-emerald-500"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="User Account & Preferences"
          >
            <User className="w-4 h-4" />
            <span>Account</span>
          </button>
        </div>

        {activeTab === "erp" ? (
          <>
            {/* Search Filter Box */}
            <div className="p-3 bg-slate-900 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter menu items..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full bg-slate-800 text-sm text-white placeholder-slate-400 px-3 py-1.5 pr-8 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
              </div>
            </div>

            {/* Navigation Lists */}
            <div className="flex-1 overflow-y-auto space-y-0.5 pb-8 text-sm font-medium">
              {renderNavGroup(filteredAdmin, "SCHOOL ADMIN")}
              {renderNavGroup(filteredTeacher, "SCHOOL TEACHER")}
              {renderNavGroup(filteredExamCell, "EXAM CELL")}
              {renderNavGroup(filteredExtra, "EXTRA FEATURES")}
            </div>
          </>
        ) : (
          /* Tab 2: User Account & Preferences Drawer */
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm text-slate-300">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ADMINISTRATOR CREDENTIALS
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80 space-y-2.5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  MP
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Mahendra Parihar</div>
                  <div className="text-xs text-slate-400">Principal / Administrator</div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-700 text-xs text-slate-400">
                School Account: <span className="font-mono text-emerald-400 font-bold">SLRJ0402749</span>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                href="/staff-profile-settings"
                onClick={onClose}
                className="flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/60 transition-colors"
              >
                <span className="font-medium text-slate-200">Staff Profile Details</span>
                <Edit3 className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/school-settings"
                onClick={onClose}
                className="flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/60 transition-colors"
              >
                <span className="font-medium text-slate-200">Institution Preferences</span>
                <Sliders className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <Link
                href="/school-settings"
                onClick={onClose}
                className="flex items-center justify-center space-x-2 w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider text-xs rounded-lg transition-colors shadow-xs"
              >
                <Sliders className="w-4 h-4" />
                <span>MANAGE PREFERENCES</span>
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

