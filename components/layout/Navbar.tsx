"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarRange,
  ChevronDown,
  ChevronRight,
  Database,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
} from "lucide-react";
import DatabaseStatusModal from "@/components/database/DatabaseStatusModal";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { SignOutDialog } from "@/components/layout/SignOutDialog";
import { titleForPath } from "@/components/layout/navConfig";
import { useCurrentUser } from "@/components/layout/useCurrentUser";

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const pathname = usePathname();
  const user = useCurrentUser();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [dbOpen, setDbOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { title, section } = titleForPath(pathname);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));

    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
    <header className="relative z-20 flex h-16 shrink-0 select-none items-center gap-3 border-b border-slate-300/40 bg-canvas px-4 sm:px-6 lg:px-8">
      <button
        onClick={onToggleSidebar}
        className="-ml-1 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Where am I */}
      <div className="min-w-0 flex-1">
        {/* The page carries its own big title; this is just the trail. */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13.5px] text-slate-500">
          <Link href="/dashboard" className="hidden hover:text-slate-800 sm:inline">
            Home
          </Link>
          {section !== "Overview" && (
            <>
              <ChevronRight className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
              <span className="truncate">{section}</span>
            </>
          )}
          <ChevronRight className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
          <span className="truncate font-semibold text-slate-900">{title}</span>
        </nav>
      </div>

      {/* Command palette trigger */}
      <button
        onClick={() => setPaletteOpen(true)}
        className="group hidden h-10 w-72 items-center gap-2.5 rounded-xl bg-slate-100/80 px-3 text-left text-sm text-slate-500 ring-1 ring-transparent hover:bg-white hover:ring-slate-200 hover:shadow-sm xl:flex"
      >
        <Search className="h-4 w-4 text-slate-400 group-hover:text-brand-600" />
        <span className="flex-1">Search pages…</span>
        <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-500 shadow-2xs">
          {isMac ? "⌘" : "Ctrl"} K
        </kbd>
      </button>
      <button
        onClick={() => setPaletteOpen(true)}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 xl:hidden"
        aria-label="Search pages"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Academic session */}
      <div className="hidden items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 xl:flex">
        <CalendarRange className="h-4 w-4 text-brand-600" />
        Session 2026–27
      </div>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen((v) => !v)}
          aria-label="Notifications"
          aria-expanded={notifOpen}
          className={`relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 ${notifOpen ? "bg-slate-100 text-slate-900" : ""}`}
        >
          <Bell className="h-[18px] w-[18px]" />
        </button>

        {notifOpen && (
          <div className="absolute right-0 mt-2 w-80 origin-top-right overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5 animate-scaleUp">
            <div className="border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-900">Notifications</div>
            <div className="px-4 py-8 text-center">
              <Bell className="mx-auto h-6 w-6 text-slate-300" />
              <p className="mt-2 text-[13px] font-medium text-slate-700">You&rsquo;re all caught up</p>
              <p className="mt-0.5 text-xs text-slate-500">Cheque clearances and fee alerts will show here.</p>
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setProfileOpen((v) => !v)}
          aria-expanded={profileOpen}
          className={`flex items-center gap-2.5 rounded-xl p-1 pr-1.5 hover:bg-slate-100 ${profileOpen ? "bg-slate-100" : ""}`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-700 text-[12px] font-semibold text-white">
            {user.initials}
          </span>
          <span className="hidden text-left leading-tight lg:block">
            <span className="block max-w-[140px] truncate text-[13px] font-semibold text-slate-900">{user.name}</span>
            <span className="block text-[11.5px] text-slate-500">{user.role}</span>
          </span>
          <ChevronDown
            className={`hidden h-4 w-4 text-slate-400 transition-transform duration-200 lg:block ${profileOpen ? "rotate-180" : ""}`}
          />
        </button>

        {profileOpen && (
          <div className="absolute right-0 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5 animate-scaleUp">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-700 text-sm font-semibold text-white">
                {user.initials}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-slate-900">{user.name}</div>
                <div className="text-xs font-medium text-brand-700">{user.role}</div>
              </div>
            </div>
            <div className="py-1.5">
              {[
                { href: "/settings/users", icon: User, label: "My profile" },
                { href: "/settings", icon: Settings, label: "School settings" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <l.icon className="h-4 w-4 text-slate-400" />
                  {l.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setProfileOpen(false);
                  setDbOpen(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                <Database className="h-4 w-4 text-slate-400" />
                Database status
              </button>
            </div>
            <div className="border-t border-slate-100 pt-1.5">
              <button
                onClick={() => {
                  setProfileOpen(false);
                  setSignOutOpen(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

    </header>

    {/* Rendered outside <header>: its backdrop-filter would otherwise trap these fixed overlays. */}
    <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    <SignOutDialog open={signOutOpen} onClose={() => setSignOutOpen(false)} />
    <DatabaseStatusModal isOpen={dbOpen} onClose={() => setDbOpen(false)} />
    </>
  );
}
