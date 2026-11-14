import React from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { PLANNED } from "@/lib/roadmap";

/**
 * Honest placeholder for a planned screen: what it will do and when,
 * instead of a page full of sample data.
 */
export function ComingSoon({ route }: { route: string }) {
  const p = PLANNED[route];
  if (!p) return null;

  return (
    <div className="space-y-6 pb-12">
      <header className="page-header">
        <h1 className="page-title">{p.title}</h1>
        <p className="page-subtitle">{p.summary}</p>
      </header>

      <section className="card max-w-3xl overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Clock className="h-[18px] w-[18px]" />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-slate-900">Not available yet</p>
            <p className="text-[13px] text-slate-500">This module is planned and is not available for school work yet.</p>
          </div>
        </div>
        <details className="px-6 py-4">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">Planned capabilities</summary>
          <ul className="mt-3 space-y-2.5">
            {p.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                {f}
              </li>
            ))}
          </ul>
        </details>
        {p.meanwhile && p.meanwhile.length > 0 && (
          <div className="border-t border-slate-100 px-6 py-4">
            <p className="text-[13px] font-medium text-slate-500">Available today</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {p.meanwhile.map((m) => (
                <Link key={m.href} href={m.href} className="btn btn-secondary btn-sm">
                  {m.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
