"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck2, ClipboardList, Home, IndianRupee, LayoutGrid, ReceiptText, Users } from "lucide-react";

type Tab = { href: string; label: string; icon: typeof Home; match: string };

/** Four everyday screens per role; everything else is one tap away under Menu. */
const TABS: Record<string, Tab[]> = {
  admin: [
    { href: "/dashboard", label: "Home", icon: Home, match: "/dashboard" },
    { href: "/students", label: "Students", icon: Users, match: "/students" },
    { href: "/fees/collect", label: "Fees", icon: IndianRupee, match: "/fees" },
    { href: "/attendance/mark", label: "Attendance", icon: CalendarCheck2, match: "/attendance" },
  ],
  accountant: [
    { href: "/dashboard", label: "Home", icon: Home, match: "/dashboard" },
    { href: "/fees/collect", label: "Collect", icon: IndianRupee, match: "/fees/collect" },
    { href: "/fees/dues", label: "Dues", icon: ReceiptText, match: "/fees/dues" },
    { href: "/students", label: "Students", icon: Users, match: "/students" },
  ],
  teacher: [
    { href: "/dashboard", label: "Home", icon: Home, match: "/dashboard" },
    { href: "/attendance/mark", label: "Attendance", icon: CalendarCheck2, match: "/attendance" },
    { href: "/exams/marks", label: "Marks", icon: ClipboardList, match: "/exams" },
    { href: "/students", label: "Students", icon: Users, match: "/students" },
  ],
  exam_cell: [
    { href: "/dashboard", label: "Home", icon: Home, match: "/dashboard" },
    { href: "/exams/marks", label: "Marks", icon: ClipboardList, match: "/exams/marks" },
    { href: "/exams/report-cards", label: "Results", icon: ReceiptText, match: "/exams/report-cards" },
    { href: "/students", label: "Students", icon: Users, match: "/students" },
  ],
};

export function MobileTabBar({ onMenu, menuOpen }: { onMenu: () => void; menuOpen: boolean }) {
  const pathname = usePathname() || "";
  const [role, setRole] = useState("admin");
  useEffect(() => {
    try {
      setRole(localStorage.getItem("schooldesk_user_role") || "admin");
    } catch {
      // keep the default
    }
  }, []);
  const tabs = TABS[role] || TABS.admin;
  const activeTab = tabs
    .filter((t) => pathname === t.match || pathname.startsWith(t.match + "/"))
    .sort((a, b) => b.match.length - a.match.length)[0];

  const item = "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 pt-1.5 text-[11px] font-semibold leading-none";
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden">
      <div className="flex h-14">
        {tabs.map((t) => {
          const on = !menuOpen && activeTab?.href === t.href;
          return (
            <Link key={t.href} href={t.href} aria-current={on ? "page" : undefined} className={`${item} ${on ? "text-brand-700" : "text-slate-500"}`}>
              <span className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${on ? "bg-brand-50" : ""}`}>
                <t.icon className="h-[20px] w-[20px]" strokeWidth={on ? 2.3 : 1.9} />
              </span>
              <span className="truncate">{t.label}</span>
            </Link>
          );
        })}
        <button type="button" onClick={onMenu} aria-expanded={menuOpen} className={`${item} ${menuOpen || !activeTab ? "text-brand-700" : "text-slate-500"}`}>
          <span className={`flex h-7 w-12 items-center justify-center rounded-full ${menuOpen || !activeTab ? "bg-brand-50" : ""}`}>
            <LayoutGrid className="h-[20px] w-[20px]" strokeWidth={1.9} />
          </span>
          <span>Menu</span>
        </button>
      </div>
    </nav>
  );
}
