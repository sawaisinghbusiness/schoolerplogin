"use client";

import Link from "next/link";
import { useSchoolProfile } from "@/components/providers/SchoolProfileProvider";

/**
 * On pages that print official documents (certificates, report cards, SR/ID cards): says why printing is held
 * back until the school profile has loaded and been saved, so nothing prints with blank or made-up details.
 */
export function SchoolProfileNotice() {
  const { notReadyReason } = useSchoolProfile();
  if (!notReadyReason) return null;
  return (
    <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      {notReadyReason}{" "}
      <Link href="/settings" className="font-semibold underline">Open Settings</Link>
    </div>
  );
}
