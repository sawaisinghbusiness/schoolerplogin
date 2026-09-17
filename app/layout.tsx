import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "St. Paul's Senior Secondary School | SchoolDesk ERP",
  description: "Official Institutional Management Portal for St. Paul's Senior Secondary School",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <body className="h-full w-full overflow-hidden antialiased bg-slate-50 font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
