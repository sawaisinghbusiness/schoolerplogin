import React from "react";
import type { LucideIcon } from "lucide-react";

/** Title block used at the top of every module page. */
export function PageHeader({
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  eyebrowIcon?: LucideIcon;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div className="min-w-0">
        {eyebrow && (
          <div className="page-eyebrow">
            {EyebrowIcon && <EyebrowIcon className="h-3.5 w-3.5 text-brand-600" />}
            <span>{eyebrow}</span>
          </div>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** A titled group of form fields inside a card. */
export function FormSection({
  icon: Icon,
  title,
  description,
  children,
  className = "",
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ${className}`}>
      <header className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
          </span>
        )}
        <div>
          <h2 className="text-[15px] font-bold text-slate-900">{title}</h2>
          {description && <p className="mt-0.5 text-[13px] text-slate-500">{description}</p>}
        </div>
      </header>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

/** Label + control + hint/error, wired for accessibility via `htmlFor`. */
export function Field({
  id,
  label,
  required,
  hint,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
