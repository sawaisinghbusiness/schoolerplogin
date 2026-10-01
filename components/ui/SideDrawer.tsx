"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Right-hand panel over the page: title bar, scrolling body, fixed footer.
 * Esc closes only the top-most drawer (capture phase + stopPropagation).
 */
export function SideDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  width = "max-w-[520px]",
  headerExtra,
  footer,
  children,
  busy,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  width?: string;
  headerExtra?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  busy?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      if (!busy) onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [isOpen, busy, onClose]);

  if (!mounted || !isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-night-950/40 animate-fadeIn" onClick={() => !busy && onClose()} />
      <aside role="dialog" aria-modal="true" className={`relative flex h-[100dvh] w-full ${width} flex-col bg-canvas shadow-2xl animate-slide-in-right`}>
        <header className="flex min-h-[3.5rem] shrink-0 items-center gap-3 border-b border-slate-300/50 bg-white px-4 pb-2.5 pt-[calc(0.625rem+env(safe-area-inset-top))] sm:min-h-[4rem] sm:px-5 sm:py-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
          </div>
          {headerExtra}
          <button type="button" onClick={onClose} disabled={busy} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-slate-300/50 bg-white px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 sm:px-5 sm:py-3">{footer}</footer>}
      </aside>
    </div>,
    document.body
  );
}
