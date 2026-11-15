"use client";

import { createPortal } from "react-dom";
import React, { useEffect, useRef, useState } from "react";
import { Check, LocateFixed, Search, Trash2, X } from "lucide-react";

const BARMER: [number, number] = [71.3967, 25.7521];
const STYLE = "https://tiles.openfreemap.org/styles/liberty";
const ML_VERSION = "4.7.1";

export interface Place {
  lat: number;
  lng: number;
}

/** MapLibre from its CDN, loaded once the first time a stop's place is picked (no extra package in the ERP). */
let loading: Promise<any> | null = null;
function maplibre(): Promise<any> {
  if ((window as any).maplibregl) return Promise.resolve((window as any).maplibregl);
  if (!loading)
    loading = new Promise((resolve, reject) => {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = `https://unpkg.com/maplibre-gl@${ML_VERSION}/dist/maplibre-gl.css`;
      document.head.appendChild(css);
      const js = document.createElement("script");
      js.src = `https://unpkg.com/maplibre-gl@${ML_VERSION}/dist/maplibre-gl.js`;
      js.onload = () => resolve((window as any).maplibregl);
      js.onerror = () => {
        loading = null;
        reject(new Error("map"));
      };
      document.head.appendChild(js);
    });
  return loading;
}

const round = (n: number) => Math.round(n * 1e6) / 1e6;

/**
 * Pick a bus stop's place on a street map: click the map (or drag the pin), search by name, or use this
 * device's location while standing at the stop. The bus app drives to this place and the parents' pick-up /
 * drop-off alert comes there.
 */
export function StopPlacePicker({ name, value, near, onSave, onClose }: { name: string; value: Place | null; near: Place | null; onSave: (p: Place | null) => void; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const pin = useRef<any>(null);
  const lib = useRef<any>(null);
  const [at, setAt] = useState<Place | null>(value);
  const [q, setQ] = useState(name);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const put = (p: Place, fly = false) => {
    setAt(p);
    const m = map.current;
    if (!m || !lib.current) return;
    if (!pin.current) {
      pin.current = new lib.current.Marker({ color: "#D93636", draggable: true }).setLngLat([p.lng, p.lat]).addTo(m);
      pin.current.on("dragend", () => {
        const ll = pin.current.getLngLat();
        setAt({ lat: round(ll.lat), lng: round(ll.lng) });
      });
    } else pin.current.setLngLat([p.lng, p.lat]);
    if (fly) m.flyTo({ center: [p.lng, p.lat], zoom: 16 });
  };

  useEffect(() => {
    let gone = false;
    maplibre()
      .then((ml) => {
        if (gone || !box.current || map.current) return;
        lib.current = ml;
        const start = value || near;
        const m = new ml.Map({ container: box.current, style: STYLE, center: start ? [start.lng, start.lat] : BARMER, zoom: start ? 15 : 13, attributionControl: { compact: true } });
        map.current = m;
        m.on("click", (e: any) => put({ lat: round(e.lngLat.lat), lng: round(e.lngLat.lng) }));
        m.on("load", () => value && put(value));
      })
      .catch(() => setMsg("The map could not load. Check the internet and open this again."));
    return () => {
      gone = true;
      map.current?.remove();
      map.current = null;
      pin.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function find(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setBusy(true);
    setMsg("");
    try {
      const c = map.current?.getCenter();
      const around = c ? `&viewbox=${c.lng - 0.25},${c.lat + 0.25},${c.lng + 0.25},${c.lat - 0.25}` : "";
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1${around}&q=${encodeURIComponent(q.trim())}`, { headers: { "Accept-Language": "en" } });
      const j = res.ok ? await res.json() : [];
      if (j?.[0]?.lat) put({ lat: Number(j[0].lat), lng: Number(j[0].lon) }, true);
      else setMsg("Not found on the map. Click the map to choose the place.");
    } catch {
      setMsg("Search did not work. Click the map to choose the place.");
    } finally {
      setBusy(false);
    }
  }

  function here() {
    if (!("geolocation" in navigator)) return setMsg("This device has no location.");
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (g) => {
        setBusy(false);
        put({ lat: round(g.coords.latitude), lng: round(g.coords.longitude) }, true);
      },
      () => {
        setBusy(false);
        setMsg("Could not get the location. Allow location for this site.");
      },
      { enableHighAccuracy: true, timeout: 15_000 }
    );
  }

  // Rendered on <body>: the drawer / page around it may use a CSS transform, which would trap a fixed panel.
  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-stretch justify-center bg-slate-900/40 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={`Place of ${name}`}>
      <div className="flex h-full w-full flex-col overflow-hidden bg-white sm:h-[min(640px,90vh)] sm:max-w-2xl sm:rounded-xl sm:shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2.5">
          <p className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900">Place of {name}</p>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={find} className="flex gap-2 px-4 py-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a place" aria-label="Search a place" className="field field-sm w-full pl-8" />
          </div>
          <button type="submit" disabled={busy} className="btn btn-secondary btn-sm">
            Find
          </button>
        </form>
        <div className="relative min-h-0 flex-1">
          <div ref={box} className="absolute inset-0" />
          <button type="button" onClick={here} disabled={busy} className="absolute right-3 top-3 z-[5] grid h-10 w-10 place-items-center rounded-lg bg-white shadow" aria-label="My location" title="Use my location">
            <LocateFixed className="h-5 w-5 text-slate-700" />
          </button>
        </div>
        <div className="space-y-2 border-t border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-600">
            {msg || (at ? `Place chosen: ${at.lat.toFixed(5)}, ${at.lng.toFixed(5)}. Drag the pin to adjust.` : "Click the stop's place on the map, search by name, or stand at the stop and use My location.")}
          </p>
          <div className="flex justify-end gap-2">
            {value && (
              <button type="button" onClick={() => onSave(null)} className="btn btn-secondary btn-sm text-rose-700">
                <Trash2 className="h-4 w-4" /> Remove place
              </button>
            )}
            <button type="button" disabled={!at} onClick={() => at && onSave(at)} className="btn btn-primary btn-sm">
              <Check className="h-4 w-4" /> Use this place
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
