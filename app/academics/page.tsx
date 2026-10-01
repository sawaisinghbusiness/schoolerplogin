"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { INK, PageBanner, SiteShell } from "@/components/site/SiteShell";
import { PublicClass, usePublicSite } from "@/components/site/usePublicSite";
import { STAGES, plural } from "@/components/site/stages";

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
/** "9th" → "Class IX"; "LKG" stays. */
const className = (n: string) => {
  const m = n.match(/^(\d{1,2})(st|nd|rd|th)?$/i);
  return m && ROMAN[+m[1]] ? `Class ${ROMAN[+m[1]]}` : n;
};

function StageBlock({ index, stage, classes }: { index: number; stage: (typeof STAGES)[number]; classes: PublicClass[] }) {
  const withSubjects = classes.some((c) => c.subjects.length);
  return (
    <section className="grid gap-6 border-t border-slate-200 py-12 first:border-t-0 md:grid-cols-[17rem_1fr] md:gap-12" aria-labelledby={`stage-${index}`}>
      <div>
        <span className="font-display text-[22px] font-semibold tabular-nums text-slate-300">{String(index + 1).padStart(2, "0")}</span>
        <h2 id={`stage-${index}`} className="mt-1 font-display text-[28px] font-semibold leading-tight" style={{ color: INK }}>{stage.wing}</h2>
        <p className="mt-1 text-[14px] text-slate-500">{stage.range} · {stage.ages}</p>
      </div>
      {classes.length === 0 ? (
        <p className="self-center text-[15px] text-slate-500">{stage.range}.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[15px]">
            <thead className="border-b border-slate-200 text-left text-[13px] text-slate-500">
              <tr>
                <th className="py-2.5 pr-4 font-semibold">Class</th>
                <th className="py-2.5 pr-4 font-semibold">Sections</th>
                {withSubjects && <th className="py-2.5 font-semibold">Subjects</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classes.map((c) => (
                <tr key={c.name} className="align-top">
                  <td className="whitespace-nowrap py-3.5 pr-4 font-semibold text-slate-900">{className(c.name)}</td>
                  <td className="py-3.5 pr-4 text-slate-600">{c.sections.length ? c.sections.join(", ") : "—"}</td>
                  {withSubjects && <td className="py-3.5 text-slate-600">{c.subjects.join(", ") || "—"}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function AcademicsPage() {
  const { site, signedIn } = usePublicSite();
  const { school, classes, stats } = site;
  return (
    <SiteShell
      site={site}
      signedIn={signedIn}
      banner={
        <PageBanner
          crumb="Academics"
          title="Academics"
          lead={`${school.name} follows the ${school.board || "CBSE"} curriculum from Pre-Nursery to Class XII${stats.sections ? `, in ${plural(stats.sections, "section")} this session` : ""}. Here is every class we run, stage by stage.`}
        />
      }
    >
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-4 sm:px-8">
        {STAGES.map((s, i) => (
          <StageBlock key={s.wing} index={i} stage={s} classes={classes.filter((c) => c.wing === s.wing)} />
        ))}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-10">
          <p className="font-display text-[22px] font-semibold" style={{ color: INK }}>Looking for a seat in one of these classes?</p>
          <Link href="/admission" className="inline-flex h-12 items-center gap-2 rounded-lg px-6 text-[15px] font-semibold text-white transition hover:brightness-110" style={{ background: INK }}>
            How to apply
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
