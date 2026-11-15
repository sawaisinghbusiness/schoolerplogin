"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Paperclip, X } from "lucide-react";
import { api } from "@/lib/apiClient";
import { shrinkDocument } from "@/lib/shrinkPhoto";
import type { HomeworkFile } from "@/lib/services/homeworkService";

const MAX_FILES = 5;
const read = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(new Error("Could not read that file."));
  reader.readAsDataURL(file);
});

export function HomeworkFilePicker({ files, onChange, onBusyChange, disabled }: { files: HomeworkFile[]; onChange: (files: HomeworkFile[]) => void; onBusyChange: (busy: boolean) => void; disabled?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function add(list: FileList | null) {
    if (busy || disabled) return;
    const selected = Array.from(list || []).slice(0, MAX_FILES - files.length);
    if (!selected.length) return;
    setError(""); setBusy(true); onBusyChange(true);
    let next = [...files];
    try {
      for (const file of selected) {
        const pdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
        if (!pdf && !file.type.startsWith("image/")) throw new Error("Choose a photo or PDF.");
        if (pdf && file.size > 3.5 * 1024 * 1024) throw new Error("Keep each PDF under 3.5 MB.");
        const dataUrl = pdf ? (await read(file)).replace(/^data:[^;]*;/, "data:application/pdf;") : await shrinkDocument(file);
        const result = await api.post<{ data: HomeworkFile }>("/api/homework/files", { dataUrl, name: file.name }, { timeoutMs: 60_000 });
        if (!result.ok || !result.data?.data) throw new Error(result.error || "Could not attach the file.");
        next = [...next, result.data.data];
        onChange(next);
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Could not attach the file."); }
    finally { setBusy(false); onBusyChange(false); }
  }
  return <div className="space-y-2">
    <p className="field-label">Attachments <span className="font-normal text-slate-500">(up to 5 photos or PDFs)</span></p>
    {!!files.length && <ul className="space-y-2">{files.map(file => <li key={file.url} className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white pl-3 pr-1">
      <FileText className="h-4 w-4 shrink-0 text-slate-500" /><a href={file.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-sm text-brand-700 hover:underline">{file.name}</a>
      <button type="button" onClick={() => onChange(files.filter(f => f.url !== file.url))} disabled={busy || disabled} aria-label={'Remove ' + file.name} className="grid h-11 w-11 shrink-0 place-items-center text-slate-500 disabled:opacity-40"><X className="h-4 w-4" /></button>
    </li>)}</ul>}
    {files.length < MAX_FILES && <button type="button" onClick={() => input.current?.click()} disabled={busy || disabled} className="btn btn-secondary w-full">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}{busy ? 'Attaching...' : 'Attach photo or PDF'}</button>}
    <input ref={input} type="file" accept="image/*,application/pdf" multiple hidden onChange={event => { add(event.target.files); event.target.value = ''; }} />
    {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
  </div>;
}

export function HomeworkFileLinks({ files }: { files?: HomeworkFile[] }) {
  if (!files?.length) return null;
  return <div className="mt-3 flex flex-wrap gap-2">{files.map(file => <a key={file.url} href={file.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-brand-700 hover:bg-slate-50"><FileText className="h-4 w-4 shrink-0" /><span className="truncate">{file.name}</span></a>)}</div>;
}
