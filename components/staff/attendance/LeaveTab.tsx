"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { LeaveList, LeaveStatus, StaffLeave, clock, firstName, shortDate, staffAttendanceService } from "@/lib/services/staffAttendanceService";
import { ErrorBox, Rows, SetupNeeded } from "./shared";
import { DecideLeaveDrawer, RecordLeaveDrawer } from "./LeaveDrawers";

type Filter = "all" | LeaveStatus;
const BADGE: Record<LeaveStatus, string> = { Pending: "badge-slate", Approved: "badge-amber", Rejected: "badge-rose" };
const range = (from: string, to: string) => (from === to ? shortDate(from) : `${shortDate(from)} – ${shortDate(to)}`);
const year = (d: string) => d.slice(0, 4);

export function LeaveTab({ canWrite, onPending }: { canWrite: boolean; onPending: (n: number) => void }) {
  const [list, setList] = useState<LeaveList | null>(null);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [recording, setRecording] = useState(false);
  const [deciding, setDeciding] = useState<{ leave: StaffLeave; mode: "Approved" | "Rejected" } | null>(null);
  const seq = useRef(0);

  const load = useCallback(async () => {
    const mine = ++seq.current;
    setLoading(true);
    const r = await staffAttendanceService.leaves();
    if (mine !== seq.current) return;
    setLoading(false);
    if (r.setupNeeded) return setSetupNeeded(true);
    setSetupNeeded(false);
    if (!r.data) return setError(r.error || "Could not load leave.");
    setError(null);
    setList(r.data);
    onPending(r.data.data.filter((l) => l.status === "Pending").length);
  }, [onPending]);
  useEffect(() => {
    load();
  }, [load]);

  if (setupNeeded) return <SetupNeeded onRetry={load} />;

  const all = list?.data || [];
  const count = (s: LeaveStatus) => all.filter((l) => l.status === s).length;
  const shown = filter === "all" ? all : all.filter((l) => l.status === filter);
  const thisYear = list ? year(list.today) : "";

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 p-3 sm:px-4">
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-lg bg-slate-100 p-0.5" role="tablist" aria-label="Show">
          {(
            [
              ["all", "All"],
              ["Pending", "Pending"],
              ["Approved", "Approved"],
              ["Rejected", "Rejected"],
            ] as [Filter, string][]
          ).map(([k, l]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={filter === k}
              onClick={() => setFilter(k)}
              className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[13px] font-semibold ${filter === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              {l}
              {k !== "all" && list ? <span className="ml-1 tabular-nums text-slate-400">{count(k)}</span> : null}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={load} disabled={loading} className="btn btn-secondary btn-sm px-2" aria-label="Reload">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          {canWrite && (
            <button type="button" onClick={() => setRecording(true)} disabled={!list} className="btn btn-primary btn-sm">
              <Plus className="h-3.5 w-3.5" />
              Record leave
            </button>
          )}
        </div>
      </div>

      {error && !loading ? (
        <ErrorBox message={error} onRetry={load} />
      ) : !list ? (
        <Rows n={5} h="h-14" />
      ) : shown.length === 0 ? (
        <div className="px-6 py-14 text-center text-sm text-slate-500">
          <p>{filter === "all" ? "No staff leave recorded yet." : `No ${filter.toLowerCase()} leave.`}</p>
          {filter === "all" && canWrite && <p className="mt-1">When someone asks for leave, use Record leave.</p>}
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {shown.map((l) => (
            <li key={l.id} className="flex items-start gap-3 px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-semibold text-slate-900">{l.name}</span>
                  <span className="text-xs text-slate-500">{[l.empCode, l.designation].filter(Boolean).join(" · ")}</span>
                </div>
                <div className="mt-0.5 text-[13px] text-slate-700">
                  {l.leaveType} · {range(l.from, l.to)}
                  {year(l.from) !== thisYear ? ` ${year(l.from)}` : ""} ·{" "}
                  <span className="tabular-nums">
                    {l.days} day{l.days === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="mt-0.5 break-words text-[13px] text-slate-500">{l.reason}</p>
                {l.status !== "Pending" && (
                  <p className="mt-0.5 text-xs text-slate-400">
                    {l.status} {l.processedBy ? `by ${firstName(l.processedBy)}` : ""}
                    {l.processedAt ? `, ${clock(l.processedAt)}` : ""}
                    {l.remarks ? ` · “${l.remarks}”` : ""}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className={`badge ${BADGE[l.status]}`}>{l.status}</span>
                {l.status === "Pending" && canWrite && (
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => setDeciding({ leave: l, mode: "Rejected" })} className="btn btn-secondary btn-sm">
                      Reject
                    </button>
                    <button type="button" onClick={() => setDeciding({ leave: l, mode: "Approved" })} className="btn btn-primary btn-sm">
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {list && <RecordLeaveDrawer open={recording} staff={list.staff} today={list.today} onClose={() => setRecording(false)} onSaved={load} />}
      <DecideLeaveDrawer leave={deciding?.leave || null} mode={deciding?.mode || "Approved"} onClose={() => setDeciding(null)} onSaved={load} />
    </section>
  );
}
