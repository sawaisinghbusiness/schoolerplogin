"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogIn, Mail, MapPin, Menu, Phone, X } from "lucide-react";
import { PublicSite, dayLabel, placeOf } from "./usePublicSite";

export const INK = "#183C40"; // school blue: headings, buttons
export const INK_DEEP = "#14282C"; // footer
export const SKY = "#F2F4EE"; // page wash behind the header
export const MARIGOLD = "#B27D3C"; // small accents only

const NAV = [
  { href: "/", label: "Home" },
  { href: "/academics", label: "Academics" },
  { href: "/admission", label: "Admission" },
  { href: "/contact", label: "Contact" },
];

function Crest({ site }: { site: PublicSite }) {
  return site.school.logo_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={site.school.logo_url} alt="" className="h-11 w-11 rounded-full bg-white object-contain p-0.5 ring-1 ring-slate-900/10" />
  ) : (
    <span className="flex h-11 w-11 items-center justify-center rounded-full font-display text-[15px] font-semibold text-white" style={{ background: INK }}>
      {(site.school.short || "SP").slice(0, 3)}
    </span>
  );
}

/** Header (with the doodle wash), optional page banner, page body and footer for every public page. */
export function SiteShell({ site, signedIn, banner, children }: { site: PublicSite; signedIn: boolean; banner?: React.ReactNode; children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const { school } = site;
  const place = placeOf(school);

  return (
    <div className="public-school-site min-h-screen bg-white text-slate-800">
      <div className="relative overflow-hidden" style={{ background: SKY }}>

        {site.events.length > 0 && (
          <div className="relative z-20 text-white" style={{ background: INK }}>
            <div className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-5 py-2 text-[13px] sm:px-8">
              <span className="shrink-0 font-semibold" style={{ color: MARIGOLD }}>Notice</span>
              {site.events.slice(0, 3).map((e) => (
                <span key={e.title + e.start} className="shrink-0 whitespace-nowrap text-white/90">
                  <span className="font-semibold">{e.start === e.end ? dayLabel(e.start, false) : `${dayLabel(e.start, false)} – ${dayLabel(e.end, false)}`}</span> · {e.title}
                  {e.holiday && <span className="text-white/60"> (school closed)</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        <header className="relative z-20 mx-auto flex min-h-[80px] max-w-7xl items-center gap-8 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Crest site={site} />
            <span className="leading-tight">
              <span className="block max-w-[250px] truncate font-display text-[17px] font-semibold sm:text-[19px]" style={{ color: INK }}>{school.name}</span>
              <span className="block text-[11.5px] text-slate-500">{school.city}, {school.state}</span>
            </span>
          </Link>
          <nav className="ml-4 hidden items-center gap-7 text-[14px] font-medium md:flex" aria-label="Main">
            {NAV.map((n) => {
              const on = n.href === pathname;
              return (
                <Link key={n.href} href={n.href} aria-current={on ? "page" : undefined} className={`relative py-1 ${on ? "text-slate-900" : "text-slate-600 hover:text-slate-900"}`}>
                  {n.label}
                  {on && <span aria-hidden className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full" style={{ background: MARIGOLD }} />}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link href={signedIn ? "/dashboard" : "/login"} className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition hover:brightness-110" style={{ background: INK }}>
              {signedIn ? <LayoutDashboard className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              {signedIn ? "Dashboard" : "Login"}
            </Link>
            <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu" aria-expanded={menuOpen} className="rounded-lg p-2 text-slate-700 hover:bg-white/70 md:hidden">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>
        {menuOpen && (
          <nav className="relative z-20 mx-5 mb-3 rounded-xl bg-white p-2 shadow-lg md:hidden" aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setMenuOpen(false)} className={`block rounded-lg px-3 py-2.5 text-[15px] font-medium ${n.href === pathname ? "bg-slate-50 text-slate-900" : "text-slate-700"}`}>
                {n.label}
              </Link>
            ))}
          </nav>
        )}

        {banner && <div className="relative z-10">{banner}</div>}
      </div>

      <main>{children}</main>

      <footer className="text-white" style={{ background: INK_DEEP }}>
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.3fr_1fr_0.8fr]">
          <div>
            <p className="font-display text-2xl font-semibold">{school.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              {school.board ? `Affiliated to ${school.board}` : ""}
              {school.affiliation_no ? `, Affiliation No. ${school.affiliation_no}` : ""}
              {school.school_code ? ` · School code ${school.school_code}` : ""}
            </p>
          </div>
          <ul className="space-y-3 text-sm text-white/85">
            {place && <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />{place}</li>}
            {school.phone.map((p) => (
              <li key={p} className="flex gap-2.5"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/50" /><a href={`tel:${p}`} className="hover:underline">{p}</a></li>
            ))}
            {school.email && <li className="flex gap-2.5"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/50" /><a href={`mailto:${school.email}`} className="hover:underline">{school.email}</a></li>}
          </ul>
          <ul className="space-y-2.5 text-sm">
            {NAV.slice(1).map((n) => (
              <li key={n.href}><Link href={n.href} className="text-white/85 hover:text-white hover:underline">{n.label}</Link></li>
            ))}
            <li><Link href="/disclosure" className="text-white/85 hover:text-white hover:underline">Mandatory Public Disclosure</Link></li>
            <li><Link href="/login" className="text-white/85 hover:text-white hover:underline">Staff &amp; parent login</Link></li>
          </ul>
        </div>
        <p className="border-t border-white/10 py-5 text-center text-xs text-white/45">© {new Date().getFullYear()} {school.name}, {school.city}</p>
      </footer>
    </div>
  );
}

/** Title block for inner pages, sitting on the doodle wash under the header. */
export function PageBanner({ title, lead, crumb }: { title: string; lead?: string; crumb: string }) {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-14 pt-8 sm:px-8 md:pb-16 md:pt-12">
      <p className="text-[13px] text-slate-500">
        <Link href="/" className="hover:text-slate-800 hover:underline">Home</Link>
        <span className="mx-1.5 text-slate-400">/</span>
        {crumb}
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl" style={{ color: INK }}>{title}</h1>
      {lead && <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-slate-600">{lead}</p>}
    </div>
  );
}
