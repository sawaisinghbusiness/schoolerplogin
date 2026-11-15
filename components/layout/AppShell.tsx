"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { SchoolProfileProvider } from "@/components/providers/SchoolProfileProvider";
import { Toaster } from "@/components/ui/Toaster";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { isPublicPage } from "@/lib/publicRoutes";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    const onExpired = () => setExpired(true);
    window.addEventListener("schooldesk:session-expired", onExpired);
    return () => window.removeEventListener("schooldesk:session-expired", onExpired);
  }, []);
  // The public website and the login page have their own full-page layout.
  const isAuthPage = isPublicPage(pathname || "/");

  if (isAuthPage) {
    return (
      <div className="h-full overflow-y-auto bg-white">
        {children}
        <Toaster />
      </div>
    );
  }

  return (
    <SchoolProfileProvider>
      <div data-action-theme="evergreen" className="erp-shell flex h-[100dvh] w-screen overflow-hidden font-sans text-slate-900">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
          <main className="relative flex-1 overflow-y-auto overflow-x-hidden min-h-0">
            {expired && <div role="alert" className="mx-4 mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">Your session has expired. Keep a copy of any unsaved changes, then <a href={`/login?from=${encodeURIComponent(pathname || "/dashboard")}`} className="font-semibold underline">sign in again</a>.</div>}
            {/* Phones: 16px gutter, and room at the bottom for the tab bar. */}
            <div key={pathname} className="erp-content page-enter relative mx-auto w-full px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 md:py-6 lg:px-7">
              {children}
            </div>
          </main>
        </div>
      </div>
      <MobileTabBar onMenu={() => setIsSidebarOpen((v) => !v)} menuOpen={isSidebarOpen} />
      <Toaster />
    </SchoolProfileProvider>
  );
}
