"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";

export interface PublicSchool {
  name: string;
  short: string;
  board: string;
  affiliation_no: string;
  school_code: string;
  udise_code: string;
  principal: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  phone: string[];
  email: string;
  website: string;
  logo_url: string;
}

export interface PublicClass {
  name: string;
  wing: string;
  sections: string[];
  subjects: string[];
}

export interface PublicSite {
  school: PublicSchool;
  stats: { students: number; families: number; teachers: number; classes: number; sections: number };
  events: { title: string; start: string; end: string; holiday: boolean }[];
  classes: PublicClass[];
}

export const FALLBACK_SITE: PublicSite = {
  school: { name: "St. Paul School", short: "SPS", board: "CBSE", affiliation_no: "", school_code: "", udise_code: "", principal: "", address: "", city: "Barmer", district: "Barmer", state: "Rajasthan", pincode: "344001", phone: [], email: "", website: "", logo_url: "" },
  stats: { students: 0, families: 0, teachers: 0, classes: 0, sections: 0 },
  events: [],
  classes: [],
};

// One fetch per visit, shared by every public page.
let cache: PublicSite | null = null;
let inflight: Promise<PublicSite | null> | null = null;

export function usePublicSite(): { site: PublicSite; loaded: boolean; signedIn: boolean } {
  const [site, setSite] = useState<PublicSite>(cache || FALLBACK_SITE);
  const [loaded, setLoaded] = useState(!!cache);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!cache) {
      inflight ||= api.get<PublicSite>("/api/public/home").then((r) => (r.ok && r.data ? (cache = r.data) : null));
      inflight.then((d) => {
        if (d) setSite(d);
        setLoaded(true);
      });
    }
    api.get<{ authenticated?: boolean }>("/api/auth/me").then((r) => setSignedIn(!!(r.ok && r.data?.authenticated)));
  }, []);

  return { site, loaded, signedIn };
}

export const dayLabel = (iso: string, withYear = true) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}) });
export const placeOf = (s: PublicSchool) => [s.address, s.city, s.state, s.pincode].filter(Boolean).join(", ");
