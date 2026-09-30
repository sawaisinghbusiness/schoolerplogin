"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bus, Check, ChevronLeft, ChevronRight, Download, IndianRupee, Loader2, Plus, RefreshCw, Search, Ticket, Upload, X } from "lucide-react";
import { Student } from "@/data/mockData";
import { studentService } from "@/lib/services/studentService";
import { toast } from "@/components/ui/Toaster";
import { Avatar } from "@/components/ui/Avatar";
import { GatePassModal } from "@/components/search/GatePassModal";
import { StudentDrawer } from "@/components/students/StudentDrawer";
import { AdmissionDrawer } from "@/components/students/AdmissionDrawer";
import { exportStudentsToExcel, importStudentsFromExcel } from "@/lib/excelHelper";

type Field = "any" | "name" | "sr" | "father" | "mobile" | "admission" | "roll" | "address" | "pen";
type View = "all" | "due" | "bus" | "paid";

const FIELDS: { key: Field; label: string }[] = [
  { key: "any", label: "Any field" },
  { key: "name", label: "Name" },
  { key: "sr", label: "SR no." },
  { key: "father", label: "Parent's name" },
  { key: "mobile", label: "Mobile" },
  { key: "admission", label: "Admission no." },
  { key: "roll", label: "Roll no." },
  { key: "address", label: "Address" },
  { key: "pen", label: "PEN" },
];

const CLASS_ORDER = ["Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
const classRank = (c: string) => {
  const i = CLASS_ORDER.indexOf(c);
  return i === -1 ? 100 + (parseInt(c, 10) || 0) : i;
};

const PAGE_SIZE = 25;
const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
const fmt = (v: number) => v.toLocaleString("en-IN");
/** ₹42.3 L / ₹1.2 Cr — for headline amounts. */
const lakh = (n: number) => (n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)} L` : inr(n));

function matches(s: Student, field: Field, q: string) {
  const has = (v?: string) => !!v && v.toLowerCase().includes(q);
  switch (field) {
    case "name":
      return has(s.name);
    case "sr":
      return has(s.srNo);
    case "father":
      return has(s.fatherName) || has(s.motherName) || has(s.guardianName);
    case "mobile":
      return has(s.mobile) || has(s.contact);
    case "admission":
      return has(s.admissionNo);
    case "roll":
      return (s.rollNo || "").toLowerCase() === q;
    case "address":
      return has(s.address);
    case "pen":
      return has(s.penNo);
    default:
      return has(s.name) || has(s.srNo) || has(s.admissionNo) || has(s.fatherName) || has(s.motherName) || has(s.mobile) || has(s.contact);
  }
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [view, setView] = useState<View>("all");
  const [field, setField] = useState<Field>("any");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [cls, setCls] = useState("all");
  const [section, setSection] = useState("all");
  const [gender, setGender] = useState("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [active, setActive] = useState<Student | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [passesVersion, setPassesVersion] = useState(0);
  const [admitOpen, setAdmitOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const load = async (quiet = false) => {
    if (quiet) setRefreshing(true);
    const res = await studentService.fetchStudents();
    setLoadError(res.error && !res.data.length ? res.error : null);
    setStudents(res.data);
    setRefreshing(false);
  };

  useEffect(() => {
    load();
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "1") {
      setAdmitOpen(true);
      window.history.replaceState(null, "", "/students");
    }
    const q = params.get("q")?.trim();
    if (q) {
      setQuery(q);
      setDebounced(q.toLowerCase());
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 180);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => setPage(1), [debounced, field, cls, section, gender, category, view]);

  const all = students || [];
  const classes = useMemo(() => Array.from(new Set(all.map((s) => s.class))).sort((a, b) => classRank(a) - classRank(b)), [all]);
  const sections = useMemo(() => Array.from(new Set(all.filter((s) => cls === "all" || s.class === cls).map((s) => s.section))).sort(), [all, cls]);
  const sectionCount = useMemo(() => new Set(all.map((s) => `${s.class}|${s.section}`)).size, [all]);

  const stats = useMemo(() => {
    const due = all.filter((s) => s.balanceFee > 0);
    const bus = all.filter((s) => s.transportOpted);
    return {
      all: all.length,
      boys: all.filter((s) => s.gender === "Male").length,
      girls: all.filter((s) => s.gender === "Female").length,
      due: due.length,
      dueAmount: due.reduce((sum, s) => sum + (s.balanceFee || 0), 0),
      bus: bus.length,
      routes: new Set(bus.map((s) => (s.busRoute || "").split(" (")[0]).filter(Boolean)).size,
      paid: all.length - due.length,
    };
  }, [all]);

  const filtered = useMemo(
    () =>
      all
        .filter((s) => {
          if (view === "due" && !(s.balanceFee > 0)) return false;
          if (view === "paid" && s.balanceFee > 0) return false;
          if (view === "bus" && !s.transportOpted) return false;
          if (debounced && !matches(s, field, debounced)) return false;
          if (cls !== "all" && s.class !== cls) return false;
          if (section !== "all" && s.section !== section) return false;
          if (gender !== "all" && s.gender !== gender) return false;
          if (category !== "all" && s.category !== category) return false;
          return true;
        })
        .sort((a, b) => classRank(a.class) - classRank(b.class) || a.section.localeCompare(b.section) || (a.rollNo || "").localeCompare(b.rollNo || "", undefined, { numeric: true }) || a.name.localeCompare(b.name)),
    [all, view, debounced, field, cls, section, gender, category]
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const filtersOn = !!debounced || cls !== "all" || section !== "all" || gender !== "all" || category !== "all";
  const reset = () => {
    setQuery("");
    setField("any");
    setCls("all");
    setSection("all");
    setGender("all");
    setCategory("all");
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const allShownSelected = shown.length > 0 && shown.every((s) => selected.has(s.id));
  const toggleShown = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allShownSelected) shown.forEach((s) => next.delete(s.id));
      else shown.forEach((s) => next.add(s.id));
      return next;
    });
  const selectedStudents = all.filter((s) => selected.has(s.id));
  const selectedDue = selectedStudents.reduce((sum, s) => sum + (s.balanceFee || 0), 0);

  const open = (s: Student, which: "profile" | "gate") => {
    setActive(s);
    if (which === "profile") setDrawerOpen(true);
    else setGateOpen(true);
  };

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImporting(true);
    try {
      const rows = await importStudentsFromExcel(file);
      if (!rows.length) return toast("That file has no student rows.", "error");
      const res = await studentService.bulkImport(rows);
      if (!res.success) return toast(res.error || "Import failed.", "error");
      const parts = [`${res.inserted} added`];
      if (res.skipped) parts.push(`${res.skipped} already existed`);
      if (res.invalid) parts.push(`${res.invalid} skipped (missing name, class, father or mobile)`);
      toast(`Import finished: ${parts.join(", ")}.`, res.inserted ? "success" : "info");
      await load(true);
    } catch {
      toast("Could not read that file. Use an .xlsx or .xls sheet.", "error");
    } finally {
      setImporting(false);
    }
  };

  const loaded = students !== null;

  return (
    <div className="space-y-5 pb-24">
      <header className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{loaded ? `Session 2026-27 · ${classes.length} classes · ${sectionCount} sections` : "Loading…"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={onImport} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={importing} className="btn btn-secondary">
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {importing ? "Importing…" : "Import"}
          </button>
          <button type="button" onClick={() => exportStudentsToExcel(filtered)} disabled={!filtered.length} className="btn btn-secondary">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button type="button" onClick={() => setAdmitOpen(true)} disabled={!loaded} className="btn btn-primary">
            <Plus className="h-4 w-4" />
            New admission
          </button>
        </div>
      </header>

      {/* Views as figures: each tile is a filter and tells you the number behind it */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" role="tablist" aria-label="Views">
        <ViewTile on={view === "all"} onClick={() => setView("all")} label="All students" value={loaded ? fmt(stats.all) : "…"}>
          {loaded && stats.all > 0 && (
            <>
              <div className="mt-3 flex h-1.5 gap-0.5 overflow-hidden rounded-full">
                <span className="rounded-full bg-brand-500" style={{ width: `${(stats.boys / stats.all) * 100}%` }} />
                <span className="flex-1 rounded-full bg-marigold-400" />
              </div>
              <div className="mt-1.5 flex justify-between text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <i className="h-2 w-2 rounded-full bg-brand-500" />
                  {fmt(stats.boys)} boys
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="h-2 w-2 rounded-full bg-marigold-400" />
                  {fmt(stats.girls)} girls
                </span>
              </div>
            </>
          )}
        </ViewTile>
        <ViewTile on={view === "due"} onClick={() => setView("due")} label="Fees pending" value={loaded ? fmt(stats.due) : "…"} tone="rose">
          {loaded && <p className="mt-3 text-[13px] text-slate-500"><span className="font-semibold text-rose-600">{lakh(stats.dueAmount)}</span> still to collect</p>}
        </ViewTile>
        <ViewTile on={view === "bus"} onClick={() => setView("bus")} label="School bus" value={loaded ? fmt(stats.bus) : "…"}>
          {loaded && <p className="mt-3 text-[13px] text-slate-500">on {stats.routes} routes</p>}
        </ViewTile>
        <ViewTile on={view === "paid"} onClick={() => setView("paid")} label="Fees fully paid" value={loaded ? fmt(stats.paid) : "…"} tone="emerald">
          {loaded && stats.all > 0 && <p className="mt-3 text-[13px] text-slate-500"><span className="font-semibold text-emerald-700">{Math.round((stats.paid / stats.all) * 100)}%</span> of students</p>}
        </ViewTile>
      </div>

      {/* Search, filters and the list in one card */}
      <section className="card overflow-hidden" aria-label="Students">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 p-3 sm:p-4">
          <div className="flex min-w-[260px] flex-[1_1_320px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/15">
            <select aria-label="Search in" value={field} onChange={(e) => setField(e.target.value as Field)} className="border-r border-slate-200 bg-transparent px-3 text-[13px] font-medium text-slate-600 outline-none">
              {FIELDS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                aria-label="Search students"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, SR no., father or mobile"
                className="h-10 w-full bg-transparent pl-9 pr-14 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              {query ? (
                <button type="button" onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600" aria-label="Clear search">
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 font-mono text-[11px] text-slate-400">/</kbd>
              )}
            </div>
          </div>
          <Chip label="Class" value={cls} onChange={(v) => { setCls(v); setSection("all"); }} options={classes.map((c) => [c, c])} />
          <Chip label="Section" value={section} onChange={setSection} options={sections.map((s) => [s, s])} />
          <Chip label="Gender" value={gender} onChange={setGender} options={[["Male", "Boys"], ["Female", "Girls"]]} />
          <Chip label="Category" value={category} onChange={setCategory} options={["General", "OBC", "SC", "ST"].map((c) => [c, c])} />
          {filtersOn && (
            <button type="button" onClick={reset} className="px-1 text-[13px] font-semibold text-brand-700 hover:underline">
              Clear
            </button>
          )}
          <span className="ml-auto flex items-center gap-1 text-[13px] text-slate-500">
            {loaded && <span className="tabular-nums">{fmt(filtered.length)} shown</span>}
            <button type="button" onClick={() => load(true)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Reload" aria-label="Reload">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </span>
        </div>

        {loadError ? (
          <div className="px-6 py-12 text-center text-sm">
            <p className="font-semibold text-slate-800">Could not load students</p>
            <p className="mt-1 text-slate-500">{loadError}</p>
            <button onClick={() => load()} className="btn btn-secondary btn-sm mt-3">
              Try again
            </button>
          </div>
        ) : !loaded ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-11 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm">
            <p className="font-semibold text-slate-800">No student found</p>
            <p className="mt-1 text-slate-500">Check the spelling, or search in &ldquo;Any field&rdquo;.</p>
            {filtersOn && (
              <button onClick={reset} className="btn btn-secondary btn-sm mt-3">
                Clear search and filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="table-head">
                  <tr>
                    <th className="w-12 py-3 pl-5 pr-2 text-left">
                      <Checkbox on={allShownSelected} onClick={toggleShown} label="Select all on this page" />
                    </th>
                    <th className="px-3 py-3 text-left">Student</th>
                    <th className="px-3 py-3 text-left">Class</th>
                    <th className="px-3 py-3 text-left">Parent</th>
                    <th className="px-3 py-3 text-left">Bus</th>
                    <th className="px-3 py-3 text-left">Fees 2026-27</th>
                    <th className="px-5 py-3 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shown.map((s) => {
                    const on = selected.has(s.id);
                    return (
                      <tr key={s.id} onClick={() => open(s, "profile")} className={`group cursor-pointer ${on ? "bg-brand-50/60 hover:bg-brand-50" : ""}`}>
                        <td className="py-2.5 pl-5 pr-2" onClick={(e) => e.stopPropagation()}>
                          <Checkbox on={on} onClick={() => toggle(s.id)} label={`Select ${s.name}`} />
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={s.name} id={s.id} photoUrl={s.photoUrl} size="sm" />
                            <span className="min-w-0">
                              <span className="flex items-center gap-2 font-semibold text-slate-900 group-hover:text-brand-700">
                                {s.name}
                                {s.status === "Inactive" && <span className="badge badge-slate py-0 text-[11px]">Left</span>}
                              </span>
                              <span className="block text-xs tabular-nums text-slate-500">{s.srNo}</span>
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[13px] font-semibold text-slate-700">{s.classSec}</span>
                          {s.rollNo && <span className="ml-2 text-xs text-slate-400">Roll {s.rollNo}</span>}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="block text-slate-800">{s.fatherName}</span>
                          <a href={`tel:${s.mobile}`} onClick={(e) => e.stopPropagation()} className="text-xs tabular-nums text-slate-500 hover:text-brand-700 hover:underline">
                            {s.mobile}
                          </a>
                        </td>
                        <td className="px-3 py-2.5">
                          {s.transportOpted ? (
                            <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-700" title={s.busRoute || ""}>
                              <Bus className="h-3.5 w-3.5 text-slate-400" />
                              {(s.busRoute || "Bus").split(" (")[0]}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <FeeCell s={s} />
                        </td>
                        <td className="whitespace-nowrap px-5 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex gap-1">
                            <Link href={`/fees/collect?student=${s.id}`} title="Collect fee" aria-label={`Collect fee from ${s.name}`} className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700">
                              <IndianRupee className="h-4 w-4" />
                            </Link>
                            <button type="button" onClick={() => open(s, "gate")} title="Gate pass" aria-label={`Gate pass for ${s.name}`} className="rounded-lg p-2 text-slate-400 hover:bg-brand-50 hover:text-brand-700">
                              <Ticket className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Phones */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {shown.map((s) => (
                <li key={s.id}>
                  <button type="button" onClick={() => open(s, "profile")} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                    <Avatar name={s.name} id={s.id} photoUrl={s.photoUrl} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-slate-900">{s.name}</span>
                      <span className="block truncate text-xs text-slate-500">
                        {s.classSec} · {s.fatherName}
                      </span>
                    </span>
                    {s.balanceFee > 0 ? <span className="badge badge-rose tabular-nums">{inr(s.balanceFee)}</span> : <span className="badge badge-emerald">Paid</span>}
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3">
              <span className="text-[13px] tabular-nums text-slate-500">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {fmt(filtered.length)}
              </span>
              {pages > 1 && (
                <div className="flex items-center gap-2">
                  <span className="hidden text-[13px] tabular-nums text-slate-500 sm:inline">
                    Page {page} of {pages}
                  </span>
                  <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-secondary btn-sm" aria-label="Previous page">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="btn btn-secondary btn-sm" aria-label="Next page">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* Bulk actions: sits at the bottom of the screen while students are selected */}
      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-5 z-30 flex justify-center px-4 md:pl-[272px]">
          <div className="flex w-full max-w-2xl flex-wrap items-center gap-3 rounded-2xl bg-night-900 px-4 py-3 text-sm text-white shadow-2xl ring-1 ring-white/5 animate-scaleUp">
            <span className="flex h-7 min-w-[28px] items-center justify-center rounded-lg bg-marigold-400 px-2 text-[13px] font-bold text-night-950">{selected.size}</span>
            <span className="font-semibold">selected</span>
            {selectedDue > 0 && <span className="text-night-400">· {inr(selectedDue)} due</span>}
            <span className="ml-auto flex gap-2">
              <button type="button" onClick={() => exportStudentsToExcel(selectedStudents)} className="btn btn-sm bg-white/10 text-white hover:bg-white/20">
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
              <button type="button" onClick={() => setSelected(new Set())} className="btn btn-sm text-night-300 hover:text-white">
                Clear
              </button>
            </span>
          </div>
        </div>
      )}

      <StudentDrawer
        student={active}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onIssueGatePass={() => setGateOpen(true)}
        onEdit={() => setEditOpen(true)}
        passesVersion={passesVersion}
      />
      {/* One form for both jobs: admitting a new student, or editing the open one. Rendered after the profile so it sits on top. */}
      <AdmissionDrawer
        isOpen={admitOpen || editOpen}
        onClose={() => {
          setAdmitOpen(false);
          setEditOpen(false);
        }}
        students={all}
        editing={editOpen ? active : null}
        onSaved={(s) => setStudents((prev) => [s, ...(prev || [])])}
        onUpdated={(s) => {
          setStudents((prev) => (prev || []).map((x) => (x.id === s.id ? s : x)));
          setActive(s);
          setEditOpen(false);
          toast(`${s.name}'s details are saved.`, "success");
        }}
        onOpenProfile={(s) => {
          setAdmitOpen(false);
          open(s, "profile");
        }}
      />
      <GatePassModal student={active} isOpen={gateOpen} onClose={() => setGateOpen(false)} onIssued={() => setPassesVersion((v) => v + 1)} />
    </div>
  );
}

/** A figure that doubles as a filter tab. */
function ViewTile({ on, onClick, label, value, tone, children }: { on: boolean; onClick: () => void; label: string; value: string; tone?: "rose" | "emerald"; children?: React.ReactNode }) {
  const dot = tone === "rose" ? "bg-rose-500" : tone === "emerald" ? "bg-emerald-500" : "bg-slate-300";
  return (
    <button
      type="button"
      role="tab"
      aria-selected={on}
      onClick={onClick}
      className={`relative rounded-2xl border bg-white p-4 text-left shadow-card transition sm:p-5 ${
        on ? "border-brand-500 ring-4 ring-brand-500/10" : "border-slate-200/80 hover:border-slate-300 hover:shadow-card-hover"
      }`}
    >
      <span className="flex items-center gap-2 text-[13px] font-semibold text-slate-600">
        <i className={`h-2 w-2 rounded-full ${dot}`} />
        {label}
        {on && <Check className="ml-auto h-4 w-4 text-brand-600" strokeWidth={2.5} />}
      </span>
      <span className="mt-1.5 block text-[28px] font-bold leading-none tracking-tight tabular-nums text-slate-900">{value}</span>
      {children}
    </button>
  );
}

/** Paid share as a small meter, then the amount still due. */
function FeeCell({ s }: { s: Student }) {
  const total = s.totalFee || s.paidFee + s.balanceFee;
  const pct = total > 0 ? Math.min(100, Math.round((s.paidFee / total) * 100)) : 100;
  if (s.balanceFee <= 0)
    return (
      <span className="badge badge-emerald">
        <Check className="h-3 w-3" strokeWidth={3} />
        Paid
      </span>
    );
  return (
    <div className="w-36">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-semibold tabular-nums text-rose-600">{inr(s.balanceFee)} due</span>
        <span className="tabular-nums text-slate-400">{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Checkbox({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={`flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border-[1.5px] transition ${on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white hover:border-slate-400"}`}
    >
      {on && <Check className="h-3 w-3" strokeWidth={3.5} />}
    </button>
  );
}

function Chip({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  const on = value !== "all";
  return (
    <label
      className={`relative flex h-10 items-center gap-1 rounded-xl border pl-3 pr-8 text-[13px] font-semibold transition ${
        on ? "border-brand-300 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      }`}
    >
      <span className={on ? "text-brand-600" : "text-slate-400"}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer appearance-none opacity-0" aria-label={label}>
        <option value="all">All</option>
        {options.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
      <span>{value === "all" ? "All" : options.find(([v]) => v === value)?.[1] || value}</span>
      <svg className="pointer-events-none absolute right-2.5 h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
      </svg>
    </label>
  );
}
