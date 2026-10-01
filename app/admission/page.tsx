"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { INK, MARIGOLD, PageBanner, SiteShell } from "@/components/site/SiteShell";
import { usePublicSite } from "@/components/site/usePublicSite";

const STEPS = [
  { title: "Enquire", text: "Visit the school office or call us with your child's name, age and the class you are looking for." },
  { title: "Meet the school", text: "A short, friendly interaction with your child, so we can confirm the right class and a seat." },
  { title: "Documents", text: "Submit the documents below and complete the admission at the office. You get your child's admission number the same day." },
];

const DOCUMENTS = [
  "Birth certificate of the child",
  "Aadhaar card of the child and parents",
  "Four recent passport-size photographs",
  "Transfer certificate from the previous school (Class II onwards)",
  "Last report card (Class II onwards)",
  "Category or caste certificate, if applicable",
];

function Block({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="grid scroll-mt-8 gap-6 border-t border-slate-200 py-12 first:border-t-0 md:grid-cols-[17rem_1fr] md:gap-12" aria-label={title}>
      <h2 className="font-display text-[28px] font-semibold leading-tight" style={{ color: INK }}>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

export default function AdmissionPage() {
  const { site, signedIn } = usePublicSite();
  const phone = site.school.phone[0];
  return (
    <SiteShell
      site={site}
      signedIn={signedIn}
      banner={<PageBanner crumb="Admission" title="Admission 2026–27" lead="Admissions are open for Pre-Nursery to Class XII, subject to seats in each class. Here is how it works and what to bring." />}
    >
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-4 sm:px-8">
        <Block title="How to apply">
          <ol className="grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="font-display text-[34px] font-semibold leading-none" style={{ color: MARIGOLD }}>{i + 1}</span>
                <p className="mt-3 text-[17px] font-semibold text-slate-900">{s.title}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">{s.text}</p>
              </li>
            ))}
          </ol>
        </Block>

        <Block title="Documents to bring">
          <ul className="grid gap-x-10 gap-y-3 text-[15px] text-slate-700 sm:grid-cols-2">
            {DOCUMENTS.map((d) => (
              <li key={d} className="flex gap-3">
                <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: INK }} />
                {d}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[14px] text-slate-500">Bring the originals along with one photocopy of each.</p>
        </Block>

        <Block title="RTE admissions">
          <p className="max-w-2xl text-[15px] leading-relaxed text-slate-600">
            Seats reserved under the Right to Education Act in the entry classes are filled through the Government of Rajasthan&apos;s RTE admission portal, by lottery. Parents apply on the portal, not at the school.
          </p>
        </Block>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-8 text-white sm:px-10" style={{ background: INK }}>
          <p className="font-display text-[24px] font-semibold">Questions about a seat? Talk to the office.</p>
          {phone ? (
            <a href={`tel:${phone}`} className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-[15px] font-semibold transition hover:bg-white/90" style={{ color: INK }}>
              <Phone className="h-4 w-4" />
              Call {phone}
            </a>
          ) : (
            <Link href="/contact" className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-[15px] font-semibold transition hover:bg-white/90" style={{ color: INK }}>
              Contact the school
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
