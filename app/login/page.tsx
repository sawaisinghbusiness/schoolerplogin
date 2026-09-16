"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  School,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  CreditCard,
  Phone,
  Lock,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2
} from "lucide-react";

type UserRole = "admin" | "teacher" | "accountant" | "parent";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [identifier, setIdentifier] = useState("9414012345");
  const [password, setPassword] = useState("admin@123");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === "admin") {
      setIdentifier("9414012345");
      setPassword("admin@123");
    } else if (role === "teacher") {
      setIdentifier("9829055443");
      setPassword("teacher@123");
    } else if (role === "accountant") {
      setIdentifier("9460199887");
      setPassword("accounts@123");
    } else {
      setIdentifier("ADM-9102");
      setPassword("student@123");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setErrorMessage("Please enter both login identifier and password.");
      return;
    }

    setIsLoading(true);
    // Simulate auth token issuance & role storage
    setTimeout(() => {
      try {
        localStorage.setItem("schooldesk_user_role", selectedRole);
        localStorage.setItem("schooldesk_user_id", identifier);
      } catch {
        // Ignore
      }

      if (selectedRole === "teacher") {
        router.push("/mentees");
      } else {
        router.push("/dashboard/admin");
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50 animate-fadeIn">
        {/* Top Schoollog Header */}
        <div className="bg-[#1e293b] p-6 text-center text-white border-b border-slate-700 relative">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border-2 border-emerald-400/40 flex items-center justify-center text-emerald-400 font-black text-2xl mb-3 shadow-inner">
            M
          </div>
          <h1 className="text-lg font-bold tracking-tight">
            Mother Teresa Nobles Academy
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Institutional ERP Portal (Schoollog Engine)
          </p>
          <div
            className="inline-block mt-2 px-3 py-0.5 rounded text-[11px] font-mono font-bold tracking-wide"
            style={{ backgroundColor: "#28d4a4", color: "#064e3b" }}
          >
            ACCOUNT ID: SLRJ0402749
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => handleRoleSelect("admin")}
            className={`py-3 text-center border-b-2 transition-all ${
              selectedRole === "admin"
                ? "border-emerald-600 text-emerald-700 bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect("teacher")}
            className={`py-3 text-center border-b-2 transition-all ${
              selectedRole === "teacher"
                ? "border-emerald-600 text-emerald-700 bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Teacher
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect("accountant")}
            className={`py-3 text-center border-b-2 transition-all ${
              selectedRole === "accountant"
                ? "border-emerald-600 text-emerald-700 bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Accounts
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect("parent")}
            className={`py-3 text-center border-b-2 transition-all ${
              selectedRole === "parent"
                ? "border-emerald-600 text-emerald-700 bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Parent/Student
          </button>
        </div>

        {/* Login Form Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1.5 flex items-center justify-between">
              <span>
                {selectedRole === "parent"
                  ? "Admission No or Registered Mobile"
                  : "Registered Phone Number / Employee ID"}
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                {selectedRole === "parent" ? "e.g. ADM-9102" : "10-Digit Mobile"}
              </span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  selectedRole === "parent"
                    ? "Enter Admission No (e.g. ADM-9102)"
                    : "Enter 10-digit mobile number"
                }
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5 flex items-center justify-between">
              <span>Password / Security PIN</span>
              <button
                type="button"
                onClick={() => alert("Password reset link sent to your registered phone number via SMS.")}
                className="text-[10px] text-emerald-600 hover:text-emerald-700"
              >
                Forgot Password?
              </button>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <span>Sign In as {selectedRole.toUpperCase()}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Quick Demo Pre-fill Notice */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-[11px] text-slate-600">
            <div className="font-bold text-slate-800 flex items-center space-x-1">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>Demo Quick Login Enabled</span>
            </div>
            <p className="text-slate-500">
              Credentials automatically populate when switching roles above. Click <strong>Sign In</strong> to test immediately.
            </p>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/dashboard/admin"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              &larr; Skip Login & Enter Admin Dashboard Directly
            </Link>
          </div>
        </form>

        <div className="p-3 bg-slate-100 text-center border-t border-slate-200 text-[10px] text-slate-500">
          Mother Teresa Nobles Academy &copy; 2026. Single-Tenant Dedicated ERP.
        </div>
      </div>
    </div>
  );
}
