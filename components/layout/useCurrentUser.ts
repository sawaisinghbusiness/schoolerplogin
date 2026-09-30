"use client";

import { useEffect, useState } from "react";

export interface CurrentUser {
  name: string;
  role: string;
  initials: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  teacher: "Faculty",
  exam_cell: "Exam Cell",
  accountant: "Accounts",
  parent: "Parent",
  student: "Student",
};

function initialsOf(name: string): string {
  const clean = name.replace(/\(.*?\)/g, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "AD";
}

/**
 * Display-only user info saved at login. Auth itself lives in the backend's
 * httpOnly cookie; this is just for greeting and avatars.
 */
export function useCurrentUser(): CurrentUser {
  const [user, setUser] = useState<CurrentUser>({ name: "Administrator", role: "Administrator", initials: "AD" });

  useEffect(() => {
    try {
      const rawName = localStorage.getItem("schooldesk_user_name") || "Administrator";
      const rawRole = localStorage.getItem("schooldesk_user_role") || "admin";
      const name = rawName.replace(/\s*\(.*?\)\s*/g, "").trim() || rawName;
      setUser({ name, role: ROLE_LABELS[rawRole] || rawRole, initials: initialsOf(name) });
    } catch {
      // storage unavailable — keep defaults
    }
  }, []);

  return user;
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
