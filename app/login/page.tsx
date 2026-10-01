"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Briefcase,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Info,
  Loader2,
  Lock,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Users,
  Wallet,
} from "lucide-react";
import { authService } from "@/lib/services/authService";

type UserRole = "admin" | "teacher" | "accountant" | "parent";

const ROLES: { id: UserRole; label: string; icon: typeof ShieldCheck }[] = [
  { id: "admin", label: "Admin", icon: ShieldCheck },
  { id: "teacher", label: "Faculty", icon: Briefcase },
  { id: "accountant", label: "Accounts", icon: Wallet },
  { id: "parent", label: "Parent", icon: Users },
];

const FEATURES = [
  { icon: Wallet, text: "Fee counter with printed receipts" },
  { icon: Users, text: "Every student's record and fee history" },
  { icon: CheckCircle2, text: "Attendance marked class by class" },
];

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("admin");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState(0);
  const [info, setInfo] = useState<string | null>(null);

  const roleIndex = ROLES.findIndex((r) => r.id === role);

  const selectRole = (r: (typeof ROLES)[number]) => {
    setRole(r.id);
    setError(null);
    setInfo(null);
  };

  const showError = (msg: string) => {
    setError(msg);
    setErrorKey((k) => k + 1); // retrigger the shake
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      showError("Enter your mobile number (or admission number) and password.");
      return;
    }
    setLoading(true);
    setError(null);

    const res = await authService.login(identifier, password);
    if (!res.success || !res.user) {
      setLoading(false);
      showError(
        res.error || "Sign-in failed. Check your connection and try again."
      );
      return;
    }

    try {
      localStorage.setItem("schooldesk_user_role", res.user.role);
      localStorage.setItem("schooldesk_user_id", res.user.identifier);
      localStorage.setItem("schooldesk_user_name", res.user.name);
    } catch {
      // display-only data; ignore storage errors
    }

    setSuccess(true);
    // Send people back to the page they were trying to open, if any.
    const from = new URLSearchParams(window.location.search).get("from");
    const target = from && from.startsWith("/") && from !== "/login" ? from : res.user.role === "teacher" ? "/dashboard" : "/dashboard";
    setTimeout(() => router.push(target), 450);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* ── Brand panel ───────────────────────────────────────────── */}
      <aside className="hidden w-[44%] flex-col justify-between bg-night-900 p-12 text-white lg:flex xl:p-14">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-marigold-400 text-[15px] font-extrabold text-night-950">SP</div>
          <div className="leading-tight">
            <div className="text-[15px] font-bold">St. Paul School</div>
            <div className="text-[13px] text-night-400">Barmer, Rajasthan</div>
          </div>
        </div>

        <div className="max-w-md">
          <h1 className="text-4xl font-bold leading-[1.15] tracking-tight xl:text-[2.6rem]">
            Fees, students and attendance <span className="text-marigold-400">in one place.</span>
          </h1>
          <ul className="mt-8 space-y-4">
            {FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-[15px] text-night-200">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-marigold-400">
                  <f.icon className="h-[18px] w-[18px]" />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[13px] text-night-500">Sessions are encrypted and expire after 12 hours</p>
      </aside>

      {/* ── Sign-in form ──────────────────────────────────────────── */}
      <main className="relative flex flex-1 items-center justify-center px-5 py-12 sm:px-10">
        <Link href="/" className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 sm:left-8 sm:top-6">
          <ArrowLeft className="h-4 w-4" />
          Back to website
        </Link>

        <div className="relative w-full max-w-[26rem]">
          {/* Compact brand for small screens */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-night-900 text-sm font-extrabold text-marigold-400">SP</div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-slate-900">St. Paul School</div>
              <div className="text-xs text-slate-500">SchoolDesk ERP · Barmer</div>
            </div>
          </div>

          <div className="animate-fade-up">
            <h2 className="text-[1.75rem] font-extrabold tracking-tight text-slate-900">Welcome back</h2>
            <p className="mt-1.5 text-[15px] text-slate-500">Choose who you are, then sign in with your registered details.</p>
          </div>

          {/* Role switcher with sliding highlight */}
          <div
            role="tablist"
            aria-label="Sign in as"
            className="relative mt-8 grid grid-cols-4 rounded-2xl bg-slate-100 p-1"
            style={{ animationDelay: "60ms" }}
          >
            <span
              aria-hidden="true"
              className="absolute bottom-1 top-1 w-[calc((100%-0.5rem)/4)] rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5 transition-transform duration-300 ease-out"
              style={{ transform: `translateX(${roleIndex * 100}%)`, left: "0.25rem" }}
            />
            {ROLES.map((r) => {
              const active = r.id === role;
              return (
                <button
                  key={r.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => selectRole(r)}
                  className={`relative z-10 flex flex-col items-center gap-1 rounded-xl py-2.5 text-xs font-semibold ${
                    active ? "text-brand-700" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <r.icon className="h-[18px] w-[18px]" strokeWidth={2} />
                  {r.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-5" style={{ animationDelay: "120ms" }} noValidate>
            {error && (
              <div
                key={errorKey}
                role="alert"
                className="flex items-start gap-2.5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100 animate-shake"
              >
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            {info && (
              <div role="status" className="flex items-start gap-2.5 rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-800 ring-1 ring-sky-100 animate-fadeIn">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                {info}
              </div>
            )}

            <div>
              <label htmlFor="login-id" className="mb-1.5 block text-sm font-semibold text-slate-700">
                {role === "parent" ? "Admission number or mobile" : "Mobile number or staff ID"}
              </label>
              <div className="group relative">
                <Smartphone className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600" />
                <input
                  id="login-id"
                  type="text"
                  inputMode={role === "parent" ? "text" : "numeric"}
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={role === "parent" ? "e.g. ADM-9102" : "10-digit mobile number"}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-[15px] font-medium text-slate-900 shadow-2xs focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="login-pass" className="text-sm font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setInfo("To reset your password, ask the school office — they can set a new one for your account.")}
                  className="text-sm font-semibold text-brand-700 hover:text-brand-800"
                >
                  Forgot password?
                </button>
              </div>
              <div className="group relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600" />
                <input
                  id="login-pass"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-[15px] font-medium text-slate-900 shadow-2xs focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className={`group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl text-[15px] font-bold text-white shadow-glow transition-all ${
                success ? "bg-brand-500" : "bg-brand-600 hover:bg-brand-700"
              } disabled:cursor-not-allowed`}
            >
              {success ? (
                <>
                  <CheckCircle2 className="h-5 w-5 animate-scaleUp" />
                  Signed in — opening dashboard
                </>
              ) : loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Checking your details
                </>
              ) : (
                <>
                  Sign in as {ROLES[roleIndex].label}
                  <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
