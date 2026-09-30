"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronRight, Loader2, RotateCcw, Save, Users } from "lucide-react";
import { DEFAULT_FEE_CONFIG, FeeConfig, fineFor, planFor, validateConfig } from "@/lib/feeEngine";
import { feeSetupService, ApplyResult } from "@/lib/services/feeSetupService";
import { toast } from "@/components/ui/Toaster";
import { Modal } from "@/components/ui/modal";
import { BandDrawer, Money, inr, sum, shortDate, ALL_CLASSES } from "@/components/fees/setup/parts";
import { ConcessionCard } from "@/components/fees/setup/ConcessionCard";

const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });

export default function FeeSetupPage() {
  const [cfg, setCfg] = useState<FeeConfig | null>(null);
  const [savedCfg, setSavedCfg] = useState<FeeConfig>(DEFAULT_FEE_CONFIG);
  const [meta, setMeta] = useState<{ saved: boolean; updatedAt: string | null; updatedBy: string | null; setupMissing: boolean }>({ saved: false, updatedAt: null, updatedBy: null, setupMissing: false });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  const load = async () => {
    const res = await feeSetupService.get();
    if (!res.data) return setLoadError(res.error || "Could not load.");
    setCfg(structuredClone(res.data.config));
    setSavedCfg(res.data.config);
    setMeta(res.data);
  };
  useEffect(() => {
    load();
  }, []);

  const dirty = useMemo(() => !!cfg && JSON.stringify(cfg) !== JSON.stringify(savedCfg), [cfg, savedCfg]);
  const problem = useMemo(() => (cfg ? validateConfig(cfg) : null), [cfg]);

  // Leaving with unsaved changes loses them: ask first.
  useEffect(() => {
    if (!dirty) return;
    const onLeave = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  const save = async () => {
    if (!cfg) return;
    if (problem) return toast(problem, "error");
    setSaving(true);
    const res = await feeSetupService.save(cfg);
    setSaving(false);
    if (!res.data) return toast(res.error || "Could not save.", "error");
    setSavedCfg(res.data.config);
    setCfg(structuredClone(res.data.config));
    setMeta(res.data);
    toast("Fee setup saved. Use “Apply to students” to update their fees.", "success");
  };

  if (loadError) return <div className="card p-8 text-center text-sm text-slate-600">{loadError}</div>;
  if (!cfg) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-10 w-64" />
        <div className="skeleton h-72 w-full" />
      </div>
    );
  }

  const setIns = (i: number, patch: Partial<FeeConfig["instalments"][number]>) => setCfg({ ...cfg, instalments: cfg.instalments.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  const busYear = sum(cfg.transport.amounts);

  return (
    <div className="space-y-5 pb-28">
      <header className="page-header">
        <div>
          <h1 className="page-title">Fee setup</h1>
          <p className="page-subtitle">
            Session 2026-27 ·{" "}
            {meta.saved ? (
              <>
                saved {meta.updatedAt ? when(meta.updatedAt) : ""}
                {meta.updatedBy ? ` by ${meta.updatedBy.split(" (")[0]}` : ""}
              </>
            ) : (
              "not saved yet: showing the structure your current fees follow"
            )}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" onClick={() => setApplyOpen(true)} disabled={!meta.saved || dirty || meta.setupMissing} title={dirty ? "Save your changes first" : !meta.saved ? "Save the setup first" : undefined} className="btn btn-secondary">
            <Users className="h-4 w-4" />
            Apply to students
          </button>
          <button type="button" onClick={save} disabled={saving || meta.setupMissing || (meta.saved && !dirty)} className="btn btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : meta.saved ? "Save changes" : "Save setup"}
          </button>
        </div>
      </header>

      {meta.setupMissing && (
        <div className="alert alert-amber">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Fee setup needs a one-time database update before it can be saved. Run the fee setup SQL in Supabase, then reload this page.</span>
        </div>
      )}

      {/* ── Fee by class ── */}
      <section className="card overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Fee by class</h2>
          <p className="text-xs text-slate-500">Yearly amount of each head. Click a group to change amounts or classes.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="table-head">
              <tr>
                <th className="px-5 py-2.5 text-left">Class group</th>
                {cfg.heads.map((h) => (
                  <th key={h.key} className="px-3 py-2.5 text-right">
                    {h.name.replace(/ fee$/i, "")}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-right">Year</th>
                <th className="px-3 py-2.5 text-right">With bus</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cfg.bands.map((b, i) => {
                const heads = cfg.heads.map((h) => sum(b.amounts[h.key] || []));
                return (
                  <tr key={b.key} onClick={() => setEditing(i)} className="group cursor-pointer">
                    <td className="px-5 py-3">
                      <span className="block font-semibold text-slate-900 group-hover:text-brand-700">{b.name}</span>
                      <span className="block text-xs text-slate-500">{b.classes.join(", ") || "No classes"}</span>
                    </td>
                    {heads.map((t, j) => (
                      <td key={j} className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-slate-700">
                        {t ? inr(t) : <span className="text-slate-300">—</span>}
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-3 py-3 text-right font-bold tabular-nums text-slate-900">{inr(sum(heads))}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-slate-500">{inr(sum(heads) + busYear)}</td>
                    <td className="pr-4 text-slate-300 group-hover:text-brand-600">
                      <ChevronRight className="h-4 w-4" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <UncoveredClasses cfg={cfg} />
      </section>

      <FeeCheck cfg={cfg} />

      <div className="grid gap-5 xl:grid-cols-2">
        {/* ── Instalments & fine ── */}
        <section className="card overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Instalments and late fine</h2>
            <p className="text-xs text-slate-500">When each part of the fee is due</p>
          </div>
          <div className="divide-y divide-slate-100">
            {cfg.instalments.map((ins, i) => (
              <div key={i} className="flex flex-wrap items-center gap-3 px-5 py-2.5">
                <input value={ins.name} onChange={(e) => setIns(i, { name: e.target.value })} aria-label={`Instalment ${i + 1} name`} className="field field-sm w-32" />
                <span className="text-[13px] text-slate-500">due on</span>
                <input type="date" value={ins.due} onChange={(e) => setIns(i, { due: e.target.value })} aria-label={`${ins.name} due date`} className="field field-sm" />
              </div>
            ))}
          </div>
          <div className="space-y-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4">
            <div className="grid grid-cols-3 gap-3">
              <label>
                <span className="mb-1 block text-xs font-semibold text-slate-600">Fine per day</span>
                <Money value={cfg.fine.perDay} onChange={(v) => setCfg({ ...cfg, fine: { ...cfg.fine, perDay: Math.min(1000, v) } })} label="Fine per day" />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold text-slate-600">Most per instalment</span>
                <Money value={cfg.fine.cap} onChange={(v) => setCfg({ ...cfg, fine: { ...cfg.fine, cap: v } })} label="Fine limit" />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold text-slate-600">Grace days</span>
                <input
                  inputMode="numeric"
                  value={cfg.fine.graceDays ? String(cfg.fine.graceDays) : ""}
                  placeholder="0"
                  onChange={(e) => setCfg({ ...cfg, fine: { ...cfg.fine, graceDays: Math.min(60, parseInt(e.target.value.replace(/\D/g, "") || "0", 10)) } })}
                  aria-label="Grace days"
                  className="field field-sm w-full text-right tabular-nums"
                />
              </label>
            </div>
            <FineExample cfg={cfg} />
          </div>
        </section>

        {/* ── Transport & admission ── */}
        <section className="card overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Transport and admission fee</h2>
            <p className="text-xs text-slate-500">Added on top of the class fee</p>
          </div>
          <div className="space-y-4 px-5 py-4">
            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-xs font-semibold text-slate-600">School bus, each instalment</span>
                <span className="text-xs text-slate-500">
                  Year <b className="tabular-nums text-slate-800">{inr(busYear)}</b>
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {cfg.instalments.map((ins, i) => (
                  <Money
                    key={i}
                    value={cfg.transport.amounts[i] || 0}
                    onChange={(v) => setCfg({ ...cfg, transport: { ...cfg.transport, amounts: cfg.transport.amounts.map((x, j) => (j === i ? v : x)) } })}
                    label={`Bus fee, ${ins.name}`}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-xs text-slate-500">The same on every route.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1 block text-xs font-semibold text-slate-600">Admission fee (new students, once)</span>
                <Money value={cfg.admission.amount} onChange={(v) => setCfg({ ...cfg, admission: { ...cfg.admission, amount: v } })} label="Admission fee" />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold text-slate-600">Charged in</span>
                <select value={cfg.admission.instalment} onChange={(e) => setCfg({ ...cfg, admission: { ...cfg.admission, instalment: Number(e.target.value) } })} className="field field-sm w-full">
                  {cfg.instalments.map((ins, i) => (
                    <option key={i} value={i}>
                      {ins.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </section>
      </div>

      <ConcessionCard cfg={cfg} setCfg={setCfg} savedCfg={savedCfg} disabled={meta.setupMissing || !meta.saved} />

      {/* Unsaved changes bar */}
      {dirty && (
        <div className="fixed inset-x-0 bottom-5 z-30 flex justify-center px-4 md:pl-[272px]">
          <div className="flex w-full max-w-2xl items-center gap-3 rounded-2xl bg-night-900 px-4 py-3 text-sm text-white shadow-2xl ring-1 ring-white/5 animate-scaleUp">
            {problem ? <AlertTriangle className="h-4 w-4 shrink-0 text-marigold-400" /> : <span className="h-2 w-2 shrink-0 rounded-full bg-marigold-400" />}
            <span className={`min-w-0 flex-1 truncate ${problem ? "text-marigold-200" : "text-night-200"}`}>{problem || "You have unsaved changes"}</span>
            <button type="button" onClick={() => setCfg(structuredClone(savedCfg))} className="btn btn-sm text-night-300 hover:text-white">
              <RotateCcw className="h-3.5 w-3.5" />
              Undo
            </button>
            <button type="button" onClick={save} disabled={saving || !!problem || meta.setupMissing} className="btn btn-sm bg-marigold-400 font-bold text-night-950 hover:bg-marigold-300 disabled:opacity-50">
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save
            </button>
          </div>
        </div>
      )}

      <BandDrawer
        cfg={cfg}
        index={editing}
        onClose={() => setEditing(null)}
        onChange={(band) => editing !== null && setCfg({ ...cfg, bands: cfg.bands.map((b, i) => (i === editing ? band : b)) })}
      />
      <ApplyModal isOpen={applyOpen} onClose={() => setApplyOpen(false)} />
    </div>
  );
}

/** Classes that no group covers get no class fee: say so. */
function UncoveredClasses({ cfg }: { cfg: FeeConfig }) {
  const covered = new Set(cfg.bands.flatMap((b) => b.classes));
  const missing = ALL_CLASSES.filter((c) => !covered.has(c) && c !== "Pre Nursery");
  if (!missing.length) return null;
  return (
    <p className="border-t border-slate-100 bg-marigold-50 px-5 py-2.5 text-[13px] text-marigold-900">
      Not in any group, so no class fee: <b>{missing.join(", ")}</b>
    </p>
  );
}

/** Worked example so the fine rule is unambiguous. */
function FineExample({ cfg }: { cfg: FeeConfig }) {
  const ins = cfg.instalments[1] || cfg.instalments[0];
  if (!ins || !/^\d{4}-\d{2}-\d{2}$/.test(ins.due)) return null;
  const d = new Date(ins.due + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 20);
  const paid = d.toISOString().slice(0, 10);
  const f = fineFor(cfg, ins.due, paid);
  const daysToCap = cfg.fine.perDay ? Math.ceil(cfg.fine.cap / cfg.fine.perDay) + cfg.fine.graceDays : 0;
  return (
    <p className="text-[13px] leading-relaxed text-slate-600">
      {cfg.fine.perDay ? (
        <>
          Example: {ins.name} due {shortDate(ins.due)}, paid {shortDate(paid)} (20 days late) → fine <b className="text-slate-900">{inr(f)}</b>.
          {cfg.fine.cap ? ` It stops growing at ${inr(cfg.fine.cap)} (after ${daysToCap} days).` : " There is no upper limit."}
        </>
      ) : (
        "No late fine is charged."
      )}
    </p>
  );
}

/** Pick a class and see exactly what a student pays, instalment by instalment. */
function FeeCheck({ cfg }: { cfg: FeeConfig }) {
  const classes = cfg.bands.flatMap((b) => b.classes);
  const [cls, setCls] = useState(classes.includes("1st") ? "1st" : classes[0] || "");
  const [bus, setBus] = useState(false);
  const [newAdm, setNewAdm] = useState(false);
  const [con, setCon] = useState("");
  const plan = planFor(cfg, { cls, bus, newAdmission: newAdm, concession: con || null });

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3">
        <div className="mr-auto">
          <h2 className="text-sm font-semibold text-slate-900">Check a student&rsquo;s fee</h2>
          <p className="text-xs text-slate-500">What they pay in each instalment, with the setup above</p>
        </div>
        <select value={cls} onChange={(e) => setCls(e.target.value)} aria-label="Class" className="field field-sm">
          {classes.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <Toggle on={bus} onClick={() => setBus(!bus)} label="Bus" />
        <Toggle on={newAdm} onClick={() => setNewAdm(!newAdm)} label="New admission" />
        <select value={con} onChange={(e) => setCon(e.target.value)} aria-label="Concession" className="field field-sm">
          <option value="">No concession</option>
          {cfg.concessions
            .filter((c) => c.name.trim())
            .map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} {c.percent}%
              </option>
            ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="table-head">
            <tr>
              <th className="px-5 py-2.5 text-left">
                <span className="sr-only">Head</span>
              </th>
              {plan.instalments.map((ins) => (
                <th key={ins.name} className="whitespace-nowrap px-3 py-2.5 text-right">
                  <span className="block">{ins.name}</span>
                  <span className="block font-normal text-slate-400">by {shortDate(ins.due)}</span>
                </th>
              ))}
              <th className="px-5 py-2.5 text-right">Year</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {plan.lines.map((l) => (
              <tr key={l.key} className="hover:bg-transparent">
                <td className="whitespace-nowrap px-5 py-2 text-slate-700">{l.name}</td>
                {l.amounts.map((a, i) => (
                  <td key={i} className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-slate-700">
                    {a ? inr(a) : <span className="text-slate-300">—</span>}
                  </td>
                ))}
                <td className="whitespace-nowrap px-5 py-2 text-right tabular-nums text-slate-900">{inr(l.total)}</td>
              </tr>
            ))}
            {plan.concession && (
              <tr className="hover:bg-transparent">
                <td className="whitespace-nowrap px-5 py-2 text-emerald-700">
                  {plan.concession.name} concession ({plan.concession.percent}%)
                </td>
                {plan.concession.amounts.map((a, i) => (
                  <td key={i} className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-emerald-700">
                    {a ? `−${inr(a)}` : <span className="text-slate-300">—</span>}
                  </td>
                ))}
                <td className="whitespace-nowrap px-5 py-2 text-right tabular-nums text-emerald-700">−{inr(plan.concession.total)}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 bg-brand-50/60">
              <td className="px-5 py-2.5 font-semibold text-slate-900">To pay</td>
              {plan.net.map((a, i) => (
                <td key={i} className="whitespace-nowrap px-3 py-2.5 text-right font-semibold tabular-nums text-slate-900">
                  {inr(a)}
                </td>
              ))}
              <td className="whitespace-nowrap px-5 py-2.5 text-right text-base font-bold tabular-nums text-brand-700">{inr(plan.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={onClick} className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-semibold transition ${on ? "border-brand-300 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
      <span className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${on ? "border-brand-600 bg-brand-600" : "border-slate-300"}`}>{on && <CheckCircle2 className="h-3 w-3 text-white" />}</span>
      {label}
    </button>
  );
}

/** Shows what applying the setup would change, then applies it on confirmation. */
function ApplyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [preview, setPreview] = useState<ApplyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<ApplyResult | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setPreview(null);
    setError(null);
    setDone(null);
    feeSetupService.apply(true).then((r) => (r.data ? setPreview(r.data) : setError(r.error || "Could not work it out.")));
  }, [isOpen]);

  const go = async () => {
    setBusy(true);
    const r = await feeSetupService.apply(false);
    setBusy(false);
    if (!r.data) return setError(r.error || "Could not apply.");
    setDone(r.data);
    toast(`Fees updated for ${r.data.changed} students.`, "success");
  };

  const net = (t: number, d: number) => inr(t - d);

  return (
    <Modal isOpen={isOpen} onClose={() => !busy && onClose()} title="Apply fee setup to students" maxWidth="max-w-2xl">
      <div className="space-y-4 text-sm">
        {error ? (
          <div className="alert alert-rose">
            <span>{error}</span>
          </div>
        ) : !preview ? (
          <div className="flex items-center gap-2 py-8 text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Working out every student&rsquo;s fee…
          </div>
        ) : done ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
            <p className="mt-2 font-semibold text-slate-900">{done.changed} students updated</p>
            <p className="mt-1 text-slate-500">Payments already made are unchanged.</p>
            <button type="button" onClick={onClose} className="btn btn-primary btn-sm mt-4">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Checked" value={preview.checked} />
              <Stat label="Already correct" value={preview.unchanged} tone="emerald" />
              <Stat label="Will change" value={preview.changed} tone={preview.changed ? "brand" : undefined} />
            </div>
            {preview.changed > 0 && (
              <p className="text-slate-600">
                Fees go up by <b className="text-slate-900">{inr(preview.raise)}</b> and down by <b className="text-slate-900">{inr(preview.reduce)}</b> in total. What students have already paid does not change.
              </p>
            )}
            {preview.blocked.length > 0 && (
              <div className="alert alert-amber">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {preview.blocked.length} student{preview.blocked.length > 1 ? "s have" : " has"} already paid more than the new fee, so they are left as they are: {preview.blocked.slice(0, 5).map((b) => b.name).join(", ")}
                  {preview.blocked.length > 5 ? "…" : ""}
                </span>
              </div>
            )}
            {preview.noGroup.length > 0 && (
              <div className="alert alert-amber">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Classes in no group are left as they are: {preview.noGroup.join(", ")}</span>
              </div>
            )}
            {preview.changes.length > 0 && (
              <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200">
                <table className="w-full text-[13px]">
                  <thead className="table-head sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Student</th>
                      <th className="px-3 py-2 text-right">Fee now</th>
                      <th className="px-3 py-2 text-right">New fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {preview.changes.map((c) => (
                      <tr key={c.studentId}>
                        <td className="px-3 py-1.5">
                          <span className="font-medium text-slate-900">{c.name}</span> <span className="text-slate-500">· {c.classSec}</span>
                        </td>
                        <td className="px-3 py-1.5 text-right tabular-nums text-slate-500">{net(c.oldTotal, c.oldDiscount)}</td>
                        <td className="px-3 py-1.5 text-right font-semibold tabular-nums text-slate-900">{net(c.newTotal, c.newDiscount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.changed > preview.changes.length && <p className="px-3 py-2 text-xs text-slate-500">…and {preview.changed - preview.changes.length} more</p>}
              </div>
            )}
            <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary btn-sm">
                {preview.changed ? "Cancel" : "Close"}
              </button>
              {preview.changed > 0 && (
                <button type="button" onClick={go} disabled={busy} className="btn btn-primary btn-sm">
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update {preview.changed} students
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "emerald" | "brand" }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2.5">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-xl font-bold tabular-nums ${tone === "emerald" ? "text-emerald-700" : tone === "brand" ? "text-brand-700" : "text-slate-900"}`}>{value.toLocaleString("en-IN")}</div>
    </div>
  );
}
