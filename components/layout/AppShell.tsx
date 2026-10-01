"use client";

import React, { useState } from "react";
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
      <div className="flex h-[100dvh] w-screen overflow-hidden bg-canvas font-sans text-slate-900">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
          <main className="relative flex-1 overflow-y-auto overflow-x-hidden min-h-0">
            {/* Phones: 16px gutter, and room at the bottom for the tab bar. */}
            <div key={pathname} className="page-enter relative mx-auto w-full max-w-7xl px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-4 sm:px-6 md:py-8 lg:px-8">
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
