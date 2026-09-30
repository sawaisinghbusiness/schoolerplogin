"use client";

import React, { useId } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

type Tone = "jade" | "sky" | "marigold" | "violet";

const TONES: Record<Tone, { tile: string; stroke: string; fill: string }> = {
  jade: { tile: "bg-emerald-50 text-emerald-700 ring-emerald-100", stroke: "#089173", fill: "#12B28C" },
  sky: { tile: "bg-sky-50 text-sky-700 ring-sky-100", stroke: "#0284C7", fill: "#0EA5E9" },
  marigold: { tile: "bg-marigold-50 text-marigold-700 ring-marigold-100", stroke: "#D67C07", fill: "#F2A516" },
  violet: { tile: "bg-violet-50 text-violet-700 ring-violet-100", stroke: "#6D5BD0", fill: "#8B7BE8" },
};

interface KpiCardProps {
  label: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  tone?: Tone;
  delta?: { value: string; up: boolean };
  trend?: number[];
  href?: string;
}

/** Single-series sparkline; the card label names the series, so no legend is needed. */
function Sparkline({ data, stroke, fill, label }: { data: number[]; stroke: string; fill: string; label: string }) {
  const id = useId().replace(/:/g, "");
  const w = 120;
  const h = 40;
  const pad = 4;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => [
    pad + (i * (w - pad * 2)) / (data.length - 1),
    h - pad - ((v - min) / span) * (h - pad * 2),
  ]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${h} L${pts[0][0]},${h} Z`;
  const [ex, ey] = pts[pts.length - 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 min-w-0 max-w-[104px] flex-1 overflow-visible" role="img" aria-label={label}>
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.28" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g-${id})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={ex} cy={ey} r="4" fill={stroke} stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

export function KpiCard({ label, value, caption, icon: Icon, tone = "jade", delta, trend, href }: KpiCardProps) {
  const t = TONES[tone];

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${t.tile}`}>
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </span>
        {delta && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11.5px] font-semibold ring-1 ${
              delta.up ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-rose-50 text-rose-700 ring-rose-100"
            }`}
          >
            {delta.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {delta.value}
          </span>
        )}
      </div>

      <p className="mt-4 truncate text-[13px] font-medium text-slate-500">{label}</p>
      <div className="mt-1.5 flex items-end justify-between gap-3">
        <p className="shrink-0 text-[1.75rem] font-bold leading-none tracking-tight text-slate-900 tabular-nums">{value}</p>
        {trend && trend.length > 1 && (
          <Sparkline data={trend} stroke={t.stroke} fill={t.fill} label={`${label} trend over the last ${trend.length} periods`} />
        )}
      </div>

      <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">{caption}</p>
    </>
  );

  const cls = "group block rounded-2xl bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover";

  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
