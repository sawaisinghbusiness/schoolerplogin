"use client";

import React, { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";

export const WINGS = ["Pre-primary", "Primary", "Middle", "Secondary", "Senior Secondary"];

export const STANDARD_CLASSES = ["Pre Nursery", "Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];

export const COMMON_SUBJECTS = [
  "Hindi",
  "English",
  "Mathematics",
  "Environmental Studies",
  "Science",
  "Social Science",
  "Sanskrit",
  "Computer",
  "General Knowledge",
  "Drawing",
  "Physical Education",
  "Physics",
  "Chemistry",
  "Biology",
  "Accountancy",
  "Business Studies",
  "Economics",
  "History",
  "Geography",
  "Political Science",
  "Hindi Literature",
  "Agriculture",
];

/** Best guess of the wing from the class name ("7th" -> Middle). */
export function guessWing(name: string): string {
  const n = name.trim().toLowerCase();
  if (/(pre|nursery|lkg|ukg|kg)/.test(n)) return "Pre-primary";
  const num = parseInt(n, 10);
  if (num >= 1 && num <= 5) return "Primary";
  if (num >= 6 && num <= 8) return "Middle";
  if (num >= 9 && num <= 10) return "Secondary";
  if (num >= 11 && num <= 12) return "Senior Secondary";
  return "";
}

/** "a" -> "A"; longer names like "Science-Maths" keep their case (students store them that way). */
export const cleanSection = (s: string) => (s.trim().length <= 2 ? s.trim().toUpperCase() : s.trim().replace(/\s+/g, " "));
export const cleanSubject = (s: string) => s.trim().replace(/\s+/g, " ");

export const plural = (n: number, one: string, many = one + "s") => `${n.toLocaleString("en-IN")} ${n === 1 ? one : many}`;

/** Chips with remove buttons plus a textbox; Enter or comma adds. Pasting "A, B, C" adds all three. */
export function ChipInput({
  values,
  onChange,
  clean,
  placeholder,
  label,
  max = 50,
  maxLength = 60,
  chipClass = "bg-slate-100 text-slate-800",
}: {
  values: string[];
  onChange: (v: string[]) => void;
  clean: (s: string) => string;
  placeholder: string;
  label: string;
  max?: number;
  maxLength?: number;
  chipClass?: string;
}) {
  const [text, setText] = useState("");
  const add = (raw: string) => {
    const next = values.slice();
    for (const part of raw.split(",")) {
      const v = clean(part);
      if (v && next.length < max && !next.some((x) => x.toLowerCase() === v.toLowerCase())) next.push(v);
    }
    onChange(next);
    setText("");
  };
  return (
    <div>
      {values.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span key={v} className={`inline-flex max-w-full items-center gap-1 rounded-md py-0.5 pl-2 pr-0.5 text-[13px] font-medium ${chipClass}`}>
              <span className="truncate">{v}</span>
              <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="rounded p-0.5 text-slate-400 hover:bg-white hover:text-rose-600" aria-label={`Remove ${v}`}>
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={text}
          maxLength={maxLength}
          onChange={(e) => (e.target.value.includes(",") ? add(e.target.value) : setText(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (text.trim()) add(text);
            } else if (e.key === "Backspace" && !text && values.length) onChange(values.slice(0, -1));
          }}
          placeholder={placeholder}
          aria-label={label}
          className="field field-sm min-w-0 flex-1"
        />
        <button type="button" onClick={() => add(text)} disabled={!text.trim()} className="btn btn-secondary btn-sm shrink-0">
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>
    </div>
  );
}

/** One-click subject suggestions that are not in the list yet. */
export function SubjectSuggestions({ values, onAdd, limit = 12 }: { values: string[]; onAdd: (s: string) => void; limit?: number }) {
  const [all, setAll] = useState(false);
  const have = new Set(values.map((v) => v.toLowerCase()));
  const left = COMMON_SUBJECTS.filter((s) => !have.has(s.toLowerCase()));
  if (!left.length) return null;
  const shown = all ? left : left.slice(0, limit);
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-slate-500">Common:</span>
      {shown.map((s) => (
        <button key={s} type="button" onClick={() => onAdd(s)} className="rounded-md border border-dashed border-slate-300 px-1.5 py-0.5 text-xs text-slate-600 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700">
          + {s}
        </button>
      ))}
      {left.length > shown.length && (
        <button type="button" onClick={() => setAll(true)} className="text-xs font-semibold text-brand-700 hover:underline">
          {left.length - shown.length} more
        </button>
      )}
    </div>
  );
}

/** Small yes/no popup for renames and deletes. */
export function ConfirmModal({
  isOpen,
  title,
  children,
  confirmLabel,
  danger,
  busy,
  onConfirm,
  onClose,
}: {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={() => !busy && onClose()} title={title} maxWidth="max-w-md">
      <div className="space-y-4 text-sm text-slate-600">
        {children}
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={busy} className={`btn btn-sm ${danger ? "btn-danger" : "btn-primary"}`}>
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/** Buttons that stay visible but explain why they are off (a disabled button shows no tooltip in some browsers). */
export function WithTip({ tip, children }: { tip?: string; children: React.ReactNode }) {
  return tip ? (
    <span title={tip} className="inline-flex">
      {children}
    </span>
  ) : (
    <>{children}</>
  );
}
