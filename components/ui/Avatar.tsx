import React from "react";

// Stable soft colour per person so lists are easy to scan.
const TINTS = [
  "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "bg-sky-50 text-sky-700 ring-sky-100",
  "bg-violet-50 text-violet-700 ring-violet-100",
  "bg-marigold-50 text-marigold-700 ring-marigold-100",
  "bg-rose-50 text-rose-700 ring-rose-100",
];

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

export const tintFor = (key: string) => TINTS[key.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length];

const SIZES = {
  sm: "h-8 w-8 rounded-lg text-[11px]",
  md: "h-10 w-10 rounded-xl text-[13px]",
  lg: "h-14 w-14 rounded-2xl text-base",
};

/** Photo when the person has one, otherwise coloured initials. */
export function Avatar({
  name,
  id,
  photoUrl,
  size = "md",
  className = "",
}: {
  name: string;
  id?: string;
  photoUrl?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  if (photoUrl) {
    return <img src={photoUrl} alt="" className={`${SIZES[size]} shrink-0 object-cover ring-1 ring-slate-200 ${className}`} />;
  }
  return (
    <span
      aria-hidden
      className={`${SIZES[size]} flex shrink-0 items-center justify-center font-bold ring-1 ${tintFor(id || name)} ${className}`}
    >
      {initials(name)}
    </span>
  );
}
