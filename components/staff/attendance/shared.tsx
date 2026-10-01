"use client";

import React from "react";
import { RefreshCw, UserCheck } from "lucide-react";
import type { Mark, StaffAttStatus } from "@/lib/services/staffAttendanceService";

export const STATUS: { key: StaffAttStatus; short: Mark; label: string; on: string }[] = [
  { key: "Present", short: "P", label: "Present", on: "bg-emerald-600 text-white" },
  { key: "Absent", short: "A", label: "Absent", on: "bg-rose-600 text-white" },
  { key: "On Leave", short: "L", label: "On leave", on: "bg-marigold-400 text-night-950" },
  { key: "Half Day", short: "H", label: "Half day", on: "bg-sky-600 text-white" },
];

export const MARK_STYLE: Record<Mark, string> = {
  P: "text-emerald-600 font-medium",
  A: "rounded bg-rose-50 text-rose-700 font-bold",
  L: "text-marigold-700 font-semibold",
  H: "text-sky-700 font-semibold",
};
export const MARK_NAME: Record<Mark, string> = { P: "Present", A: "Absent", L: "On leave", H: "Half day" };

/** Shown by every tab until 20261002_staff.sql has been run. */
export function SetupNeeded({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="card p-8 text-center">
      <UserCheck className="mx-auto h-8 w-8 text-slate-300" />
      <p className="mt-3 font-semibold text-slate-900">Staff attendance needs a one-time database setup</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Run sms backend/supabase/migrations/20261002_staff.sql in the Supabase SQL editor.</p>
      <button type="button" onClick={onRetry} className="btn btn-secondary btn-sm mt-4">
        <RefreshCw className="h-4 w-4" />
        Check again
      </button>
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="px-6 py-12 text-center text-sm">
      <p className="text-rose-700">{message}</p>
      <button type="button" onClick={onRetry} className="btn btn-secondary btn-sm mt-3">
        Try again
      </button>
    </div>
  );
}

export function Rows({ n = 8, h = "h-11" }: { n?: number; h?: string }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className={`skeleton ${h} w-full`} />
      ))}
    </div>
  );
}
