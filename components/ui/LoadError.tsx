/** A list that failed to load says so, with a retry, so it is never mistaken for "nothing here" (2026-11-16). */
export function LoadError({ what, error, onRetry }: { what: string; error: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
      <span className="min-w-0 flex-1">
        {what} did not load. {error}
      </span>
      <button type="button" onClick={onRetry} className="btn btn-secondary btn-sm">Try again</button>
    </div>
  );
}
