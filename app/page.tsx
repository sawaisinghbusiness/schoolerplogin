"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { INK, INK_DEEP, MARIGOLD, SiteShell } from "@/components/site/SiteShell";
import { PublicClass, usePublicSite } from "@/components/site/usePublicSite";
import { STAGES, plural } from "@/components/site/stages";

/** Hand-drawn marigold stroke under a word in the headline. */
function Swash() {
  return (
    <svg aria-hidden viewBox="0 0 300 18" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full">
      <path d="M3 13 C 70 4, 150 3, 297 8" fill="none" stroke={MARIGOLD} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function Hero({ phone }: { phone?: string }) {
  return (
    <div className="mx-auto grid max-w-7xl items-end gap-8 px-5 sm:px-8 md:grid-cols-[1.1fr_0.9fr]">
      <div className="pb-6 pt-8 md:pb-24 md:pt-14">
        <p className="flex items-center gap-3 text-[14px] text-slate-600">
          <span aria-hidden className="h-[2px] w-8 rounded-full" style={{ background: MARIGOLD }} />
          CBSE affiliated · Pre-Nursery to Class XII · Barmer
        </p>
        <h1 className="mt-6 font-display text-[2.7rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.2rem]" style={{ color: INK }}>
          Your Child&apos;s{" "}
          <span className="relative inline-block">
            Future
            <Swash />
          </span>
          <br />
          Begins Here
        </h1>
        <p className="mt-7 max-w-md text-[17px] leading-relaxed text-slate-600">
          A CBSE school in Barmer where children join at three and stay until their Class XII board exams. Admissions for 2026–27 are open.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Link href="/admission" className="inline-flex h-12 items-center gap-2 rounded-lg px-6 text-[15px] font-semibold text-white transition hover:brightness-110" style={{ background: INK }}>
            Admission 2026–27
            <ArrowRight className="h-4 w-4" />
          </Link>
          {phone ? (
            <a href={`tel:${phone}`} className="inline-flex items-center gap-2 text-[15px] font-semibold underline-offset-4 hover:underline" style={{ color: INK }}>
              <Phone className="h-4 w-4" />
              {phone}
            </a>
          ) : (
            <Link href="/contact" className="text-[15px] font-semibold underline-offset-4 hover:underline" style={{ color: INK }}>
              Visit the school →
            </Link>
          )}
        </div>
      </div>

      {/* The student in front of a school doorway arch */}
      <div className="relative mx-auto h-[340px] w-[300px] sm:h-[460px] sm:w-[400px] lg:h-[520px] lg:w-[440px]">
        <div className="absolute bottom-0 left-1/2 h-[85%] w-[86%] -translate-x-1/2 rounded-t-full" style={{ background: INK }}>
          <div className="absolute inset-x-3 bottom-0 top-3 rounded-t-full border border-b-0 border-white/25" />
        </div>
        <Image
          src="/images/hero-student.png"
          alt="A St. Paul School student holding her notebooks"
          width={1406}
          height={1422}
          priority
          sizes="(min-width: 1024px) 440px, (min-width: 640px) 400px, 300px"
          className="absolute bottom-0 left-1/2 w-full -translate-x-1/2"
        />
        <div className="absolute left-0 top-[16%] flex h-24 w-24 -rotate-[10deg] items-center justify-center rounded-full text-center shadow-sm sm:h-28 sm:w-28" style={{ background: MARIGOLD, color: INK_DEEP }}>
          <span aria-hidden className="absolute inset-1.5 rounded-full border border-dashed border-white/70" />
          <span className="font-display text-[13px] font-semibold leading-tight sm:text-[15px]">
            Admissions
            <br />
            open
            <br />
            <span className="text-[11px] sm:text-[12px]">2026–27</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function Facts({ loaded, students, classes, sections, board, aff }: { loaded: boolean; students: number; classes: number; sections: number; board: string; aff: string }) {
  const items = [
    { value: students ? students.toLocaleString("en-IN") : "—", label: "students this session" },
    { value: classes ? String(classes) : "—", label: "classes, Pre-Nursery to XII" },
    { value: sections ? String(sections) : "—", label: "sections" },
    { value: board || "CBSE", label: aff ? `Affiliation No. ${aff}` : "affiliated" },
  ];
  return (
    <section aria-label="The school in numbers" className="border-b border-slate-200 bg-white">
      <dl className="mx-auto grid max-w-7xl grid-cols-2 px-5 sm:px-8 md:grid-cols-4">
        {items.map((it, i) => (
          <div key={it.label} className={`py-8 md:px-8 md:py-10 ${i % 2 ? "pl-5" : ""} ${i ? "md:border-l md:border-slate-200" : "md:pl-0"} ${i > 1 ? "border-t border-slate-200 md:border-t-0" : ""}`}>
            <dt className="sr-only">{it.label}</dt>
            <dd>
              <span className={`block font-display text-[40px] font-semibold leading-none tabular-nums sm:text-[46px] ${loaded ? "" : "opacity-30"}`} style={{ color: INK }}>{it.value}</span>
              <span className="mt-2.5 block text-[14px] text-slate-600">{it.label}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Stages({ classes }: { classes: PublicClass[] }) {
  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-[0.85fr_1.15fr] md:py-28" aria-labelledby="stages-title">
      <div>
        <h2 id="stages-title" className="font-display text-[2.2rem] font-semibold leading-[1.1] tracking-tight sm:text-[2.7rem]" style={{ color: INK }}>
          Pre-Nursery to Class XII, under one roof.
        </h2>
        <p className="mt-5 max-w-sm text-[16px] leading-relaxed text-slate-600">Five stages, one school. Your child moves up with friends and teachers who already know them.</p>
        <Link href="/academics" className="mt-7 inline-flex items-center gap-2 text-[15px] font-semibold underline-offset-4 hover:underline" style={{ color: INK }}>
          Classes and subjects
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <ol className="border-t border-slate-200">
        {STAGES.map((s, i) => {
          const secs = classes.filter((c) => c.wing === s.wing).reduce((n, c) => n + c.sections.length, 0);
          return (
            <li key={s.wing} className="grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 border-b border-slate-200 py-5">
              <span className="font-display text-[22px] font-semibold tabular-nums text-slate-300">{String(i + 1).padStart(2, "0")}</span>
              <span>
                <span className="block text-[17px] font-semibold text-slate-900">{s.wing}</span>
                <span className="mt-0.5 block text-[14px] text-slate-500">{s.range}</span>
              </span>
              {secs > 0 && <span className="text-right text-[13px] tabular-nums text-slate-500">{plural(secs, "section")}</span>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function AdmissionBand({ phone }: { phone?: string }) {
  return (
    <section style={{ background: INK }} aria-labelledby="admission-band">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1.25fr_0.75fr] md:py-20">
        <div>
          <span aria-hidden className="block h-[3px] w-12 rounded-full" style={{ background: MARIGOLD }} />
          <h2 id="admission-band" className="mt-6 font-display text-[2.2rem] font-semibold leading-[1.1] tracking-tight text-white sm:text-[2.7rem]">
            Admissions for 2026–27 are open.
          </h2>
          <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-white/75">See the steps and the documents to bring — or call the office and come see the school.</p>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <Link href="/admission" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-[15px] font-semibold transition hover:bg-white/90" style={{ color: INK }}>
            How to apply
            <ArrowRight className="h-4 w-4" />
          </Link>
          {phone && (
            <a href={`tel:${phone}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg px-6 text-[15px] font-semibold text-white ring-1 ring-white/35 transition hover:bg-white/10">
              <Phone className="h-4 w-4" />
              Call {phone}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { site, loaded, signedIn } = usePublicSite();
  const { school, stats } = site;
  return (
    <SiteShell site={site} signedIn={signedIn} banner={<Hero phone={school.phone[0]} />}>
      <Facts loaded={loaded} students={stats.students} classes={stats.classes} sections={stats.sections} board={school.board} aff={school.affiliation_no} />
      <Stages classes={site.classes} />
      <AdmissionBand phone={school.phone[0]} />
    </SiteShell>
  );
}
