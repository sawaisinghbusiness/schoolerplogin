"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Briefcase, Fingerprint } from "lucide-react";
import { STAFF_ATTENDANCE_DATA } from "@/data/mockData";

function StaffTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">
      <div className="text-slate-400">{d.name}</div>
      <div className="mt-0.5 font-mono text-sm font-semibold">
        {d.count} staff · {d.percentage}
      </div>
    </div>
  );
}

export function StaffAttendanceCard() {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  useEffect(() => setMounted(true), []);

  const total = STAFF_ATTENDANCE_DATA.reduce((a, c) => a + c.count, 0);
  const present = STAFF_ATTENDANCE_DATA.find((s) => s.name === "Present")?.count || 0;

  return (
    <section className="flex h-full flex-col rounded-2xl bg-white shadow-card">
      <header className="flex items-start justify-between gap-4 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
            <Briefcase className="h-5 w-5" strokeWidth={1.9} />
          </span>
          <div>
            <h3 className="text-[15px] font-bold text-slate-900">Staff attendance</h3>
            <p className="mt-0.5 text-xs text-slate-500">Teaching and non-teaching staff</p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11.5px] font-semibold text-slate-700">
          {Math.round((present / total) * 100)}% on duty
        </span>
      </header>

      <div className="flex flex-1 flex-col items-center gap-6 px-5 sm:flex-row sm:px-6">
        <div className="relative h-48 w-48 shrink-0" role="img" aria-label={STAFF_ATTENDANCE_DATA.map((d) => `${d.name} ${d.count}`).join(", ")}>
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={STAFF_ATTENDANCE_DATA}
                  dataKey="value"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={2}
                  cornerRadius={2}
                  stroke="#fff"
                  strokeWidth={2}
                  startAngle={90}
                  endAngle={-270}
                  onMouseEnter={(_, i) => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  animationDuration={900}
                >
                  {STAFF_ATTENDANCE_DATA.map((entry, i) => (
                    <Cell key={entry.name} fill={entry.color} opacity={active === null || active === i ? 1 : 0.35} />
                  ))}
                </Pie>
                <Tooltip content={<StaffTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="skeleton h-full w-full rounded-full" />
          )}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tracking-tight tabular-nums text-slate-900">
              {present}
              <span className="text-lg text-slate-400">/{total}</span>
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">on duty</span>
          </div>
        </div>

        <ul className="w-full space-y-1.5">
          {STAFF_ATTENDANCE_DATA.map((item, i) => (
            <li
              key={item.name}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm ${active === i ? "bg-slate-50" : ""}`}
            >
              <span className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-medium text-slate-700">{item.name}</span>
              </span>
              <span className="flex items-baseline gap-2">
                <span className="font-mono font-bold text-slate-900">{item.count}</span>
                <span className="w-12 text-right font-mono text-xs text-slate-400">{item.percentage}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <footer className="mt-5 flex items-center justify-between border-t border-slate-100 px-5 py-3.5 sm:px-6">
        <span className="flex items-center gap-2 text-xs text-slate-500">
          <Fingerprint className="h-4 w-4 text-emerald-600" />
          Main gate biometric online
        </span>
        <Link href="/staff/attendance" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
          Staff roster
        </Link>
      </footer>
    </section>
  );
}
