"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CornerDownLeft, Search } from "lucide-react";
import { allDestinations } from "@/components/layout/navConfig";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const destinations = useMemo(() => allDestinations(), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return destinations.slice(0, 12);
    return destinations
      .filter((d) => d.title.toLowerCase().includes(q) || d.section.toLowerCase().includes(q))
      .slice(0, 30);
  }, [query, destinations]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  // Keep the highlighted row in view while arrowing through.
  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  if (!open) return null;

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && results[cursor]) {
      e.preventDefault();
      go(results[cursor].href);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-slate-950/50 animate-fadeIn" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Go to page"
        className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 animate-scaleUp"
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-4">
          <Search className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Jump to a page — try “fees”, “attendance”, “report card”"
            className="h-14 w-full bg-transparent text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="hidden shrink-0 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] text-slate-500 sm:block">
            Esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {!query && <div className="px-3 pb-1.5 pt-2 eyebrow">Suggested</div>}
          {results.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm font-semibold text-slate-700">No pages found</p>
              <p className="mt-1 text-sm text-slate-500">Try a shorter word, like “exam” or “staff”.</p>
            </div>
          ) : (
            results.map((d, i) => {
              const Icon = d.icon;
              const active = i === cursor;
              return (
                <button
                  key={d.href}
                  data-idx={i}
                  onMouseMove={() => setCursor(i)}
                  onClick={() => go(d.href)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${
                    active ? "bg-brand-50" : ""
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ${
                      active
                        ? "bg-brand-600 text-white ring-brand-600"
                        : "bg-slate-50 text-slate-500 ring-slate-200"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-semibold ${active ? "text-brand-900" : "text-slate-800"}`}>
                      {d.title}
                    </span>
                    <span className="block truncate text-xs text-slate-500">{d.section}</span>
                  </span>
                  {active ? (
                    <CornerDownLeft className="h-4 w-4 shrink-0 text-brand-600" />
                  ) : (
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[11.5px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-slate-200 bg-white px-1 font-mono">↑</kbd>
            <kbd className="rounded border border-slate-200 bg-white px-1 font-mono">↓</kbd>
            to move
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-slate-200 bg-white px-1 font-mono">Enter</kbd>
            to open
          </span>
          <span className="ml-auto hidden sm:block">{destinations.length} pages</span>
        </div>
      </div>
    </div>
  );
}
