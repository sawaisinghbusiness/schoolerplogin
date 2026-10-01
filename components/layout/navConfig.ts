import {
  Briefcase,
  Bus,
  CalendarCheck,
  IndianRupee,
  LayoutDashboard,
  MessageSquareText,
  Settings2,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Single source of truth for the sidebar, the command palette and page titles.
 * Mirrors the rebuild plan's 11 modules. `soon` marks screens that are planned but
 * not built yet: they open an honest "coming in phase X" page instead of fake data.
 */

export interface NavChild {
  title: string;
  href: string;
  soon?: boolean;
}

export interface NavItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  soon?: boolean;
  children?: NavChild[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const CORE_NAV: NavItem[] = [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }];

/**
 * One page per job. Things that fit on a page live there as tabs, popups or drawers
 * (new admission, student profile, add staff…); a separate page only when a different
 * person does it, at a different time, or it is a big workflow of its own.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Daily work",
    items: [
      {
        title: "Students",
        icon: Users,
        children: [
          { title: "All students", href: "/students" },
          { title: "Enquiries", href: "/students/enquiries" },
          { title: "Promote & transfer", href: "/students/promote" },
          { title: "Certificates", href: "/students/certificates" },
        ],
      },
      {
        title: "Fees",
        icon: IndianRupee,
        children: [
          { title: "Collect fee", href: "/fees/collect" },
          { title: "Dues & reminders", href: "/fees/dues" },
          { title: "Receipts", href: "/fees/receipts" },
          { title: "Reports", href: "/fees/reports" },
          { title: "Fee setup", href: "/fees/setup" },
        ],
      },
      {
        title: "Attendance",
        icon: CalendarCheck,
        children: [
          { title: "Mark attendance", href: "/attendance/mark" },
          { title: "Register & reports", href: "/attendance/register" },
        ],
      },
      { title: "Messages", href: "/messages", icon: MessageSquareText },
    ],
  },
  {
    label: "Academics",
    items: [
      {
        title: "Exams",
        icon: Trophy,
        children: [
          { title: "Marks entry", href: "/exams/marks" },
          { title: "Report cards", href: "/exams/report-cards" },
          { title: "Exam setup", href: "/exams/setup" },
        ],
      },
    ],
  },
  {
    label: "School",
    items: [
      {
        title: "Staff",
        icon: Briefcase,
        children: [
          { title: "Directory", href: "/staff" },
          { title: "Attendance & leave", href: "/staff/attendance" },
          { title: "Payroll", href: "/staff/payroll", soon: true },
        ],
      },
      { title: "Transport", href: "/transport", icon: Bus, soon: true },
      {
        title: "Settings",
        icon: Settings2,
        children: [
          { title: "School & sessions", href: "/settings" },
          { title: "Classes & subjects", href: "/settings/classes" },
          { title: "Users & roles", href: "/settings/users" },
          { title: "Messaging & print", href: "/settings/messaging", soon: true },
        ],
      },
    ],
  },
];

/**
 * What the sidebar shows: the full plan, so the school sees everything the product
 * will do. Screens not built yet carry `soon` and are drawn muted with a tag.
 * A module whose screens are all unbuilt is marked `soon` itself.
 */
export function visibleNavGroups(): NavGroup[] {
  return NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.map((item) => (item.children && item.children.every((c) => c.soon) ? { ...item, soon: true } : item)),
  }));
}

/** Flat list of every destination, for the command palette and page titles. */
export interface NavDestination {
  title: string;
  href: string;
  section: string;
  icon: LucideIcon;
  soon?: boolean;
}

export function allDestinations(): NavDestination[] {
  const out: NavDestination[] = CORE_NAV.map((i) => ({ title: i.title, href: i.href!, section: "Overview", icon: i.icon }));
  const seen = new Set(out.map((d) => d.href));
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (item.href && !seen.has(item.href)) {
        out.push({ title: item.title, href: item.href, section: group.label, icon: item.icon, soon: item.soon });
        seen.add(item.href);
      }
      for (const child of item.children || []) {
        if (!seen.has(child.href)) {
          out.push({ title: child.title, href: child.href, section: item.title, icon: item.icon, soon: child.soon });
          seen.add(child.href);
        }
      }
    }
  }
  return out;
}

/** Human title for the current path (used by the top bar breadcrumb). */
export function titleForPath(pathname: string): { title: string; section: string } {
  const match = allDestinations().find((d) => d.href === pathname);
  if (match) return { title: match.title, section: match.section };
  if (pathname.startsWith("/students/")) return { title: "Student", section: "Students" };
  const last = pathname.split("/").filter(Boolean).pop() || "dashboard";
  return { title: last.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), section: "SchoolDesk" };
}
