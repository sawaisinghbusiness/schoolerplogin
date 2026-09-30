"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { IndianRupee, Pencil, Printer, Ticket, X } from "lucide-react";
import { Student } from "@/data/mockData";
import { feeService, FeeTransaction } from "@/lib/services/feeService";
import { gatePassService, GatePass } from "@/lib/services/gatePassService";
import { generateGatePassPDF } from "@/lib/pdfGenerator";
import { FeeReceiptModal } from "@/components/fees/FeeReceiptModal";
import { useSchoolProfile } from "@/components/providers/SchoolProfileProvider";
import { StudentCard } from "@/components/students/StudentCard";

type Tab = "details" | "fees" | "passes";

const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
const day = (d: string) => new Date(String(d).slice(0, 10) + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });
const payMode = (m: string) => (/upi|qr/i.test(m) ? "UPI" : /cheque|dd/i.test(m) ? "Cheque" : "Cash");

interface Props {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  /** Opens the gate pass form (a popup over this drawer). */
  onIssueGatePass: (s: Student) => void;
  /** Opens the edit form for this student. */
  onEdit?: (s: Student) => void;
  /** Bumped by the parent after a pass is issued, so the list reloads. */
  passesVersion?: number;
}

/** Everything about one student, without leaving the list. */
export function StudentDrawer({ student, isOpen, onClose, onIssueGatePass, onEdit, passesVersion = 0 }: Props) {
  const { schoolProfile } = useSchoolProfile();
  const [tab, setTab] = useState<Tab>("details");
  const [receipts, setReceipts] = useState<FeeTransaction[] | null>(null);
  const [passes, setPasses] = useState<GatePass[] | null>(null);
  const [receipt, setReceipt] = useState<FeeTransaction | null>(null);
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  // New student: back to the first tab, drop the old lists.
  useEffect(() => {
    if (!isOpen) return;
    setTab("details");
    setReceipts(null);
    setPasses(null);
    closeRef.current?.focus();
  }, [isOpen, student?.id]);

  useEffect(() => {
    if (!isOpen || !student || tab !== "fees" || receipts) return;
    feeService.fetchStudentTransactions(student.id, 50).then(setReceipts).catch(() => setReceipts([]));
  }, [isOpen, student, tab, receipts]);

  useEffect(() => {
    if (!isOpen || !student || tab !== "passes") return;
    gatePassService.list({ studentId: student.id, limit: 20 }).then((r) => setPasses(r.error ? [] : r.data));
  }, [isOpen, student, tab, passesVersion]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !receipt && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, receipt]);

  if (!mounted || !isOpen || !student) return null;
  const s = student;
  const total = s.totalFee || s.paidFee + s.balanceFee;
  const pct = total > 0 ? Math.min(100, Math.round((s.paidFee / total) * 100)) : 100;
  const schoolName = schoolProfile.school_name || "School";
  const schoolShort = schoolProfile.short_name || schoolName.split(/\s+/).filter((w) => w.length > 2).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const TABS: { key: Tab; label: string }[] = [
    { key: "details", label: "Details" },
    { key: "fees", label: "Fees" },
    { key: "passes", label: "Gate passes" },
  ];

  const printPass = (p: GatePass) => {
    const d = new Date(p.issued_at);
    generateGatePassPDF(s, {
      passId: p.pass_no,
      time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      reason: p.reason,
      escort: p.escort,
    });
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 flex justify-end">
        <div className="absolute inset-0 bg-night-950/40 animate-fadeIn" onClick={onClose} />

        <aside role="dialog" aria-modal="true" aria-label={`${s.name}, student profile`} className="relative flex h-full w-full max-w-[540px] flex-col bg-canvas shadow-2xl animate-slide-in-right">
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-300/50 px-5">
            <span className="text-sm font-semibold text-slate-600">Student profile</span>
            <span className="flex items-center gap-1">
              {onEdit && (
                <button type="button" onClick={() => onEdit(s)} className="btn btn-secondary btn-sm">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              )}
              <button ref={closeRef} type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-900" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </span>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-5 pb-2 pt-5">
              <StudentCard student={s} schoolName={schoolName} schoolShort={schoolShort} />
            </div>

            <div className="sticky top-0 z-10 bg-canvas px-5 pt-3">
              <div className="flex gap-1 rounded-xl bg-slate-200/60 p-1" role="tablist" aria-label="Profile sections">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex-1 rounded-lg py-2 text-[13.5px] font-semibold transition ${tab === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 p-5">
              {tab === "details" && (
                <>
                  <InfoCard title="Student">
                    <Info label="Gender" value={s.gender} />
                    <Info label="Category" value={s.category} />
                    <Info label="House" value={s.house} />
                    <Info label="PEN" value={s.penNo} />
                    <Info label="Status" value={s.status || "Active"} />
                  </InfoCard>
                  <InfoCard title="Family">
                    <Info label="Father" value={s.fatherName} />
                    <Info label="Mother" value={s.motherName} />
                    {s.guardianName && <Info label="Guardian" value={s.guardianName} />}
                    <Info
                      label="Mobile"
                      value={
                        s.mobile ? (
                          <a href={`tel:${s.mobile}`} className="font-semibold text-brand-700 hover:underline">
                            {s.mobile}
                          </a>
                        ) : undefined
                      }
                    />
                    {s.contact && s.contact !== s.mobile && <Info label="Other phone" value={s.contact} />}
                    <Info label="Address" value={s.address} wide />
                  </InfoCard>
                  <InfoCard title="School bus">
                    <Info label="Route" value={s.transportOpted ? s.busRoute || "School bus" : "Not using the bus"} wide />
                  </InfoCard>
                </>
              )}

              {tab === "fees" && (
                <>
                  <div className="card p-4">
                    <div className="grid grid-cols-3 gap-3">
                      <Figure label="Total fee" value={inr(total)} />
                      <Figure label="Paid" value={inr(s.paidFee)} tone="emerald" />
                      <Figure label="Due" value={s.balanceFee > 0 ? inr(s.balanceFee) : "Nil"} tone={s.balanceFee > 0 ? "rose" : undefined} />
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">{pct}% of this session&rsquo;s fee paid</p>
                  </div>

                  <div className="card overflow-hidden">
                    <h3 className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">Receipts</h3>
                    {receipts === null ? (
                      <div className="space-y-2 p-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="skeleton h-9 w-full" />
                        ))}
                      </div>
                    ) : receipts.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-slate-500">No fee collected from this student yet.</p>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {receipts.map((t) => (
                          <li key={t.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`font-semibold tabular-nums ${t.cancelled ? "text-slate-400 line-through" : "text-slate-900"}`}>{inr(Number(t.amount_paid))}</span>
                                {t.cancelled && <span className="badge badge-rose py-0 text-[11px]">Cancelled</span>}
                              </div>
                              <div className="truncate text-xs text-slate-500">
                                {day(t.payment_date)} · {payMode(t.payment_mode)} · <span className="font-mono">{t.receipt_no}</span>
                              </div>
                            </div>
                            <button type="button" onClick={() => setReceipt(t)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800" title="Print receipt" aria-label={`Print receipt ${t.receipt_no}`}>
                              <Printer className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}

              {tab === "passes" && (
                <div className="card overflow-hidden">
                  <h3 className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">Gate passes</h3>
                  {passes === null ? (
                    <div className="space-y-2 p-4">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="skeleton h-9 w-full" />
                      ))}
                    </div>
                  ) : passes.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-slate-500">No gate pass issued to this student.</p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {passes.map((p) => (
                        <li key={p.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-slate-900">{p.reason}</div>
                            <div className="truncate text-xs text-slate-500">
                              {when(p.issued_at)} · with {p.escort} · <span className="font-mono">{p.pass_no}</span>
                            </div>
                          </div>
                          <button type="button" onClick={() => printPass(p)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800" title="Print slip" aria-label={`Print ${p.pass_no}`}>
                            <Printer className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          <footer className="flex shrink-0 gap-2 border-t border-slate-300/50 bg-white px-5 py-3">
            <button type="button" onClick={() => onIssueGatePass(s)} className="btn btn-secondary flex-1">
              <Ticket className="h-4 w-4" />
              Gate pass
            </button>
            <Link href={`/fees/collect?student=${encodeURIComponent(s.id)}`} className="btn btn-primary flex-[1.4]">
              <IndianRupee className="h-4 w-4" />
              {s.balanceFee > 0 ? `Collect ${inr(s.balanceFee)}` : "Fee counter"}
            </Link>
          </footer>
        </aside>
      </div>

      <FeeReceiptModal isOpen={!!receipt} onClose={() => setReceipt(null)} transaction={receipt} schoolName={schoolName} />
    </>,
    document.body
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">{title}</h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">{children}</dl>
    </section>
  );
}

function Info({ label, value, wide }: { label: string; value?: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`min-w-0 ${wide ? "col-span-2" : ""}`}>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-900">{value || <span className="text-slate-400">Not added</span>}</dd>
    </div>
  );
}

function Figure({ label, value, tone }: { label: string; value: string; tone?: "emerald" | "rose" }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`mt-0.5 text-lg font-bold tabular-nums ${tone === "rose" ? "text-rose-600" : tone === "emerald" ? "text-emerald-700" : "text-slate-900"}`}>{value}</div>
    </div>
  );
}
