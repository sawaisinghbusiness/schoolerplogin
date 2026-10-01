"use client";

import React from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { INK, PageBanner, SiteShell } from "@/components/site/SiteShell";
import { placeOf, usePublicSite } from "@/components/site/usePublicSite";

function Row({ icon: Icon, label, children }: { icon: typeof Phone; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 border-b border-slate-200 py-5">
      <Icon className="mt-1 h-5 w-5 shrink-0" style={{ color: INK }} />
      <div>
        <p className="text-[13px] text-slate-500">{label}</p>
        <div className="mt-0.5 text-[16px] font-medium text-slate-900">{children}</div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const { site, signedIn } = usePublicSite();
  const { school } = site;
  const place = placeOf(school);
  const mapQuery = encodeURIComponent([school.name, school.address, school.city, school.state].filter(Boolean).join(", "));
  return (
    <SiteShell site={site} signedIn={signedIn} banner={<PageBanner crumb="Contact" title="Contact the school" lead="Visit us, call the office, or write to us. Admission enquiries are welcome on any working day." />}>
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-12 sm:px-8 md:grid-cols-[0.9fr_1.1fr]">
        <div className="border-t border-slate-200">
          <Row icon={MapPin} label="Address">
            <span className="font-display text-[18px] font-semibold" style={{ color: INK }}>{school.name}</span>
            <br />
            {place}
          </Row>
          {school.phone.length > 0 && (
            <Row icon={Phone} label="Phone">
              {school.phone.map((p) => (
                <a key={p} href={`tel:${p}`} className="block underline-offset-4 hover:underline">{p}</a>
              ))}
            </Row>
          )}
          {school.email && (
            <Row icon={Mail} label="Email">
              <a href={`mailto:${school.email}`} className="underline-offset-4 hover:underline">{school.email}</a>
            </Row>
          )}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-11 items-center rounded-lg px-5 text-[15px] font-semibold text-white transition hover:brightness-110"
            style={{ background: INK }}
          >
            Get directions
          </a>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <iframe
            title={`Map showing ${school.name}`}
            src={`https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed`}
            className="h-[360px] w-full md:h-full md:min-h-[420px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </SiteShell>
  );
}
