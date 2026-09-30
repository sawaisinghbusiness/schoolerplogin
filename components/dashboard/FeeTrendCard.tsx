"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight } from "lucide-react";

// Monthly collections for the session, in lakh rupees (sample figures).
const FEE_TREND = [
  { month: "Apr", lakh: 52.1 },
  { month: "May", lakh: 18.4 },
  { month: "Jun", lakh: 9.8 },
  { month: "Jul", lakh: 41.2 },
  { month: "Aug", lakh: 33.67 },
  { month: "Sep", lakh: 38.45 },
];

const TOTAL = FEE_TREND.reduce((s, m) => s + m.lakh, 0);

function FeeTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">
      <div className="text-slate-400">{label} 2026</div>
      <div className="mt-0.5 font-mono text-sm font-semibold">₹{Number(payload[0].value).toFixed(2)} L</div>
    </div>
  );
}

// Emphasise only the latest month.
function EndDot(props: any) {
  const { cx, cy, index } = props;
  if (index !== FEE_TREND.length - 1) return null;
  return <circle cx={cx} cy={cy} r={5} fill="#089173" stroke="#fff" strokeWidth={2.5} />;
}

export function FeeTrendCard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-bold text-slate-900">Fee collection</h3>
          <p className="mt-0.5 text-xs text-slate-500">Monthly total, session 2026–27 · ₹ lakh</p>
        </div>
        <div className="sm:text-right">
          <p className="text-2xl font-bold tracking-tight tabular-nums text-slate-900">₹{TOTAL.toFixed(2)} L</p>
          <p className="text-xs text-slate-500">collected so far this session</p>
        </div>
      </div>

      <div className="mt-5 h-60 flex-1" role="img" aria-label="Area chart of monthly fee collection from April to September 2026">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={FEE_TREND} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="feeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#12B28C" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#12B28C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#EFF1F6" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#687389", fontSize: 12 }} dy={8} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={44}
                tick={{ fill: "#97A1B6", fontSize: 12 }}
                tickFormatter={(v) => `₹${v}L`}
                domain={[0, 60]}
                ticks={[0, 20, 40, 60]}
              />
              <Tooltip content={<FeeTooltip />} cursor={{ stroke: "#CBD2DF", strokeWidth: 1, strokeDasharray: "4 4" }} />
              <Area
                type="monotone"
                dataKey="lakh"
                stroke="#089173"
                strokeWidth={2}
                fill="url(#feeFill)"
                dot={<EndDot />}
                activeDot={{ r: 5, fill: "#089173", stroke: "#fff", strokeWidth: 2.5 }}
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="skeleton h-full w-full" />
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
        <span className="text-slate-500">
          September is up <span className="font-semibold text-emerald-700">14.2%</span> on August
        </span>
        <Link href="/fees/collect" className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:text-brand-800">
          Open fee counter
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
