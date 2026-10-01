import type { Metadata, Viewport } from "next";
// Self-hosted variable fonts (bundled from npm, so builds never depend on Google Fonts).
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/fraunces";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "St. Paul School | SchoolDesk ERP",
  description: "School management portal for St. Paul School, Barmer",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <body className="h-full w-full overflow-hidden antialiased bg-slate-50 font-sans text-slate-900 selection:bg-brand-500 selection:text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
