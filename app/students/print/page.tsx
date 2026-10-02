"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Printer, RotateCw, Search, Users } from "lucide-react";
import { Student } from "@/data/mockData";
import { studentService } from "@/lib/services/studentService";
import { schoolProfileService } from "@/lib/services/schoolProfileService";
import { useSchoolProfile } from "@/components/providers/SchoolProfileProvider";
import { Avatar } from "@/components/ui/Avatar";
import { PrintReportCards } from "@/components/exams/report/PrintReportCards";
import { CARD_H, CARD_W, CardSchool, IdCardBack, IdCardFront, IdCardSheet, PER_SHEET } from "@/components/students/IdCardPrint";

const CLASS_ORDER = ["Pre Nursery", "Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
const rank = (c: string) => (CLASS_ORDER.indexOf(c) === -1 ? 99 : CLASS_ORDER.indexOf(c));
const bySectionRoll = (a: Student, b: Student) =>
  a.section.localeCompare(b.section) || (a.rollNo || "").localeCompare(b.rollNo || "", undefined, { numeric: true }) || a.name.localeCompare(b.name);
const longDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const MM = 96 / 25.4;

function chunk<T>(list: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

export default function IdCardsPage() {
  const { schoolProfile: p } = useSchoolProfile();
  const [students, setStudents] = useState<Student[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [session, setSession] = useState<{ label: string; end: string } | null>(null);
  const [cls, setCls] = useState("");
  const [sec, setSec] = useState("");
  const [query, setQuery] = useState("");
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    studentService.fetchStudents().then((r) => {
      setLoadError(r.error);
      setStudents(r.data.filter((s) => s.status !== "Inactive"));
    });
    schoolProfileService.session().then((r) => setSession({ label: r.session.label, end: r.session.end }));
  }, []);

  const school: CardSchool = {
    name: p.school_name || "School",
    short: p.short_name || "SCH",
    logoUrl: p.logo_url || undefined,
    address: [p.address, p.city, [p.state, p.pincode].filter(Boolean).join(" ")].filter(Boolean).join(", "),
    phone: p.contact1 || undefined,
    affiliation: p.affiliation_no ? `${p.board || "CBSE"} Affiliation No. ${p.affiliation_no}` : undefined,
    session: session?.label || "2026-27",
    validTill: session?.end ? longDate(session.end) : undefined,
  };

  /** class -> sections -> head count, from the students actually enrolled */
  const classes = useMemo(() => {
    const m = new Map<string, Map<string, number>>();
    for (const s of students || []) {
      if (!m.has(s.class)) m.set(s.class, new Map());
      const secs = m.get(s.class)!;
      secs.set(s.section, (secs.get(s.section) || 0) + 1);
    }
    return Array.from(m.entries())
      .sort((a, b) => rank(a[0]) - rank(b[0]))
      .map(([name, secs]) => ({ name, total: Array.from(secs.values()).reduce((a, b) => a + b, 0), sections: Array.from(secs.entries()).sort((a, b) => a[0].localeCompare(b[0])) }));
  }, [students]);

  // First load: open on the first class so there is something to look at.
  useEffect(() => {
    if (!cls && classes.length) setCls(classes[0].name);
  }, [classes, cls]);

  const inClass = useMemo(() => (students || []).filter((s) => s.class === cls && (!sec || s.section === sec)).sort(bySectionRoll), [students, cls, sec]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? inClass.filter((s) => s.name.toLowerCase().includes(q) || s.srNo.toLowerCase().includes(q) || (s.rollNo || "").replace(/^0+/, "") === q.replace(/^0+/, "")) : inClass;
  }, [inClass, query]);
  const chosen = useMemo(() => inClass.filter((s) => !excluded.has(s.id)), [inClass, excluded]);
  const sheets = useMemo(() => chunk(chosen, PER_SHEET), [chosen]);
  const preview = inClass.find((s) => s.id === previewId) || chosen[0] || inClass[0];

  // A new class or section starts with everyone ticked.
  useEffect(() => {
    setExcluded(new Set());
    setQuery("");
  }, [cls, sec]);

  const toggle = (id: string) =>
    setExcluded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const allShownTicked = shown.length > 0 && shown.every((s) => !excluded.has(s.id));
  const tickShown = (on: boolean) =>
    setExcluded((prev) => {
      const next = new Set(prev);
      shown.forEach((s) => (on ? next.delete(s.id) : next.add(s.id)));
      return next;
    });

  const sections = classes.find((c) => c.name === cls)?.sections || [];

  return (
    // Desktop: the page fills the screen and only the list of names scrolls; title, Print and the card stay put.
    <div className="flex flex-col gap-5 pb-12 lg:h-[calc(100dvh-128px)] lg:pb-0">
      <header className="page-header shrink-0">
        <h1 className="page-title">ID cards</h1>
        <button type="button" onClick={() => setPrinting(true)} disabled={!chosen.length} className="btn btn-primary">
          <Printer className="h-4 w-4" />
          {chosen.length === 1 ? "Print 1 card" : `Print ${chosen.length} cards`}
        </button>
      </header>

      {students === null ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <div className="card space-y-3 p-5">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="skeleton h-10 w-full" />
            ))}
          </div>
          <div className="card skeleton h-[420px]" />
        </div>
      ) : !students.length ? (
        <div className="card p-8 text-center">
          <Users className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">{loadError ? "Could not load students" : "No students yet"}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{loadError || "Add students first; their cards appear here class by class."}</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          {/* ── Who gets a card ── */}
          <section className="card order-2 flex flex-col overflow-hidden lg:order-none lg:min-h-0" aria-label="Students">
            <div className="shrink-0 space-y-3 border-b border-slate-200/80 p-4">
              <div className="flex gap-2">
                <label className="min-w-0 flex-1">
                  <span className="field-label">Class</span>
                  <select
                    value={cls}
                    onChange={(e) => {
                      setCls(e.target.value);
                      setSec("");
                    }}
                    className="field field-sm w-full"
                  >
                    {classes.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.total})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="w-[44%] shrink-0">
                  <span className="field-label">Section</span>
                  <select value={sec} onChange={(e) => setSec(e.target.value)} className="field field-sm w-full">
                    <option value="">All</option>
                    {sections.map(([name, n]) => (
                      <option key={name} value={name}>
                        {name} ({n})
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, SR or roll no." aria-label="Find a student" className="field field-sm w-full pl-9" />
              </div>
            </div>

            <label className="flex min-h-[44px] shrink-0 cursor-pointer items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-4 text-[13px]">
              <input type="checkbox" checked={allShownTicked} onChange={(e) => tickShown(e.target.checked)} className="h-4 w-4 accent-brand-600" />
              <span className="font-semibold text-slate-700">{query ? "All matching" : "Everyone"}</span>
              <span className="ml-auto tabular-nums text-slate-500">{chosen.length} selected</span>
            </label>

            <ul className="divide-y divide-slate-100 overscroll-contain lg:min-h-0 lg:flex-1 lg:overflow-y-auto" aria-label="Students in this class">
              {shown.map((s) => {
                const on = !excluded.has(s.id);
                const active = preview?.id === s.id;
                return (
                  <li key={s.id} className={`flex items-center ${active ? "bg-brand-50/70" : ""}`}>
                    <label className="flex h-12 w-11 shrink-0 cursor-pointer items-center justify-center pl-1">
                      <input type="checkbox" checked={on} onChange={() => toggle(s.id)} aria-label={`Print card for ${s.name}`} className="h-4 w-4 accent-brand-600" />
                    </label>
                    <button type="button" onClick={() => setPreviewId(s.id)} aria-current={active || undefined} className="flex h-12 min-w-0 flex-1 items-center gap-3 pr-4 text-left">
                      <Avatar name={s.name} id={s.id} photoUrl={s.photoUrl} size="sm" neutral />
                      <span className={`truncate text-[14px] font-medium ${on ? "text-slate-900" : "text-slate-400"}`}>{s.name}</span>
                    </button>
                  </li>
                );
              })}
              {!shown.length && <li className="px-4 py-10 text-center text-sm text-slate-500">Nobody matches “{query}”.</li>}
            </ul>
          </section>

          {/* ── The card, both sides ── */}
          {preview && (
            <section className="card order-1 flex items-center justify-center p-4 sm:p-6 lg:order-none lg:min-h-0" aria-label={`ID card of ${preview.name}`}>
              <FlipCard key={preview.id} s={preview} school={school} />
            </section>
          )}
        </div>
      )}

      {printing && (
        <PrintReportCards onDone={() => setPrinting(false)}>
          {sheets.flatMap((group, i) => [
            <IdCardSheet key={`f${i}`} students={group} side="front" school={school} />,
            <IdCardSheet key={`b${i}`} students={group} side="back" school={school} />,
          ])}
        </PrintReportCards>
      )}
    </div>
  );
}

/**
 * The selected student's card at a readable size. Click, tap, Enter or Space turns it over
 * (a 3D flip; people who ask for reduced motion get an instant switch instead).
 */
function FlipCard({ s, school }: { s: Student; school: CardSchool }) {
  const ref = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);
  const [scale, setScale] = useState(1.4);

  // As big as the panel allows, by width and by the height left on screen.
  useEffect(() => {
    const fit = () => {
      const w = ref.current?.clientWidth || 0;
      const h = window.innerWidth >= 1024 ? window.innerHeight - 300 : Infinity;
      setScale(Math.max(0.8, Math.min(1.9, w / (CARD_W * MM), h / (CARD_H * MM))));
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (ref.current) ro.observe(ref.current);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  const w = CARD_W * MM * scale;
  const h = CARD_H * MM * scale;
  const turn = () => setFlipped((f) => !f);

  return (
    <div ref={ref} className="flex w-full flex-col items-center">
      <div className="[perspective:1600px]" style={{ width: w, height: h }}>
        <div
          role="button"
          tabIndex={0}
          onClick={turn}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              turn();
            }
          }}
          aria-pressed={flipped}
          aria-label={flipped ? `Show the front of ${s.name}'s card` : `Show the back of ${s.name}'s card`}
          className="relative h-full w-full cursor-pointer select-none rounded-[3mm] transition-transform duration-700 [transform-style:preserve-3d] [transition-timing-function:cubic-bezier(0.3,0.9,0.3,1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 motion-reduce:duration-0"
          style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
        >
          <Face scale={scale}>
            <IdCardFront s={s} school={school} />
          </Face>
          <Face scale={scale} back>
            <IdCardBack s={s} school={school} />
          </Face>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
        <RotateCw className="h-3.5 w-3.5" />
        {flipped ? "Back · tap to see the front" : "Front · tap to see the back"}
      </p>
    </div>
  );
}

function Face({ scale, back, children }: { scale: number; back?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden rounded-[3mm] shadow-[0_1px_2px_rgba(16,24,40,0.06),0_10px_24px_-8px_rgba(16,24,40,0.22)] [backface-visibility:hidden] ${back ? "[transform:rotateY(180deg)]" : ""}`}
    >
      <div style={{ width: `${CARD_W}mm`, height: `${CARD_H}mm`, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
    </div>
  );
}
