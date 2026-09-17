"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  Power,
  Menu,
  School,
  Calendar,
  Database,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import DatabaseStatusModal from "@/components/database/DatabaseStatusModal";

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSignOut = () => {
    try {
      localStorage.removeItem("schooldesk_user_role");
      localStorage.removeItem("schooldesk_user_id");
      localStorage.removeItem("schooldesk_user_name");
    } catch {
      // ignore
    }
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-20 shadow-xs select-none">
      {/* Left Section: Mobile Menu Toggle + School Brand Identity & Active Session */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 md:hidden"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Institution Brand Identity */}
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:bg-emerald-700 transition-colors shrink-0">
            SP
          </div>
          <div className="leading-tight">
            <div className="flex items-center space-x-2.5">
              <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                St. Paul&apos;s Senior Secondary School
              </span>
            </div>
            <p className="hidden sm:block text-xs text-slate-500 font-medium mt-0.5">
              Institutional ERP & Academic Management Portal
            </p>
          </div>
        </Link>
      </div>

      {/* Right Section: Modern SaaS Utility Toolbar */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* 1. Global Quick Search Pill (⌘K / Ctrl K) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          title="Search scholars, staff, and records (Ctrl + K)"
        >
          <Search className="w-4 h-4 text-slate-500" />
          <span className="hidden md:inline">Quick Search...</span>
          <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-slate-300 text-[11px] font-mono text-slate-500 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* 2. Single Notification Bell with Unread Indicator */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
            title="Institutional Notifications & Alerts"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>

          {/* Notifications Flyout */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-fadeIn text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-xs">Institutional Alerts</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                  3 New
                </span>
              </div>
              <div className="divide-y divide-slate-100 mt-2 space-y-1 max-h-64 overflow-y-auto">
                <div className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="font-semibold text-slate-800">Term 1 Exam Timetable Finalized</div>
                  <div className="text-slate-500 text-xs mt-0.5">Examination cell published the schedules for Class 9 to 12.</div>
                </div>
                <div className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="font-semibold text-slate-800">Biometric Terminal Online</div>
                  <div className="text-slate-500 text-xs mt-0.5">Main Gate staff biometric sync completed at 08:45 AM.</div>
                </div>
                <div className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="font-semibold text-slate-800">Daily Fee Collection Settlement</div>
                  <div className="text-slate-500 text-xs mt-0.5">₹1,42,800 collected today across counter & online gateway.</div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 text-center">
                <Link
                  href="/send-notifications"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  View All Notifications &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* 3. Administrative User Avatar Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center space-x-2.5 p-1 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
            title="Administrator Profile"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              AD
            </div>
            <div className="hidden lg:block text-left leading-tight pr-1">
              <div className="text-xs font-bold text-slate-900">
                Administrator
              </div>
              <div className="text-xs text-slate-500">
                Principal Office
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden lg:block transition-transform duration-150 ${isProfileMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 p-2 z-50 animate-fadeIn text-xs">
              <div className="p-3 border-b border-slate-100 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                  AD
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-slate-900 text-sm truncate">Administrator</div>
                  <div className="text-xs text-slate-500 truncate">St. Paul&apos;s Senior Secondary</div>
                  <div className="text-xs text-emerald-700 font-semibold mt-0.5">Principal Office</div>
                </div>
              </div>

              <div className="py-1.5 space-y-0.5">
                <Link
                  href="/staff-profile-settings"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Administrative Profile</span>
                </Link>
                <Link
                  href="/school-settings"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Institutional Settings</span>
                </Link>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsDbModalOpen(true);
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium text-left"
                >
                  <Database className="w-4 h-4 text-slate-400" />
                  <span>Database Status & Sync</span>
                </button>
              </div>

              <div className="pt-1.5 mt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsSignOutModalOpen(true);
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold transition-colors text-left"
                >
                  <Power className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Quick Search Modal (⌘K) */}
      <Modal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        title="St. Paul's Quick Navigation"
        subtitle="Search across scholars, faculty, fee ledgers, and attendance"
      >
        <div className="space-y-4 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by student name, roll no, mobile, or module..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div className="space-y-1 max-h-60 overflow-y-auto">
            <Link
              href="/search-student"
              onClick={() => setIsSearchOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-3.5 h-3.5 text-emerald-600" />
                <span>Student Multi-Search</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">/search-student</span>
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setIsSearchOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold transition-colors"
            >
              <div className="flex items-center space-x-2">
                <School className="w-3.5 h-3.5 text-emerald-600" />
                <span>Executive Dashboard</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">/dashboard</span>
            </Link>

            <Link
              href="/collect-fees"
              onClick={() => setIsSearchOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fee Collection Counter</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">/collect-fees</span>
            </Link>

            <Link
              href="/mark-attendance"
              onClick={() => setIsSearchOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark Student Attendance</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">/mark-attendance</span>
            </Link>
          </div>
        </div>
      </Modal>

      {/* Sign Out Confirmation Modal (Clean Tailwind Modal, Zero Browser Alerts) */}
      <Modal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        title="Confirm Sign Out"
        subtitle="End administrative session for St. Paul's Senior Secondary School"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Are you sure you want to sign out of the St. Paul&apos;s Senior Secondary School ERP portal? Any unsaved form data will be discarded.
          </p>
          <div className="flex justify-end space-x-2.5 pt-2">
            <button
              onClick={() => setIsSignOutModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors shadow-xs"
            >
              Sign Out Securely
            </button>
          </div>
        </div>
      </Modal>

      {/* Supabase Database Connection & Setup Modal */}
      <DatabaseStatusModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />
    </header>
  );
}

