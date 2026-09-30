"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { SchoolProfileProvider } from "@/components/providers/SchoolProfileProvider";
import { Toaster } from "@/components/ui/Toaster";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";

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
      <div className="flex h-screen w-screen overflow-hidden bg-canvas font-sans text-slate-900">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
          <main className="relative flex-1 overflow-y-auto overflow-x-hidden min-h-0">
            <div key={pathname} className="page-enter relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </SchoolProfileProvider>
  );
}
