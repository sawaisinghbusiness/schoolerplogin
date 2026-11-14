"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Search, X } from "lucide-react";
import { useSchoolProfile } from "@/components/providers/SchoolProfileProvider";
import { CORE_NAV, visibleNavGroups, type NavItem } from "./navConfig";
import { useCurrentUser } from "./useCurrentUser";
import { SignOutDialog } from "./SignOutDialog";
import { useDialog } from "@/components/ui/useDialog";

interface SidebarProps { isOpen: boolean; onClose?: () => void }
const initials = (name: string) => name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "S";
const Planned = () => <span className="ml-auto text-[10px] font-medium text-slate-500">Planned</span>;

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { schoolProfile } = useSchoolProfile();
  const user = useCurrentUser();
  const [query, setQuery] = useState("");
  const [mobile, setMobile] = useState(false);
  useEffect(() => { const media = window.matchMedia("(max-width: 767px)"); const update = () => setMobile(media.matches); update(); media.addEventListener("change", update); return () => media.removeEventListener("change", update); }, []);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const panel = useRef<HTMLElement>(null);
  const navGroups = useMemo(() => visibleNavGroups(), []);
  useDialog(isOpen && mobile, panel, onClose || (() => {}));
  useEffect(() => { if (mobile && !isOpen) panel.current?.setAttribute("inert", ""); else panel.current?.removeAttribute("inert"); }, [mobile, isOpen]);

  useEffect(() => {
    for (const group of navGroups) for (const item of group.items) {
      if (item.children?.some(child => child.href === pathname)) {
        setOpen(previous => previous[item.title] ? previous : { ...previous, [item.title]: true });
      }
    }
    onClose?.();
  }, [pathname, navGroups]); // Close the phone drawer after navigation.

  const q = query.trim().toLowerCase();
  const groups = useMemo(() => !q ? navGroups : navGroups.map(group => ({ ...group,
    items: group.items.map(item => {
      if (item.title.toLowerCase().includes(q)) return item;
      const children = item.children?.filter(child => child.title.toLowerCase().includes(q));
      return children?.length ? { ...item, children } : null;
    }).filter(Boolean) as NavItem[],
  })).filter(group => group.items.length), [q, navGroups]);

  const leaf = (item: NavItem) => {
    const active = pathname === item.href, Icon = item.icon;
    return <Link key={item.title} href={item.href || "#"} onClick={onClose} aria-current={active ? "page" : undefined} className={`office-nav-link ${active ? "is-active" : ""}`}>
      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.7} aria-hidden />
      <span className="truncate">{item.title}</span>{item.soon && <Planned />}
    </Link>;
  };
  const item = (entry: NavItem) => {
    if (!entry.children?.length) return leaf(entry);
    const Icon = entry.icon, expanded = !!q || !!open[entry.title];
    const current = entry.children.some(child => child.href === pathname);
    return <div key={entry.title}>
      <button type="button" onClick={() => setOpen(previous => ({ ...previous, [entry.title]: !previous[entry.title] }))} aria-expanded={expanded} className={`office-nav-link w-full text-left ${current ? "font-semibold text-slate-900" : ""}`}>
        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.7} aria-hidden />
        <span className="min-w-0 flex-1 truncate">{entry.title}</span>
        {entry.soon && <Planned />}<ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${expanded ? "" : "-rotate-90"}`} aria-hidden />
      </button>
      {expanded && <div className="office-nav-children">
        {entry.children.map(child => <Link key={child.href} href={child.href} onClick={onClose} aria-current={pathname === child.href ? "page" : undefined} className={`office-nav-child ${pathname === child.href ? "is-active" : ""}`}>
          <span className="truncate">{child.title}</span>{child.soon && <Planned />}
        </Link>)}
      </div>}
    </div>;
  };
  return <>
    {isOpen && <div className="fixed inset-0 z-30 bg-slate-950/35 md:hidden" onClick={onClose} aria-hidden="true" />}
    <aside aria-hidden={mobile && !isOpen || undefined} ref={panel} tabIndex={-1} role={isOpen ? "dialog" : undefined} aria-modal={isOpen || undefined} aria-label="School navigation" className={`erp-sidebar fixed inset-y-0 left-0 z-40 flex h-full shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white transition-transform duration-200 md:static md:z-20 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="office-school-identity">
        <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-800">
          {schoolProfile.logo_url ? <img src={schoolProfile.logo_url} alt="" className="h-8 w-8 object-contain" /> : initials(schoolProfile.school_name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[13px] font-semibold leading-[1.3] text-slate-900">{schoolProfile.school_name}</p>
          <p className="mt-1 text-xs text-slate-500">{schoolProfile.city || "School office"}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close menu" className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-100 md:hidden"><X className="h-4 w-4" /></button>
      </div>
      <div className="relative mx-3 mb-2">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden />
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a module" aria-label="Filter navigation" className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-8 text-[13px] text-slate-800 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
        {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear navigation filter" className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded text-slate-500"><X className="h-3 w-3" /></button>}
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-5" aria-label="Main">
        {(!q || CORE_NAV.some(entry => entry.title.toLowerCase().includes(q))) && <div className="mb-1 space-y-1">{CORE_NAV.filter(entry => !q || entry.title.toLowerCase().includes(q)).map(leaf)}</div>}
        {groups.map(group => <div key={group.label} className="pt-5"><p className="mb-2 px-3 text-[11px] font-medium text-slate-500">{group.label}</p><div className="space-y-1">{group.items.map(item)}</div></div>)}
        {q && !groups.length && !CORE_NAV.some(entry => entry.title.toLowerCase().includes(q)) && <p className="px-3 py-6 text-sm text-slate-500">No module matches &ldquo;{query}&rdquo;</p>}
      </nav>
      <div className="office-sidebar-footer">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700">{user.initials}</span>
        <div className="min-w-0 flex-1"><p className="truncate text-[12px] font-semibold text-slate-800">{user.name}</p><p className="truncate text-[11px] text-slate-500">{user.role}</p></div>
        <button type="button" onClick={() => setSignOutOpen(true)} aria-label="Sign out" title="Sign out" className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-700"><LogOut className="h-4 w-4" /></button>
      </div>
    </aside>
    <SignOutDialog open={signOutOpen} onClose={() => setSignOutOpen(false)} />
  </>;
}