"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Check, ClipboardList, GraduationCap, Plus, RefreshCw, Search } from "lucide-react";
import { Student } from "@/data/mockData";
import { studentService } from "@/lib/services/studentService";
import { enquiryService, Enquiry, STATUS_LABEL, enquiryNo } from "@/lib/services/enquiryService";
import { toast } from "@/components/ui/Toaster";
import { EnquiryFormDrawer, dayIso } from "@/components/enquiries/EnquiryFormDrawer";
import { EnquiryDetailDrawer, STATUS_BADGE } from "@/components/enquiries/EnquiryDetailDrawer";
import { AdmissionDrawer, AdmissionPrefill } from "@/components/students/AdmissionDrawer";

type View = "due" | "open" | "admitted" | "dropped";

const shortDay = (iso: string) => new Date(iso.slice(0, 10) + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });

/** "Today", "Overdue · 3 days", "Tomorrow", "12 Oct" — with a tone for the colour. */
function followUp(e: Enquiry): { text: string; tone: "rose" | "amber" | "plain" | "none" } {
  if (e.status === "admitted" || e.status === "dropped" || !e.next_follow_up) return { text: "—", tone: "none" };
  const today = dayIso(0);
  if (e.next_follow_up < today) {
    const days = Math.round((new Date(today).getTime() - new Date(e.next_follow_up).getTime()) / 86400000);
    return { text: `Overdue · ${days} day${days === 1 ? "" : "s"}`, tone: "rose" };
  }
  if (e.next_follow_up === today) return { text: "Today", tone: "amber" };
  if (e.next_follow_up === dayIso(1)) return { text: "Tomorrow", tone: "plain" };
  return { text: shortDay(e.next_follow_up), tone: "plain" };
}

export default function EnquiriesPage() {
  const [list, setList] = useState<Enquiry[] | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [view, setView] = useState<View>("open");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [active, setActive] = useState<Enquiry | null>(null);
  const [admitFrom, setAdmitFrom] = useState<Enquiry | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    const res = await enquiryService.list();
    setSetupError(res.error || null);
    setList(res.data);
    setRefreshing(false);
  };
  useEffect(() => {
    load();
    studentService.fetchStudents().then((r) => setStudents(r.data));
  }, []);

  const replace = (e: Enquiry) => {
    setList((prev) => (prev || []).map((x) => (x.id === e.id ? e : x)));
    setActive((a) => (a && a.id === e.id ? e : a));
  };

  const stats = useMemo(() => {
    const all = list || [];
    const today = dayIso(0);
    const open = all.filter((e) => e.status === "new" || e.status === "visited");
    const admitted = all.filter((e) => e.status === "admitted").length;
    const closed = admitted + all.filter((e) => e.status === "dropped").length;
    return {
      due: open.filter((e) => e.next_follow_up && e.next_follow_up <= today).length,
      open: open.length,
      admitted,
      dropped: all.filter((e) => e.status === "dropped").length,
      conversion: closed ? Math.round((admitted / closed) * 100) : 0,
    };
  }, [list]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const today = dayIso(0);
    return (list || [])
      .filter((e) => {
        if (view === "open" && !(e.status === "new" || e.status === "visited")) return false;
        if (view === "due" && !((e.status === "new" || e.status === "visited") && e.next_follow_up && e.next_follow_up <= today)) return false;
        if (view === "admitted" && e.status !== "admitted") return false;
        if (view === "dropped" && e.status !== "dropped") return false;
        if (!q) return true;
        return [e.student_name, e.father_name, e.mother_name, e.mobile, e.area, enquiryNo(e.enquiry_no)].some((v) => (v || "").toLowerCase().includes(q));
      })
      .sort((a, b) => (view === "open" || view === "due" ? (a.next_follow_up || "9999").localeCompare(b.next_follow_up || "9999") : b.created_at.localeCompare(a.created_at)));
  }, [list, view, query]);

  const prefill: AdmissionPrefill | null = admitFrom
    ? {
        name: admitFrom.student_name,
        class: admitFrom.class_wanted,
        gender: (admitFrom.gender === "Female" ? "Female" : "Male") as AdmissionPrefill["gender"],
        dob: admitFrom.dob || "",
        fatherName: admitFrom.father_name || "",
        motherName: admitFrom.mother_name || "",
        mobile: admitFrom.mobile,
        altMobile: admitFrom.alt_mobile || "",
        address: admitFrom.area || "",
      }
    : null;

  const admitted = async (s: Student) => {
    const e = admitFrom;
    setStudents((prev) => [s, ...prev]);
    // Only the first admission from this drawer closes the enquiry ("Admit another" is a different child).
    if (!e || e.status === "admitted") return;
    setAdmitFrom({ ...e, status: "admitted" });
    const res = await enquiryService.update(e.id, { status: "admitted", next_follow_up: null, admitted_student_id: s.id });
    if (res.data) {
      const withNote = await enquiryService.addNote(e.id, `Admitted to ${s.classSec} with SR no. ${s.srNo}.`);
      replace(withNote.data || res.data);
    }
  };

  return (
    <div className="space-y-5 pb-12">
      <header className="page-header">
        <div>
          <h1 className="page-title">Enquiries</h1>
          <p className="page-subtitle">Parents who asked about admission, and when to call them back</p>
        </div>
        <button type="button" onClick={() => setFormOpen(true)} className="btn btn-primary">
          <Plus className="h-4 w-4" />
          New enquiry
        </button>
      </header>

      {setupError ? (
        <div className="card p-8 text-center">
          <ClipboardList className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">Enquiries need a one-time database setup</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{setupError}</p>
          <button type="button" onClick={load} className="btn btn-secondary btn-sm mt-4">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Check again
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" role="tablist" aria-label="Views">
            <Tile on={view === "due"} onClick={() => setView("due")} label="Call back today" value={stats.due} dot="bg-rose-500" note={stats.due ? "Due today or overdue" : "Nobody waiting"} />
            <Tile on={view === "open"} onClick={() => setView("open")} label="Open enquiries" value={stats.open} dot="bg-brand-500" note="New and visited" />
            <Tile on={view === "admitted"} onClick={() => setView("admitted")} label="Admitted" value={stats.admitted} dot="bg-emerald-500" note={`${stats.conversion}% of closed enquiries`} />
            <Tile on={view === "dropped"} onClick={() => setView("dropped")} label="Not interested" value={stats.dropped} dot="bg-slate-400" note="Closed without admission" />
          </div>

          <section className="card overflow-hidden" aria-label="Enquiries">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 p-3 sm:p-4">
              <div className="relative w-full sm:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Child, parent, mobile or area" aria-label="Search enquiries" className="field field-sm w-full pl-9" />
              </div>
              <span className="ml-auto text-[13px] tabular-nums text-slate-500">{list ? `${shown.length} shown` : ""}</span>
            </div>

            {list === null ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-11 w-full" />
                ))}
              </div>
            ) : shown.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <ClipboardList className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 font-semibold text-slate-800">{list.length ? "Nothing here" : "No enquiry recorded yet"}</p>
                <p className="mt-1 text-sm text-slate-500">{list.length ? "Try another view or search." : "When a parent walks in or calls about admission, note it here so nobody forgets to call back."}</p>
                {!list.length && (
                  <button type="button" onClick={() => setFormOpen(true)} className="btn btn-primary btn-sm mt-4">
                    <Plus className="h-4 w-4" />
                    Record the first enquiry
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="table-head">
                    <tr>
                      <th className="px-5 py-3 text-left">Child</th>
                      <th className="px-3 py-3 text-left">Parent</th>
                      <th className="hidden px-3 py-3 text-left xl:table-cell">Heard of us</th>
                      <th className="px-3 py-3 text-left">Call back</th>
                      <th className="px-3 py-3 text-left">Status</th>
                      <th className="px-5 py-3 text-right">
                        <span className="sr-only">Admit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {shown.map((e) => {
                      const f = followUp(e);
                      const open = e.status === "new" || e.status === "visited";
                      return (
                        <tr key={e.id} onClick={() => setActive(e)} className="group cursor-pointer">
                          <td className="px-5 py-3">
                            <span className="block font-semibold text-slate-900 group-hover:text-brand-700">{e.student_name}</span>
                            <span className="block text-xs text-slate-500">
                              for <b className="font-semibold text-slate-700">{e.class_wanted}</b> · {enquiryNo(e.enquiry_no)} · {shortDay(e.created_at)}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="block text-slate-800">{e.father_name || e.mother_name || "—"}</span>
                            <a href={`tel:${e.mobile}`} onClick={(ev) => ev.stopPropagation()} className="text-xs tabular-nums text-slate-500 hover:text-brand-700 hover:underline">
                              {e.mobile}
                            </a>
                          </td>
                          <td className="hidden px-3 py-3 text-slate-600 xl:table-cell">{e.source || "—"}</td>
                          <td className="whitespace-nowrap px-3 py-3">
                            <span className={f.tone === "rose" ? "font-semibold text-rose-600" : f.tone === "amber" ? "font-semibold text-marigold-700" : f.tone === "plain" ? "text-slate-700" : "text-slate-300"}>{f.text}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`badge ${STATUS_BADGE[e.status]}`}>
                              {e.status === "admitted" && <Check className="h-3 w-3" strokeWidth={3} />}
                              {STATUS_LABEL[e.status]}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right" onClick={(ev) => ev.stopPropagation()}>
                            {open && (
                              <button type="button" onClick={() => setAdmitFrom(e)} className="btn btn-secondary btn-sm">
                                <GraduationCap className="h-3.5 w-3.5" />
                                Admit
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <EnquiryFormDrawer
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={(e) => {
          setList((prev) => [e, ...(prev || [])]);
          setFormOpen(false);
          toast(`${e.student_name}'s enquiry is saved as ${enquiryNo(e.enquiry_no)}.`, "success");
        }}
      />
      <EnquiryDetailDrawer
        enquiry={active}
        isOpen={!!active && !admitFrom}
        onClose={() => setActive(null)}
        onChanged={replace}
        onAdmit={(e) => setAdmitFrom(e)}
      />
      <AdmissionDrawer
        isOpen={!!admitFrom}
        onClose={() => setAdmitFrom(null)}
        students={students}
        prefill={prefill}
        onSaved={admitted}
        onOpenProfile={() => {
          setAdmitFrom(null);
          setActive(null);
        }}
      />
    </div>
  );
}

function Tile({ on, onClick, label, value, dot, note }: { on: boolean; onClick: () => void; label: string; value: number; dot: string; note: string }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={on}
      onClick={onClick}
      className={`rounded-2xl border bg-white p-4 text-left shadow-card transition sm:p-5 ${on ? "border-brand-500 ring-4 ring-brand-500/10" : "border-slate-200/80 hover:border-slate-300 hover:shadow-card-hover"}`}
    >
      <span className="flex items-center gap-2 text-[13px] font-semibold text-slate-600">
        <i className={`h-2 w-2 rounded-full ${dot}`} />
        {label}
        {on && <Check className="ml-auto h-4 w-4 text-brand-600" strokeWidth={2.5} />}
      </span>
      <span className="mt-1.5 block text-[28px] font-bold leading-none tracking-tight tabular-nums text-slate-900">{value}</span>
      <span className="mt-2 block text-[13px] text-slate-500">{note}</span>
    </button>
  );
}
