"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Calendar,
  Settings,
  Mail,
  Globe,
  Headphones,
  Search,
  Power,
  RotateCw,
  List,
  Edit2,
  Lock,
  Menu,
  ChevronDown,
  Database
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import DatabaseStatusModal from "@/components/database/DatabaseStatusModal";


interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState("26-27");
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isSmsUsageModalOpen, setIsSmsUsageModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState("15-09-2026 15:34:43");

  const sessionRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const formatted = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    setCurrentTime(formatted);

    const handleClickOutside = (e: MouseEvent) => {
      if (sessionRef.current && !sessionRef.current.contains(e.target as Node)) {
        setIsSessionOpen(false);
      }
      if (walletRef.current && !walletRef.current.contains(e.target as Node)) {
        setIsWalletOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#222d32] text-white border-b border-[#1b242a] shadow-md select-none">
      <div className="flex items-stretch h-14 justify-between">
        {/* Leftmost: User Profile Chip (Exact Schoollog green chip from screenshot) */}
        <div className="flex items-center">
          <div className="bg-[#16a085] hover:bg-[#149077] transition-colors h-full px-3 py-1.5 flex items-center space-x-2.5 w-60 border-r border-[#138d75]">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Mahendra Parihar"
              className="w-8 h-8 rounded object-cover border border-white/40 shadow-xs shrink-0"
            />
            <div className="overflow-hidden leading-tight flex-1">
              <div className="text-xs font-bold text-white uppercase tracking-wider truncate">
                MAHENDRA PARIHAR
              </div>
              <Link
                href="/staff-profile-settings"
                className="text-[10px] text-white/90 hover:text-white flex items-center space-x-1"
              >
                <span>✎ Edit Profile</span>
                <Lock className="w-2.5 h-2.5 text-white/80 inline ml-1" />
              </Link>
            </div>
          </div>

          {/* Hamburger Menu Icon */}
          <button
            onClick={onToggleSidebar}
            className="px-3.5 hover:bg-[#1b242a] text-white/90 hover:text-white h-full flex items-center transition-colors focus:outline-none"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* School Name & Account ID */}
          <div className="px-3 py-1 hidden sm:block">
            <div className="text-xs md:text-sm font-bold tracking-tight text-white uppercase">
              MOTHER TERESA NOBLES ACADEMY SR. SEC....
            </div>
            <div className="text-[11px] font-mono font-bold tracking-wide text-[#28d4a4]">
              ACCOUNT ID:SLRJ0402749
            </div>
          </div>
        </div>

        {/* Right Action Icons (Exact layout from Schoollog) */}
        <div className="flex items-center">
          {/* 1. Academic Session Calendar Icon with "26-27" */}
          <div className="relative h-full" ref={sessionRef}>
            <button
              onClick={() => setIsSessionOpen(!isSessionOpen)}
              className="h-full px-3 hover:bg-[#1b242a] flex flex-col items-center justify-center text-slate-300 hover:text-white transition-colors focus:outline-none"
              title="Active Academic Session"
            >
              <Calendar className="w-4 h-4 text-slate-300" />
              <span className="text-[10px] font-mono leading-none mt-1 text-slate-300">
                {selectedSession}
              </span>
            </button>

            {/* Session Popover (Exact match to Image 5) */}
            {isSessionOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white text-slate-800 rounded-md shadow-2xl border-t-4 border-[#16a085] p-4 z-50 animate-fadeIn">
                <div className="text-center font-bold text-sm text-[#16a085] mb-3">
                  Active Session: {selectedSession}
                </div>
                <div className="relative">
                  <select
                    value={selectedSession}
                    onChange={(e) => {
                      setSelectedSession(e.target.value);
                      setIsSessionOpen(false);
                    }}
                    className="w-full p-2 border border-slate-300 rounded text-xs bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#16a085]"
                  >
                    <option value="26-27">26-27</option>
                    <option value="25-26">25-26</option>
                    <option value="24-25">24-25</option>
                    <option value="23-24">23-24</option>
                    <option value="22-23">22-23</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 2. Settings Gear with Orange Badge "30" */}
          <Link
            href="/school-settings"
            className="h-full px-3 hover:bg-[#1b242a] flex items-center justify-center text-slate-300 hover:text-white relative transition-colors"
            title="Custom Settings (30 Alerts)"
          >
            <Settings className="w-4 h-4 text-slate-300" />
            <span className="absolute top-2.5 right-1.5 w-4 h-4 rounded-full bg-[#e67e22] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
              30
            </span>
          </Link>

          {/* 3. Envelope / SMS Wallet with "5153" */}
          <div className="relative h-full" ref={walletRef}>
            <button
              onClick={() => setIsWalletOpen(!isWalletOpen)}
              className="h-full px-3 hover:bg-[#1b242a] flex flex-col items-center justify-center text-slate-300 hover:text-white transition-colors focus:outline-none"
              title="SMS/WhatsApp Wallet Balance"
            >
              <Mail className="w-4 h-4 text-slate-300" />
              <span className="text-[10px] font-mono leading-none mt-1 text-slate-300">
                5153
              </span>
            </button>

            {/* Exact SMS Popover matching Screenshot Image 4! */}
            {isWalletOpen && (
              <div className="absolute right-0 mt-1 w-72 bg-white text-slate-800 rounded-md shadow-2xl border-t-4 border-[#16a085] p-3.5 z-50 animate-fadeIn text-xs">
                {/* Top Action Icons (Blue reload, Green list) */}
                <div className="flex justify-end space-x-2 pb-2">
                  <button
                    onClick={() => {
                      alert("SMS balance refreshed.");
                    }}
                    className="w-6 h-6 rounded-full bg-[#3498db] hover:bg-[#2980b9] text-white flex items-center justify-center shadow-xs transition-colors"
                    title="Refresh Balance"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setIsWalletOpen(false);
                      setIsSmsUsageModalOpen(true);
                    }}
                    className="w-6 h-6 rounded-full bg-[#2ecc71] hover:bg-[#27ae60] text-white flex items-center justify-center shadow-xs transition-colors"
                    title="View Transaction Logs"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-600 font-medium">SMS Balance</span>
                    <span className="text-sm font-bold text-[#16a085] font-mono">5153</span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-600 font-medium">SMS Used</span>
                    <button
                      onClick={() => {
                        setIsWalletOpen(false);
                        setIsSmsUsageModalOpen(true);
                      }}
                      className="px-2.5 py-0.5 border border-[#2ecc71] text-[#27ae60] hover:bg-emerald-50 rounded-full text-[10px] font-bold uppercase transition-colors"
                    >
                      VIEW
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Updated At</span>
                    <span className="font-mono text-slate-700">{currentTime}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Globe Icon */}
          <button
            onClick={() => alert("Multi-Language Portal selection (English / Hindi)")}
            className="h-full px-3 hover:bg-[#1b242a] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="Language & Portal"
          >
            <Globe className="w-4 h-4 text-slate-300" />
          </button>

          {/* 5. Headphones Help Icon with "HELP" text */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="h-full px-3 hover:bg-[#1b242a] flex flex-col items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="Helpdesk Support"
          >
            <Headphones className="w-4 h-4 text-slate-300" />
            <span className="text-[9px] font-bold leading-none mt-1 text-slate-300">
              HELP
            </span>
          </button>

          {/* 6. Database / Supabase Connection Status Button */}
          <button
            onClick={() => setIsDbModalOpen(true)}
            className="h-full px-3 hover:bg-[#1b242a] flex flex-col items-center justify-center text-slate-300 hover:text-white transition-colors focus:outline-none"
            title="Database Hub (Supabase Cloud PostgreSQL)"
          >
            <Database className="w-4 h-4 text-[#28d4a4]" />
            <span className="text-[9px] font-mono leading-none mt-1 text-[#28d4a4]">
              DB
            </span>
          </button>

          {/* 7. Magnifying Search Icon */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="h-full px-3 hover:bg-[#1b242a] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="Global Quick Search"
          >
            <Search className="w-4 h-4 text-slate-300" />
          </button>

          {/* 7. Big Solid Teal Logout Button (Exact match from screenshot!) */}
          <button
            onClick={() => {
              if (confirm("Are you sure you want to sign out of Schoollog ERP?")) {
                window.location.href = "/login";
              }
            }}
            className="h-full px-4 bg-[#16a085] hover:bg-[#149077] text-white flex items-center justify-center transition-colors"
            title="Sign Out"
          >
            <Power className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Global Search Modal */}
      <Modal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        title="Global ERP Search"
        subtitle="Search across scholars, staff, and modules"
      >
        <div className="space-y-4 text-xs">
          <input
            type="text"
            placeholder="Type student name, mobile or module..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded text-xs"
            autoFocus
          />
          <div className="space-y-1">
            <Link
              href="/search-student"
              onClick={() => setIsSearchOpen(false)}
              className="p-2 block border rounded hover:bg-slate-50 text-slate-800 font-semibold"
            >
              &rarr; 9-Way Student Search
            </Link>
            <Link
              href="/dashboard/admin"
              onClick={() => setIsSearchOpen(false)}
              className="p-2 block border rounded hover:bg-slate-50 text-slate-800 font-semibold"
            >
              &rarr; Admin Dashboard
            </Link>
          </div>
        </div>
      </Modal>

      {/* Help Modal */}
      <Modal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Institutional Support Desk"
        subtitle="Mother Teresa Nobles Academy Dedicated Help"
      >
        <div className="space-y-3 text-xs text-slate-700">
          <p>Direct Relationship Manager: <strong>+91-8448443326</strong></p>
          <p>Technical Escalations: <strong>info@schoollog.in</strong></p>
          <p>AnyDesk Remote Support ID: <strong>Download AnyDesk from footer</strong></p>
        </div>
      </Modal>

      {/* SMS Usage Modal */}
      <Modal
        isOpen={isSmsUsageModalOpen}
        onClose={() => setIsSmsUsageModalOpen(false)}
        title="SMS Transaction Ledger"
        subtitle="Institutional quota usage history"
      >
        <div className="space-y-3 text-xs">
          <div className="flex justify-between p-2 bg-slate-50 border rounded font-mono">
            <span>Balance: 5,153</span>
            <span>Used: 2,844</span>
            <span>Quota: 8,000</span>
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
