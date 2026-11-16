"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import "./toaster.css";

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

const STYLES: Record<Tone, { icon: typeof Info }> = {success:{icon:CheckCircle2},error:{icon:TriangleAlert},info:{icon:Info}};

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
    <div className="erp-toast-stack">
      {items.map((t) => {
        const s = STYLES[t.tone];
        const Icon = s.icon;
        return (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className="erp-toast" data-tone={t.tone}
          >
            <span className="erp-toast-icon">
              <Icon size={18} aria-hidden />
            </span>
            <p>{t.message}</p>
            <button
              onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
              type="button" className="erp-toast-dismiss"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
