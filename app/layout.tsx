import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "SchoolDesk - Mother Teresa Nobles Academy",
  description: "Dedicated Schoollog ERP Portal for Mother Teresa Nobles Academy (Account: SLRJ0402749)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-800 bg-[#f4f6f9]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
