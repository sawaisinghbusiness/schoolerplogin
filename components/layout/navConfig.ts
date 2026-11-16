import { LayoutDashboard, Users, IndianRupee, CalendarCheck, MessageSquareText, CalendarClock, MessagesSquare, CalendarDays, Cake, Trophy, Table2, NotebookPen, ListChecks, ClipboardCheck, Briefcase, Bus, Settings2, Video, Award, FileQuestion, Library, BedDouble, Package, DoorOpen, HeartPulse, MessageSquareWarning, GraduationCap, Fingerprint, type LucideIcon } from 'lucide-react';
import catalog from '@/lib/erp-system.json';
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
const ICONS: Record<string, LucideIcon> = { LayoutDashboard, Users, IndianRupee, CalendarCheck, MessageSquareText, CalendarClock, MessagesSquare, CalendarDays, Cake, Trophy, Table2, NotebookPen, ListChecks, ClipboardCheck, Briefcase, Bus, Settings2, Video, Award, FileQuestion, Library, BedDouble, Package, DoorOpen, HeartPulse, MessageSquareWarning, GraduationCap, Fingerprint };
export const NAV_GROUPS: NavGroup[] = [];
for (const f of catalog.features) {
    let group = NAV_GROUPS.find(g => g.label === f.group.en);
    if (!group) {
        group = { label: f.group.en, items: [] };
        NAV_GROUPS.push(group);
    }
    let item = group.items.find(i => i.title === f.module.en);
    if (!item) {
        item = { title: f.module.en, icon: ICONS[f.icon] || LayoutDashboard, children: [] };
        group.items.push(item);
    }
    item.children!.push({ title: f.title.en, href: f.web, soon: f.status === 'planned' });
}
for (const group of NAV_GROUPS)
    for (const item of group.items)
        if (item.children?.length === 1 && item.children[0].title === item.title) {
            item.href = item.children[0].href;
            item.soon = item.children[0].soon;
            delete item.children;
        }
/**
 * Who may open a section, matching the backend's requireRole checks (sms backend/src/routes, 2026-11-16).
 * Longest prefix wins; anything not listed is open to every signed-in staff role. Without this, teachers saw
 * Payroll, Users and the fee counter in the menu and got "HTTP 403" on opening them.
 */
const ROUTE_ROLES: [prefix: string, roles: string[]][] = [
    ["/fees", ["admin", "accountant"]],
    ["/staff/payroll", ["admin", "accountant"]],
    ["/staff/new", ["admin"]],
    ["/staff/excel", ["admin"]],
    ["/staff/allocation", ["admin"]],
    ["/staff/class-teachers", ["admin"]],
    ["/students/documents", ["admin", "accountant"]],
    ["/students/enquiries", ["admin", "accountant"]],
    ["/students/promote", ["admin"]],
    ["/students/certificates", ["admin"]],
    ["/students/excel", ["admin"]],
    ["/parent-chats", ["admin"]],
    ["/settings", ["admin"]],
];
/** True when `roleKey` may open `href`. An unknown role (still loading) sees everything, so the menu never flickers empty. */
export function canOpen(href: string, roleKey?: string): boolean {
    if (!roleKey) return true;
    const path = href.split("?")[0];
    const rule = ROUTE_ROLES.filter(([p]) => path === p || path.startsWith(p + "/")).sort((a, b) => b[0].length - a[0].length)[0];
    return !rule || rule[1].includes(roleKey);
}
export function visibleNavGroups(roleKey?: string): NavGroup[] {
    return NAV_GROUPS.map((g) => ({
        ...g,
        items: g.items
            .map((item) => {
                const children = item.children?.filter((c) => canOpen(c.href, roleKey));
                if (item.children && !children?.length) return null;
                if (!item.children && item.href && !canOpen(item.href, roleKey)) return null;
                const next = children ? { ...item, children } : item;
                return next.children && next.children.every((c) => c.soon) ? { ...next, soon: true } : next;
            })
            .filter((item): item is NavItem => !!item),
    })).filter((g) => g.items.length > 0);
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
export function titleForPath(pathname: string): {
    title: string;
    section: string;
} {
    const match = allDestinations().find((d) => d.href === pathname);
    if (match)
        return { title: match.title, section: match.section };
    const parent = allDestinations().filter(d => !d.href.includes("?") && pathname.startsWith(d.href + "/")).sort((a, b) => b.href.length - a.href.length)[0];
    if (parent) {
        const leaf = pathname.split("/").filter(Boolean).at(-1) || parent.title;
        return { title: leaf.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()), section: parent.title };
    }
    if (pathname.startsWith("/students/"))
        return { title: "Student", section: "Students" };
    const last = pathname.split("/").filter(Boolean).pop() || "dashboard";
    return { title: last.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), section: "SchoolDesk" };
}
