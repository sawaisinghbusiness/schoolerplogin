"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CalendarOff, Check, Phone, RefreshCw, X } from "lucide-react";
import { api } from "@/lib/apiClient";
import { toast } from "@/components/ui/Toaster";

/**
 * Leave applications parents send from the parent app. Admin and teachers approve or reject;
 * approving only records the answer, attendance is still marked as usual.
 */

type Status = "pending" | "approved" | "rejected";
interface LeaveRequest {
  id: string;
  studentId: string;
  name: string;
  classSec: string;
  rollNo: string;
  fatherName: string;
  parentPhone: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: Status;
  decidedBy: string | null;
  decidedAt: string | null;
  createdAt: string;
}
interface ListResult {
  setupNeeded: boolean;
  pending: number;
  data: LeaveRequest[];
  error?: string;
}
type Filter = "pending" | "decided";

const BADGE: Record<Status, string> = { pending: "badge-amber", approved: "badge-emerald", rejected: "badge-rose" };
const LABEL: Record<Status, string> = { pending: "Waiting", approved: "Approved", rejected: "Rejected" };

const day = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const dayLong = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
const range = (r: LeaveRequest) => (r.from === r.to ? dayLong(r.from) : `${day(r.from)} – ${day(r.to)}`);
const sentAgo = (iso: string) => {
  const mins = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (mins < 60) return `${Math.max(1, mins)} min ago`;
  if (mins < 24 * 60) return `${Math.round(mins / 60)} h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};
const phone = (p: string) => (p.length === 10 ? `${p.slice(0, 5)} ${p.slice(5)}` : p);

export default function LeaveRequestsPage() {
  const [filter, setFilter] = useState<Filter>("pending");
  const [res, setRes] = useState<ListResult | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    try {
      setRole(localStorage.getItem("schooldesk_user_role") || "");
    } catch {
      /* display only */
    }
  }, []);

  const load = useCallback(async () => {
    setRes(null);
    const r = await api.get<ListResult>(`/api/leave-requests?filter=${filter}`);
    if (!r.ok) toast(r.error || "Could not load leave requests.", "error");
    setRes(r.data && Array.isArray(r.data.data) ? r.data : { setupNeeded: false, pending: 0, data: [] });
  }, [filter]);
  useEffect(() => {
    load();
  }, [load]);

  const canDecide = role === "admin" || role === "teacher";

  const decide = async (r: LeaveRequest, status: "approved" | "rejected") => {
    setBusy(r.id + status);
    const out = await api.post<{ success: boolean; error?: string }>(`/api/leave-requests/${r.id}/decide`, { status });
    setBusy(null);
    if (!out.ok || !out.data?.success) {
      toast(out.data?.error || out.error || "Could not save.", "error");
      load();
      return;
    }
    toast(`${r.name}: leave ${status}.`, "success");
    setRes((cur) => (cur ? { ...cur, pending: Math.max(0, cur.pending - 1), data: cur.data.filter((x) => x.id !== r.id) } : cur));
  };

  if (res?.setupNeeded) {
    return (
      <div className="card mx-auto mt-6 max-w-lg p-8 text-center">
        <CalendarOff className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-3 font-semibold text-slate-900">Leave requests need a one-time database setup</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Run sms backend/supabase/migrations/20261006_parent_app.sql in the Supabase SQL editor.</p>
        <button type="button" onClick={load} className="btn btn-secondary btn-sm mt-4">
          <RefreshCw className="h-4 w-4" />
          Check again
        </button>
      </div>
    );
  }

  const Actions = ({ r, wide }: { r: LeaveRequest; wide?: boolean }) =>
    canDecide ? (
      <div className={`flex gap-2 ${wide ? "w-full" : ""}`}>
        <button type="button" disabled={!!busy} onClick={() => decide(r, "approved")} className={`btn btn-secondary btn-sm min-h-[40px] ${wide ? "flex-1 min-h-[44px]" : ""}`}>
          <Check className="h-4 w-4 text-emerald-600" />
          {busy === r.id + "approved" ? "Saving…" : "Approve"}
        </button>
        <button type="button" disabled={!!busy} onClick={() => decide(r, "rejected")} className={`btn btn-secondary btn-sm min-h-[40px] ${wide ? "flex-1 min-h-[44px]" : ""}`}>
          <X className="h-4 w-4 text-rose-600" />
          {busy === r.id + "rejected" ? "Saving…" : "Reject"}
        </button>
      </div>
    ) : null;

  const list = res?.data || [];

  return (
    <div className="space-y-5 pb-12">
      <header className="page-header">
        <div>
          <h1 className="page-title">Leave requests</h1>
          <p className="page-subtitle">Sent by parents from the parent app. Approving does not mark attendance; mark the day as Leave in the register as usual.</p>
        </div>
        <button type="button" onClick={load} aria-label="Refresh" className="btn btn-secondary min-h-[44px] min-w-[44px]">
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </header>

      <div className="flex w-fit gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Show">
        {(
          [
            ["pending", "Waiting"],
            ["decided", "Answered"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={filter === k}
            onClick={() => setFilter(k)}
            className={`flex min-h-[40px] items-center gap-2 rounded-lg px-4 text-[13px] font-semibold transition ${filter === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            {label}
            {k === "pending" && res && res.pending > 0 && <span className="tabular-nums text-slate-500">{res.pending}</span>}
          </button>
        ))}
      </div>

      {!res ? (
        <div className="card space-y-3 p-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-14 w-full" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <CalendarOff className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-800">{filter === "pending" ? "No leave requests waiting" : "No answered leave requests yet"}</p>
          <p className="mt-1 text-sm text-slate-500">Parents apply for leave from the parent app.</p>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="card hidden overflow-hidden sm:block">
            <table className="w-full text-sm">
              <thead className="table-head">
                <tr>
                  <th className="px-5 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Dates</th>
                  <th className="px-4 py-3 text-left">Reason</th>
                  <th className="px-4 py-3 text-left">Parent</th>
                  <th className="px-5 py-3 text-right">{filter === "pending" ? "" : "Answer"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((r) => (
                  <tr key={r.id} className="align-top">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{r.name}</div>
                      <div className="text-[13px] text-slate-500">
                        {r.classSec}
                        {r.rollNo ? ` · Roll ${r.rollNo}` : ""}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="font-semibold tabular-nums text-slate-900">{range(r)}</div>
                      <div className="text-[13px] text-slate-500">
                        {r.days} {r.days === 1 ? "day" : "days"} · sent {sentAgo(r.createdAt)}
                      </div>
                    </td>
                    <td className="max-w-[320px] px-4 py-3.5 text-slate-700">
                      <p className="whitespace-pre-line break-words">{r.reason}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      {r.fatherName && <div className="text-slate-700">{r.fatherName}</div>}
                      {r.parentPhone && (
                        <a href={`tel:${r.parentPhone}`} className="text-[13px] font-medium tabular-nums text-brand-700 hover:underline">
                          {phone(r.parentPhone)}
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {r.status === "pending" ? (
                        <div className="flex justify-end">
                          <Actions r={r} />
                        </div>
                      ) : (
                        <>
                          <span className={`badge ${BADGE[r.status]}`}>{LABEL[r.status]}</span>
                          {r.decidedBy && <div className="mt-1 text-[12px] text-slate-500">{r.decidedBy}{r.decidedAt ? ` · ${day(r.decidedAt.slice(0, 10))}` : ""}</div>}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phone */}
          <ul className="card divide-y divide-slate-100 overflow-hidden sm:hidden">
            {list.map((r) => (
              <li key={r.id} className="space-y-2 px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="m-row-main">
                    <span className="m-row-title">{r.name}</span>
                    <span className="m-row-meta">
                      {r.classSec}
                      {r.rollNo ? ` · Roll ${r.rollNo}` : ""}
                    </span>
                  </span>
                  <span className="m-row-value">
                    {range(r)}
                    <span className="block text-xs font-medium text-slate-500">
                      {r.days} {r.days === 1 ? "day" : "days"}
                    </span>
                  </span>
                </div>
                <p className="whitespace-pre-line break-words text-sm text-slate-700">{r.reason}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-slate-500">
                  {r.parentPhone && (
                    <a href={`tel:${r.parentPhone}`} className="inline-flex min-h-[32px] items-center gap-1 font-medium tabular-nums text-brand-700">
                      <Phone className="h-3.5 w-3.5" />
                      {phone(r.parentPhone)}
                    </a>
                  )}
                  <span>sent {sentAgo(r.createdAt)}</span>
                  {r.status !== "pending" && (
                    <>
                      <span className={`badge ${BADGE[r.status]}`}>{LABEL[r.status]}</span>
                      {r.decidedBy && <span>{r.decidedBy}</span>}
                    </>
                  )}
                </div>
                {r.status === "pending" && <Actions r={r} wide />}
              </li>
            ))}
          </ul>
        </>
      )}

      {res && !canDecide && filter === "pending" && list.length > 0 && <p className="text-sm text-slate-500">Only the admin and teachers can approve or reject leave.</p>}
    </div>
  );
}
