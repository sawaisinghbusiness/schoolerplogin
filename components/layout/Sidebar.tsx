"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
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
  Edit3,
  CheckSquare,
  Shield,
  HelpCircle,
  BarChart2,
  CreditCard,
  FileSpreadsheet,
  LogOut,
  X,
  AlertTriangle
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [filterQuery, setFilterQuery] = useState("");
  const [showSignOutModal, setShowSignOutModal] = useState(false);
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

  const CORE_NAV_ITEMS = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Fee Collection",
      href: "/collect-fees",
      icon: CreditCard,
    },
    {
      title: "Student Search",
      href: "/search-student",
      icon: Search,
    },
    {
      title: "Daily Attendance",
      href: "/mark-attendance",
      icon: CalendarCheck,
    },
    {
      title: "Bulk Student Import",
      href: "/update-students",
      icon: FileSpreadsheet,
    },
  ];

  const SCHOOL_ADMIN_ITEMS = [
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
      title: "Manage Syllabus",
      icon: BookOpen,
      children: [
        { title: "Syllabus Plan", href: "/syllabus-overview" },
        { title: "Lessons", href: "/syllabus-progress" },
      ],
    },
    {
      title: "Design Studio",
      href: "/design/templates",
      icon: Sliders,
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
        <div className="px-3 pt-3 pb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
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
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-600 text-white font-medium shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span className="truncate">{item.title}</span>
                </div>
              </Link>
            );
          }

          return (
            <div key={idx} className="space-y-1">
              <button
                onClick={() => toggleAccordion(item.title)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                  <span className="truncate">{item.title}</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                    isAccordionOpen ? "rotate-90 text-slate-300" : ""
                  }`}
                />
              </button>

              {isAccordionOpen && item.children && (
                <div className="bg-slate-950/60 border-l border-slate-800/80 ml-5 pl-2 my-1 space-y-0.5 py-1">
                  {item.children.map((child, cIdx) => {
                    const isChildActive = child.href !== "#" && pathname === child.href;
                    return (
                      <Link
                        key={cIdx}
                        href={child.href}
                        onClick={onClose}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isChildActive
                            ? "bg-emerald-600 text-white font-medium shadow-xs"
                            : "text-slate-400 hover:text-white hover:bg-slate-900"
                        }`}
                      >
                        <span className="truncate">{child.title}</span>
                        {child.badge && (
                          <span className="px-1.5 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-300 font-semibold">
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
        className={`w-64 shrink-0 bg-slate-950 border-r border-slate-800/80 text-slate-300 flex flex-col h-full overflow-hidden select-none transition-transform duration-200 ease-in-out fixed inset-y-0 left-0 z-40 md:static md:translate-x-0 md:z-20 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Bar in Sidebar Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800/80 bg-slate-950 shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm tracking-wider shadow-xs ring-1 ring-emerald-500/30 shrink-0">
              SP
            </div>
            <div className="overflow-hidden leading-tight">
              <div className="text-sm font-bold text-white tracking-tight truncate">
                St. Paul&apos;s SchoolDesk
              </div>
              <div className="text-xs text-slate-400 font-medium truncate">
                Senior Secondary ERP
              </div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 md:hidden transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Filter Box */}
        <div className="p-3 bg-slate-950 border-b border-slate-800/60 shrink-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Filter menu items..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full bg-slate-900 text-xs text-white placeholder-slate-400 pl-8 pr-6 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            {filterQuery && (
              <button
                onClick={() => setFilterQuery("")}
                className="text-slate-400 hover:text-white text-xs absolute right-2.5 top-2"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Primary Core Action Items */}
        {!filterQuery && (
          <div className="px-3 pt-3 pb-2 space-y-1 shrink-0 border-b border-slate-800/80">
            <div className="px-3 pb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              CORE WORKFLOWS
            </div>
            {CORE_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-600 text-white font-medium shadow-xs"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span className="truncate">{item.title}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Scrollable Navigation Modules */}
        <div className="flex-1 overflow-y-auto min-h-0 px-3 py-2 space-y-1 text-sm font-medium">
          {renderNavGroup(filteredAdmin, "ACADEMIC & ADMIN MODULES")}
          {renderNavGroup(filteredTeacher, "TEACHER WORKFLOWS")}
          {renderNavGroup(filteredExamCell, "EXAM CELL")}
          {renderNavGroup(filteredExtra, "SYSTEM & HARDWARE")}
        </div>

        {/* Clean Administrative Account Card Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950 shrink-0">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                SP
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-200 truncate">Administrator</div>
                <div className="text-xs text-slate-400 truncate">School Superadmin</div>
              </div>
            </div>
            <button
              onClick={() => setShowSignOutModal(true)}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Styled Tailwind Sign-Out Modal (Zero browser alert/confirm) */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-slate-900 animate-fadeIn space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Sign Out Confirmation</h3>
                <p className="text-xs text-slate-500">St. Paul&apos;s Senior Secondary School</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to end your administrative session and return to the login screen?
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSignOutModal(false);
                  localStorage.removeItem("auth_token");
                  localStorage.removeItem("user_role");
                  sessionStorage.clear();
                  router.push("/login");
                }}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

