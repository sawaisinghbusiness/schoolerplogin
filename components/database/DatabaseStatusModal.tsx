"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink,
  Check,
  X,
  Server,
  Layers,
  Sparkles,
  Info
} from "lucide-react";

interface HealthData {
  status: string;
  configured: boolean;
  connected: boolean;
  latencyMs?: number;
  message?: string;
  error?: string;
  database?: {
    projectUrl?: string;
    institutionSettingsRows?: number;
    studentsCount?: number;
    staffCount?: number;
  };
}

export default function DatabaseStatusModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"status" | "instructions" | "schema">("status");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health/supabase");
      const data = await res.json();
      setHealth(data);
    } catch (err: any) {
      setHealth({
        status: "fetch_error",
        configured: false,
        connected: false,
        message: err.message || "Failed to contact health check API",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkHealth();
    }
  }, [isOpen]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Supabase Database Hub</h2>
              <p className="text-xs text-slate-400">
                PostgreSQL Cloud Backend for St. Paul&apos;s Senior Secondary School
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold px-6 pt-2 space-x-6">
          <button
            onClick={() => setActiveTab("status")}
            className={`pb-2.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === "status"
                ? "border-emerald-600 text-emerald-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Connection Status</span>
          </button>
          <button
            onClick={() => setActiveTab("instructions")}
            className={`pb-2.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === "instructions"
                ? "border-emerald-600 text-emerald-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Setup Instructions (Free)</span>
          </button>
          <button
            onClick={() => setActiveTab("schema")}
            className={`pb-2.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === "schema"
                ? "border-emerald-600 text-emerald-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>SQL Schema (18 Tables)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {activeTab === "status" && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start space-x-3.5 ${
                  health?.connected
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : health?.configured
                    ? "bg-amber-50 border-amber-200 text-amber-900"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                {health?.connected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 flex-1">
                  <div className="font-bold text-sm flex items-center justify-between">
                    <span>
                      {health?.connected
                        ? "Supabase Live Connected!"
                        : health?.configured
                        ? "Credentials Detected (Testing Connection...)"
                        : "Operating in Local Mock Engine"}
                    </span>
                    {health?.latencyMs !== undefined && (
                      <span className="text-xs font-mono px-2 py-0.5 bg-white/80 rounded border">
                        {health.latencyMs} ms
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {health?.message ||
                      "The application gracefully operates with local mock data when Supabase credentials are not provided. Once credentials are set in .env.local, it seamlessly switches to live PostgreSQL tables."}
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-xs uppercase font-bold text-slate-400">Database Engine</div>
                  <div className="text-sm font-black text-slate-800 mt-1">
                    {health?.connected ? "PostgreSQL (Supabase)" : "Mock Data Engine"}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-xs uppercase font-bold text-slate-400">Scholars Roster</div>
                  <div className="text-sm font-black text-slate-800 mt-1">
                    {health?.connected ? `${health.database?.studentsCount ?? 0} Students` : "1,924 Mock Scholars"}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-xs uppercase font-bold text-slate-400">Faculty Roster</div>
                  <div className="text-sm font-black text-slate-800 mt-1">
                    {health?.connected ? `${health.database?.staffCount ?? 0} Staff` : "68 Faculty Members"}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={checkHealth}
                  disabled={loading}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>{loading ? "Testing Connection..." : "Test Connection Live"}</span>
                </button>

                <button
                  onClick={() => setActiveTab("instructions")}
                  className="inline-flex items-center space-x-1 px-3 py-2 text-emerald-600 hover:underline font-bold"
                >
                  <span>View Step-by-Step Setup Guide &rarr;</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "instructions" && (
            <div className="space-y-4 text-slate-700">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-800 space-y-1">
                <div className="font-bold flex items-center space-x-1.5 text-xs">
                  <Info className="w-4 h-4 text-emerald-600" />
                  <span>Free Tier Supabase Setup in 2 Minutes</span>
                </div>
                <p className="text-xs leading-relaxed">
                  Supabase offers a 100% free PostgreSQL database with generous limits (500MB database, 50,000 monthly active users, unlimited API requests).
                </p>
              </div>

              <ol className="space-y-3 list-decimal list-inside text-xs leading-relaxed font-medium">
                <li className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong className="text-slate-900">Step 1: Create a Free Supabase Project</strong>
                  <p className="text-slate-600 text-xs mt-1">
                    Go to{" "}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 underline font-bold inline-flex items-center space-x-0.5"
                    >
                      <span>supabase.com</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                    , click <em>New Project</em>, name it <code className="bg-slate-200 px-1 py-0.5 rounded">schoolerplogin</code>, and select Region <strong>ap-south-1 (Mumbai)</strong>.
                  </p>
                </li>

                <li className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong className="text-slate-900">Step 2: Run SQL Schema & Seed</strong>
                  <p className="text-slate-600 text-xs mt-1">
                    In your Supabase dashboard left menu, click <strong>SQL Editor</strong>. Open the <em>SQL Schema</em> tab in this modal, copy the SQL, paste it in Supabase, and click <strong>RUN</strong>.
                  </p>
                </li>

                <li className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong className="text-slate-900">Step 3: Copy Keys to .env.local</strong>
                  <p className="text-slate-600 text-xs mt-1">
                    In Supabase, go to <strong>Project Settings &rarr; API</strong>. Copy <strong>Project URL</strong> and <strong>anon/public key</strong> into your local project&apos;s <code className="bg-slate-200 px-1 py-0.5 rounded">.env.local</code> file:
                  </p>
                  <pre className="mt-2 p-2.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-md overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here`}
                  </pre>
                </li>
              </ol>
            </div>
          )}

          {activeTab === "schema" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">
                  Database Tables: 18 Modules (Students, Staff, Attendance, Exams, Settings)
                </span>
                <button
                  onClick={() => copyToClipboard(`-- Run schema.sql from repo: supabase/schema.sql`, "schema_path")}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-semibold text-xs"
                >
                  {copiedKey === "schema_path" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "schema_path" ? "Copied Path!" : "Copy File Path (supabase/schema.sql)"}</span>
                </button>
              </div>

              <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-xs space-y-1 max-h-60 overflow-y-auto">
                <div className="text-emerald-400 font-bold">-- 18 Comprehensive ERP PostgreSQL Tables Ready in supabase/schema.sql:</div>
                <div className="text-slate-400">1. institution_settings (Master affiliation, CBSE code, SMS wallet, 2FA)</div>
                <div className="text-slate-400">2. academic_sessions (2026-2027 active session, start & end dates)</div>
                <div className="text-slate-400">3. classes (10th, 12th PCM, Pre-Primary, etc.)</div>
                <div className="text-slate-400">4. sections (A, B, C, D)</div>
                <div className="text-slate-400">5. users (Admin, Teacher, Accountant, Parent roles & passwords)</div>
                <div className="text-slate-400">6. students (Full 9-way indexed scholar records, fee balances)</div>
                <div className="text-slate-400">7. staff (Faculty roster, biometric user ID, designations)</div>
                <div className="text-slate-400">8. attendance (Daily student attendance records)</div>
                <div className="text-slate-400">9. staff_attendance (Faculty biometric/manual attendance)</div>
                <div className="text-slate-400">10. circulars (Notice board & circular blast logs)</div>
                <div className="text-slate-400">11. calendar_events (Holidays, exam schedules, PTMs)</div>
                <div className="text-slate-400">12. exams & exam_marks (Half-yearly, annual, green sheet)</div>
                <div className="text-slate-400">13. biometric_logs (CEXJ232160976 punch records)</div>
              </div>

              <div className="text-xs text-slate-500">
                Both <code className="font-bold text-slate-700">supabase/schema.sql</code> and <code className="font-bold text-slate-700">supabase/seed.sql</code> are committed to the project root directory and GitHub repository.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            St. Paul&apos;s ERP &bull; Database Status Modal
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
