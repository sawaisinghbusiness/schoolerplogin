"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { ClassItem, classService } from "@/lib/services/classService";
import { Audience, AudienceKind, Lang, Message, Preview, TEMPLATES, messageService, unfilled } from "@/lib/services/messageService";

const KINDS: { kind: AudienceKind; label: string }[] = [
  { kind: "school", label: "Whole school" },
  { kind: "classes", label: "Classes" },
  { kind: "sections", label: "Sections" },
  { kind: "dues", label: "Fees due" },
];

const FIELDS: { key: string; label: string; duesOnly?: boolean }[] = [
  { key: "name", label: "Child's name" },
  { key: "class", label: "Class" },
  { key: "father", label: "Father's name" },
  { key: "school", label: "School name" },
  { key: "due", label: "Amount due", duesOnly: true },
];

const plusDays = (n: number) => {
  const d = new Date(Date.now() + n * 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-lg px-2.5 py-1.5 text-[13px] font-semibold ring-1 transition ${on ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-slate-700 ring-slate-200 hover:ring-slate-300"}`}
    >
      {children}
    </button>
  );
}

export function ComposeDrawer({ isOpen, onClose, onCreated }: { isOpen: boolean; onClose: () => void; onCreated: (m: Message) => void }) {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [kind, setKind] = useState<AudienceKind>("school");
  const [picked, setPicked] = useState<string[]>([]);
  const [lang, setLang] = useState<Lang>("hi");
  const [template, setTemplate] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [onWebsite, setOnWebsite] = useState(false);
  const [until, setUntil] = useState(plusDays(7));
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setKind("school");
    setPicked([]);
    setLang("hi");
    setTemplate(null);
    setTitle("");
    setBody("");
    setOnWebsite(false);
    setUntil(plusDays(7));
    setPreview(null);
    setError(null);
    if (!classes.length) classService.fetchClasses().then((r) => setClasses(r.data || []));
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const audience: Audience = useMemo(
    () => (kind === "classes" ? { kind, classes: picked } : kind === "sections" ? { kind, sections: picked } : { kind }),
    [kind, picked]
  );
  const audienceReady = !((kind === "classes" || kind === "sections") && picked.length === 0);

  // Who it reaches and how the first parent reads it, after typing settles.
  useEffect(() => {
    if (!isOpen || !audienceReady) {
      setPreview(null);
      return;
    }
    setPreviewing(true);
    const t = setTimeout(async () => {
      const r = await messageService.preview(audience, body, lang);
      setPreview(r.data || null);
      setPreviewing(false);
    }, 450);
    return () => clearTimeout(t);
  }, [isOpen, audience, audienceReady, body, lang]);

  const applyTemplate = (key: string, l: Lang = lang) => {
    const t = TEMPLATES.find((x) => x.key === key);
    if (!t) return;
    setTemplate(key);
    setTitle(t.title[l]);
    setBody(t.body[l]);
    if (t.dues) setKind("dues");
    setTimeout(() => bodyRef.current?.focus(), 0);
  };

  const switchLang = (l: Lang) => {
    setLang(l);
    // A template not yet edited follows the language.
    const t = TEMPLATES.find((x) => x.key === template);
    if (t && body === t.body[lang]) {
      setBody(t.body[l]);
      setTitle(t.title[l]);
    }
  };

  const insert = (key: string) => {
    const el = bodyRef.current;
    const tag = `{${key}}`;
    if (!el) return setBody((b) => b + tag);
    const s = el.selectionStart ?? body.length;
    const e = el.selectionEnd ?? body.length;
    setBody(body.slice(0, s) + tag + body.slice(e));
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(s + tag.length, s + tag.length);
    }, 0);
  };

  const toggle = (v: string) => setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));
  const left = unfilled(body);

  const save = async () => {
    if (!audienceReady) return setError(kind === "classes" ? "Pick at least one class." : "Pick at least one section.");
    if (title.trim().length < 2) return setError("Give the message a short title.");
    if (body.trim().length < 5) return setError("Write the message.");
    if (left.length) return setError(`Replace ${left.map((k) => `{${k}}`).join(", ")} with the real details first.`);
    if (body.includes("{due}") && kind !== "dues") return setError("{due} only works when sending to parents with fees due.");
    setBusy(true);
    setError(null);
    const r = await messageService.create({ title: title.trim(), body: body.trim(), lang, audience, showOnWebsite: onWebsite, websiteUntil: onWebsite ? until : null });
    setBusy(false);
    if (r.error || !r.data) return setError(r.error || "Could not save the message.");
    onCreated(r.data);
  };

  const sections = classes.flatMap((c) => c.sections.map((s) => ({ cls: c.name, value: `${c.name} - ${s.name}`, label: s.name })));

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      busy={busy}
      width="max-w-[680px]"
      title="New message"
      subtitle="Goes to parents on WhatsApp, each with their child's name filled in"
      footer={
        <>
          <span className="text-[13px] text-slate-500">{preview ? `${preview.families.toLocaleString("en-IN")} parents` : ""}</span>
          <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary ml-auto">Cancel</button>
          <button type="button" onClick={save} disabled={busy} className="btn btn-primary">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Save and start sending
          </button>
        </>
      }
    >
      <div className="space-y-4 p-5">
        {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100">{error}</p>}

        <section className="card p-4">
          <h3 className="text-sm font-bold text-slate-900">To</h3>
          <div className="mt-3 flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1" role="radiogroup" aria-label="Send to">
            {KINDS.map((k) => (
              <button
                key={k.kind}
                type="button"
                role="radio"
                aria-checked={kind === k.kind}
                onClick={() => {
                  setKind(k.kind);
                  setPicked([]);
                }}
                className={`flex-1 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${kind === k.kind ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                {k.label}
              </button>
            ))}
          </div>
          {kind === "classes" && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {classes.filter((c) => c.sections.length).map((c) => (
                <Chip key={c.id} on={picked.includes(c.name)} onClick={() => toggle(c.name)}>{c.name}</Chip>
              ))}
            </div>
          )}
          {kind === "sections" && (
            <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
              {classes.filter((c) => c.sections.length).map((c) => (
                <div key={c.id} className="flex flex-wrap items-center gap-1.5">
                  <span className="w-16 shrink-0 text-[13px] font-semibold text-slate-500">{c.name}</span>
                  {sections.filter((s) => s.cls === c.name).map((s) => (
                    <Chip key={s.value} on={picked.includes(s.value)} onClick={() => toggle(s.value)}>{s.label}</Chip>
                  ))}
                </div>
              ))}
            </div>
          )}
          {kind === "dues" && <p className="mt-3 text-[13px] text-slate-500">Parents whose fees are overdue today. Use {"{due}"} to put each family&apos;s amount in the message.</p>}
        </section>

        <section className="card space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="mr-auto text-sm font-bold text-slate-900">Message</h3>
            <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5" role="radiogroup" aria-label="Language">
              {(["hi", "en"] as Lang[]).map((l) => (
                <button key={l} type="button" role="radio" aria-checked={lang === l} onClick={() => switchLang(l)} className={`rounded-md px-2.5 py-1 text-xs font-semibold ${lang === l ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                  {l === "hi" ? "हिंदी" : "English"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATES.map((t) => (
              <Chip key={t.key} on={template === t.key} onClick={() => applyTemplate(t.key)}>{t.label}</Chip>
            ))}
          </div>
          <div>
            <label htmlFor="m-title" className="field-label">Title (for your register)</label>
            <input id="m-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Diwali holidays" className="field w-full" maxLength={120} />
          </div>
          <div>
            <div className="flex items-end justify-between">
              <label htmlFor="m-body" className="field-label">Text</label>
              <span className={`text-xs tabular-nums ${body.length > 1000 ? "text-rose-600" : "text-slate-400"}`}>{body.length}/1000</span>
            </div>
            <textarea id="m-body" ref={bodyRef} value={body} onChange={(e) => setBody(e.target.value)} rows={6} lang={lang} className="field w-full leading-relaxed" placeholder="Choose a ready message above, or write your own." />
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500">Fill in for each parent:</span>
              {FIELDS.filter((f) => !f.duesOnly || kind === "dues").map((f) => (
                <button key={f.key} type="button" onClick={() => insert(f.key)} className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[12px] text-slate-700 hover:bg-slate-200" title={f.label}>
                  {`{${f.key}}`}
                </button>
              ))}
            </div>
            {left.length > 0 && (
              <p className="mt-2 flex items-start gap-1.5 text-[13px] text-marigold-800">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Replace {left.map((k) => `{${k}}`).join(", ")} with the real details.
              </p>
            )}
          </div>
        </section>

        <section className="card p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900">How the first parent gets it</h3>
            {previewing && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
          </div>
          {!audienceReady ? (
            <p className="mt-2 text-[13px] text-slate-500">Pick {kind === "classes" ? "a class" : "a section"} to see who it reaches.</p>
          ) : preview ? (
            <>
              <p className="mt-1 text-[13px] text-slate-600">
                <b className="tabular-nums text-slate-900">{preview.families.toLocaleString("en-IN")}</b> parents ({preview.students.toLocaleString("en-IN")} students; brothers and sisters share one message)
                {preview.noPhone > 0 && <span className="text-marigold-800"> · {preview.noPhone} without a mobile number are skipped</span>}
              </p>
              {preview.sample && body.trim() ? (
                <p lang={lang} className="mt-3 whitespace-pre-wrap rounded-lg bg-[#EFF8EC] px-3.5 py-3 text-[14px] leading-relaxed text-slate-800 ring-1 ring-emerald-100">{preview.sample.text}</p>
              ) : (
                <p className="mt-3 text-[13px] text-slate-400">The text appears here as you write.</p>
              )}
            </>
          ) : (
            <div className="skeleton mt-3 h-16 w-full" />
          )}
        </section>

        <section className="card flex flex-wrap items-center gap-3 p-4">
          <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
            <input type="checkbox" checked={onWebsite} onChange={(e) => setOnWebsite(e.target.checked)} className="mt-1 h-4 w-4 accent-brand-600" />
            <span>
              <span className="block text-sm font-semibold text-slate-900">Also show on the website notice board</span>
              <span className="block text-xs text-slate-500">Only the title is shown, at the top of the school website.</span>
            </span>
          </label>
          {onWebsite && (
            <label className="flex items-center gap-2 text-[13px] text-slate-600">
              until
              <input type="date" value={until} min={plusDays(0)} onChange={(e) => setUntil(e.target.value)} className="field field-sm" />
            </label>
          )}
        </section>
      </div>
    </SideDrawer>
  );
}
