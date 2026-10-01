"use client";

import React from "react";
import { INK, PageBanner, SiteShell } from "@/components/site/SiteShell";
import { usePublicSite } from "@/components/site/usePublicSite";

function Table({ title, rows }: { title: string; rows: [string, string][] }) {
  const shown = rows.filter(([, v]) => v);
  if (!shown.length) return null;
  return (
    <section className="grid gap-6 border-t border-slate-200 py-10 first:border-t-0 md:grid-cols-[17rem_1fr] md:gap-12" aria-label={title}>
      <h2 className="font-display text-[24px] font-semibold leading-tight" style={{ color: INK }}>{title}</h2>
      <table className="w-full text-[15px]">
        <tbody className="divide-y divide-slate-100">
          {shown.map(([k, v], i) => (
            <tr key={k}>
              <td className="w-10 py-3 align-top tabular-nums text-slate-400">{i + 1}.</td>
              <th scope="row" className="py-3 pr-6 text-left align-top font-normal text-slate-500">{k}</th>
              <td className="py-3 align-top font-medium text-slate-900">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function DisclosurePage() {
  const { site, signedIn } = usePublicSite();
  const { school, stats } = site;
  return (
    <SiteShell
      site={site}
      signedIn={signedIn}
      banner={<PageBanner crumb="Mandatory Public Disclosure" title="Mandatory Public Disclosure" lead={`Information published as required by the ${school.board || "CBSE"} Affiliation Bye-Laws.`} />}
    >
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-4 sm:px-8">
        <Table
          title="A. General information"
          rows={[
            ["Name of the school", school.name],
            ["Affiliation No.", school.affiliation_no],
            ["School code", school.school_code],
            ["UDISE code", school.udise_code],
            ["Complete address with PIN code", [school.address, school.city, school.district !== school.city ? school.district : "", school.state, school.pincode].filter(Boolean).join(", ")],
            ["Principal's name", school.principal],
            ["School email", school.email],
            ["Contact details", school.phone.join(", ")],
          ]}
        />
        <Table
          title="B. Classes and students"
          rows={[
            ["Classes run", stats.classes ? `${stats.classes} (Pre-Nursery to Class XII)` : ""],
            ["Sections", stats.sections ? String(stats.sections) : ""],
            ["Students enrolled this session", stats.students ? stats.students.toLocaleString("en-IN") : ""],
            ["Teaching staff", stats.teachers ? String(stats.teachers) : ""],
          ]}
        />
      </div>
    </SiteShell>
  );
}
