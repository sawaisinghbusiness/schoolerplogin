"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

type Tone = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
}

const EVENT = "schooldesk:toast";

function guessTone(message: string): Tone {
  const m = message.toLowerCase();
  if (/(error|fail|invalid|could not|cannot|not allowed|required)/.test(m)) return "error";
  if (/(success|saved|sent|updated|created|added|approved|done|dispatched|enrolled|marked|recorded|✓)/.test(m)) return "success";
  return "info";
}

/** Show a toast from anywhere. `window.alert` is routed here too (see Toaster). */
export function toast(message: string, tone?: Tone) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { message: String(message), tone: tone ?? guessTone(String(message)) } }));
}

const STYLES: Record<Tone, { icon: typeof Info; ring: string; iconTint: string; bar: string }> = {
  success: { icon: CheckCircle2, ring: "ring-emerald-600/15", iconTint: "bg-emerald-50 text-emerald-600", bar: "bg-emerald-500" },
  error: { icon: TriangleAlert, ring: "ring-rose-600/15", iconTint: "bg-rose-50 text-rose-600", bar: "bg-rose-500" },
  info: { icon: Info, ring: "ring-slate-900/10", iconTint: "bg-sky-50 text-sky-600", bar: "bg-sky-500" },
};

const DURATION = 4500;

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    let seq = 0;
    const onToast = (e: Event) => {
      const { message, tone } = (e as CustomEvent).detail as { message: string; tone: Tone };
      const id = ++seq;
      setItems((prev) => [...prev.slice(-3), { id, message, tone }]);
      setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), DURATION);
    };
    window.addEventListener(EVENT, onToast);

    // Pages still call the blocking browser alert(); show those as toasts instead.
    const originalAlert = window.alert;
    window.alert = (msg?: unknown) => toast(String(msg ?? ""));

    return () => {
      window.removeEventListener(EVENT, onToast);
      window.alert = originalAlert;
    };
  }, []);

  return (
    <div aria-live="polite" className="pointer-events-none fixed left-1/2 top-4 z-[80] flex w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-2.5">
      {items.map((t) => {
        const s = STYLES[t.tone];
        const Icon = s.icon;
        return (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-2xl bg-white p-3.5 pr-10 shadow-xl ring-1 animate-scaleUp ${s.ring}`}
          >
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${s.iconTint}`}>
              <Icon className="h-4 w-4" />
            </span>
            <p className="pt-1 text-sm leading-snug text-slate-700">{t.message}</p>
            <button
              onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
              className="absolute right-2 top-2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
            <span
              className={`absolute bottom-0 left-0 h-0.5 origin-left ${s.bar}`}
              style={{ width: "100%", animation: `toastBar ${DURATION}ms linear forwards` }}
            />
          </div>
        );
      })}
    </div>
  );
}
