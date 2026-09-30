"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarPlus, Loader2, RotateCcw, Save, Trash2 } from "lucide-react";
import { useSchoolProfile } from "@/components/providers/SchoolProfileProvider";
import { schoolProfileService, SchoolProfile, Holiday } from "@/lib/services/schoolProfileService";
import { toast } from "@/components/ui/Toaster";

type Tab = "school" | "session";

const day = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const short = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5) + 1;
const todayIso = () => new Date().toLocaleDateString("en-CA");

/** Fixed-date national holidays only (festival dates change every year, so those are typed in). */
const SUGGESTED = [
  { title: "Gandhi Jayanti", date: "2026-10-02" },
  { title: "Christmas", date: "2026-12-25" },
  { title: "Republic Day", date: "2027-01-26" },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("school");
  return (
    <div className="space-y-5 pb-28">
      <header className="page-header">
        <div>
          <h1 className="page-title">School &amp; session</h1>
          <p className="page-subtitle">What prints on receipts and certificates, and the days school is closed</p>
        </div>
      </header>
      <div className="flex w-fit gap-1 rounded-xl bg-slate-200/60 p-1" role="tablist">
        {(
          [
            ["school", "School"],
            ["session", "Session & holidays"],
          ] as [Tab, string][]
        ).map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`rounded-lg px-4 py-2 text-[13.5px] font-semibold ${tab === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
            {l}
          </button>
        ))}
      </div>
      {tab === "school" ? <SchoolTab /> : <SessionTab />}
    </div>
  );
}

/* ───────────────────────── School ───────────────────────── */

function SchoolTab() {
  const { schoolProfile, updateProfile, refreshProfile, isLoading } = useSchoolProfile();
  const [form, setForm] = useState<SchoolProfile>(schoolProfile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupNeeded, setSetupNeeded] = useState(false);

  useEffect(() => setForm(schoolProfile), [schoolProfile]);
  useEffect(() => {
    schoolProfileService.getProfile().then((p) => setSetupNeeded(!!p.setupNeeded));
  }, []);

  const dirty = useMemo(() => (Object.keys(form) as (keyof SchoolProfile)[]).some((k) => k !== "updated_at" && (form[k] || "") !== (schoolProfile[k] || "")), [form, schoolProfile]);
  const set = (k: keyof SchoolProfile, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.school_name.trim()) return setError("Enter the school's name.");
    setSaving(true);
    setError(null);
    const res = await updateProfile(form);
    setSaving(false);
    if (!res.success) return setError(res.error || "Could not save.");
    await refreshProfile();
    toast(res.partial ? "Saved the main details. Some fields need the one-time settings update in the database." : "School details saved.", res.partial ? "info" : "success");
  };

  if (isLoading) return <div className="skeleton h-96 w-full" />;
  const place = [form.city, form.state].filter(Boolean).join(", ");

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        {setupNeeded && (
          <div className="alert alert-amber">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Some fields (board, UDISE, city, logo, principal…) need a one-time database update before they can be saved. Name, codes, address, phone and e-mail save now.</span>
          </div>
        )}
        {error && (
          <div className="alert alert-rose">
            <span>{error}</span>
          </div>
        )}

        <Card title="School">
          <In label="School name" required value={form.school_name} onChange={(v) => set("school_name", v)} wide />
          <In label="Short name" hint="Shown in the logo tile and crest, e.g. SPS" value={form.short_name} onChange={(v) => set("short_name", v.toUpperCase().slice(0, 5))} />
          <In label="Principal's name" hint="Printed under the signature line" value={form.principal_name} onChange={(v) => set("principal_name", v)} />
          <LogoUpload value={form.logo_url} short={form.short_name} onChange={(v) => set("logo_url", v)} />
        </Card>

        <Card title="Board and registration">
          <label className="block">
            <span className="field-label">Board</span>
            <select value={form.board || "CBSE"} onChange={(e) => set("board", e.target.value)} className="field w-full">
              {["CBSE", "RBSE", "ICSE", "Other"].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
          <In label="Affiliation no." value={form.affiliation_no} onChange={(v) => set("affiliation_no", v)} mono />
          <In label="School no. / code" value={form.school_code} onChange={(v) => set("school_code", v)} mono />
          <In label="UDISE+ code" hint="11 digits" value={form.udise_code} onChange={(v) => set("udise_code", v.replace(/\D/g, "").slice(0, 11))} mono />
        </Card>

        <Card title="Address and contact">
          <In label="Address" hint="Street / area" value={form.address} onChange={(v) => set("address", v)} wide />
          <In label="City" value={form.city} onChange={(v) => set("city", v)} />
          <In label="District" value={form.district} onChange={(v) => set("district", v)} />
          <In label="State" value={form.state} onChange={(v) => set("state", v)} />
          <In label="PIN code" value={form.pincode} onChange={(v) => set("pincode", v.replace(/\D/g, "").slice(0, 6))} mono />
          <In label="Office phone" value={form.contact1} onChange={(v) => set("contact1", v)} mono />
          <In label="Second phone" value={form.contact2} onChange={(v) => set("contact2", v)} mono />
          <In label="E-mail" value={form.email} onChange={(v) => set("email", v.trim())} />
          <In label="Website" value={form.website} onChange={(v) => set("website", v.trim())} />
        </Card>
      </div>

      {/* How it prints */}
      <aside className="space-y-3 xl:sticky xl:top-4">
        <div className="card overflow-hidden">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">How it prints</div>
          <div className="p-5 text-center" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            {form.logo_url ? (
              <img src={form.logo_url} alt="" className="mx-auto h-14 w-14 object-contain" />
            ) : (
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#1c2a5e] text-sm font-bold text-[#1c2a5e]">{form.short_name || "SPS"}</div>
            )}
            <p className="mt-2 text-lg font-bold uppercase leading-tight text-[#1c2a5e]">{form.school_name || "School name"}</p>
            <p className="text-[12px] font-bold uppercase">
              {place || "City, State"}
              {form.pincode ? ` – ${form.pincode}` : ""}
            </p>
            <p className="mt-1 text-[11px] italic text-slate-600">Affiliated to {form.board === "RBSE" ? "Board of Secondary Education, Rajasthan" : form.board === "ICSE" ? "CISCE, New Delhi" : "C.B.S.E., New Delhi"}</p>
            <p className="text-[11px] text-slate-600">
              Affiliation No. {form.affiliation_no || "—"} · School No. {form.school_code || "—"}
            </p>
            {(form.contact1 || form.email) && <p className="text-[11px] text-slate-600">{[form.contact1 && `Ph. ${form.contact1}`, form.email].filter(Boolean).join(" · ")}</p>}
          </div>
        </div>
        <p className="px-1 text-xs leading-relaxed text-slate-500">Used on fee receipts, TC, bonafide and character certificates, gate passes and the sidebar.</p>
      </aside>

      {dirty && (
        <div className="fixed inset-x-0 bottom-5 z-30 flex justify-center px-4 md:pl-[272px]">
          <div className="flex w-full max-w-xl items-center gap-3 rounded-2xl bg-night-900 px-4 py-3 text-sm text-white shadow-2xl ring-1 ring-white/5 animate-scaleUp">
            <span className="h-2 w-2 shrink-0 rounded-full bg-marigold-400" />
            <span className="flex-1 text-night-200">You have unsaved changes</span>
            <button type="button" onClick={() => setForm(schoolProfile)} className="btn btn-sm text-night-300 hover:text-white">
              <RotateCcw className="h-3.5 w-3.5" />
              Undo
            </button>
            <button type="button" onClick={save} disabled={saving} className="btn btn-sm bg-marigold-400 font-bold text-night-950 hover:bg-marigold-300">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="mb-4 text-sm font-semibold text-slate-900">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

/**
 * Pick the school logo from this computer or phone. It is shrunk in the browser to at most
 * 320px (PNG keeps a transparent background) so it stays small and prints sharp enough.
 */
function LogoUpload({ value, short, onChange }: { value: string; short: string; onChange: (v: string) => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (file?: File) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return toast("Choose a PNG or JPG image.", "error");
    if (file.size > 8 * 1024 * 1024) return toast("That picture is too big (over 8 MB).", "error");
    setBusy(true);
    try {
      const url = URL.createObjectURL(file);
      const img = await new Promise<HTMLImageElement>((ok, bad) => {
        const i = new Image();
        i.onload = () => ok(i);
        i.onerror = bad;
        i.src = url;
      });
      const scale = Math.min(1, 320 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      let data = canvas.toDataURL("image/png");
      if (data.length > 450_000) data = canvas.toDataURL("image/jpeg", 0.85); // photos: JPEG is far smaller
      if (data.length > 490_000) return toast("That picture is too detailed. Use a simpler logo image.", "error");
      onChange(data);
    } catch {
      toast("Could not read that picture. Try another file.", "error");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="sm:col-span-2">
      <span className="field-label">Logo</span>
      <div className="flex items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
          {value ? <img src={value} alt="School logo" className="h-full w-full object-contain p-1" /> : <span className="text-sm font-bold text-slate-400">{short || "SPS"}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-slate-700">{value ? "Logo uploaded" : "No logo yet: the crest with your short name is used"}</p>
          <p className="text-xs text-slate-500">PNG or JPG. A square logo on a white or clear background looks best.</p>
        </div>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="btn btn-secondary btn-sm">
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {value ? "Change" : "Upload logo"}
          </button>
          {value && (
            <button type="button" onClick={() => onChange("")} className="btn btn-sm text-rose-600 hover:bg-rose-50">
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function In({ label, value, onChange, hint, required, wide, mono }: { label: string; value: string; onChange: (v: string) => void; hint?: string; required?: boolean; wide?: boolean; mono?: boolean }) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="field-label">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </span>
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} className={`field w-full ${mono ? "font-mono" : ""}`} />
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

/* ───────────────────────── Session & holidays ───────────────────────── */

function SessionTab() {
  const [data, setData] = useState<Awaited<ReturnType<typeof schoolProfileService.session>> | null>(null);
  const [title, setTitle] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => schoolProfileService.session().then(setData);
  useEffect(() => {
    load();
  }, []);

  const add = async (t: string, a: string, b: string) => {
    if (!t.trim() || !a) return toast("Name the holiday and pick its date.", "error");
    setBusy("add");
    const r = await schoolProfileService.addHoliday(t.trim(), a, b || a);
    setBusy(null);
    if (!r.success) return toast(r.error || "Could not add.", "error");
    toast(`${t.trim()} added.`, "success");
    setTitle("");
    setFrom("");
    setTo("");
    load();
  };
  const remove = async (h: Holiday) => {
    setBusy(h.id);
    const r = await schoolProfileService.removeHoliday(h.id);
    setBusy(null);
    if (!r.success) return toast(r.error || "Could not remove.", "error");
    load();
  };

  if (!data) return <div className="skeleton h-72 w-full" />;
  const s = data.session;
  const today = todayIso();
  const total = daysBetween(s.start, s.end);
  const gone = Math.min(total, Math.max(0, daysBetween(s.start, today < s.start ? s.start : today) - (today < s.start ? 1 : 0)));
  const holidayDays = data.holidays.reduce((a, h) => a + daysBetween(h.start_date, h.end_date), 0);
  const suggestions = SUGGESTED.filter((x) => x.date >= today && !data.holidays.some((h) => h.start_date <= x.date && h.end_date >= x.date));

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
      <section className="card p-5">
        <p className="text-[13px] font-semibold text-slate-600">Current session</p>
        <p className="mt-1 text-[28px] font-bold leading-none tracking-tight text-slate-900">{s.label}</p>
        <p className="mt-2 text-[13px] text-slate-500">
          {day(s.start)} – {day(s.end)}
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${(gone / total) * 100}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          {Math.round((gone / total) * 100)}% of the session gone · {holidayDays} holiday day{holidayDays === 1 ? "" : "s"} listed · Sundays are always off
        </p>
        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">The next session (2027-28) starts at the end of March, together with promoting classes from Students → Promote &amp; transfer.</p>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Holidays</h2>
          <p className="text-xs text-slate-500">Attendance treats these days as closed, and the register greys them out</p>
        </div>
        <div className="flex flex-wrap items-end gap-2 border-b border-slate-100 bg-slate-50/60 px-5 py-3">
          <label className="min-w-[160px] flex-1">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Holiday</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Diwali vacation" className="field field-sm w-full" />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600">From</span>
            <input type="date" value={from} min={s.start} max={s.end} onChange={(e) => setFrom(e.target.value)} className="field field-sm" />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600">To (optional)</span>
            <input type="date" value={to} min={from || s.start} max={s.end} onChange={(e) => setTo(e.target.value)} className="field field-sm" />
          </label>
          <button type="button" onClick={() => add(title, from, to)} disabled={busy === "add"} className="btn btn-primary btn-sm h-9">
            {busy === "add" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CalendarPlus className="h-3.5 w-3.5" />}
            Add
          </button>
        </div>
        {suggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-2.5 text-[13px] text-slate-500">
            Add quickly:
            {suggestions.map((x) => (
              <button key={x.date} type="button" onClick={() => add(x.title, x.date, x.date)} className="btn btn-secondary btn-sm">
                {x.title} · {short(x.date)}
              </button>
            ))}
          </div>
        )}
        {data.error && <p className="px-5 py-3 text-sm text-rose-600">{data.error}</p>}
        {data.holidays.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">No holidays listed yet. Add Diwali, Holi, summer vacation and the rest for {s.label}.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.holidays.map((h) => {
              const n = daysBetween(h.start_date, h.end_date);
              const past = h.end_date < today;
              return (
                <li key={h.id} className={`flex items-center gap-3 px-5 py-2.5 ${past ? "opacity-60" : ""}`}>
                  <span className="w-16 shrink-0 text-center">
                    <span className="block text-[11px] font-semibold uppercase text-slate-400">{new Date(h.start_date + "T00:00:00").toLocaleDateString("en-IN", { month: "short" })}</span>
                    <span className="block text-lg font-bold leading-none text-slate-900">{new Date(h.start_date + "T00:00:00").getDate()}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">{h.title}</span>
                    <span className="block text-xs text-slate-500">
                      {n === 1 ? day(h.start_date) : `${day(h.start_date)} – ${day(h.end_date)} · ${n} days`}
                    </span>
                  </span>
                  <button type="button" onClick={() => remove(h)} disabled={busy === h.id} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Remove ${h.title}`}>
                    {busy === h.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
