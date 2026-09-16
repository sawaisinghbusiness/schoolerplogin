"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  MessageSquare,
  UserPlus,
  Gift,
  UserCheck,
  Home,
  BookOpen,
  Bus,
  ExternalLink
} from "lucide-react";

interface StatCardProps {
  title: string;
  count: string | number;
  icon: string;
  color: string;
  hasExternalLink?: boolean;
  href?: string;
  subtext?: string;
}

const ICON_MAP: Record<string, any> = {
  Users,
  MessageSquare,
  UserPlus,
  Gift,
  UserCheck,
  Home,
  BookOpen,
  Bus,
};

export function StatCard({
  title,
  count,
  icon,
  color,
  hasExternalLink = false,
  href = "/search-student",
  subtext
}: StatCardProps) {
  const IconComponent = ICON_MAP[icon] || Users;

  return (
    <div
      className="relative overflow-hidden bg-white rounded-lg shadow-sm border border-slate-200/90 hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
      style={{ borderTop: `4px solid ${color}` }}
    >
      <div className="p-4 sm:p-5 flex items-start justify-between">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {title}
          </div>
          <div
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ color: color }}
          >
            {count}
          </div>
          {subtext && (
            <p className="text-[11px] text-slate-400 font-medium">
              {subtext}
            </p>
          )}
        </div>

        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform"
          style={{ backgroundColor: color }}
        >
          <IconComponent className="w-6 h-6" />
        </div>
      </div>

      {hasExternalLink ? (
        <Link
          href={href}
          className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors"
        >
          <span>View Detailed Records</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
        </Link>
      ) : (
        <div className="h-1 bg-slate-50 border-t border-slate-100" />
      )}
    </div>
  );
}
