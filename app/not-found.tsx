import Link from "next/link";

/** Unknown addresses (an old bookmark, a mistyped link) land here inside the ERP frame, not on Next's bare 404. */
export default function NotFound() {
  return (
    <section className="card mx-auto mt-6 max-w-xl space-y-3 p-6">
      <h1 className="page-title">Page not found</h1>
      <p className="text-sm text-slate-600">This address is not part of SchoolDesk, or the page has moved. Use the menu, or start again from the dashboard.</p>
      <div className="pt-1">
        <Link href="/dashboard" className="btn btn-primary">Go to dashboard</Link>
      </div>
    </section>
  );
}
