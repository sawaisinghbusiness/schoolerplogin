"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Check, Images, Loader2, Lock, X } from "lucide-react";
import { Student } from "@/data/mockData";
import { studentService } from "@/lib/services/studentService";
import { BulkResult, photoService } from "@/lib/services/photoService";
import { shrinkPhoto } from "@/lib/shrinkPhoto";
import { initials } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/Toaster";
import { ConfirmModal } from "@/components/settings/classes/shared";

const CLASS_ORDER = ["Pre Nursery", "Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
const rank = (c: string) => (CLASS_ORDER.indexOf(c) === -1 ? 99 : CLASS_ORDER.indexOf(c));
const bySectionRoll = (a: Student, b: Student) =>
  a.section.localeCompare(b.section) || (a.rollNo || "").localeCompare(b.rollNo || "", undefined, { numeric: true }) || a.name.localeCompare(b.name);
const role = () => {
  try {
    return localStorage.getItem("schooldesk_user_role") || "";
  } catch {
    return "";
  }
};

export default function PhotosPage() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [cls, setCls] = useState("");
  const [sec, setSec] = useState("");
  const [only, setOnly] = useState<"all" | "missing">("all");
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [removing, setRemoving] = useState<Student | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [me, setMe] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const target = useRef<string | null>(null);

  const load = () => studentService.fetchStudents().then((r) => setStudents(r.data.filter((s) => s.status !== "Inactive")));
  useEffect(() => {
    load();
    setMe(role());
  }, []);

  const classes = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const s of students || []) {
      if (!m.has(s.class)) m.set(s.class, new Set());
      m.get(s.class)!.add(s.section);
    }
    return Array.from(m.entries())
      .sort((a, b) => rank(a[0]) - rank(b[0]))
      .map(([name, secs]) => ({ name, sections: Array.from(secs).sort() }));
  }, [students]);
  useEffect(() => {
    if (!cls && classes.length) setCls(classes[0].name);
  }, [classes, cls]);

  const inClass = useMemo(() => (students || []).filter((s) => s.class === cls && (!sec || s.section === sec)).sort(bySectionRoll), [students, cls, sec]);
  const withPhoto = inClass.filter((s) => s.photoUrl).length;
  const shown = only === "missing" ? inClass.filter((s) => !s.photoUrl) : inClass;
  const canEdit = me === "admin" || me === "accountant";

  const setPhoto = (id: string, url: string) => setStudents((prev) => (prev || []).map((s) => (s.id === id ? { ...s, photoUrl: url } : s)));
  const mark = (id: string, on: boolean) =>
    setBusy((prev) => {
      const n = new Set(prev);
      on ? n.add(id) : n.delete(id);
      return n;
    });

  const pick = (s: Student) => {
    if (!canEdit || busy.has(s.id)) return;
    target.current = s.id;
    fileRef.current?.click();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const id = target.current;
    e.target.value = "";
    if (!file || !id) return;
    mark(id, true);
    try {
      const image = await shrinkPhoto(file);
      const r = await photoService.set(id, image);
      if (r.error || !r.url) toast(r.error || "Could not save the photo.", "error");
      else setPhoto(id, r.url);
    } catch (err: any) {
      toast(err?.message || "Could not use this photo.", "error");
    }
    mark(id, false);
  };

  const remove = async () => {
    if (!removing) return;
    const s = removing;
    mark(s.id, true);
    const r = await photoService.remove(s.id);
    mark(s.id, false);
    setRemoving(null);
    if (r.error) return toast(r.error, "error");
    setPhoto(s.id, "");
    toast(`${s.name}'s photo removed.`, "success");
  };

  return (
    <div className="space-y-5 pb-12">
      <header className="page-header">
        <h1 className="page-title">Photos</h1>
        {canEdit && (
          <div className="flex justify-end">
            <button type="button" onClick={() => setBulkOpen(true)} className="btn btn-secondary px-3 sm:px-4" aria-label="Upload many photos">
              <Images className="h-4 w-4" />
              <span className="hidden sm:inline">Upload many</span>
            </button>
          </div>
        )}
      </header>

      {me && !canEdit && (
        <div className="card flex items-center gap-3 p-4 text-sm text-slate-700">
          <Lock className="h-4 w-4 shrink-0 text-slate-400" />
          Only the admin and the accountant can add photos.
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />

      {students === null ? (
        <div className="card skeleton h-72" />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={cls}
              onChange={(e) => {
                setCls(e.target.value);
                setSec("");
              }}
              aria-label="Class"
              className="field field-sm w-36"
            >
              {classes.map((c) => (
                <option key={c.name}>{c.name}</option>
              ))}
            </select>
            <select value={sec} onChange={(e) => setSec(e.target.value)} aria-label="Section" className="field field-sm w-36">
              <option value="">All sections</option>
              {(classes.find((c) => c.name === cls)?.sections || []).map((s) => (
                <option key={s} value={s}>
                  Section {s}
                </option>
              ))}
            </select>
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Show">
              {(
                [
                  ["all", `All ${inClass.length}`],
                  ["missing", `No photo ${inClass.length - withPhoto}`],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={only === k}
                  onClick={() => setOnly(k)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-semibold tabular-nums transition ${only === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {shown.length === 0 ? (
            <div className="card px-6 py-16 text-center text-sm text-slate-600">
              {inClass.length ? (
                <>
                  <Check className="mx-auto h-8 w-8 text-emerald-600" strokeWidth={2.5} />
                  <p className="mt-3 font-semibold text-slate-900">Everyone here has a photo</p>
                </>
              ) : (
                "No students in this class."
              )}
            </div>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {shown.map((s) => (
                <li key={s.id} className="relative">
                  <button
                    type="button"
                    onClick={() => pick(s)}
                    disabled={!canEdit}
                    aria-label={s.photoUrl ? `Replace photo of ${s.name}` : `Add photo of ${s.name}`}
                    className="group block w-full text-left"
                  >
                    <span className="relative block aspect-[3/4] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
                      {s.photoUrl ? (
                        <img src={s.photoUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-50 text-slate-400">
                          <span className="text-2xl font-bold text-slate-400">{initials(s.name)}</span>
                          {canEdit && <Camera className="h-5 w-5" />}
                        </span>
                      )}
                      {busy.has(s.id) && (
                        <span className="absolute inset-0 flex items-center justify-center bg-white/70">
                          <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
                        </span>
                      )}
                    </span>
                    <span className="mt-1.5 block truncate text-[13px] font-medium text-slate-900">{s.name}</span>
                    <span className="block text-xs tabular-nums text-slate-500">{s.rollNo ? `Roll ${s.rollNo}` : "—"}</span>
                  </button>
                  {canEdit && s.photoUrl && !busy.has(s.id) && (
                    <button
                      type="button"
                      onClick={() => setRemoving(s)}
                      aria-label={`Remove photo of ${s.name}`}
                      className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-600 shadow ring-1 ring-slate-200 hover:text-rose-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <BulkModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onDone={() => {
          load();
        }}
      />
      <ConfirmModal isOpen={!!removing} title={`Remove ${removing?.name || ""}'s photo?`} confirmLabel="Remove" danger busy={!!removing && busy.has(removing.id)} onConfirm={remove} onClose={() => setRemoving(null)}>
        The card will show initials until a new photo is added.
      </ConfirmModal>
    </div>
  );
}

/** Many photos at once, matched to students by the SR number in each file name. */
function BulkModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [results, setResults] = useState<BulkResult[] | null>(null);

  useEffect(() => {
    if (open) {
      setProgress(null);
      setResults(null);
    }
  }, [open]);

  const run = async (files: File[]) => {
    if (!files.length) return;
    const all: BulkResult[] = [];
    setResults(null);
    setProgress({ done: 0, total: files.length });
    let batch: { srNo: string; image: string }[] = [];
    const flush = async () => {
      if (!batch.length) return;
      const r = await photoService.bulk(batch);
      all.push(...(r.results || batch.map((b) => ({ srNo: b.srNo, ok: false, error: r.error || "Could not save." }))));
      batch = [];
    };
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const srNo = f.name.replace(/\.[^.]+$/, "").trim();
      try {
        batch.push({ srNo, image: await shrinkPhoto(f) });
      } catch (e: any) {
        all.push({ srNo, ok: false, error: e?.message || "Could not use this photo." });
      }
      if (batch.length === 8) await flush();
      setProgress({ done: i + 1, total: files.length });
    }
    await flush();
    setProgress(null);
    setResults(all);
    onDone();
  };

  const saved = results?.filter((r) => r.ok).length || 0;
  const failed = results?.filter((r) => !r.ok) || [];

  return (
    <Modal isOpen={open} onClose={() => !progress && onClose()} title="Upload many photos" maxWidth="max-w-lg">
      <div className="space-y-4">
        <input
          ref={ref}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            e.target.value = "";
            run(files);
          }}
        />
        {!progress && !results && (
          <>
            <p className="text-sm text-slate-700">
              Name each photo with the student&apos;s SR no., for example <span className="font-mono text-[13px] font-semibold">SR-2024-1001.jpg</span>.
            </p>
            <button type="button" onClick={() => ref.current?.click()} className="btn btn-primary w-full">
              <Images className="h-4 w-4" />
              Choose photos
            </button>
          </>
        )}
        {progress && (
          <div>
            <div className="flex justify-between text-sm tabular-nums text-slate-700">
              <span>Saving photos…</span>
              <span>
                {progress.done} of {progress.total}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
            </div>
          </div>
        )}
        {results && (
          <>
            <p className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
              <Check className="h-5 w-5 text-emerald-600" strokeWidth={2.5} />
              {saved} saved{failed.length ? `, ${failed.length} not saved` : ""}
            </p>
            {failed.length > 0 && (
              <ul className="max-h-56 divide-y divide-slate-100 overflow-y-auto rounded-xl ring-1 ring-slate-200">
                {failed.map((r, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-3 px-3 py-2 text-sm">
                    <span className="min-w-0 truncate font-mono text-[13px] text-slate-800">{r.srNo || "(no name)"}</span>
                    <span className="shrink-0 text-xs text-slate-600">{r.error}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button type="button" onClick={() => ref.current?.click()} className="btn btn-secondary">
                Add more
              </button>
              <button type="button" onClick={onClose} className="btn btn-primary">
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
