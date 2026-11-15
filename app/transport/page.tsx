"use client";

import { useCurrentUser } from "@/components/layout/useCurrentUser";

import React, { useCallback, useEffect, useState } from "react";
import { Bus, ChevronRight, Plus, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { useSchoolProfile } from "@/components/providers/SchoolProfileProvider";
import { BusRoute, transportService } from "@/lib/services/transportService";
import { TransportLivePanel } from "@/components/transport/TransportLivePanel";
import { RouteDrawer } from "@/components/transport/RouteDrawer";

const fmtPhone = (p?: string | null) => (p && /^\d{10}$/.test(p) ? `${p.slice(0, 5)} ${p.slice(5)}` : "");

export default function TransportPage() {
  const { schoolProfile } = useSchoolProfile();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [routes, setRoutes] = useState<BusRoute[] | null>(null);
  const [total, setTotal] = useState(0);
  const [unassigned, setUnassigned] = useState(0);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [open, setOpen] = useState<BusRoute | "unassigned" | "new" | null>(null);
  const { roleKey: me } = useCurrentUser();

  const load = useCallback(async () => {
    setLoadError(null);
    const r = await transportService.list();
    if (r.error) { setLoadError(r.error); return; }
    setSetupNeeded(r.setupNeeded);
    setTotal(r.total);
    setUnassigned(r.unassigned);
    setRoutes(r.routes);
    // Keep an open route's drawer showing fresh numbers.
    setOpen((o) => (o && typeof o === "object" ? r.routes.find((x) => x.id === o.id) || null : o));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isAdmin = me === "admin";
  const seats = (routes || []).reduce((t, r) => t + (r.capacity || 0), 0);
  const noBus = (routes || []).filter((r) => !r.vehicle_no || !r.driver_name).length;

  return (
    <div className="space-y-5 pb-12">
      <header className="page-header">
        <div><h1 className="page-title">Transport</h1><p className="page-subtitle">Routes, vehicles, drivers and student allocations</p></div>
        {isAdmin && !setupNeeded && (
          <button type="button" onClick={() => setOpen("new")} className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Add route
          </button>
        )}
      </header>

      {loadError ? <div role="alert" className="alert alert-rose"><span className="flex-1">Could not load transport: {loadError}</span><button type="button" onClick={load} className="btn btn-secondary btn-sm">Try again</button></div> : setupNeeded ? (
        <div className="card p-8 text-center">
          <Bus className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">Transport needs a one-time database setup</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Ask your school administrator to enable this module, then check again.</p>
          <button type="button" onClick={load} className="btn btn-secondary btn-sm mt-4">
            <RefreshCw className="h-4 w-4" />
            Check again
          </button>
        </div>
      ) : (
        <>
          {(me === "admin" || me === "accountant") && <TransportLivePanel />}
          <div className="summary-strip">
            <Figure label="Students on bus" value={routes ? total.toLocaleString("en-IN") : "…"} dot="bg-brand-500" />
            <Figure label="Routes" value={routes ? String(routes.length) : "…"} dot="bg-slate-400" />
            <Figure label="Seats" value={routes ? (seats ? seats.toLocaleString("en-IN") : "—") : "…"} dot="bg-emerald-500" />
            <Figure
              label="Without a route"
              value={routes ? String(unassigned) : "…"}
              dot="bg-rose-500"
              onClick={unassigned ? () => setOpen("unassigned") : undefined}
            />
          </div>

          <section className="card register-table overflow-hidden" aria-label="Routes">
            <div className="workspace-toolbar !rounded-none !border-x-0 !border-t-0 !shadow-none"><div className="min-w-0 flex-1"><h2 className="text-sm font-semibold text-slate-900">Route register</h2><p className="mt-1 text-xs text-slate-500">Open a route to manage its stops and riders</p></div><button type="button" onClick={load} className="btn btn-secondary btn-sm" aria-label="Refresh routes"><RefreshCw className="h-4 w-4" /></button></div>
            {routes === null ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton h-14 w-full" />
                ))}
              </div>
            ) : routes.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <Bus className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 font-semibold text-slate-800">No bus route yet</p>
                {isAdmin && (
                  <button type="button" onClick={() => setOpen("new")} className="btn btn-primary btn-sm mt-4">
                    <Plus className="h-4 w-4" />
                    Add the first route
                  </button>
                )}
              </div>
            ) : (
              <>
                {noBus > 0 && (
                  <p className="border-b border-slate-100 px-5 py-2.5 text-[13px] text-slate-600">
                    <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-marigold-500 align-middle" />
                    {noBus === routes.length ? "Add the bus number and driver to each route." : `${noBus} routes still need a bus number or driver.`}
                  </p>
                )}
                <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-medium text-slate-600 sm:grid"><span>Route / area</span><span>Vehicle / driver</span><span>Occupancy</span><span className="w-4" /></div>
                <ul className="divide-y divide-slate-100">
                  {routes.map((r) => {
                    const [no, area] = splitName(r.name);
                    const full = r.capacity ? Math.round((r.students / r.capacity) * 100) : null;
                    const over = r.capacity !== null && r.students > r.capacity;
                    return (
                      <li key={r.id}>
                        <button type="button" onClick={() => setOpen(r)} className="grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-4 gap-y-1 px-4 py-3.5 text-left hover:bg-slate-50/70 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:px-5">
                          <span className="min-w-0">
                            <span className="block truncate text-[15px] font-semibold text-slate-900">{no}</span>
                            <span className="block truncate text-[13px] text-slate-500">{area || `${r.stops.length} stops`}</span>
                          </span>
                          <span className="hidden min-w-0 sm:block">
                            <span className={`block truncate text-sm ${r.vehicle_no ? "font-medium text-slate-800" : "text-slate-400"}`}>{r.vehicle_no || "No bus added"}</span>
                            <span className="block truncate text-xs text-slate-500">{r.driver_name ? `${r.driver_name}${r.driver_mobile ? ` · ${fmtPhone(r.driver_mobile)}` : ""}` : "No driver"}</span>
                          </span>
                          <span className="min-w-[6.5rem] text-right sm:text-left">
                            <span className="block text-sm tabular-nums text-slate-800">
                              <b className="font-semibold text-slate-900">{r.students}</b>
                              {r.capacity ? <span className="text-slate-500"> / {r.capacity} seats</span> : <span className="text-slate-500"> students</span>}
                            </span>
                            {full !== null && (
                              <span className="mt-1 block h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 sm:w-32">
                                <span className={`block h-full rounded-full ${over ? "bg-rose-500" : "bg-brand-500"}`} style={{ width: `${Math.min(100, full)}%` }} />
                              </span>
                            )}
                            {over && <span className="mt-1 block text-xs font-medium text-rose-700">{r.students - (r.capacity || 0)} above capacity</span>}
                          </span>
                          <ChevronRight className="h-4 w-4 text-slate-300" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </section>
        </>
      )}

      <RouteDrawer route={open} routes={routes || []} school={schoolProfile.school_name || "School"} isAdmin={isAdmin} onClose={() => setOpen(null)} onChanged={load} />
    </div>
  );
}

/** "Route 8 (Rai Colony - Civil Lines)" → ["Route 8", "Rai Colony – Civil Lines"]. */
function splitName(name: string): [string, string] {
  const m = name.match(/^(.*?)\s*\((.*)\)\s*$/);
  return m ? [m[1], m[2].replace(/\s+-\s+/g, " – ")] : [name, ""];
}

function Figure({ label, value, dot, onClick }: { label: string; value: string; dot: string; onClick?: () => void }) {
  const cls = "kpi p-4 text-left sm:p-5";
  const inner = (
    <>
      <span className="kpi-label">
        <i className={`h-2 w-2 rounded-full ${dot}`} />
        {label}
      </span>
      <span className="kpi-value">{value}</span>
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className={`${cls} transition hover:border-slate-300`}>
      {inner}
    </button>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
