"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, Loader2, Plus, X } from "lucide-react";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { ExamPart, PART_PRESETS, maxOf, partsProblem } from "@/lib/grading";
import { Exam, ExamInput, ExamScope, examService } from "@/lib/services/examService";
import type { ClassItem } from "@/lib/services/classService";

const NAMES = ["Periodic Test 1", "Half Yearly", "Periodic Test 2", "Annual", "Pre-Board"];

const keyFor = (name: string, taken: string[]) => {
  let base = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 16) || "part";
  let k = base;
  for (let i = 2; taken.includes(k); i++) k = `${base}_${i}`;
  return k;
};

const uniq = (xs: string[]) => Array.from(new Set(xs));
const flip = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/**
 * Add or change an exam: its name, dates, the parts marks are entered in, and for each class
 * which sections and subjects sit it (default: all) and the units each subject covers.
 */
export function ExamDrawer({ isOpen, exam, classes, nextOrder, onClose, onSaved }: {
  isOpen: boolean;
  exam: Exam | null;
  classes: ClassItem[];
  nextOrder: number;
  onClose: () => void;
  onSaved: (e: Exam) => void;
}) {
  const [title, setTitle] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [parts, setParts] = useState<ExamPart[]>(PART_PRESETS[0].parts);
  const [scope, setScope] = useState<ExamScope>({});
  const [open, setOpen] = useState<string[]>([]);
  const names = classes.map((c) => c.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(exam?.title || "");
    setPicked(exam?.classes || []);
    setScope(exam?.scope || {});
    setOpen(Object.keys(exam?.scope || {}));
    setStart(exam?.start_date || "");
    setEnd(exam?.end_date || "");
    setParts(exam?.components || PART_PRESETS[0].parts);
    setError(null);
  }, [isOpen, exam, classes]);

  const preset = PART_PRESETS.find((p) => JSON.stringify(p.parts) === JSON.stringify(parts))?.key || "custom";
  const toggle = (c: string) => {
    const on = !picked.includes(c);
    setPicked((p) => (on ? [...p, c] : p.filter((x) => x !== c)));
    // A class picked on its own opens, so its sections and subjects are in view.
    setOpen((o) => (on ? uniq([...o, c]) : o.filter((x) => x !== c)));
  };

  /* What a class sits: chosen sections (default all) and the subjects of those sections (default all). */
  const sectionsOf = (cls: string) => classes.find((c) => c.name === cls)?.sections || [];
  const chosenSecs = (cls: string) => {
    const all = sectionsOf(cls).map((x) => x.name);
    const sel = (scope[cls]?.sections || []).filter((x) => all.includes(x));
    return sel.length ? sel : all;
  };
  const subjectsOf = (cls: string) => uniq(sectionsOf(cls).filter((x) => chosenSecs(cls).includes(x.name)).flatMap((x) => x.subjects));
  const chosenSubs = (cls: string) => {
    const all = subjectsOf(cls);
    const sel = (scope[cls]?.subjects || []).filter((x) => all.includes(x));
    return sel.length ? sel : all;
  };
  const patchScope = (cls: string, patch: Partial<ExamScope[string]>) => setScope((sc) => ({ ...sc, [cls]: { ...sc[cls], ...patch } }));
  const toggleSec = (cls: string, sec: string) => {
    const next = flip(chosenSecs(cls), sec);
    if (next.length) patchScope(cls, { sections: next.length === sectionsOf(cls).length ? [] : next });
  };
  const toggleSub = (cls: string, sub: string) => {
    const next = flip(chosenSubs(cls), sub);
    if (next.length) patchScope(cls, { subjects: next.length === subjectsOf(cls).length ? [] : next });
  };
  const setUnit = (cls: string, sub: string, text: string) => patchScope(cls, { units: { ...scope[cls]?.units, [sub]: text } });

  /** Only what differs from "everything", for the classes still picked. */
  const scopeToSave = (): ExamScope => {
    const out: ExamScope = {};
    for (const cls of picked) {
      const secs = chosenSecs(cls);
      const subs = chosenSubs(cls);
      const units = Object.fromEntries(
        Object.entries(scope[cls]?.units || {})
          .filter(([sub, t]) => subs.includes(sub) && t.trim())
          .map(([sub, t]) => [sub, t.trim()])
      );
      const entry = {
        ...(secs.length < sectionsOf(cls).length ? { sections: secs } : {}),
        ...(subs.length < subjectsOf(cls).length ? { subjects: subs } : {}),
        ...(Object.keys(units).length ? { units } : {}),
      };
      if (Object.keys(entry).length) out[cls] = entry;
    }
    return out;
  };
  const setPart = (i: number, patch: Partial<ExamPart>) =>
    setParts((ps) => ps.map((p, j) => (j === i ? { ...p, ...patch, key: patch.name !== undefined ? keyFor(patch.name, ps.filter((_, k) => k !== i).map((x) => x.key)) : p.key } : p)));

  const save = async () => {
    if (title.trim().length < 2) return setError("Give the exam a name.");
    if (!picked.length) return setError("Choose the classes that sit this exam.");
    const problem = partsProblem(parts);
    if (problem) return setError(problem);
    const noSubjects = picked.find((c) => !subjectsOf(c).length);
    if (noSubjects) return setError(`${noSubjects} has no subjects yet. Set them under "Subjects by class" first.`);
    const input: ExamInput = { title: title.trim(), classes: names.filter((c) => picked.includes(c)), start_date: start || null, end_date: end || start || null, components: parts, order_seq: exam ? exam.order_seq : nextOrder, scope: scopeToSave() };
    setBusy(true);
    setError(null);
    const r = await examService.save(input, exam?.id);
    setBusy(false);
    if (r.error || !r.data) return setError(r.error || "Could not save.");
    onSaved(r.data);
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      busy={busy}
      width="max-w-[600px]"
      title={exam ? `Edit ${exam.title}` : "Add an exam"}
      subtitle="Session 2026-27"
      footer={
        <>
          <span className="text-[13px] text-slate-500">Out of {maxOf(parts)} in each subject</span>
          <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary ml-auto">Cancel</button>
          <button type="button" onClick={save} disabled={busy} className="btn btn-primary">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {exam ? "Save changes" : "Add exam"}
          </button>
        </>
      }
    >
      <div className="space-y-4 p-5">
        {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100">{error}</p>}

        <section className="card space-y-3 p-4">
          <div>
            <label htmlFor="ex-title" className="field-label">Exam name</label>
            <input id="ex-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Half Yearly" maxLength={80} className="field w-full" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {NAMES.map((n) => (
              <button key={n} type="button" onClick={() => setTitle(n)} className={`rounded-md px-2 py-1 text-xs font-semibold ring-1 ${title === n ? "bg-brand-50 text-brand-700 ring-brand-200" : "text-slate-600 ring-slate-200 hover:ring-slate-300"}`}>
                {n}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="ex-start" className="field-label">First paper</label>
              <input id="ex-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} className="field w-full" />
            </div>
            <div>
              <label htmlFor="ex-end" className="field-label">Last paper</label>
              <input id="ex-end" type="date" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} className="field w-full" />
            </div>
          </div>
        </section>

        <section className="card p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900">Classes</h3>
            <span className="flex gap-3 text-xs font-semibold">
              <button type="button" onClick={() => setPicked(names)} className="text-brand-700 hover:underline">All</button>
              <button
                type="button"
                onClick={() => {
                  setPicked([]);
                  setOpen([]);
                }}
                className="text-slate-500 hover:underline"
              >
                None
              </button>
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {names.map((c) => (
              <button key={c} type="button" aria-pressed={picked.includes(c)} onClick={() => toggle(c)} className={`min-h-[36px] rounded-lg px-2.5 py-1.5 text-[13px] font-semibold ring-1 transition ${picked.includes(c) ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-slate-700 ring-slate-200 hover:ring-slate-300"}`}>
                {c}
              </button>
            ))}
          </div>

          {/* Each picked class: which sections, which subjects, and units (optional) */}
          {picked.length > 0 && (
            <ul className="mt-4 divide-y divide-slate-100 rounded-xl ring-1 ring-slate-200">
              {names
                .filter((c) => picked.includes(c))
                .map((cls) => {
                  const secs = sectionsOf(cls);
                  const cs = chosenSecs(cls);
                  const subs = subjectsOf(cls);
                  const csub = chosenSubs(cls);
                  const isOpen = open.includes(cls);
                  return (
                    <li key={cls}>
                      <button type="button" onClick={() => setOpen((o) => flip(o, cls))} aria-expanded={isOpen} className="flex min-h-[44px] w-full items-center gap-3 px-3 text-left">
                        <span className="w-16 shrink-0 text-[13px] font-bold text-slate-900">{cls}</span>
                        <span className="min-w-0 flex-1 truncate text-xs text-slate-500">
                          {secs.length > 1 ? (cs.length === secs.length ? `All ${secs.length} sections` : `Section ${cs.join(", ")}`) : `Section ${secs[0]?.name || "—"}`}
                          {" · "}
                          {!subs.length ? (
                            <span className="font-semibold text-marigold-800">no subjects set</span>
                          ) : csub.length === subs.length ? (
                            `all ${subs.length} subjects`
                          ) : (
                            `${csub.length} of ${subs.length} subjects`
                          )}
                        </span>
                        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="space-y-3 px-3 pb-3">
                          {secs.length > 1 && (
                            <div>
                              <span className="field-label">Sections</span>
                              <div className="flex flex-wrap gap-1.5">
                                {secs.map((x) => (
                                  <Chip key={x.id} on={cs.includes(x.name)} onClick={() => toggleSec(cls, x.name)}>
                                    {x.name}
                                  </Chip>
                                ))}
                              </div>
                            </div>
                          )}
                          <div>
                            <span className="field-label">Subjects</span>
                            {subs.length ? (
                              <div className="flex flex-wrap gap-1.5">
                                {subs.map((sub) => (
                                  <Chip key={sub} on={csub.includes(sub)} onClick={() => toggleSub(cls, sub)}>
                                    {sub}
                                  </Chip>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-marigold-800">Set this class&apos;s subjects under &ldquo;Subjects by class&rdquo; first.</p>
                            )}
                          </div>
                          {csub.length > 0 && (
                            <div>
                              <span className="field-label">
                                Units <span className="font-normal text-slate-400">(optional)</span>
                              </span>
                              <div className="space-y-1.5">
                                {csub.map((sub) => (
                                  <label key={sub} className="flex items-center gap-2">
                                    <span className="w-28 shrink-0 truncate text-[13px] text-slate-700">{sub}</span>
                                    <input
                                      value={scope[cls]?.units?.[sub] || ""}
                                      onChange={(e) => setUnit(cls, sub, e.target.value)}
                                      placeholder="e.g. Units 1–4"
                                      maxLength={120}
                                      aria-label={`Units of ${sub} for ${cls}`}
                                      className="field field-sm min-w-0 flex-1"
                                    />
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
            </ul>
          )}
          <p className="mt-2 text-xs text-slate-500">For a different pattern in IX–X (80 + 20), add a separate exam with the same name for those classes.</p>
        </section>

        <section className="card p-4">
          <h3 className="text-sm font-bold text-slate-900">Marks in each subject</h3>
          {exam && <p className="mt-0.5 text-xs text-slate-500">Can&apos;t be changed once marks are entered.</p>}
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {PART_PRESETS.map((p) => (
              <label key={p.key} className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[13px] font-semibold transition ${preset === p.key ? "border-brand-500 bg-brand-50/60 text-slate-900 ring-1 ring-brand-500" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}>
                <input type="radio" name="ex-preset" checked={preset === p.key} onChange={() => setParts(p.parts)} className="accent-brand-600" />
                {p.label}
              </label>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {parts.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={p.name} onChange={(e) => setPart(i, { name: e.target.value })} aria-label={`Part ${i + 1} name`} className="field field-sm min-w-0 flex-1" maxLength={30} />
                <span className="text-xs text-slate-500">out of</span>
                <input type="number" inputMode="numeric" min={1} max={200} value={p.max} onChange={(e) => setPart(i, { max: Math.round(Number(e.target.value)) })} aria-label={`${p.name} maximum`} className="field field-sm w-20 text-right tabular-nums" />
                <button type="button" onClick={() => setParts((ps) => ps.filter((_, j) => j !== i))} disabled={parts.length === 1} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 disabled:opacity-30" aria-label={`Remove ${p.name}`}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {parts.length < 4 && (
              <button type="button" onClick={() => setParts((ps) => [...ps, { key: keyFor("Practical", ps.map((x) => x.key)), name: "Practical", max: 20 }])} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline">
                <Plus className="h-3.5 w-3.5" />
                Add a part
              </button>
            )}
          </div>
        </section>
      </div>
    </SideDrawer>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`min-h-[32px] rounded-md px-2.5 py-1 text-[13px] font-semibold ring-1 transition ${on ? "bg-brand-50 text-brand-800 ring-brand-300" : "bg-white text-slate-500 ring-slate-200 hover:ring-slate-300"}`}
    >
      {children}
    </button>
  );
}
