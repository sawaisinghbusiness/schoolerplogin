"use client";

import React, { useEffect, useState } from "react";
import { staffAttendanceService } from "@/lib/services/staffAttendanceService";
import { DayTab } from "@/components/staff/attendance/DayTab";
import { RegisterTab } from "@/components/staff/attendance/RegisterTab";
import { LeaveTab } from "@/components/staff/attendance/LeaveTab";

type Tab = "today" | "register" | "leave";
const TABS: [Tab, string][] = [
  ["today", "Today"],
  ["register", "Register"],
  ["leave", "Leave"],
];
const isTab = (v: string | null): v is Tab => v === "today" || v === "register" || v === "leave";

export default function StaffAttendancePage() {
  const [tab, setTab] = useState<Tab>("today");
  const [role, setRole] = useState<string | null>(null);
  const [pending, setPending] = useState<number | null>(null);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (isTab(t)) setTab(t);
    try {
      setRole(localStorage.getItem("schooldesk_user_role") || "");
    } catch {
      /* private window */
    }
    staffAttendanceService.leaves().then((r) => {
      if (r.data) setPending(r.data.data.filter((l) => l.status === "Pending").length);
    });
  }, []);

  const choose = (t: Tab) => {
    setTab(t);
    const u = new URL(window.location.href);
    if (t === "today") u.searchParams.delete("tab");
    else u.searchParams.set("tab", t);
    window.history.replaceState(null, "", u.pathname + u.search);
  };

  const canWrite = role === "admin";

  return (
    <div className="space-y-4 pb-12">
      <header className="page-header">
        <div>
          <h1 className="page-title">Staff attendance & leave</h1>
          <p className="page-subtitle">Mark the whole staff for a day, see the month, and record leave{role !== null && !canWrite ? " · view only" : ""}</p>
        </div>
      </header>

      <div className="flex max-w-full gap-1 self-start overflow-x-auto rounded-xl bg-slate-100 p-1 sm:inline-flex" role="tablist" aria-label="Staff attendance">
        {TABS.map(([k, l]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => choose(k)}
            className={`whitespace-nowrap rounded-lg px-4 py-1.5 text-[13px] font-semibold ${tab === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            {l}
            {k === "leave" && pending ? <span className="ml-1.5 rounded-full bg-marigold-100 px-1.5 text-xs tabular-nums text-marigold-800">{pending} pending</span> : null}
          </button>
        ))}
      </div>

      {tab === "today" && <DayTab canWrite={canWrite} />}
      {tab === "register" && <RegisterTab />}
      {tab === "leave" && <LeaveTab canWrite={canWrite} onPending={setPending} />}
    </div>
  );
}
