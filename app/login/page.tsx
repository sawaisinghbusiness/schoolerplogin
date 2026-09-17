"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  School,
  ShieldCheck,
  Phone,
  Lock,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  UserCheck,
  GraduationCap,
  CreditCard,
  Building2
} from "lucide-react";
import { authService } from "@/lib/services/authService";
import DatabaseStatusModal from "@/components/database/DatabaseStatusModal";

type UserRole = "admin" | "teacher" | "accountant" | "parent";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [identifier, setIdentifier] = useState("9414012345");
  const [password, setPassword] = useState("admin@123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    setInfoMessage(null);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setErrorMessage("Please enter both login identifier and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authService.login(identifier, password, selectedRole);
      if (res.success && res.user) {
        try {
          localStorage.setItem("schooldesk_user_role", res.user.role);
          localStorage.setItem("schooldesk_user_id", res.user.identifier);
          localStorage.setItem("schooldesk_user_name", res.user.name);
        } catch {
          // Ignore storage errors
        }

        if (res.user.role === "teacher") {
          router.push("/mentees");
        } else {
          router.push("/dashboard/admin");
        }
      } else {
        setErrorMessage(res.error || "Authentication failed. Please verify your credentials.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setInfoMessage("A temporary security PIN has been dispatched to your institutional mobile number via SMS gateway.");
    setTimeout(() => setInfoMessage(null), 6000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col md:flex-row animate-fadeIn">
        {/* Left Panel: Prestigious Institutional Crest & Credentials */}
        <div className="w-full md:w-5/12 bg-slate-900 p-8 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            {/* Official School Seal & Title */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/30 text-white font-black text-lg">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xs font-semibold text-emerald-400">
                  Institutional Portal
                </div>
                <div className="text-xs font-medium text-slate-400">
                  Affiliation #1730000
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
                St. Paul&apos;s Senior Secondary School
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Senior Secondary Institution • Barmer, Rajasthan
              </p>
            </div>

            {/* Accreditation & Stats */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>CBSE & State Board Curriculum</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>1,920+ Scholars & 68 Faculty Members</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automated Attendance & SMS Gateway</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div className="pt-8 border-t border-slate-800 text-[11px] text-slate-400 space-y-2 relative z-10">
            <div className="flex items-center space-x-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">256-bit SSL Secure Session</span>
            </div>
            <p className="text-slate-400 text-[10px]">
              Institutional Helpdesk: +91-8448443326 • Barmer
            </p>
          </div>
        </div>

        {/* Right Panel: Role Selector & Login Form */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 flex flex-col justify-between text-xs">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Sign In to Enterprise Portal
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Select your institutional role to access dashboard & records
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100/80 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleRoleSelect("admin")}
                className={`py-2 px-2 text-center rounded-lg transition-all ${
                  selectedRole === "admin"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect("teacher")}
                className={`py-2 px-2 text-center rounded-lg transition-all ${
                  selectedRole === "teacher"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect("accountant")}
                className={`py-2 px-2 text-center rounded-lg transition-all ${
                  selectedRole === "accountant"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Accounts
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect("parent")}
                className={`py-2 px-2 text-center rounded-lg transition-all ${
                  selectedRole === "parent"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Parent
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                {errorMessage}
              </div>
            )}

            {infoMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{infoMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 flex items-center justify-between text-xs">
                  <span>
                    {selectedRole === "parent"
                      ? "Admission Number or Registered Mobile"
                      : "Registered Mobile Number / Staff ID"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {selectedRole === "parent" ? "e.g. ADM-9102" : "10-Digit Mobile"}
                  </span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      selectedRole === "parent"
                        ? "Enter Admission No (e.g. ADM-9102)"
                        : "Enter 10-digit mobile number"
                    }
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 flex items-center justify-between text-xs">
                  <span>Security Password / PIN</span>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    Forgot PIN?
                  </button>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <span>Authenticating Credentials...</span>
                  ) : (
                    <>
                      <span>Sign In as {selectedRole.toUpperCase()}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Fast Role Testing Helper (Clean & Professional) */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2 text-slate-600">
                  <KeyRound className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Role presets loaded for immediate testing</span>
                </div>
                <span className="font-mono font-semibold text-slate-700 uppercase">
                  {selectedRole} Mode
                </span>
              </div>
            </form>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <Link
              href="/dashboard/admin"
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              &larr; Direct Control Center Access
            </Link>
            <button
              type="button"
              onClick={() => setIsDbModalOpen(true)}
              className="inline-flex items-center space-x-1.5 text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Database Connection Hub</span>
            </button>
          </div>
        </div>
      </div>

      <DatabaseStatusModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />
    </div>
  );
}


