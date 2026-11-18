"use client";

import { useEffect, useState } from "react";
import { authService } from "@/lib/services/authService";

export interface CurrentUser {
  name: string;
  role: string;
  initials: string;
  roleKey: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Director",
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
 * Server-confirmed user metadata for greetings and role-specific presentation.
 * Authorization itself remains enforced by the backend httpOnly session.
 */
export function useCurrentUser(): CurrentUser {
  const [user, setUser] = useState<CurrentUser>({ name: "Your account", role: "Loading account", initials: "", roleKey: "" });

  useEffect(() => {
    let active = true;
    authService.currentUser().then(account => {
      if (!active) return;
      if (!account) { setUser({ name: "Your account", role: "Account unavailable", initials: "", roleKey: "" }); return; }
      const name = account.name.replace(/\s*\(.*?\)\s*/g, "").trim() || account.name;
      setUser({ name, role: ROLE_LABELS[account.role] || account.role, initials: initialsOf(name), roleKey: account.role });
    });
    return () => { active = false; };
  }, []);

  return user;
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
