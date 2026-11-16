"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Shown in place of a page that threw while rendering (2026-11-16). Before this the whole ERP went to a
 * blank "Application error" screen with no way back. The menu and top bar stay, so the office can move on.
 */
export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section role="alert" className="card mx-auto mt-6 max-w-xl space-y-3 p-6">
      <h1 className="page-title">This page stopped working</h1>
      <p className="text-sm text-slate-600">
        Nothing you saved earlier is lost. Try the page again; if it keeps happening, go back to the dashboard and tell the school&apos;s ERP support what you clicked.
      </p>
      {error.digest && <p className="font-mono text-xs text-slate-500">Error code: {error.digest}</p>}
      <div className="flex flex-wrap gap-2 pt-1">
        <button type="button" onClick={reset} className="btn btn-primary">Try again</button>
        <Link href="/dashboard" className="btn btn-secondary">Go to dashboard</Link>
      </div>
    </section>
  );
}
