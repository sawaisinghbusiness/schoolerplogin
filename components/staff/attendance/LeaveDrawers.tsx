"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { toast } from "@/components/ui/Toaster";
import { LEAVE_TYPES, LeaveList, StaffLeave, leaveDays, shortDate, staffAttendanceService } from "@/lib/services/staffAttendanceService";

const range = (from: string, to: string) => (from === to ? shortDate(from) : `${shortDate(from)} – ${shortDate(to)}`);

function afterApproval(written: number, kept: number) {
  const parts = [];
  if (written) parts.push(`${written} day${written === 1 ? "" : "s"} marked On leave`);
  if (kept) parts.push(`${kept} already marked day${kept === 1 ? "" : "s"} kept`);
  return parts.length ? ` ${parts.join(", ")}.` : "";
}

/** The office writes down a leave someone asked for (on paper or by phone). */
export function RecordLeaveDrawer({ open, staff, today, onClose, onSaved }: { open: boolean; staff: LeaveList["staff"]; today: string; onClose: () => void; onSaved: () => void }) {
  const [staffId, setStaffId] = useState("");
  const [type, setType] = useState("Casual");
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [reason, setReason] = useState("");
  const [approve, setApprove] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStaffId("");
    setType("Casual");
    setFrom(today);
    setTo(today);
    setReason("");
    setApprove(false);
    setError(null);
  }, [open, today]);

  const days = leaveDays(from, to);
  const save = async () => {
    if (!staffId) return setError("Choose the staff member.");
    if (!from || !to || to < from) return setError("Check the dates: the leave ends before it starts.");
    if (!days) return setError("Those dates are all Sundays.");
    if (reason.trim().length < 2) return setError("Write the reason for the leave.");
    setSaving(true);
    setError(null);
    const r = await staffAttendanceService.recordLeave({ staffId, leaveType: type, from, to, reason: reason.trim(), approve });
    setSaving(false);
    if (!r.success) return setError(r.error);
    const who = staff.find((s) => s.id === staffId)?.name || "Leave";
    toast(approve ? `${who}: leave recorded and approved.${afterApproval(r.data.written, r.data.kept)}` : `${who}: leave recorded. Approve it from the list.`, "success");
    onSaved();
    onClose();
  };

  return (
    <SideDrawer
      isOpen={open}
      onClose={onClose}
      busy={saving}
      title="Record leave"
      subtitle="For leave asked on paper or by phone"
      footer={
        <>
          <button type="button" onClick={onClose} disabled={saving} className="btn btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={save} disabled={saving} className="btn btn-primary ml-auto min-w-[140px]">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : approve ? "Record & approve" : "Record leave"}
          </button>
        </>
      }
    >
      <div className="space-y-4 p-5">
        {error && (
          <div className="alert alert-rose">
            <span>{error}</span>
          </div>
        )}
        <div>
          <label className="field-label" htmlFor="lv-staff">
            Staff member
          </label>
          <select id="lv-staff" value={staffId} onChange={(e) => setStaffId(e.target.value)} className="field w-full">
            <option value="">Choose…</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.designation} ({s.empCode})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="lv-type">
            Type of leave
          </label>
          <select id="lv-type" value={type} onChange={(e) => setType(e.target.value)} className="field w-full">
            {LEAVE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="lv-from">
              From
            </label>
            <input
              id="lv-from"
              type="date"
              value={from}
              onChange={(e) => {
                const v = e.target.value;
                setFrom(v);
                if (v && (!to || to < v)) setTo(v);
              }}
              className="field w-full"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="lv-to">
              To
            </label>
            <input id="lv-to" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="field w-full" />
          </div>
        </div>
        <p className="-mt-1 text-[13px] text-slate-500">
          {days ? (
            <>
              <b className="text-slate-800">
                {days} day{days === 1 ? "" : "s"}
              </b>{" "}
              (Sundays not counted)
            </>
          ) : from && to && to >= from ? (
            "Those dates are all Sundays."
          ) : (
            ""
          )}
        </p>
        <div>
          <label className="field-label" htmlFor="lv-reason">
            Reason
          </label>
          <textarea id="lv-reason" value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Sister's wedding at Jodhpur" className="field w-full" />
        </div>
        <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-[13px] text-slate-700">
          <input type="checkbox" checked={approve} onChange={(e) => setApprove(e.target.checked)} className="mt-0.5" />
          <span>
            <b className="font-semibold text-slate-900">Already approved</b>
            <span className="block text-slate-500">Marks these days On leave in staff attendance. Days already marked are not changed.</span>
          </span>
        </label>
      </div>
    </SideDrawer>
  );
}

/** Approve or reject one pending leave, with an optional remark. */
export function DecideLeaveDrawer({ leave, mode, onClose, onSaved }: { leave: StaffLeave | null; mode: "Approved" | "Rejected"; onClose: () => void; onSaved: () => void }) {
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setRemark("");
    setError(null);
  }, [leave, mode]);

  if (!leave) return null;
  const approving = mode === "Approved";
  const go = async () => {
    setSaving(true);
    setError(null);
    const r = await staffAttendanceService.decide(leave.id, mode, remark.trim());
    setSaving(false);
    if (!r.success) return setError(r.error);
    toast(approving ? `${leave.name}: leave approved.${afterApproval(r.data.written, r.data.kept)}` : `${leave.name}: leave rejected.`, approving ? "success" : "info");
    onSaved();
    onClose();
  };

  return (
    <SideDrawer
      isOpen={!!leave}
      onClose={onClose}
      busy={saving}
      width="max-w-[460px]"
      title={approving ? "Approve leave" : "Reject leave"}
      subtitle={`${leave.name} · ${leave.designation || leave.empCode}`}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={saving} className="btn btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={go} disabled={saving} className={`btn ml-auto min-w-[130px] ${approving ? "btn-primary" : "btn-danger"}`}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : approving ? "Approve" : "Reject"}
          </button>
        </>
      }
    >
      <div className="space-y-4 p-5">
        {error && (
          <div className="alert alert-rose">
            <span>{error}</span>
          </div>
        )}
        <dl className="card divide-y divide-slate-100 text-[13px]">
          {[
            ["Type", `${leave.leaveType} leave`],
            ["Dates", range(leave.from, leave.to)],
            ["Days", `${leave.days} (Sundays not counted)`],
            ["Reason", leave.reason],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-3 px-4 py-2.5">
              <dt className="w-16 shrink-0 text-slate-500">{k}</dt>
              <dd className="min-w-0 flex-1 break-words font-medium text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>
        {approving && <p className="text-[13px] text-slate-600">Days of this leave that have no attendance yet will be marked On leave (not Sundays or school holidays). Days already marked Present or Absent stay as they are.</p>}
        <div>
          <label className="field-label" htmlFor="lv-remark">
            Remark <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input id="lv-remark" value={remark} maxLength={300} onChange={(e) => setRemark(e.target.value)} placeholder={approving ? "e.g. Arrange substitute for 7th-A" : "e.g. Exams that week"} className="field w-full" />
        </div>
      </div>
    </SideDrawer>
  );
}
