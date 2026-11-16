"use client";

/** Last resort when the app shell itself fails: plain HTML, no shared styles, so it always renders. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#F4F5F7", color: "#1F2937" }}>
        <main role="alert" style={{ maxWidth: 520, margin: "64px auto", padding: "24px", background: "#fff", border: "1px solid #D6DDE6", borderRadius: 12 }}>
          <h1 style={{ fontSize: 20, margin: "0 0 8px" }}>SchoolDesk could not open</h1>
          <p style={{ fontSize: 14, lineHeight: 1.5, margin: "0 0 16px", color: "#536071" }}>
            Something went wrong while loading the app. Try again; if it keeps happening, reload the page or sign in again.
          </p>
          {error.digest && <p style={{ fontFamily: "monospace", fontSize: 12, color: "#647582" }}>Error code: {error.digest}</p>}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" onClick={reset} style={{ minHeight: 40, padding: "0 16px", borderRadius: 8, border: 0, background: "#A43F20", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Try again</button>
            <a href="/login" style={{ minHeight: 40, padding: "0 16px", borderRadius: 8, border: "1px solid #7B8C99", color: "#202938", display: "inline-flex", alignItems: "center", textDecoration: "none", fontWeight: 600 }}>Sign in again</a>
          </div>
        </main>
      </body>
    </html>
  );
}
