"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Phone, Plus, Printer, Search, Trash2, X } from "lucide-react";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { toast } from "@/components/ui/Toaster";
import { PrintSheet } from "@/components/certificates/SheetPreview";
import { BusRoute, Rider, RouteInput, Stop, transportService } from "@/lib/services/transportService";

type Tab = "students" | "details";
const fmtPhone = (p?: string | null) => (p && /^\d{10}$/.test(p) && !/^(\d)\1{9}$/.test(p) ? `${p.slice(0, 5)} ${p.slice(5)}` : "—");
const blank = (): RouteInput => ({ name: "", stops: [], vehicle_no: "", capacity: "", driver_name: "", driver_mobile: "", conductor_name: "", conductor_mobile: "" });

/**
 * One route: its riders (move them, set their stop, print the driver's list) and its details
 * (stops with pickup times, bus, driver, conductor). `route === "unassigned"` lists bus
 * students who have no route yet; `route === "new"` opens an empty form.
 */
export function RouteDrawer({ route, routes, school, isAdmin, onClose, onChanged }: {
  route: BusRoute | "unassigned" | "new" | null;
  routes: BusRoute[];
  school: string;
  isAdmin: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const isNew = route === "new";
  const isUnassigned = route === "unassigned";
  const r = route && typeof route === "object" ? route : null;
  const [tab, setTab] = useState<Tab>("students");
  const [riders, setRiders] = useState<Rider[] | null>(null);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [moveTo, setMoveTo] = useState("");
  const [moveStop, setMoveStop] = useState("");
  const [f, setF] = useState<RouteInput>(blank());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);

  const loadRiders = async () => {
    if (!route || isNew) return;
    setRiders(null);
    const res = await transportService.riders(isUnassigned ? "unassigned" : r!.id);
    if (res.error) toast(res.error, "error");
    setRiders(res.data);
  };

  useEffect(() => {
    if (!route) return;
    setTab(isNew ? "details" : "students");
    setQuery("");
    setPicked(new Set());
    setError(null);
    setMoveTo(isUnassigned ? routes[0]?.id || "" : "");
    setMoveStop("");
    setF(r ? { name: r.name, stops: r.stops, vehicle_no: r.vehicle_no || "", capacity: r.capacity ? String(r.capacity) : "", driver_name: r.driver_name || "", driver_mobile: r.driver_mobile || "", conductor_name: r.conductor_name || "", conductor_mobile: r.conductor_mobile || "" } : blank());
    loadRiders();
  }, [route]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (riders || []).filter((s) => !q || s.name.toLowerCase().includes(q) || s.classSec.toLowerCase().includes(q) || s.stop.toLowerCase().includes(q));
  }, [riders, query]);
  const target = routes.find((x) => x.id === (moveTo || r?.id));

  if (!route) return null;

  const setStop = (i: number, patch: Partial<Stop>) => setF((p) => ({ ...p, stops: p.stops.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));
  const moveStopRow = (i: number, d: number) =>
    setF((p) => {
      const stops = [...p.stops];
      const j = i + d;
      if (j < 0 || j >= stops.length) return p;
      [stops[i], stops[j]] = [stops[j], stops[i]];
      return { ...p, stops };
    });

  const saveDetails = async () => {
    setBusy(true);
    setError(null);
    const res = await transportService.save({ ...f, stops: f.stops.filter((s) => s.name.trim()) }, r?.id);
    setBusy(false);
    if (!res.success) return setError(res.error || "Could not save.");
    toast(`${f.name} saved.`, "success");
    onChanged();
    if (isNew) onClose();
  };

  const remove = async () => {
    if (!r) return;
    setBusy(true);
    const res = await transportService.remove(r.id);
    setBusy(false);
    if (!res.success) return setError(res.error || "Could not delete.");
    toast(`${r.name} deleted.`, "success");
    onChanged();
    onClose();
  };

  const assign = async () => {
    const dest = moveTo || r?.id;
    if (!dest || !picked.size) return;
    setBusy(true);
    const res = await transportService.assign(dest, Array.from(picked), moveStop);
    setBusy(false);
    if (!res.success) return toast(res.error || "Could not move.", "error");
    toast(`${res.moved} students updated.`, "success");
    setPicked(new Set());
    onChanged();
    loadRiders();
  };

  const title = isNew ? "New route" : isUnassigned ? "Bus students without a route" : r!.name;
  const TABS: { key: Tab; label: string }[] = isUnassigned || isNew ? [] : [
    { key: "students", label: `Students${riders ? ` · ${riders.length}` : ""}` },
    { key: "details", label: "Route details" },
  ];

  return (
    <>
      <SideDrawer
        isOpen
        onClose={onClose}
        busy={busy}
        width="max-w-[620px]"
        title={title}
        subtitle={r && !isNew ? [r.vehicle_no, r.driver_name].filter(Boolean).join(" · ") || undefined : undefined}
        footer={
          tab === "details" && isAdmin ? (
            <>
              {r && (
                <button type="button" onClick={remove} disabled={busy} className="btn btn-secondary" aria-label="Delete route">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary ml-auto">
                Cancel
              </button>
              <button type="button" onClick={saveDetails} disabled={busy} className="btn btn-primary">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {isNew ? "Add route" : "Save"}
              </button>
            </>
          ) : picked.size > 0 ? (
            <>
              <span className="text-[13px] font-semibold text-slate-700">{picked.size} selected</span>
              <select value={moveTo} onChange={(e) => { setMoveTo(e.target.value); setMoveStop(""); }} className="field field-sm ml-auto w-36 sm:w-44" aria-label="Route">
                {!isUnassigned && <option value="">This route</option>}
                {routes.filter((x) => x.id !== r?.id).map((x) => (
                  <option key={x.id} value={x.id}>{x.name.split(" (")[0]}</option>
                ))}
              </select>
              <select value={moveStop} onChange={(e) => setMoveStop(e.target.value)} className="field field-sm w-32 sm:w-40" aria-label="Stop">
                <option value="">No stop</option>
                {(target?.stops || []).map((s) => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
              <button type="button" onClick={assign} disabled={busy || (!moveTo && !r)} className="btn btn-primary btn-sm">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Apply
              </button>
            </>
          ) : !isUnassigned && riders?.length ? (
            <button type="button" onClick={() => setPrinting(true)} className="btn btn-secondary ml-auto">
              <Printer className="h-4 w-4" />
              Driver&apos;s list
            </button>
          ) : null
        }
      >
        {TABS.length > 0 && (
          <div className="sticky top-0 z-10 bg-canvas px-5 pt-4">
            <div className="flex gap-1 rounded-xl bg-slate-200/60 p-1" role="tablist">
              {TABS.map((t) => (
                <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)} className={`flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold transition ${tab === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4 p-5">
          {error && <p role="alert" className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-800 ring-1 ring-rose-300">{error}</p>}

          {tab === "students" && !isNew && (
            <section className="card overflow-hidden">
              <div className="border-b border-slate-100 p-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, class or stop" aria-label="Find a student" className="field field-sm w-full pl-9" />
                </div>
              </div>
              {riders === null ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton h-10 w-full" />
                  ))}
                </div>
              ) : !shown.length ? (
                <p className="px-4 py-10 text-center text-sm text-slate-500">{riders.length ? "Nobody matches." : isUnassigned ? "Every bus student has a route." : "No student rides this route yet."}</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {shown.map((s) => {
                    const on = picked.has(s.id);
                    return (
                      <li key={s.id}>
                        <label className={`flex min-h-[52px] cursor-pointer items-center gap-3 px-4 py-2 ${on ? "bg-brand-50/60" : ""}`}>
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => setPicked((p) => { const n = new Set(p); n.has(s.id) ? n.delete(s.id) : n.add(s.id); return n; })}
                            className="h-4 w-4 accent-brand-600"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-slate-900">{s.name}</span>
                            <span className="block truncate text-xs text-slate-500">{s.classSec}</span>
                          </span>
                          <span className={`shrink-0 text-right text-xs ${s.stop ? "text-slate-700" : "text-slate-400"}`}>{s.stop || "No stop"}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}

          {tab === "details" && (
            <>
              <section className="card space-y-3 p-4">
                <label className="block">
                  <span className="field-label">Route name</span>
                  <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Route 9 (Gandhi Chowk - Jasdev Nagar)" maxLength={80} disabled={!isAdmin} className="field w-full" />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="field-label">Bus no.</span>
                    <input value={f.vehicle_no || ""} onChange={(e) => setF({ ...f, vehicle_no: e.target.value.toUpperCase() })} placeholder="RJ04 PA 1234" maxLength={20} disabled={!isAdmin} className="field w-full uppercase" />
                  </label>
                  <label className="block">
                    <span className="field-label">Seats</span>
                    <input type="number" inputMode="numeric" min={1} max={120} value={f.capacity} onChange={(e) => setF({ ...f, capacity: e.target.value })} placeholder="40" disabled={!isAdmin} className="field w-full tabular-nums" />
                  </label>
                  <label className="block">
                    <span className="field-label">Driver</span>
                    <input value={f.driver_name || ""} onChange={(e) => setF({ ...f, driver_name: e.target.value })} maxLength={60} disabled={!isAdmin} className="field w-full" />
                  </label>
                  <label className="block">
                    <span className="field-label">Driver mobile</span>
                    <input value={f.driver_mobile || ""} onChange={(e) => setF({ ...f, driver_mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })} inputMode="tel" disabled={!isAdmin} className="field w-full tabular-nums" />
                  </label>
                  <label className="block">
                    <span className="field-label">Conductor</span>
                    <input value={f.conductor_name || ""} onChange={(e) => setF({ ...f, conductor_name: e.target.value })} maxLength={60} disabled={!isAdmin} className="field w-full" />
                  </label>
                  <label className="block">
                    <span className="field-label">Conductor mobile</span>
                    <input value={f.conductor_mobile || ""} onChange={(e) => setF({ ...f, conductor_mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })} inputMode="tel" disabled={!isAdmin} className="field w-full tabular-nums" />
                  </label>
                </div>
              </section>

              <section className="card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Stops</h3>
                  <span className="text-xs text-slate-500">In pickup order</span>
                </div>
                <ol className="space-y-2">
                  {f.stops.map((s, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-5 shrink-0 text-right text-xs tabular-nums text-slate-400">{i + 1}</span>
                      <input value={s.name} onChange={(e) => setStop(i, { name: e.target.value })} placeholder="Stop name" maxLength={60} disabled={!isAdmin} aria-label={`Stop ${i + 1}`} className="field field-sm min-w-0 flex-1" />
                      <input type="time" value={s.time} onChange={(e) => setStop(i, { time: e.target.value })} disabled={!isAdmin} aria-label={`Pickup time at stop ${i + 1}`} className="field field-sm w-[7.5rem] tabular-nums" />
                      {isAdmin && (
                        <span className="flex shrink-0">
                          <button type="button" onClick={() => moveStopRow(i, -1)} disabled={i === 0} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30" aria-label="Move up">
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => moveStopRow(i, 1)} disabled={i === f.stops.length - 1} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30" aria-label="Move down">
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => setF((p) => ({ ...p, stops: p.stops.filter((_, j) => j !== i) }))} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600" aria-label="Remove stop">
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
                {isAdmin && (
                  <button type="button" onClick={() => setF((p) => ({ ...p, stops: [...p.stops, { name: "", time: "" }] }))} className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700 hover:underline">
                    <Plus className="h-3.5 w-3.5" />
                    Add a stop
                  </button>
                )}
              </section>

              {r && (r.driver_mobile || r.conductor_mobile) && (
                <section className="card divide-y divide-slate-100">
                  {[["Driver", r.driver_name, r.driver_mobile], ["Conductor", r.conductor_name, r.conductor_mobile]].filter(([, , m]) => m).map(([who, name, m]) => (
                    <a key={who} href={`tel:${m}`} className="flex min-h-[48px] items-center gap-3 px-4 text-sm hover:bg-slate-50">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-slate-800">{name || who}</span>
                      <span className="text-slate-500">{who}</span>
                      <span className="ml-auto tabular-nums text-slate-700">{fmtPhone(m)}</span>
                    </a>
                  ))}
                </section>
              )}
            </>
          )}
        </div>
      </SideDrawer>

      {printing && r && riders && (
        <PrintSheet onDone={() => setPrinting(false)}>
          <DriverList route={r} riders={riders} school={school} />
        </PrintSheet>
      )}
    </>
  );
}

/** A4 list for the bus: students grouped by stop, with parents' numbers. */
function DriverList({ route, riders, school }: { route: BusRoute; riders: Rider[]; school: string }) {
  const order = new Map(route.stops.map((s, i) => [s.name, i]));
  const rows = [...riders].sort((a, b) => (order.get(a.stop) ?? 999) - (order.get(b.stop) ?? 999) || a.name.localeCompare(b.name));
  const time = (stop: string) => route.stops.find((s) => s.name === stop)?.time || "";
  const cell = "border border-black px-2 py-1";
  return (
    // Not a fixed A4 box: a long route runs onto a second page.
    <div className="mx-auto w-[794px] bg-white px-10 py-10 text-[12px] text-black" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div className="border-b-2 border-black pb-2">
        <div className="text-[16px] font-bold">{school}</div>
        <div className="mt-0.5 flex justify-between text-[13px]">
          <b>{route.name}</b>
          <span>{[route.vehicle_no, route.driver_name && `Driver ${route.driver_name} ${fmtPhone(route.driver_mobile)}`].filter(Boolean).join(" · ")}</span>
        </div>
      </div>
      <table className="mt-3 w-full border-collapse">
        <thead>
          <tr className="bg-neutral-100">
            <th className={`${cell} w-8 text-left`}>#</th>
            <th className={`${cell} text-left`}>Student</th>
            <th className={`${cell} text-left`}>Class</th>
            <th className={`${cell} text-left`}>Stop</th>
            <th className={`${cell} text-left`}>Parent</th>
            <th className={`${cell} text-left`}>Mobile</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s, i) => (
            <tr key={s.id}>
              <td className={cell}>{i + 1}</td>
              <td className={cell}>{s.name}</td>
              <td className={cell}>{s.classSec}</td>
              <td className={cell}>{s.stop ? `${s.stop}${time(s.stop) ? ` (${time(s.stop)})` : ""}` : "—"}</td>
              <td className={cell}>{s.fatherName}</td>
              <td className={`${cell} tabular-nums`}>{fmtPhone(s.mobile)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
