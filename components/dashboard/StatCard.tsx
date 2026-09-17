"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  MessageSquare,
  UserPlus,
  Gift,
  UserCheck,
  User,
  Home,
  BookOpen,
  Bus,
  CreditCard,
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  GraduationCap,
  IndianRupee,
  Receipt,
  ClipboardCheck,
  Send,
  Cake,
  Briefcase,
  Wallet
} from "lucide-react";

interface StatCardProps {
  title: string;
  count: string | number;
  icon: string;
  color?: string;
  hasExternalLink?: boolean;
  href?: string;
  subtext?: string;
  trend?: string;
}

const ICON_MAP: Record<string, any> = {
  GraduationCap,
  IndianRupee,
  Receipt,
  ClipboardCheck,
  Send,
  Cake,
  Briefcase,
  Bus,
  Users,
  Wallet,
  CalendarCheck,
  UserPlus,
  MessageSquare,
  Gift,
  UserCheck,
  User,
  Home,
  BookOpen,
  CreditCard,
  TrendingUp,
};

export function StatCard({
  title,
  count,
  icon,
  hasExternalLink = false,
  href = "/search-student",
  subtext,
  trend
}: StatCardProps) {
  const IconComponent = ICON_MAP[icon] || Users;
  const trendText = trend || subtext;

  const cardContent = (
    <div className="p-5 flex flex-col justify-between h-full space-y-3">
      {/* Top row: Label + Minimal Professional Icon */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
          {title}
        </span>
        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-200/80 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-colors">
          <IconComponent className="w-4 h-4 stroke-[1.8]" />
        </div>
      </div>

      {/* Metric row: Bold, Crisp, Monospaced */}
      <div>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums font-mono">
          {count}
        </div>
      </div>

      {/* Footer row: Clean metadata pill & optional link */}
      <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-100">
        <span className="text-xs font-medium text-slate-500 truncate">
          {trendText}
        </span>
        {hasExternalLink && (
          <span className="inline-flex items-center space-x-0.5 text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
            <span>View</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        )}
      </div>
    </div>
  );

  if (hasExternalLink && href) {
    return (
      <Link
        href={href}
        className="group bg-white rounded-xl shadow-2xs border border-slate-200/90 hover:border-slate-300 hover:shadow-xs transition-all duration-150 flex flex-col justify-between"
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div className="group bg-white rounded-xl shadow-2xs border border-slate-200/90 hover:border-slate-300 hover:shadow-xs transition-all duration-150 flex flex-col justify-between">
      {cardContent}
    </div>
  );
}

