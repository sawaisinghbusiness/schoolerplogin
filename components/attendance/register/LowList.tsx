"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { LowReport, lowAttendanceMessage, whatsappLink } from "@/lib/services/attendanceRegisterService";
import { Meter } from "./RegisterGrid";

/** School-wide students below the threshold for the month, lowest first, with a WhatsApp nudge to the parent. */
export function LowList({ report, highlight }: { report: LowReport; highlight?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead className="table-head">
          <tr className="[&>th]:whitespace-nowrap">
            <th className="px-4 py-2.5 text-left">Student</th>
            <th className="hidden px-3 py-2.5 text-left lg:table-cell">Parent</th>
            <th className="px-3 py-2.5 text-right" title="Days this student was marked">
              Days
            </th>
            <th className="px-3 py-2.5 text-right">Absent</th>
            <th className="px-3 py-2.5 text-right">Leave</th>
            <th className="px-3 py-2.5 text-right">Attendance</th>
            <th className="px-4 py-2.5 text-right">
              <span className="sr-only">Remind</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {report.students.map((s) => {
            const wa = whatsappLink(s.mobile, lowAttendanceMessage(s));
            return (
              <tr key={s.id} className={highlight === s.classSec ? "bg-brand-50/40" : ""}>
                <td className="px-4 py-2">
                  <span className="block whitespace-nowrap font-semibold text-slate-900">{s.name}</span>
                  <span className="block whitespace-nowrap text-xs text-slate-500">
                    {s.classSec}
                    {s.rollNo ? ` · Roll ${s.rollNo}` : ""}
                  </span>
                </td>
                <td className="hidden px-3 py-2 lg:table-cell">
                  <span className="block whitespace-nowrap text-slate-700">{s.fatherName || "—"}</span>
                  {s.mobile ? (
                    <a href={`tel:${s.mobile}`} className="block whitespace-nowrap text-xs tabular-nums text-slate-500 hover:text-brand-700 hover:underline">
                      {s.mobile}
                    </a>
                  ) : null}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-slate-700">{s.workingDays}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums text-rose-700">{s.absent}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-marigold-700">{s.leave || <span className="text-slate-400">0</span>}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <Meter percent={s.percent} half={s.half} below={report.below} />
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-right">
                  {wa ? (
                    <a href={wa} target="_blank" rel="noreferrer" title={`WhatsApp ${s.fatherName || "the parent"} · ${s.mobile}`} aria-label={`WhatsApp ${s.name}'s parent`} className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700">
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  ) : (
                    <span className="inline-flex p-2 text-slate-200" title="No valid mobile number">
                      <MessageCircle className="h-4 w-4" />
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
