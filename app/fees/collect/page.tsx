"use client";
import { useErpSession } from "@/lib/useErpSession";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Banknote, Bus, Check, Landmark, Loader2, Phone, Printer, QrCode, Search, X } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { Avatar } from "@/components/ui/Avatar";
import { studentService } from "@/lib/services/studentService";
import { feeService, FeeTransaction, FeePosition, DaySummary, numberToWordsIndian } from "@/lib/services/feeService";
import { duesFor, planFor, splitPayment } from "@/lib/feeEngine";
import { headLabel, headRows } from "@/lib/feeHeads";
import { Student } from "@/data/mockData";
import { FeeReceiptModal } from "@/components/fees/FeeReceiptModal";
import { useSchoolProfile } from "@/components/providers/SchoolProfileProvider";

type Mode = "Cash" | "UPI" | "Cheque";

// Payment-mode colours: validated categorical trio (colour-blind safe, labels always shown).
const MODES: { key: Mode; icon: typeof Banknote; color: string }[] = [
  { key: "Cash", icon: Banknote, color: "#12665E" },
  { key: "UPI", icon: QrCode, color: "#65758B" },
  { key: "Cheque", icon: Landmark, color: "#B88436" },
];
const MODE_ICON: Record<Mode, typeof Banknote> = { Cash: Banknote, UPI: QrCode, Cheque: Landmark };

const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
const digits = (s: string) => Math.max(0, parseInt(String(s).replace(/\D/g, "") || "0", 10));
const todayKey = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local time
const dm = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });

/** DB stores "UPI / QR" / "Cheque / DD"; the counter uses short labels. */
function modeKind(mode: string): Mode {
  if (/upi|qr/i.test(mode)) return "UPI";
  if (/cheque|dd/i.test(mode)) return "Cheque";
  return "Cash";
}

const shortDate = (d: string) => {
  const day = String(d).slice(0, 10);
  return day === todayKey() ? "Today" : new Date(day + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

export default function CollectFeesPage() {
  const { session } = useErpSession();
  const { schoolProfile } = useSchoolProfile();
  // Search
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Student[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Selection + form
  const [student, setStudent] = useState<Student | null>(null);
  const [position, setPosition] = useState<FeePosition | null>(null);
  const [positionError, setPositionError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [fineText, setFineText] = useState("");
  const [fineEdited, setFineEdited] = useState(false);
  const [waiveReason, setWaiveReason] = useState("");
  const [mode, setMode] = useState<Mode>("Cash");
  const [reference, setReference] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // A ref, not the state: Ctrl+Enter twice fires before the re-render that disables the button (2026-11-16).
  const inFlight = useRef(false);
  // One key per payment the cashier means to take. A retry after a timeout sends the same key, and the
  // server returns the first receipt in place of saving a second one. A new key once anything changes.
  const payKey = useRef<string | null>(null);
  // Only the latest fee-position request may fill the screen (fast switching between students).
  const positionReq = useRef(0);
  const [error, setError] = useState<string | null>(null);

  // Live data (Supabase via the backend)
  const [summary, setSummary] = useState<DaySummary | null>(null);
  const [topDues, setTopDues] = useState<Student[] | null>(null);
  const [recent, setRecent] = useState<FeeTransaction[] | null>(null);
  const [history, setHistory] = useState<FeeTransaction[] | null>(null);
  const [receipt, setReceipt] = useState<FeeTransaction | null>(null);

  const loadDesk = useCallback(() => {
    feeService.fetchDaySummary().then(setSummary).catch(() => setSummary(null));
    feeService.fetchTopDues(8).then(setTopDues).catch(() => setTopDues([]));
    feeService.fetchRecentTransactions(12).then(setRecent).catch(() => setRecent([]));
  }, []);

  useEffect(loadDesk, [loadDesk]);

  /** Loads the student's fee position and suggests paying whatever is overdue. */
  const loadPosition = useCallback(async (id: string, suggest: boolean) => {
    const req = ++positionReq.current;
    setPosition(null);
    setPositionError(null);
    const r = await feeService.fetchPosition(id);
    if (req !== positionReq.current) return; // another student was picked meanwhile
    if (!r.data) return setPositionError(r.error || "Could not load the fee details.");
    setPosition(r.data);
    if (suggest) {
      const p = r.data;
      const plan = planFor(p.config, p.input);
      const d = duesFor(p.config, plan, p.ledger.net, p.ledger.paid, p.asOf);
      setAmount(d.dueNow > 0 ? String(d.dueNow) : "");
    }
  }, []);

  const selectStudent = useCallback(
    (s: Student) => {
      setStudent(s);
      setQuery("");
      setOpen(false);
      setError(null);
      setReference("");
      setRemarks("");
      setMode("Cash");
      setAmount("");
      setFineEdited(false);
      setWaiveReason("");
      loadPosition(s.id, true);
    },
    [loadPosition]
  );

  // Deep link from other pages: /fees/collect?student=<id>
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("student");
    if (id) studentService.fetchStudentById(id).then((r) => r.data && selectStudent(r.data));
  }, [selectStudent]);

  // "/" focuses search; clicking outside closes results.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  // Debounced search.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setOpen(false);
      setSearching(false);
      return;
    }
    setSearching(true);
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await studentService.fetchStudents({ query: q, limit: 8 });
        if (cancelled) return;
        setResults(res.data);
        setActive(0);
        setOpen(true);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  // Receipts of the selected student.
  useEffect(() => {
    if (!student) return setHistory(null);
    setHistory(null);
    feeService.fetchStudentTransactions(student.id).then(setHistory).catch(() => setHistory([]));
  }, [student?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearStudent = () => {
    setStudent(null);
    setPosition(null);
    setAmount("");
    setError(null);
    requestAnimationFrame(() => searchRef.current?.focus());
  };

  const onSearchKey = (e: React.KeyboardEvent) => {
    if (!open || !results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectStudent(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Everything below is worked out with the same fee engine the server uses.
  const calc = useMemo(() => {
    if (!position) return null;
    const p = position;
    const plan = planFor(p.config, p.input);
    const dues = duesFor(p.config, plan, p.ledger.net, p.ledger.paid, p.asOf);
    const amt = digits(amount);
    const split = splitPayment(p.config, plan, p.ledger.net, p.ledger.paid, Math.min(amt, p.ledger.balance), p.asOf);
    const nextIdx = dues.instalments.findIndex((i) => i.due > p.asOf && i.outstanding > 0);
    const upTo = nextIdx >= 0 ? dues.instalments.slice(0, nextIdx + 1).reduce((s, i) => s + i.outstanding, 0) : 0;
    return { plan, dues, amt, split, nextIdx, upTo };
  }, [position, amount]);

  // The fine follows the amount unless the cashier has changed it.
  const maxFine = calc?.split.fine || 0;
  const fine = fineEdited ? Math.min(digits(fineText), maxFine) : maxFine;
  useEffect(() => {
    if (!fineEdited) setFineText(maxFine ? String(maxFine) : "");
  }, [maxFine, fineEdited]);

  const balance = position?.ledger.balance ?? 0;
  const amt = calc?.amt ?? 0;
  const over = amt > balance;
  const waived = maxFine - fine;
  const total = (over ? 0 : amt) + fine;
  const needsRef = mode !== "Cash";
  useEffect(() => {
    payKey.current = null;
  }, [student?.id, amt, fine, mode, reference]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inFlight.current) return;
    if (!student || !position) return setError("Pick a student first.");
    if (amt <= 0) return setError("Enter the fee amount being paid.");
    if (over) return setError(`Only ${inr(balance)} is due for the session.`);
    if (waived > 0 && waiveReason.trim().length < 3) return setError(`Write why ${inr(waived)} of the late fine is being let go.`);
    if (needsRef && !reference.trim()) return setError(mode === "UPI" ? "Enter the UPI reference (UTR) number." : "Enter the cheque number.");

    inFlight.current = true;
    setSubmitting(true);
    setError(null);
    payKey.current ||= typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      const res = await feeService.collect({
        idempotencyKey: payKey.current,
        studentId: student.id,
        amount: amt,
        fine,
        waiveReason: waived > 0 ? waiveReason.trim() : undefined,
        paymentMode: mode,
        transactionId: reference.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });
      if (!res.success || !res.transaction) {
        setError(res.error || "The payment was not saved. Try again.");
        return;
      }
      const tx = res.transaction;
      payKey.current = null;
      const newDue = res.newDue ?? Math.max(0, balance - amt);
      setStudent({ ...student, balanceFee: newDue, paidFee: student.paidFee + amt });
      setHistory((list) => [tx, ...(list || [])]);
      setReference("");
      setRemarks("");
      setFineEdited(false);
      setWaiveReason("");
      setReceipt(tx);
      toast(`${inr(total)} received from ${student.name}`, "success");
      loadDesk();
      loadPosition(student.id, false);
      setAmount("");
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Try again.");
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  const onFormKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit();
  };

  const net = position?.ledger.net ?? student?.totalFee ?? 0;
  const paid = position?.ledger.paid ?? student?.paidFee ?? 0;
  const paidPct = net > 0 ? Math.min(100, Math.round((paid / net) * 100)) : 0;

  return (
    <div className="workspace-page space-y-6 pb-12">
      <header className="page-header">
        <div>
          <h1 className="page-title">Fee counter</h1>
          <p className="page-subtitle">Find a student, review dues and record a payment</p>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          {/* Student search */}
          <section className="workspace-section card p-4 sm:p-5" aria-label="Find a student">
            <div className="mb-3 flex items-baseline justify-between gap-3"><h2 className="text-sm font-semibold text-slate-900">Find a student</h2><span className="hidden text-xs text-slate-500 sm:inline">Name, register number or parent mobile</span></div>
          <div ref={boxRef} className="relative">
            <label htmlFor="fee-search" className="sr-only">
              Find student
            </label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              id="fee-search"
              ref={searchRef}
              type="text"
              role="combobox"
              aria-expanded={open}
              aria-controls="fee-search-results"
              aria-autocomplete="list"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              onKeyDown={onSearchKey}
              placeholder={student ? "Collect from another student…" : "Search by name, SR no., father's name or mobile"}
              className="h-11 w-full rounded-md border border-slate-300 bg-white pl-12 pr-12 text-base text-slate-900 sm:pr-16 sm:text-[14px] outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
            />
            <span className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2 text-slate-400">
              {searching && <Loader2 className="h-4 w-4 animate-spin text-brand-600" />}
              {query ? (
                <button type="button" onClick={() => setQuery("")} className="rounded-md p-0.5 hover:bg-slate-100 hover:text-slate-600" aria-label="Clear search">
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <kbd className="hidden rounded-md border border-slate-200 px-1.5 py-0.5 font-mono text-[11px] sm:block">/</kbd>
              )}
            </span>

            {open && (
              <ul id="fee-search-results" role="listbox" className="absolute inset-x-0 top-full z-30 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-scaleUp">
                {results.length === 0 ? (
                  <li className="px-3 py-6 text-center text-sm text-slate-500">No student matches &ldquo;{query}&rdquo;. Try the SR number or mobile.</li>
                ) : (
                  results.map((s, i) => (
                    <li key={s.id} role="option" aria-selected={i === active}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(i)}
                        onClick={() => selectStudent(s)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${i === active ? "bg-brand-50" : ""}`}
                      >
                        <Avatar name={s.name} id={s.id} photoUrl={s.photoUrl} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-slate-900">{s.name}</span>
                          <span className="block truncate text-xs text-slate-500">
                            {s.classSec} · {s.srNo} · {s.fatherName}
                          </span>
                        </span>
                        {s.balanceFee > 0 ? <span className="badge badge-rose tabular-nums">Due {inr(s.balanceFee)}</span> : <span className="badge badge-emerald">Paid</span>}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          </section>

          {student ? (
            <>
              {/* Selected student */}
              <section className="card workspace-section p-4 sm:p-5" aria-label="Selected student">
                <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                  <Avatar name={student.name} id={student.id} photoUrl={student.photoUrl} size="lg" className="hidden sm:flex" />
                  <Avatar name={student.name} id={student.id} photoUrl={student.photoUrl} className="sm:hidden" />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">{student.name}</h2>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <span className="badge badge-brand">Class {student.classSec}</span>
                      {student.rollNo && <span className="badge badge-slate">Roll {student.rollNo}</span>}
                      {student.transportOpted && (
                        <span className="badge badge-slate">
                          <Bus className="h-3 w-3" />
                          {(student.busRoute || "School bus").split(" (")[0]}
                        </span>
                      )}
                      {position?.input.concession && (
                        <span className="badge badge-emerald">{position.config.concessions.find((c) => c.code === position.input.concession)?.name || position.input.concession} concession</span>
                      )}
                    </div>
                    <p className="mt-2 text-[13px] text-slate-500">
                      {student.srNo} · Father {student.fatherName} ·{" "}
                      <a href={`tel:${student.mobile}`} className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline">
                        <Phone className="h-3 w-3" />
                        {student.mobile}
                      </a>
                    </p>
                  </div>
                  <button type="button" onClick={clearStudent} className="btn btn-secondary btn-sm shrink-0 self-start">
                    Change
                  </button>
                </div>

                <div className="summary-strip summary-three mt-4 grid grid-cols-3 sm:mt-5">
                  <Figure label="Session fee" value={inr(net)} />
                  <Figure label="Paid" value={inr(paid)} />
                  <Figure label={balance > 0 ? "Still due" : "Balance"} value={balance > 0 ? inr(balance) : "Nil"} due={balance > 0} />
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>Session {session?.label || "unavailable"}{position && position.ledger.finePaid > 0 ? ` · late fine paid ${inr(position.ledger.finePaid)}` : ""}</span>
                    <span className="tabular-nums">{paidPct}% paid</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-500" style={{ width: `${paidPct}%` }} />
                  </div>
                </div>

                {/* Instalments */}
                {positionError ? (
                  <p className="alert alert-rose mt-5">{positionError}</p>
                ) : !calc ? (
                  <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="skeleton h-[74px]" />
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {calc.dues.instalments.map((ins, i) => {
                      const now = calc.split.perInstalment[i] || 0;
                      const cleared = calc.split.cleared.includes(i);
                      const tone = ins.outstanding === 0 ? "paid" : ins.overdue ? "late" : "open";
                      return (
                        <div
                          key={ins.name}
                          className={`rounded-xl border px-3 py-2.5 ${now > 0 ? "border-brand-400 ring-2 ring-brand-500/15" : "border-slate-200"} ${tone === "paid" ? "bg-emerald-50/50" : tone === "late" ? "bg-rose-50/50" : "bg-white"}`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[13px] font-semibold text-slate-800">{ins.name}</span>
                            <span className="text-[11.5px] text-slate-500">{dm(ins.due)}</span>
                          </div>
                          {tone === "paid" ? (
                            <p className="mt-1 flex items-center gap-1 text-[13px] font-semibold text-emerald-700">
                              <Check className="h-3.5 w-3.5" strokeWidth={3} /> Paid {inr(ins.amount)}
                            </p>
                          ) : (
                            <p className={`mt-1 text-[13px] font-bold tabular-nums ${tone === "late" ? "text-rose-600" : "text-slate-800"}`}>
                              {inr(ins.outstanding)}
                              <span className="ml-1 text-[11.5px] font-medium">{tone === "late" ? `· ${ins.daysLate}d late` : ins.paid > 0 ? "left" : ""}</span>
                            </p>
                          )}
                          {now > 0 && <p className="mt-0.5 text-[11.5px] font-semibold text-brand-700">{cleared ? "Cleared by this payment" : `${inr(now)} from this payment`}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Payment */}
              {calc && balance > 0 && (
                <form onSubmit={submit} onKeyDown={onFormKey} className="card workspace-section overflow-hidden" aria-label="Payment">
                  <div className="space-y-5 p-5 sm:p-6">
                    {error && (
                      <div className="alert alert-rose" role="alert">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div>
                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <label htmlFor="fee-amount" className="text-[15px] font-semibold text-slate-900">
                          Fee being paid
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {calc.dues.dueNow > 0 && <Chip on={amt === calc.dues.dueNow} onClick={() => setAmount(String(calc.dues.dueNow))} label={`Overdue ${inr(calc.dues.dueNow)}`} />}
                          {calc.nextIdx >= 0 && calc.upTo !== calc.dues.dueNow && (
                            <Chip on={amt === calc.upTo} onClick={() => setAmount(String(calc.upTo))} label={`Up to ${calc.dues.instalments[calc.nextIdx].name} ${inr(calc.upTo)}`} />
                          )}
                          {balance !== calc.upTo && <Chip on={amt === balance} onClick={() => setAmount(String(balance))} label={`Full session ${inr(balance)}`} />}
                        </div>
                      </div>
                      <div className="relative mt-2">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">₹</span>
                        <input
                          id="fee-amount"
                          inputMode="numeric"
                          value={amount ? Number(digits(amount)).toLocaleString("en-IN") : ""}
                          onChange={(e) => setAmount(String(digits(e.target.value)))}
                          placeholder="0"
                          className={`field h-14 w-full pl-9 text-2xl font-semibold tabular-nums ${over ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15" : ""}`}
                        />
                      </div>
                      {over && <p className="mt-1.5 text-[13px] font-medium text-rose-600">Only {inr(balance)} is due for the session.</p>}
                    </div>

                    {/* Where the money goes (hidden while the amount is more than what is due) */}
                    <div className={`overflow-hidden rounded-xl border border-slate-200 ${over ? "hidden" : ""}`}>
                      {headRows(calc.split.heads).map((r) => (
                        <div key={r.key} className="flex items-center justify-between border-b border-slate-100 px-4 py-2 text-sm">
                          <span className="text-slate-700">{r.label}</span>
                          <span className="font-semibold tabular-nums text-slate-900">{inr(r.amount)}</span>
                        </div>
                      ))}
                      {maxFine > 0 && (
                        <div className="border-b border-slate-100 bg-marigold-50/50 px-4 py-2.5 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <label htmlFor="fee-fine" className="min-w-0 text-slate-700">
                              {headLabel("late_fine")}
                              <span className="block text-xs text-slate-500">
                                {calc.split.cleared
                                  .map((i) => calc.dues.instalments[i])
                                  .filter((x) => x.overdue)
                                  .map((x) => `${x.name} ${x.daysLate} days late`)
                                  .join(" · ")}{" "}
                                (up to {inr(maxFine)})
                              </span>
                            </label>
                            <div className="relative w-32">
                              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">₹</span>
                              <input
                                id="fee-fine"
                                inputMode="numeric"
                                value={fineText}
                                onChange={(e) => {
                                  setFineEdited(true);
                                  setFineText(String(Math.min(digits(e.target.value), maxFine)));
                                }}
                                className="field field-sm w-full pl-7 text-right font-semibold tabular-nums"
                              />
                            </div>
                          </div>
                          {waived > 0 && (
                            <input
                              value={waiveReason}
                              onChange={(e) => setWaiveReason(e.target.value)}
                              placeholder={`Why is ${inr(waived)} of the fine being let go? (printed on the receipt)`}
                              aria-label="Reason for letting go of the fine"
                              className="field field-sm mt-2 w-full"
                            />
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-4 bg-brand-50 px-4 py-3.5">
                        <div className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-slate-900">Total to collect</span>
                          <span className="block truncate text-xs text-brand-800/80">{total > 0 ? numberToWordsIndian(total) : "Enter the fee amount above"}</span>
                        </div>
                        <span className="text-2xl font-semibold tabular-nums text-brand-700">{inr(total)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end">
                      <fieldset>
                        <legend className="field-label">Paid by</legend>
                        <div className="inline-flex gap-1 rounded-xl bg-slate-100 p-1">
                          {MODES.map((m) => (
                            <button
                              key={m.key}
                              type="button"
                              aria-pressed={mode === m.key}
                              onClick={() => setMode(m.key)}
                              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${mode === m.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                            >
                              <m.icon className="h-4 w-4" />
                              {m.key}
                            </button>
                          ))}
                        </div>
                      </fieldset>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {needsRef && (
                          <div className="animate-fadeIn">
                            <label htmlFor="fee-ref" className="field-label">
                              {mode === "UPI" ? "UTR number" : "Cheque no. and bank"}
                            </label>
                            <input id="fee-ref" value={reference} onChange={(e) => setReference(e.target.value)} placeholder={mode === "UPI" ? "423589102456" : "918234, SBI Barmer"} className="field w-full font-mono" />
                          </div>
                        )}
                        <div className={needsRef ? "" : "sm:col-span-2"}>
                          <label htmlFor="fee-remarks" className="field-label">
                            Note <span className="font-normal text-slate-400">(optional)</span>
                          </label>
                          <input id="fee-remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g. Paid by father" className="field w-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
                    <span className="hidden text-xs text-slate-500 sm:inline">Ctrl + Enter</span>
                    <button type="submit" disabled={submitting || total <= 0 || over} className="btn btn-primary h-12 px-6 text-[15px]">
                      {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Printer className="h-5 w-5" />}
                      {submitting ? "Saving…" : `Collect ${inr(total)} & print`}
                    </button>
                  </div>
                </form>
              )}
              {calc && balance <= 0 && (
                <div className="card workspace-section flex items-center gap-3 p-5 text-sm text-emerald-800">
                  <Check className="h-5 w-5 text-emerald-600" strokeWidth={3} />
                  The whole session&rsquo;s fee is paid. Nothing to collect.
                </div>
              )}
            </>
          ) : (
            <TopDues list={topDues} onPick={selectStudent} />
          )}
        </div>

        {/* Right column */}
        <aside className="space-y-5 xl:sticky xl:top-5" aria-label="Counter activity">
          <TodayCard summary={summary} />
          {student && <ReceiptList title={`${student.name.split(" ")[0]}'s receipts`} list={history} onOpen={setReceipt} showStudent={false} />}
          <ReceiptList title="Latest receipts" list={recent} onOpen={setReceipt} />
        </aside>
      </div>

      <FeeReceiptModal
        isOpen={!!receipt}
        onClose={() => {
          setReceipt(null);
          requestAnimationFrame(() => searchRef.current?.focus());
        }}
        transaction={receipt}
        schoolName={schoolProfile.school_name || "School"}
      />
    </div>
  );
}

function Chip({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className={`btn btn-sm whitespace-nowrap ${on ? "btn-soft ring-1 ring-brand-300" : "btn-secondary"}`}>
      {label}
    </button>
  );
}

function Figure({ label, value, due }: { label: string; value: string; due?: boolean }) {
  return (
    <div className="px-3 py-3 sm:px-4">
      <p className={`text-xs font-semibold ${due ? "text-rose-600" : "text-slate-500"}`}>{label}</p>
      <p className={`mt-1 truncate text-lg font-semibold tabular-nums sm:text-xl ${due ? "text-rose-700" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}

function TodayCard({ summary }: { summary: DaySummary | null }) {
  const total = summary?.total ?? 0;
  return (
    <section className="card workspace-section p-5" aria-label="Today at the counter">
      <p className="text-[13px] font-semibold text-slate-600">Collected today</p>
      {summary ? (
        <>
          <p className="mt-1 text-[30px] font-semibold leading-tight tracking-tight text-slate-900">{inr(total)}</p>
          <p className="text-[13px] text-slate-500">
            {summary.count} {summary.count === 1 ? "receipt" : "receipts"}
          </p>
          <div className="mt-4 flex h-1.5 gap-px overflow-hidden rounded-sm bg-slate-100" role="img" aria-label="Split by payment mode">
            {total > 0 &&
              MODES.map((m) => (summary.byMode[m.key] > 0 ? <span key={m.key} style={{ width: `${(summary.byMode[m.key] / total) * 100}%`, background: m.color }} title={`${m.key} ${inr(summary.byMode[m.key])}`} /> : null))}
          </div>
          <ul className="mt-3 space-y-2">
            {MODES.map((m) => (
              <li key={m.key} className="flex items-center gap-2.5 text-[13.5px]">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: m.color }} />
                <span className="flex-1 text-slate-700">{m.key}</span>
                <span className="font-semibold tabular-nums text-slate-900">{inr(summary.byMode[m.key])}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="mt-2 space-y-2">
          <div className="skeleton h-8 w-32" />
          <div className="skeleton h-3 w-full" />
        </div>
      )}
    </section>
  );
}

function TopDues({ list, onPick }: { list: Student[] | null; onPick: (s: Student) => void }) {
  return (
    <section className="card workspace-section overflow-hidden" aria-label="Outstanding balances">
      <div className="px-5 pb-3 pt-5 sm:px-6">
        <h2 className="text-[15px] font-semibold text-slate-900">Outstanding balances</h2>
        <p className="text-[13px] text-slate-500">Select a record to review its ledger and collect payment.</p>
      </div>
      {list === null ? (
        <div className="space-y-3 px-6 pb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-11 w-full" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="px-6 pb-8 text-sm text-slate-500">No fees pending this session.</p>
      ) : (
        <ul className="divide-y divide-slate-100 border-t border-slate-100">
          {list.map((s) => {
            return (
              <li key={s.id}>
                <button type="button" onClick={() => onPick(s)} className="group flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-slate-50 sm:px-6">
                  <Avatar name={s.name} id={s.id} photoUrl={s.photoUrl} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">{s.name}</span>
                    <span className="block truncate text-xs text-slate-500">
                      {s.classSec} · {s.srNo || s.admissionNo}
                    </span>
                  </span>
                  <span className="min-w-[90px] text-right text-sm font-semibold tabular-nums text-slate-900">{inr(s.balanceFee)}<span className="block text-[11px] font-normal text-slate-500">outstanding</span></span>
                  <span className="ml-2 text-xs font-semibold text-brand-700">Collect</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ReceiptList({ title, list, onOpen, showStudent = true }: { title: string; list: FeeTransaction[] | null; onOpen: (t: FeeTransaction) => void; showStudent?: boolean }) {
  return (
    <section className="card workspace-section overflow-hidden" aria-label={title}>
      <h2 className="px-5 pb-2 pt-4 text-[15px] font-bold text-slate-900">{title}</h2>
      {list === null ? (
        <div className="space-y-2 px-5 pb-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-9 w-full" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="px-5 pb-5 text-sm text-slate-500">No receipts yet.</p>
      ) : (
        <ul className="max-h-[480px] overflow-y-auto pb-2">
          {list.map((t) => {
            const kind = modeKind(t.payment_mode);
            const Icon = MODE_ICON[kind];
            return (
              <li key={t.id}>
                <button type="button" onClick={() => onOpen(t)} className="flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-slate-50" title="View or reprint">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">{showStudent ? t.student?.name || "—" : kind}</span>
                    <span className="block truncate text-xs text-slate-500">
                      {shortDate(t.payment_date)} · #{String(t.receipt_no).split("/").pop()}
                      {showStudent && t.student?.class_name ? ` · ${t.student.class_name}` : ""}
                    </span>
                  </span>
                  <span className="text-sm font-bold tabular-nums text-slate-900">{inr(Number(t.amount_paid))}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

