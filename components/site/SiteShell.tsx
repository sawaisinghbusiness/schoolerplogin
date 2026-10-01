"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogIn, Mail, MapPin, Menu, Phone, X } from "lucide-react";
import { PublicSite, dayLabel, placeOf } from "./usePublicSite";

export const INK = "#17507A"; // school blue: headings, buttons
export const INK_DEEP = "#0F3A59"; // footer
export const SKY = "#E9F0FB"; // page wash behind the header
export const MARIGOLD = "#E9A23B"; // small accents only

/** School doodles (pencil, book, ruler, notes, ABC…) as one repeating tile. */
const DOODLE_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='220' viewBox='0 0 260 220' fill='none' stroke='#C5D4EC' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'>
<g transform='rotate(-30 30 40)'><rect x='10' y='34' width='46' height='11' rx='2'/><path d='M56 34l11 5.5-11 5.5'/><path d='M18 34v11'/></g>
<g transform='translate(92 18)'><path d='M2 6c8-4 16-4 22 0v26c-6-4-14-4-22 0z'/><path d='M24 6c6-4 14-4 22 0v26c-8-4-16-4-22 0'/></g>
<g transform='translate(176 14) rotate(12)'><path d='M2 40L40 2v38z'/><path d='M10 40v-5M18 40v-7M26 40v-5'/></g>
<g transform='translate(222 92)'><path d='M8 26V4l16-4v22'/><circle cx='5' cy='26' r='4'/><circle cx='21' cy='22' r='4'/></g>
<text x='22' y='120' font-family='Georgia,serif' font-size='22' fill='#C5D4EC' stroke='none'>A b c</text>
<g transform='translate(110 96)'><circle cx='16' cy='16' r='15'/><path d='M1 16h30M16 1c-7 8-7 22 0 30M16 1c7 8 7 22 0 30'/></g>
<g transform='translate(168 150) rotate(-10)'><path d='M0 12L40 0 28 30 20 18z'/><path d='M20 18L40 0'/></g>
<text x='30' y='190' font-family='Georgia,serif' font-size='18' fill='#C5D4EC' stroke='none'>2+3=5</text>
<g transform='translate(118 168)'><path d='M12 0a10 10 0 0 1 6 18v6h-12v-6A10 10 0 0 1 12 0z'/><path d='M7 28h10'/></g>
<g transform='translate(222 176)'><path d='M10 0l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z'/></g>
<g transform='translate(66 64)'><rect x='0' y='0' width='24' height='30' rx='2'/><path d='M5 8h14M5 14h14M5 20h9'/></g>
</svg>`;
export const DOODLES = `url("data:image/svg+xml,${encodeURIComponent(DOODLE_SVG)}")`;

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
    <div className="min-h-screen bg-white text-slate-800">
      <div className="relative overflow-hidden" style={{ background: SKY }}>
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: DOODLES, backgroundSize: "260px 220px" }} />

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

        <header className="relative z-20 mx-auto flex h-[76px] max-w-7xl items-center gap-8 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Crest site={site} />
            <span className="leading-tight">
              <span className="block whitespace-nowrap font-display text-[17px] font-semibold sm:text-[19px]" style={{ color: INK }}>{school.name}</span>
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
