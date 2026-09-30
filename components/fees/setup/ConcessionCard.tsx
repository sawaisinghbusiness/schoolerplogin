"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { Concession, FeeConfig, planFor } from "@/lib/feeEngine";
import { Student } from "@/data/mockData";
import { studentService } from "@/lib/services/studentService";
import { feeSetupService, ConcessionHolder } from "@/lib/services/feeSetupService";
import { toast } from "@/components/ui/Toaster";
import { inr } from "@/components/fees/setup/parts";

/**
 * Concession types live in the fee setup (saved with the page);
 * giving one to a student saves straight away and recalculates that student's discount.
 */
export function ConcessionCard({ cfg, setCfg, savedCfg, disabled }: { cfg: FeeConfig; setCfg: (c: FeeConfig) => void; savedCfg: FeeConfig; disabled: boolean }) {
  const [holders, setHolders] = useState<ConcessionHolder[] | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [pick, setPick] = useState<Student | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => feeSetupService.concessions().then((r) => setHolders(r.data));
  useEffect(() => {
    load();
    studentService.fetchStudents().then((r) => setStudents(r.data.filter((s) => s.status !== "Inactive")));
  }, []);

  const setType = (i: number, patch: Partial<Concession>) => setCfg({ ...cfg, concessions: cfg.concessions.map((c, j) => (j === i ? { ...c, ...patch } : c)) });
  const addType = () => {
    let k = 1;
    while (cfg.concessions.some((c) => c.code === `custom${k}`)) k++;
    setCfg({ ...cfg, concessions: [...cfg.concessions, { code: `custom${k}`, name: "", percent: 0, on: "tuition" }] });
  };
  const removeType = (i: number) => setCfg({ ...cfg, concessions: cfg.concessions.filter((_, j) => j !== i) });
  const countOf = (c: string) => (holders || []).filter((h) => h.code === c).length;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return students.filter((s) => s.name.toLowerCase().includes(q) || s.srNo.toLowerCase().includes(q) || (s.fatherName || "").toLowerCase().includes(q)).slice(0, 6);
  }, [query, students]);

  // Only types that are already saved can be given (the backend checks the saved setup).
  const savedCodes = savedCfg.concessions.filter((c) => c.name.trim());

  const give = async () => {
    if (!pick || !code) return;
    setBusy("give");
    const res = await feeSetupService.setConcession(pick.id, code);
    setBusy(null);
    if (!res.success) return toast(res.error || "Could not save.", "error");
    toast(`${pick.name} now gets the ${savedCfg.concessions.find((c) => c.code === code)?.name} concession.`, "success");
    setAdding(false);
    setPick(null);
    setQuery("");
    load();
  };
  const remove = async (h: ConcessionHolder) => {
    setBusy(h.studentId);
    const res = await feeSetupService.setConcession(h.studentId, null);
    setBusy(null);
    if (!res.success) return toast(res.error || "Could not remove.", "error");
    toast(`Concession removed for ${h.name}.`, "success");
    load();
  };

  const preview = pick && code ? planFor(savedCfg, { cls: pick.class, bus: pick.transportOpted, newAdmission: false, concession: code }) : null;

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Concessions</h2>
          <p className="text-xs text-slate-500">Taken off the fee as a discount; bus and admission fee are never discounted</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="table-head">
            <tr>
              <th className="px-5 py-2.5 text-left">Name</th>
              <th className="px-3 py-2.5 text-left">Discount</th>
              <th className="px-3 py-2.5 text-left">On</th>
              <th className="px-3 py-2.5 text-right">Students</th>
              <th className="px-5 py-2.5">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cfg.concessions.map((c, i) => (
              <tr key={c.code} className="hover:bg-transparent">
                <td className="px-5 py-2">
                  <input value={c.name} onChange={(e) => setType(i, { name: e.target.value })} placeholder="e.g. Single girl child" aria-label="Concession name" className="field field-sm w-full min-w-[140px]" />
                </td>
                <td className="px-3 py-2">
                  <div className="relative w-24">
                    <input
                      inputMode="numeric"
                      value={c.percent ? String(c.percent) : ""}
                      placeholder="0"
                      onChange={(e) => setType(i, { percent: Math.min(100, parseInt(e.target.value.replace(/\D/g, "") || "0", 10)) })}
                      aria-label={`${c.name} percent`}
                      className="field field-sm w-full pr-7 text-right tabular-nums"
                    />
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[13px] text-slate-400">%</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <select value={c.on} onChange={(e) => setType(i, { on: e.target.value as Concession["on"] })} aria-label={`${c.name} applies to`} className="field field-sm">
                    <option value="tuition">Tuition fee only</option>
                    <option value="school">All school fees</option>
                  </select>
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-700">{holders ? countOf(c.code) : "…"}</td>
                <td className="px-5 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => removeType(i)}
                    disabled={countOf(c.code) > 0}
                    title={countOf(c.code) > 0 ? "Some students have this concession" : "Remove"}
                    className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                    aria-label={`Remove ${c.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-b border-slate-100 px-5 py-2.5">
        <button type="button" onClick={addType} className="text-[13px] font-semibold text-brand-700 hover:underline">
          + Add a concession type
        </button>
      </div>

      {/* Who has one */}
      <div className="px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Students with a concession</h3>
          {!adding && (
            <button type="button" onClick={() => setAdding(true)} disabled={disabled} className="btn btn-soft btn-sm">
              <Plus className="h-3.5 w-3.5" />
              Give concession
            </button>
          )}
        </div>

        {adding && (
          <div className="mb-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            {pick ? (
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900">{pick.name}</div>
                  <div className="text-xs text-slate-500">
                    {pick.classSec} · {pick.srNo} · {pick.fatherName}
                  </div>
                </div>
                <button type="button" onClick={() => setPick(null)} className="btn btn-secondary btn-sm">
                  Change
                </button>
              </div>
            ) : (
              <div>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Student name, SR no. or father" aria-label="Find student" className="field field-sm w-full pl-9" />
                </div>
                {results.length > 0 && (
                  <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                    {results.map((s) => (
                      <li key={s.id}>
                        <button type="button" onClick={() => setPick(s)} className="w-full px-3 py-2 text-left hover:bg-slate-50">
                          <span className="block text-sm font-semibold text-slate-900">{s.name}</span>
                          <span className="block text-xs text-slate-500">
                            {s.classSec} · {s.srNo} · {s.fatherName}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <select value={code} onChange={(e) => setCode(e.target.value)} aria-label="Concession" className="field field-sm">
                <option value="">Choose concession</option>
                {savedCodes.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.percent}%)
                  </option>
                ))}
              </select>
              {preview && (
                <span className="text-[13px] text-slate-600">
                  Takes <b className="text-emerald-700">{inr(preview.discount)}</b> off · fee becomes <b className="text-slate-900">{inr(preview.total)}</b>
                </span>
              )}
              <span className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdding(false);
                    setPick(null);
                    setQuery("");
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button type="button" onClick={give} disabled={!pick || !code || busy === "give"} className="btn btn-primary btn-sm">
                  {busy === "give" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save
                </button>
              </span>
            </div>
          </div>
        )}

        {holders === null ? (
          <div className="skeleton h-10 w-full" />
        ) : holders.length === 0 ? (
          <p className="text-sm text-slate-500">Nobody has a concession yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {holders.map((h) => (
              <li key={h.studentId} className="flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-900">{h.name}</div>
                  <div className="truncate text-xs text-slate-500">
                    {h.classSec} · {h.srNo}
                  </div>
                </div>
                <span className="badge badge-emerald">{savedCfg.concessions.find((c) => c.code === h.code)?.name || h.code}</span>
                <span className="w-24 text-right text-sm font-semibold tabular-nums text-emerald-700">−{inr(h.discount)}</span>
                <button type="button" onClick={() => remove(h)} disabled={busy === h.studentId} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Remove concession for ${h.name}`}>
                  {busy === h.studentId ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
