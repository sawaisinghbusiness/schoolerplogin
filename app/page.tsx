"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-500 text-xs">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Entering St. Paul&apos;s Senior Secondary School Control Center...</span>
      </div>
    </div>
  );
}
