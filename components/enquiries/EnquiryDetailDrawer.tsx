"use client";

import React, { useEffect, useState } from "react";
import { GraduationCap, Loader2, Phone } from "lucide-react";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { enquiryService, Enquiry, EnquiryStatus, STATUS_LABEL, enquiryNo } from "@/lib/services/enquiryService";
import { dayIso, FOLLOW_UP_CHIPS } from "@/components/enquiries/EnquiryFormDrawer";
import { toast } from "@/components/ui/Toaster";

const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });
const day = (iso?: string | null) => (iso ? new Date(iso.slice(0, 10) + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");

export const STATUS_BADGE: Record<EnquiryStatus, string> = {
  new: "badge-brand",
  visited: "badge-amber",
  admitted: "badge-emerald",
  dropped: "badge-slate",
};

export function EnquiryDetailDrawer({
  enquiry,
  isOpen,
  onClose,
  onChanged,
  onAdmit,
}: {
  enquiry: Enquiry | null;
  isOpen: boolean;
  onClose: () => void;
  onChanged: (e: Enquiry) => void;
  onAdmit: (e: Enquiry) => void;
}) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => setNote(""), [enquiry?.id, isOpen]);

  if (!enquiry) return null;
  const e = enquiry;
  const open = e.status === "new" || e.status === "visited";

  const patch = async (key: string, input: Parameters<typeof enquiryService.update>[1]) => {
    setBusy(key);
    const res = await enquiryService.update(e.id, input);
    setBusy(null);
    if (!res.success || !res.data) return toast(res.error || "Could not save.", "error");
    onChanged(res.data);
  };

  const saveNote = async () => {
    if (!note.trim()) return;
    setBusy("note");
    const res = await enquiryService.addNote(e.id, note.trim());
    setBusy(null);
    if (!res.success || !res.data) return toast(res.error || "Could not save the note.", "error");
    setNote("");
    onChanged(res.data);
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      busy={!!busy}
      title={e.student_name}
      subtitle={`${enquiryNo(e.enquiry_no)} · for ${e.class_wanted} · asked on ${day(e.created_at)}`}
      headerExtra={<span className={`badge ${STATUS_BADGE[e.status]}`}>{STATUS_LABEL[e.status]}</span>}
      footer={
        <>
          <a href={`tel:${e.mobile}`} className="btn btn-secondary">
            <Phone className="h-4 w-4" />
            Call {e.mobile}
          </a>
          {open ? (
            <button type="button" onClick={() => onAdmit(e)} className="btn btn-primary ml-auto">
              <GraduationCap className="h-4 w-4" />
              Admit {e.student_name.split(" ")[0]}
            </button>
          ) : (
            <span className="ml-auto text-[13px] text-slate-500">{e.status === "admitted" ? "Admitted. See the student list." : "Marked not interested"}</span>
          )}
        </>
      }
    >
      <div className="space-y-4 p-5">
        {/* Where it stands */}
        {e.status !== "admitted" && (
          <section className="card p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Status</h3>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1" role="radiogroup" aria-label="Status">
              {(["new", "visited", "dropped"] as EnquiryStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={e.status === s}
                  disabled={!!busy}
                  onClick={() => e.status !== s && patch("status", { status: s, ...(s === "dropped" ? { next_follow_up: null } : {}) })}
                  className={`rounded-lg py-2 text-[13px] font-semibold transition ${e.status === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </section>
        )}

        {open && (
          <section className="card p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Next follow-up</h3>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                aria-label="Next follow-up"
                value={e.next_follow_up || ""}
                onChange={(ev) => patch("date", { next_follow_up: ev.target.value || null })}
                className="field field-sm"
              />
              {FOLLOW_UP_CHIPS.map((c) => (
                <button key={c.label} type="button" disabled={!!busy} onClick={() => patch("date", { next_follow_up: dayIso(c.days) })} className="btn btn-secondary btn-sm">
                  {c.label}
                </button>
              ))}
              {busy === "date" && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
            </div>
          </section>
        )}

        <section className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Details</h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Info label="Father" value={e.father_name} />
            <Info label="Mother" value={e.mother_name} />
            <Info label="Mobile" value={e.mobile} />
            <Info label="Other mobile" value={e.alt_mobile} />
            <Info label="Area" value={e.area} />
            <Info label="Present school" value={e.previous_school} />
            <Info label="Gender" value={e.gender === "Male" ? "Boy" : e.gender === "Female" ? "Girl" : e.gender} />
            <Info label="Date of birth" value={day(e.dob)} />
            <Info label="Heard of us" value={e.source} />
            <Info label="Recorded by" value={e.created_by_name} />
          </dl>
        </section>

        {/* Conversation log */}
        <section className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Follow-up notes</h3>
          <div className="mb-4 space-y-2">
            <textarea
              value={note}
              onChange={(ev) => setNote(ev.target.value)}
              rows={2}
              placeholder="What happened? e.g. Called, father will visit on Saturday with documents"
              aria-label="New note"
              className="field w-full"
            />
            <div className="flex justify-end">
              <button type="button" onClick={saveNote} disabled={!note.trim() || !!busy} className="btn btn-soft btn-sm">
                {busy === "note" && <Loader2 className="h-4 w-4 animate-spin" />}
                Add note
              </button>
            </div>
          </div>
          {e.notes.length === 0 ? (
            <p className="text-sm text-slate-500">No notes yet.</p>
          ) : (
            <ol className="relative space-y-4 border-l border-slate-200 pl-4">
              {[...e.notes].reverse().map((n, i) => (
                <li key={i} className="relative">
                  <span aria-hidden className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-500 ring-1 ring-brand-200" />
                  <p className="text-sm text-slate-800">{n.text}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {when(n.at)} · {n.by}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </SideDrawer>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 truncate text-slate-900">{value || <span className="text-slate-400">—</span>}</dd>
    </div>
  );
}
