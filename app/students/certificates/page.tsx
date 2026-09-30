"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FileBadge2, Plus, Printer, RefreshCw, Search } from "lucide-react";
import { Student } from "@/data/mockData";
import { studentService } from "@/lib/services/studentService";
import { certificateService, Certificate, CertificateType } from "@/lib/services/certificateService";
import { useSchoolProfile } from "@/components/providers/SchoolProfileProvider";
import { CertificateDocument, SchoolInfo } from "@/components/certificates/CertificateDocument";
import { PrintSheet } from "@/components/certificates/SheetPreview";
import { IssueCertificateDrawer } from "@/components/certificates/IssueCertificateDrawer";

type Filter = "all" | CertificateType;

const when = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const TYPE_BADGE: Record<CertificateType, string> = { tc: "badge-rose", bonafide: "badge-brand", character: "badge-emerald" };
const TYPE_SHORT: Record<CertificateType, string> = { tc: "TC", bonafide: "Bonafide", character: "Character" };

export default function CertificatesPage() {
  const { schoolProfile } = useSchoolProfile();
  const [certs, setCerts] = useState<Certificate[] | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [issueOpen, setIssueOpen] = useState(false);
  const [printing, setPrinting] = useState<Certificate | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const school: SchoolInfo = {
    name: schoolProfile.school_name || "School",
    short: schoolProfile.short_name || "SPS",
    affiliationNo: schoolProfile.affiliation_no,
    schoolCode: schoolProfile.school_code,
    place: [schoolProfile.address, schoolProfile.city || "Barmer", schoolProfile.state || "Rajasthan"].filter(Boolean).join(", "),
    pincode: schoolProfile.pincode,
    phone: [schoolProfile.contact1, schoolProfile.contact2].filter(Boolean).join(", "),
    email: schoolProfile.email,
    logoUrl: schoolProfile.logo_url || undefined,
  };

  const load = async () => {
    setRefreshing(true);
    const res = await certificateService.list({ limit: 500 });
    setSetupError(res.error || null);
    setCerts(res.data);
    setRefreshing(false);
  };

  useEffect(() => {
    load();
    studentService.fetchStudents().then((r) => setStudents(r.data.filter((s) => s.status !== "Inactive")));
  }, []);

  const counts = useMemo(() => {
    const c = { all: 0, tc: 0, bonafide: 0, character: 0 } as Record<Filter, number>;
    for (const x of certs || []) {
      c.all++;
      c[x.type]++;
    }
    return c;
  }, [certs]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (certs || []).filter(
      (c) =>
        (filter === "all" || c.type === filter) &&
        (!q || c.serial_no.toLowerCase().includes(q) || (c.details.name || c.student?.name || "").toLowerCase().includes(q) || (c.details.srNo || "").toLowerCase().includes(q))
    );
  }, [certs, filter, query]);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "tc", label: "Transfer (TC)" },
    { key: "bonafide", label: "Bonafide" },
    { key: "character", label: "Character" },
  ];

  return (
    <div className="space-y-5 pb-12">
      <header className="page-header">
        <div>
          <h1 className="page-title">Certificates</h1>
          <p className="page-subtitle">Transfer, bonafide and character certificates, with a numbered register of every one issued</p>
        </div>
        <button type="button" onClick={() => setIssueOpen(true)} className="btn btn-primary">
          <Plus className="h-4 w-4" />
          Issue certificate
        </button>
      </header>

      {setupError ? (
        <div className="card p-8 text-center">
          <FileBadge2 className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">The certificate register needs a one-time database setup</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{setupError}</p>
          <button type="button" onClick={load} className="btn btn-secondary btn-sm mt-4">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Check again
          </button>
        </div>
      ) : (
        <section className="card overflow-hidden" aria-label="Certificate register">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 p-3 sm:p-4">
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Type">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${filter === f.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {f.label}
                  <span className="tabular-nums text-slate-400">{certs ? counts[f.key] : "…"}</span>
                </button>
              ))}
            </div>
            <div className="relative ml-auto w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Serial no., student or SR no." aria-label="Search register" className="field field-sm w-full pl-9" />
            </div>
          </div>

          {certs === null ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton h-10 w-full" />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <FileBadge2 className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-800">{certs.length ? "Nothing matches" : "No certificate issued yet"}</p>
              <p className="mt-1 text-sm text-slate-500">{certs.length ? "Try another name or serial number." : "Every TC, bonafide and character certificate you issue is listed here with its serial number."}</p>
              {!certs.length && (
                <button type="button" onClick={() => setIssueOpen(true)} className="btn btn-primary btn-sm mt-4">
                  <Plus className="h-4 w-4" />
                  Issue the first one
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="table-head">
                  <tr>
                    <th className="px-5 py-3 text-left">Serial no.</th>
                    <th className="px-3 py-3 text-left">Type</th>
                    <th className="px-3 py-3 text-left">Student</th>
                    <th className="px-3 py-3 text-left">Class</th>
                    <th className="px-3 py-3 text-left">Issued</th>
                    <th className="hidden px-3 py-3 text-left xl:table-cell">For</th>
                    <th className="px-5 py-3 text-right">
                      <span className="sr-only">Print</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shown.map((c) => (
                    <tr key={c.id}>
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-[13px] font-semibold text-slate-800">{c.serial_no}</td>
                      <td className="px-3 py-3">
                        <span className={`badge ${TYPE_BADGE[c.type]}`}>{TYPE_SHORT[c.type]}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <span className="block font-semibold text-slate-900">{c.details.name || c.student?.name}</span>
                        <span className="block text-xs text-slate-500">{c.details.srNo || c.student?.sr_no}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-slate-700">{c.details.classSec || c.student?.class_sec}</td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <span className="block text-slate-800">{when(c.issued_at)}</span>
                        <span className="block max-w-[9rem] truncate text-xs text-slate-500" title={c.issued_by_name}>by {(c.issued_by_name || "Office").split(" (")[0]}</span>
                      </td>
                      <td className="hidden max-w-[16rem] truncate px-3 py-3 text-slate-600 xl:table-cell">{c.type === "tc" ? c.details.reason : c.type === "bonafide" ? c.details.purpose || "—" : c.details.conduct}</td>
                      <td className="px-5 py-3 text-right">
                        <button type="button" onClick={() => setPrinting(c)} title="Print" aria-label={`Print ${c.serial_no}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800">
                          <Printer className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <IssueCertificateDrawer
        isOpen={issueOpen}
        onClose={() => setIssueOpen(false)}
        students={students}
        school={school}
        onIssued={(c) => {
          setCerts((prev) => [c, ...(prev || [])]);
          if (c.type === "tc") setStudents((prev) => prev.filter((s) => s.id !== c.student_id));
        }}
      />

      {printing && (
        <PrintSheet onDone={() => setPrinting(null)}>
          <CertificateDocument type={printing.type} d={printing.details} serial={printing.serial_no} school={school} />
        </PrintSheet>
      )}
    </div>
  );
}
