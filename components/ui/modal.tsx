"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = "max-w-2xl" }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  // Portal to <body> so page wrappers (animations, overflow) cannot offset or clip it.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="fixed inset-0 bg-slate-950/50 animate-fadeIn" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 flex max-h-[92dvh] w-full ${maxWidth} flex-col overflow-hidden rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-xl animate-slide-up sm:max-h-[90vh] sm:rounded-lg sm:pb-0 sm:animate-scaleUp`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3 sm:px-5 sm:py-3.5">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="-mr-2 -mt-1 rounded-lg p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 sm:-mr-1.5 sm:mt-0 sm:p-1.5"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-4 sm:p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
