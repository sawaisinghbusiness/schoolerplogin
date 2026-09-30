"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LogOut, Search, X } from "lucide-react";
import { useSchoolProfile } from "@/components/providers/SchoolProfileProvider";
import { CORE_NAV, visibleNavGroups, type NavItem } from "@/components/layout/navConfig";
import { useCurrentUser } from "@/components/layout/useCurrentUser";
import { SignOutDialog } from "@/components/layout/SignOutDialog";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

/** Exact match only: /students/certificates must not also light up /students. */
function isPathActive(pathname: string, href?: string) {
  if (!href || href === "#") return false;
  return pathname === href;
}

function schoolInitials(name: string) {
  return (
    name
      .split(" ")
      .filter((w) => w.length > 2)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "MT"
  );
}

/** "ST. PAUL SCHOOL" -> "St. Paul School" */
const titleCase = (s: string) => s.toLowerCase().replace(/(^|[\s.(-])([a-z])/g, (_m, p, c) => p + c.toUpperCase());

const SoonTag = () => <span className="ml-auto shrink-0 rounded px-1.5 py-px text-[10.5px] font-semibold text-night-500 ring-1 ring-night-700">Soon</span>;

/** The marigold marker on the active row. */
const ActiveBar = () => <span aria-hidden className="absolute -left-3 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-marigold-400" />;

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { schoolProfile } = useSchoolProfile();
  const user = useCurrentUser();
  const [query, setQuery] = useState("");
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const navGroups = useMemo(() => visibleNavGroups(), []);

  // Keep the module that contains the current page expanded.
  useEffect(() => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.children?.some((c) => isPathActive(pathname, c.href))) {
          setOpen((prev) => (prev[item.title] ? prev : { ...prev, [item.title]: true }));
        }
      }
    }
  }, [pathname, navGroups]);

  const q = query.trim().toLowerCase();
  const groups = useMemo(() => {
    if (!q) return navGroups;
    return navGroups
      .map((g) => ({
        ...g,
        items: g.items
          .map((item) => {
            if (item.title.toLowerCase().includes(q)) return item;
            const children = item.children?.filter((c) => c.title.toLowerCase().includes(q));
            return children && children.length ? { ...item, children } : null;
          })
          .filter(Boolean) as NavItem[],
      }))
      .filter((g) => g.items.length > 0);
  }, [q, navGroups]);

  const toggle = (title: string) => setOpen((prev) => ({ ...prev, [title]: !prev[title] }));

  const renderLeaf = (item: NavItem) => {
    const Icon = item.icon;
    const active = isPathActive(pathname, item.href);
    return (
      <Link
        key={item.title}
        href={item.href || "#"}
        onClick={onClose}
        aria-current={active ? "page" : undefined}
        className={`group relative flex h-10 items-center gap-3 rounded-lg px-3 text-[14px] transition-colors ${
          active
            ? "bg-white/[0.08] font-semibold text-white"
            : item.soon
              ? "font-medium text-night-500 hover:bg-white/[0.03] hover:text-night-300"
              : "font-medium text-night-300 hover:bg-white/[0.04] hover:text-white"
        }`}
      >
        {active && <ActiveBar />}
        <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-marigold-400" : item.soon ? "text-night-600" : "text-night-400 group-hover:text-night-200"}`} strokeWidth={1.9} />
        <span className="truncate">{item.title}</span>
        {item.soon && !active && <SoonTag />}
      </Link>
    );
  };

  const renderGroupItem = (item: NavItem) => {
    if (!item.children?.length) return renderLeaf(item);

    const Icon = item.icon;
    const expanded = Boolean(q) || Boolean(open[item.title]);
    const hasActiveChild = item.children.some((c) => isPathActive(pathname, c.href));

    return (
      <div key={item.title}>
        <button
          onClick={() => toggle(item.title)}
          aria-expanded={expanded}
          className={`group flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[14px] transition-colors ${
            hasActiveChild
              ? "font-semibold text-white"
              : item.soon
                ? "font-medium text-night-500 hover:bg-white/[0.03] hover:text-night-300"
                : "font-medium text-night-300 hover:bg-white/[0.04] hover:text-white"
          }`}
        >
          <Icon className={`h-[18px] w-[18px] shrink-0 ${hasActiveChild ? "text-marigold-400" : item.soon ? "text-night-600" : "text-night-400 group-hover:text-night-200"}`} strokeWidth={1.9} />
          <span className="flex-1 truncate">{item.title}</span>
          {item.soon && <SoonTag />}
          <ChevronRight className={`h-4 w-4 shrink-0 text-night-500 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`} />
        </button>

        <div className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="overflow-hidden">
            <div className="mb-1.5 ml-[21px] mt-0.5 space-y-0.5 border-l border-night-700 pl-3">
              {item.children.map((child) => {
                const active = isPathActive(pathname, child.href);
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onClose}
                    tabIndex={expanded ? 0 : -1}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex items-center rounded-md px-3 py-[7px] text-[13.5px] transition-colors ${
                      active
                        ? "bg-white/[0.08] font-semibold text-white"
                        : child.soon
                          ? "text-night-500 hover:bg-white/[0.03] hover:text-night-300"
                          : "text-night-300 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    {active && <span aria-hidden className="absolute -left-[13px] top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-marigold-400" />}
                    <span className="truncate">{child.title}</span>
                    {child.soon && !active && !item.soon && <SoonTag />}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {isOpen && <div onClick={onClose} className="fixed inset-0 z-30 bg-night-950/50 md:hidden" />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-[256px] shrink-0 select-none flex-col overflow-hidden bg-night-900 text-night-200 transition-transform duration-300 ease-out md:static md:z-20 md:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* School identity */}
        <div className="flex h-[72px] shrink-0 items-center gap-3 px-4">
          {schoolProfile.logo_url ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1">
              <img src={schoolProfile.logo_url} alt="" className="h-full w-full object-contain" />
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-marigold-400 text-[13px] font-extrabold text-night-950">
              {schoolInitials(schoolProfile.school_name)}
            </div>
          )}
          <div className="min-w-0 flex-1 leading-tight">
            <div className="line-clamp-2 text-[13px] font-bold text-white" title={schoolProfile.school_name}>
              {titleCase(schoolProfile.school_name)}
            </div>
            <div className="mt-0.5 text-xs text-night-400">Barmer · 2026-27</div>
          </div>
          {onClose && (
            <button onClick={onClose} className="rounded-md p-1.5 text-night-400 hover:bg-white/5 hover:text-white md:hidden" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Menu filter */}
        <div className="relative shrink-0 px-3 pb-2">
          <Search className="pointer-events-none absolute left-6 top-1/2 h-4 w-4 -translate-y-[calc(50%+4px)] text-night-500" />
          <input
            type="text"
            placeholder="Find a page"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-night-700 bg-night-850 py-2 pl-9 pr-8 text-[13.5px] text-white placeholder:text-night-500 focus:border-marigold-400/60 focus:outline-none focus:ring-2 focus:ring-marigold-400/20"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-5 top-1/2 -translate-y-[calc(50%+4px)] rounded p-0.5 text-night-400 hover:text-white" aria-label="Clear">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 [scrollbar-color:#2E313B_transparent]" aria-label="Main">
          {!q && <div className="space-y-0.5 pt-2">{CORE_NAV.map(renderLeaf)}</div>}

          {groups.map((group) => (
            <div key={group.label} className="space-y-0.5 pt-5">
              <div className="px-3 pb-1.5 text-[11.5px] font-semibold text-night-500">{group.label}</div>
              {group.items.map(renderGroupItem)}
            </div>
          ))}

          {q && groups.length === 0 && <p className="px-3 py-8 text-center text-[13px] text-night-400">No page matches &ldquo;{query}&rdquo;</p>}
        </nav>

        {/* Signed-in user */}
        <div className="shrink-0 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-night-850 p-2 ring-1 ring-white/[0.04]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-night-700 text-[12px] font-bold text-marigold-300">{user.initials}</div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-[13px] font-semibold text-white">{user.name}</div>
              <div className="truncate text-xs text-night-400">{user.role}</div>
            </div>
            <button onClick={() => setSignOutOpen(true)} title="Sign out" aria-label="Sign out" className="rounded-md p-2 text-night-400 hover:bg-rose-500/10 hover:text-rose-400">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <SignOutDialog open={signOutOpen} onClose={() => setSignOutOpen(false)} />
    </>
  );
}
