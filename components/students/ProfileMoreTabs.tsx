"use client";

/**
 * The student profile drawer's tabs after "Gate passes" (ledger, payments, wallet, refunds, attendance,
 * results, siblings, remarks, discipline, SR register, timetable, edit history), drawn exactly like the
 * drawer's own Fees and Gate passes tabs: white cards with a heading, divided rows, the same buttons and fields.
 * Data comes from the backend's /api/student-profile, /api/fees and /api/fee-setup.
 */
import React, { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { api } from "@/lib/apiClient";
import type { Student, StudentFull } from "@/data/mockData";

const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
const day = (d: string) => new Date(String(d).slice(0, 10) + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
const payMode = (m?: string | null) => (!m ? "" : /wallet/i.test(m) ? "Wallet" : /upi|qr/i.test(m) ? "UPI" : /cheque|dd/i.test(m) ? "Cheque" : /razorpay|online/i.test(m) ? "Online" : m);
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
const enc = encodeURIComponent;
const SETUP = "This starts working after the one-time database update (student profile 360 SQL).";

/* ───────────── shared pieces (same look as the drawer's Fees and Gate passes) ───────────── */

function useLoad<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<{ status: number; text: string } | null>(null);
  const load = useCallback(() => {
    let live = true;
    setError(null);
    api.get<T>(path).then((r) => {
      if (!live) return;
      if (r.ok && r.data) setData(r.data);
      else setError({ status: r.status, text: r.error || "Could not load this." });
    });
    return () => {
      live = false;
    };
  }, [path]);
  useEffect(() => load(), [load]);
  return { data, error, reload: load };
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
const Rows = ({ n = 3 }: { n?: number }) => (
  <div className="space-y-2 p-4">
    {Array.from({ length: n }).map((_, i) => (
      <div key={i} className="skeleton h-9 w-full" />
    ))}
  </div>
);
const Nothing = ({ children }: { children: React.ReactNode }) => <p className="px-4 py-8 text-center text-sm text-slate-500">{children}</p>;

/** Loading / error / office-only / needs-SQL, the same way in every tab. */
function Load<T extends object>({ q, title, rows, sql, children }: { q: ReturnType<typeof useLoad<T>>; title: string; rows?: number; sql?: boolean; children: (d: T) => React.ReactNode }) {
  if (sql && q.data && (q.data as any).setupNeeded) return <Card title={title}><Nothing>{SETUP}</Nothing></Card>;
  if (q.data) return <>{children(q.data)}</>;
  if (q.error)
    return (
      <Card title={title}>
        <div className="px-4 py-8 text-center text-sm text-slate-500">
          {q.error.status === 403 ? "Only the office (admin, accountant) can see this." : q.error.text}
          {q.error.status !== 403 && (
            <div className="mt-3">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => q.reload()}>
                Try again
              </button>
            </div>
          )}
        </div>
      </Card>
    );
  return (
    <Card title={title}>
      <Rows n={rows} />
    </Card>
  );
}

function Figure({ label, value, tone }: { label: string; value: string; tone?: "emerald" | "rose" }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`mt-0.5 text-lg font-semibold tabular-nums ${tone === "rose" ? "text-rose-600" : tone === "emerald" ? "text-emerald-700" : "text-slate-900"}`}>{value}</div>
    </div>
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
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}
async function send(path: string, body: unknown, method: "post" | "patch" = "post") {
  const r = await (method === "post" ? api.post<any>(path, body) : api.patch<any>(path, body));
  if (!r.ok || r.data?.success === false) throw new Error(r.data?.error || r.error || "Could not save.");
  return r.data;
}

/* ───────────── Ledger ───────────── */

interface LedgerEntry {
  date: string;
  kind: string;
  text: string;
  debit: number;
  credit: number;
  balance: number;
  receiptNo?: string;
  mode?: string;
  cancelled?: boolean;
  cancelReason?: string | null;
}
interface Ledger {
  session: string;
  setupNeeded: boolean;
  entries: LedgerEntry[];
  totals: { charged: number; concession: number; paid: number; finePaid: number; balance: number } | null;
}

export function LedgerSection({ id }: { id: string }) {
  const q = useLoad<Ledger>(`/api/student-profile/${enc(id)}/ledger`);
  return (
    <Load q={q} title="Ledger">
      {(d) =>
        !d.totals ? (
          <Card title="Ledger">
            <Nothing>No fee is set for this student this session.</Nothing>
          </Card>
        ) : (
          <>
            <div className="card p-4">
              <div className="summary-strip grid grid-cols-2 gap-y-3 sm:grid-cols-4">
                <Figure label="Charged" value={inr(d.totals.charged)} />
                <Figure label="Concession" value={inr(d.totals.concession)} />
                <Figure label="Paid" value={inr(d.totals.paid)} tone="emerald" />
                <Figure label="Balance" value={d.totals.balance > 0 ? inr(d.totals.balance) : "Nil"} tone={d.totals.balance > 0 ? "rose" : undefined} />
              </div>
              {d.totals.finePaid > 0 && <p className="mt-2 text-xs text-slate-500">{inr(d.totals.finePaid)} late fine paid this session.</p>}
            </div>
            <Card title={`Ledger ${d.session}`}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                      <th className="px-4 py-2 font-medium">Date</th>
                      <th className="px-4 py-2 font-medium">Details</th>
                      <th className="px-4 py-2 text-right font-medium">Debit</th>
                      <th className="px-4 py-2 text-right font-medium">Credit</th>
                      <th className="px-4 py-2 text-right font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {d.entries.map((e, i) => (
                      <tr key={i} className={e.cancelled ? "text-slate-400" : "text-slate-900"}>
                        <td className="whitespace-nowrap px-4 py-2.5">{day(e.date)}</td>
                        <td className="px-4 py-2.5">
                          <span className={e.cancelled ? "line-through" : ""}>{e.text}</span>
                          {e.mode && <span className="ml-1.5 text-xs text-slate-500">· {payMode(e.mode)}</span>}
                          {e.cancelled && <span className="badge badge-rose ml-2 py-0 text-[11px]">Cancelled</span>}
                          {e.cancelled && e.cancelReason && <div className="text-xs">{e.cancelReason}</div>}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums">{e.debit ? inr(e.debit) : ""}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums">{e.credit ? inr(e.credit) : ""}</td>
                        <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{e.cancelled ? "" : inr(e.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )
      }
    </Load>
  );
}

/* ───────────── Payments ───────────── */

interface Receipt {
  id: string;
  receipt_no: string;
  amount_paid: number;
  payment_mode: string;
  payment_date: string;
  transaction_id?: string | null;
  fee_heads?: { late_fine?: number };
  cancelled?: boolean;
  cancel_reason?: string | null;
}

export function PaymentsSection({ id, onPrint }: { id: string; onPrint: (t: any) => void }) {
  const q = useLoad<{ data: Receipt[] }>(`/api/fees/transactions?limit=200&studentId=${enc(id)}`);
  return (
    <Load q={q} title="Payments">
      {(d) => {
        const live = d.data.filter((t) => !t.cancelled);
        return (
          <Card title="Payments" action={<span className="text-xs text-slate-500">{live.length} receipts · {inr(live.reduce((n, t) => n + Number(t.amount_paid), 0))}</span>}>
            {d.data.length === 0 ? (
              <Nothing>No fee collected from this student yet.</Nothing>
            ) : (
              <ul className="divide-y divide-slate-100">
                {d.data.map((t) => {
                  const fine = Number(t.fee_heads?.late_fine) || 0;
                  return (
                    <li key={t.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold tabular-nums ${t.cancelled ? "text-slate-400 line-through" : "text-slate-900"}`}>{inr(Number(t.amount_paid))}</span>
                          {t.cancelled && <span className="badge badge-rose py-0 text-[11px]">Cancelled</span>}
                          {fine > 0 && <span className="text-xs text-slate-500">incl. {inr(fine)} late fine</span>}
                        </div>
                        <div className="truncate text-xs text-slate-500">
                          {day(t.payment_date)} · {payMode(t.payment_mode)} · <span className="font-mono">{t.receipt_no}</span>
                          {t.transaction_id ? ` · Ref ${t.transaction_id}` : ""}
                          {t.cancelled && t.cancel_reason ? ` · ${t.cancel_reason}` : ""}
                        </div>
                      </div>
                      <button type="button" onClick={() => onPrint(t)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800" title="Print receipt" aria-label={`Print receipt ${t.receipt_no}`}>
                        <Printer className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        );
      }}
    </Load>
  );
}

/* ───────────── Wallet ───────────── */

interface Wallet {
  setupNeeded: boolean;
  balance: number;
  modes: string[];
  entries: { id: string; amount: number; kind: string; mode: string | null; reference: string | null; note: string | null; receiptNo: string | null; by: string | null; at: string }[];
}
const KIND: Record<string, string> = { deposit: "Advance added", used: "Used for fee", refund: "Refunded", adjust: "Adjustment" };

export function WalletSection({ id, balanceDue }: { id: string; balanceDue: number }) {
  const q = useLoad<Wallet>(`/api/student-profile/${enc(id)}/wallet`);
  const [form, setForm] = useState<"" | "add" | "pay">("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("Cash");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function save() {
    if (!Number(amount)) return setMsg({ ok: false, text: "Enter the amount." });
    setBusy(true);
    setMsg(null);
    try {
      if (form === "add") await send(`/api/student-profile/${enc(id)}/wallet/deposit`, { amount: Number(amount), mode, reference });
      else await send(`/api/student-profile/${enc(id)}/wallet/pay`, { amount: Number(amount) });
      setMsg({ ok: true, text: form === "add" ? "Added to the wallet." : "Fee paid from the wallet; a receipt was made." });
      setForm("");
      setAmount("");
      setReference("");
      q.reload();
    } catch (e: any) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Load q={q} title="Wallet" sql>
      {(d) => (
        <>
          <div className="card p-4">
            <div className="summary-strip summary-three grid grid-cols-3">
              <Figure label="In the wallet" value={inr(d.balance)} tone={d.balance > 0 ? "emerald" : undefined} />
              <Figure label="Fee due" value={balanceDue > 0 ? inr(balanceDue) : "Nil"} tone={balanceDue > 0 ? "rose" : undefined} />
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => (setForm(form === "add" ? "" : "add"), setAmount(""), setMsg(null))}>
                  Add advance
                </button>
                <button type="button" className="btn btn-primary btn-sm" disabled={d.balance <= 0 || balanceDue <= 0} onClick={() => (setForm(form === "pay" ? "" : "pay"), setAmount(String(Math.min(d.balance, balanceDue))), setMsg(null))}>
                  Pay fee from wallet
                </button>
              </div>
            </div>
            {form && (
              <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
                <Field label="Amount (₹)">
                  <input className="field w-full" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 8))} />
                </Field>
                {form === "add" ? (
                  <>
                    <Field label="Received by">
                      <select className="field w-full" value={mode} onChange={(e) => setMode(e.target.value)}>
                        {d.modes.map((m) => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Reference (UPI / cheque no.)">
                      <input className="field w-full" maxLength={80} value={reference} onChange={(e) => setReference(e.target.value)} />
                    </Field>
                  </>
                ) : (
                  <p className="text-xs text-slate-500 sm:col-span-2 sm:self-center">A fee receipt is made in the mode &ldquo;Wallet&rdquo;. If a late fine is due, use the fee counter.</p>
                )}
                <div className="sm:col-span-3">
                  <button type="button" className="btn btn-primary" disabled={busy} onClick={save}>
                    {form === "add" ? "Add to wallet" : "Pay fee"}
                  </button>
                </div>
              </div>
            )}
            {msg && <p className={`mt-3 text-sm ${msg.ok ? "text-emerald-700" : "text-rose-600"}`}>{msg.text}</p>}
          </div>
          <Card title="Wallet entries">
            {d.entries.length === 0 ? (
              <Nothing>Nothing in the wallet yet.</Nothing>
            ) : (
              <ul className="divide-y divide-slate-100">
                {d.entries.map((e) => (
                  <li key={e.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900">{KIND[e.kind] || e.kind}</div>
                      <div className="truncate text-xs text-slate-500">{[when(e.at), e.mode, e.receiptNo, e.reference, e.note, e.by].filter(Boolean).join(" · ")}</div>
                    </div>
                    <span className={`font-semibold tabular-nums ${e.amount > 0 ? "text-emerald-700" : "text-slate-900"}`}>
                      {e.amount > 0 ? "+" : "−"}
                      {inr(Math.abs(e.amount))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </Load>
  );
}

/* ───────────── Refunds ───────────── */

interface Refunds {
  setupNeeded: boolean;
  modes: string[];
  items: { id: string; amount: number; source: "wallet" | "fee"; mode: string; reference: string | null; reason: string; on: string; by: string | null }[];
}

export function RefundsSection({ id, paid }: { id: string; paid: number }) {
  const q = useLoad<Refunds>(`/api/student-profile/${enc(id)}/refunds`);
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<"wallet" | "fee">("wallet");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("Cash");
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function save() {
    if (!Number(amount)) return setMsg({ ok: false, text: "Enter the amount." });
    if (reason.trim().length < 3) return setMsg({ ok: false, text: "Write why the money is refunded." });
    setBusy(true);
    setMsg(null);
    try {
      await send(`/api/student-profile/${enc(id)}/refunds`, { source, amount: Number(amount), mode, reference, reason, on: today() });
      setMsg({ ok: true, text: "Refund recorded." });
      setOpen(false);
      setAmount("");
      setReason("");
      setReference("");
      q.reload();
    } catch (e: any) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Load q={q} title="Refunds" sql>
      {(d) => (
        <>
          {open && (
            <div className="card p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Refund from">
                  <select className="field w-full" value={source} onChange={(e) => setSource(e.target.value as "wallet" | "fee")}>
                    <option value="wallet">Wallet (advance money)</option>
                    <option value="fee">Fee already paid</option>
                  </select>
                </Field>
                <Field label="Amount (₹)">
                  <input className="field w-full" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 8))} />
                </Field>
                <Field label="Paid back by">
                  <select className="field w-full" value={mode} onChange={(e) => setMode(e.target.value)}>
                    {d.modes.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Reference (UPI / cheque no.)">
                  <input className="field w-full" maxLength={80} value={reference} onChange={(e) => setReference(e.target.value)} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Reason">
                    <input className="field w-full" maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
                  </Field>
                </div>
              </div>
              {source === "fee" && <p className="mt-2 text-xs text-slate-500">{inr(paid)} fee paid this session. A refund lowers the fee paid and raises the balance.</p>}
              <div className="mt-3 flex gap-2">
                <button type="button" className="btn btn-primary" disabled={busy} onClick={save}>
                  Save refund
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
          {msg && <p className={`px-1 text-sm ${msg.ok ? "text-emerald-700" : "text-rose-600"}`}>{msg.text}</p>}
          <Card
            title="Refunds"
            action={
              !open && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => (setOpen(true), setMsg(null))}>
                  Record refund
                </button>
              )
            }
          >
            {d.items.length === 0 ? (
              <Nothing>No refunds for this student.</Nothing>
            ) : (
              <ul className="divide-y divide-slate-100">
                {d.items.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900">{r.reason}</div>
                      <div className="truncate text-xs text-slate-500">{[day(r.on), r.source === "wallet" ? "From wallet" : "From fee paid", r.mode, r.reference, r.by].filter(Boolean).join(" · ")}</div>
                    </div>
                    <span className="font-semibold tabular-nums text-slate-900">{inr(r.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </Load>
  );
}

/* ───────────── Attendance ───────────── */

interface Attendance {
  month: string;
  today: string;
  firstMonth: string;
  days: { date: string; mark: "P" | "A" | "L" | "H" | null; holiday: string | null; sunday: boolean }[];
  totals: { present: number; absent: number; leave: number; half: number; percent: number | null };
  session: { percent: number | null; workingDays: number };
}
const MARK: Record<string, string> = { P: "bg-emerald-500 text-white", A: "bg-rose-500 text-white", L: "bg-amber-400 text-slate-900", H: "bg-sky-500 text-white" };
const MARK_WORD: Record<string, string> = { P: "Present", A: "Absent", L: "Leave", H: "Half day" };
const shift = (m: string, by: number) => {
  const [y, mo] = m.split("-").map(Number);
  const d = new Date(Date.UTC(y, mo - 1 + by, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};

export function AttendanceSection({ id }: { id: string }) {
  const [month, setMonth] = useState("");
  const q = useLoad<Attendance>(`/api/student-profile/${enc(id)}/attendance${month ? `?month=${month}` : ""}`);
  return (
    <Load q={q} title="Attendance">
      {(d) => {
        const lead = (new Date(`${d.days[0]?.date || d.month + "-01"}T00:00:00Z`).getUTCDay() + 6) % 7;
        const label = new Date(`${d.month}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
        return (
          <>
            <div className="card p-4">
              <div className="summary-strip grid grid-cols-4">
                <Figure label="Present" value={String(d.totals.present)} tone="emerald" />
                <Figure label="Absent" value={String(d.totals.absent)} tone={d.totals.absent ? "rose" : undefined} />
                <Figure label="Leave" value={String(d.totals.leave)} />
                <Figure label="Month" value={d.totals.percent === null ? "—" : `${d.totals.percent}%`} />
              </div>
              <p className="mt-2 text-xs text-slate-500">{d.session.percent === null ? "No attendance marked this session yet." : `${d.session.percent}% attendance this session (${d.session.workingDays} days)`}</p>
            </div>
            <Card
              title={label}
              action={
                <span className="flex gap-1">
                  <button type="button" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30" disabled={d.month <= d.firstMonth} onClick={() => setMonth(shift(d.month, -1))} aria-label="Previous month">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button type="button" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30" disabled={d.month >= d.today.slice(0, 7)} onClick={() => setMonth(shift(d.month, 1))} aria-label="Next month">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </span>
              }
            >
              <div className="grid grid-cols-7 gap-1.5 p-4 text-center text-xs text-slate-500">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => (
                  <span key={w}>{w}</span>
                ))}
                {Array.from({ length: lead }, (_, i) => (
                  <span key={`x${i}`} />
                ))}
                {d.days.map((x) => (
                  <span
                    key={x.date}
                    title={x.holiday || (x.mark ? MARK_WORD[x.mark] : "")}
                    className={`grid h-9 place-items-center rounded-lg text-[13px] font-semibold tabular-nums ${x.mark ? MARK[x.mark] : x.holiday || x.sunday ? "bg-slate-100 text-slate-400" : x.date > d.today ? "text-slate-300" : "text-slate-700"}`}
                  >
                    {Number(x.date.slice(8))}
                  </span>
                ))}
              </div>
            </Card>
          </>
        );
      }}
    </Load>
  );
}

/* ───────────── Results ───────────── */

interface Results {
  setupNeeded: boolean;
  exams: {
    id: string;
    title: string;
    locked: boolean;
    card: { exam: { max: number }; subjects: { subject: string; total: number | null; absent: boolean; grade: string; passed: boolean; entered: boolean }[]; grand: number; outOf: number; percent: number | null; grade: string; result: string; complete: boolean; rank: number | null; classSize: number } | null;
  }[];
}

export function ResultsSection({ id }: { id: string }) {
  const q = useLoad<Results>(`/api/student-profile/${enc(id)}/results`);
  return (
    <Load q={q} title="Results">
      {(d) =>
        d.exams.length === 0 ? (
          <Card title="Results">
            <Nothing>No exams for this class this session yet.</Nothing>
          </Card>
        ) : (
          <>
            {d.exams.map((e) => (
              <Card key={e.id} title={e.title} action={<span className={`badge py-0 text-[11px] ${e.locked ? "badge-emerald" : "badge-amber"}`}>{e.locked ? "Final" : "Marks in progress"}</span>}>
                {!e.card ? (
                  <Nothing>No marks entered yet.</Nothing>
                ) : (
                  <>
                    <ul className="divide-y divide-slate-100">
                      {e.card.subjects.map((s) => (
                        <li key={s.subject} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                          <span className="min-w-0 flex-1 text-slate-900">{s.subject}</span>
                          <span className={`font-semibold tabular-nums ${s.entered && !s.passed ? "text-rose-600" : "text-slate-900"}`}>{!s.entered ? "—" : s.absent ? "Absent" : `${s.total ?? "—"} / ${e.card!.exam.max}`}</span>
                          <span className="w-8 text-right text-xs text-slate-500">{s.entered ? s.grade : ""}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">
                      Total {e.card.grand} / {e.card.outOf}
                      {e.card.percent !== null && ` · ${e.card.percent}%`}
                      {e.card.grade && ` · ${e.card.grade}`}
                      {e.card.rank && e.card.complete ? ` · Rank ${e.card.rank} of ${e.card.classSize}` : ""}
                      {e.card.result && <span className="ml-2 font-normal text-slate-500">{e.card.result}</span>}
                    </div>
                  </>
                )}
              </Card>
            ))}
          </>
        )
      }
    </Load>
  );
}

/* ───────────── Siblings ───────────── */

export function SiblingsSection({ id }: { id: string }) {
  const q = useLoad<{ siblings: { id: string; name: string; classSec: string; srNo: string; status: string; balance: number | null }[] }>(`/api/student-profile/${enc(id)}/siblings`);
  return (
    <Load q={q} title="Siblings">
      {(d) => (
        <Card title="Brothers and sisters">
          {d.siblings.length === 0 ? (
            <Nothing>No brothers or sisters linked. Use Edit to link them.</Nothing>
          ) : (
            <ul className="divide-y divide-slate-100">
              {d.siblings.map((b) => (
                <li key={b.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900">{b.name}</div>
                    <div className="truncate text-xs text-slate-500">
                      {b.classSec} · <span className="font-mono">{b.srNo}</span>
                      {b.status !== "Active" ? ` · ${b.status}` : ""}
                    </div>
                  </div>
                  {b.balance !== null && <span className={`font-semibold tabular-nums ${b.balance > 0 ? "text-rose-600" : "text-emerald-700"}`}>{b.balance > 0 ? `${inr(b.balance)} due` : "Paid up"}</span>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </Load>
  );
}

/* ───────────── Remarks and discipline ───────────── */

interface Remark {
  id: string;
  text: string;
  category: string | null;
  severity: "low" | "medium" | "high" | null;
  actionTaken: string | null;
  nextFollowUp: string | null;
  done: boolean;
  by: string | null;
  at: string;
}
const CATEGORIES = ["Late coming", "Uniform", "Homework", "Behaviour", "Fight", "Mobile phone", "Absent without leave", "Other"];
const SEVERITY: Record<string, string> = { low: "Minor", medium: "Moderate", high: "Serious" };

export function RemarksSection({ id, kind }: { id: string; kind: "followup" | "discipline" }) {
  const q = useLoad<{ setupNeeded: boolean; items: Remark[] }>(`/api/student-profile/${enc(id)}/remarks?kind=${kind}`);
  const discipline = kind === "discipline";
  const [text, setText] = useState("");
  const [next, setNext] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [severity, setSeverity] = useState("low");
  const [action, setAction] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function add() {
    if (text.trim().length < 2) return setErr("Write the note.");
    setBusy(true);
    setErr("");
    try {
      await send(`/api/student-profile/${enc(id)}/remarks`, discipline ? { kind, text, category, severity, actionTaken: action } : { kind, text, nextFollowUp: next || undefined });
      setText("");
      setNext("");
      setAction("");
      q.reload();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function toggle(r: Remark) {
    try {
      await send(`/api/student-profile/${enc(id)}/remarks/${r.id}`, { done: !r.done }, "patch");
      q.reload();
    } catch (e: any) {
      setErr(e.message);
    }
  }

  const title = discipline ? "Discipline" : "Follow-up notes";
  return (
    <Load q={q} title={title} sql>
      {(d) => (
        <>
          <div className="card p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label={discipline ? "What happened" : "Note"}>
                  <textarea className="field w-full" rows={2} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} placeholder={discipline ? "" : "e.g. Spoke to the father, will pay on the 10th"} />
                </Field>
              </div>
              {discipline ? (
                <>
                  <Field label="Category">
                    <select className="field w-full" value={category} onChange={(e) => setCategory(e.target.value)}>
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Severity">
                    <select className="field w-full" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                      {Object.entries(SEVERITY).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Action taken">
                      <input className="field w-full" maxLength={300} value={action} onChange={(e) => setAction(e.target.value)} />
                    </Field>
                  </div>
                </>
              ) : (
                <Field label="Next follow-up (optional)">
                  <input type="date" className="field w-full" min={today()} value={next} onChange={(e) => setNext(e.target.value)} />
                </Field>
              )}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={add}>
                Add note
              </button>
              {err && <span className="text-sm text-rose-600">{err}</span>}
            </div>
          </div>
          <Card title={title}>
            {d.items.length === 0 ? (
              <Nothing>{discipline ? "No discipline notes." : "No follow-up notes."}</Nothing>
            ) : (
              <ul className="divide-y divide-slate-100">
                {d.items.map((r) => {
                  const overdue = !r.done && !!r.nextFollowUp && r.nextFollowUp < today();
                  return (
                    <li key={r.id} className="flex items-start gap-3 px-4 py-2.5 text-sm">
                      {!discipline && <input type="checkbox" className="mt-1 h-4 w-4 accent-emerald-700" checked={r.done} onChange={() => toggle(r)} aria-label={r.done ? "Mark not done" : "Mark done"} />}
                      <div className="min-w-0 flex-1">
                        <div className={r.done ? "text-slate-400 line-through" : "text-slate-900"}>{r.text}</div>
                        <div className="text-xs text-slate-500">{[when(r.at), r.by, discipline ? [r.category, SEVERITY[r.severity || "low"]].join(" · ") : "", r.actionTaken ? `Action: ${r.actionTaken}` : ""].filter(Boolean).join(" · ")}</div>
                      </div>
                      {!discipline && r.nextFollowUp && !r.done && <span className={`badge py-0 text-[11px] ${overdue ? "badge-rose" : "badge-amber"}`}>{day(r.nextFollowUp)}</span>}
                      {discipline && r.severity === "high" && <span className="badge badge-rose py-0 text-[11px]">Serious</span>}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </>
      )}
    </Load>
  );
}

/* ───────────── SR register ───────────── */

const esc = (v: unknown) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function SrRegisterSection({ s, full }: { s: Student; full: StudentFull | null | false }) {
  const f: any = { ...s, ...(full || {}) };
  const rows: [string, string, boolean?][] = [
    ["SR no.", f.srNo || ""],
    ["Admission no.", f.admissionNo || ""],
    ["Date of admission", f.admissionDate ? day(f.admissionDate) : ""],
    ["Present class", f.classSec || [f.class, f.section].filter(Boolean).join(" - ")],
    ["Student's name", [f.name, f.nameHi].filter(Boolean).join(" / "), true],
    ["Father's name", f.fatherName || ""],
    ["Mother's name", f.motherName || ""],
    ["Date of birth", f.dob ? day(f.dob) : ""],
    ["Category / caste", [f.category, f.caste].filter(Boolean).join(" · ")],
    ["Religion", f.religion || ""],
    ["PEN", f.penNo || ""],
    ["Aadhaar", f.aadhaarNo || ""],
    ["Shala Darpan ID", f.shalaDarpanId || ""],
    ["Address", [f.address, f.city, f.district, f.pincode].filter(Boolean).join(", "), true],
    ["Previous school", [f.prevSchool, f.prevClass].filter(Boolean).join(" · "), true],
    ["Status", f.status || "Active"],
    ["TC no. / date", [f.tcNo, f.tcDate ? day(f.tcDate) : ""].filter(Boolean).join(" · ")],
    ["Reason for leaving", f.leavingReason || "", true],
  ];
  function print() {
    const w = window.open("", "_blank", "width=820,height=1000");
    if (!w) return;
    const body = rows.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v) || "&nbsp;"}</td></tr>`).join("");
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>SR ${esc(f.srNo)}</title>
<style>@page{size:A4;margin:16mm}body{font:14px/1.5 system-ui,"Noto Sans Devanagari",sans-serif;color:#000}h1{font-size:18px;margin:0 0 4px}p{margin:0 0 14px;color:#333}
table{width:100%;border-collapse:collapse}th,td{border:1px solid #000;padding:7px 9px;text-align:left;vertical-align:top}th{width:38%;font-weight:600;background:#f2f2f2}.sign{display:flex;justify-content:space-between;margin-top:48px}</style></head><body>
<h1>Scholar Register (SR) entry</h1><p>${esc(f.name)}</p><table>${body}</table><div class="sign"><span>Class teacher</span><span>Principal</span></div>
<script>window.onload=function(){window.print()}</script></body></html>`);
    w.document.close();
  }
  return (
    <section className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Scholar Register (SR) entry</h3>
        <button type="button" onClick={print} className="btn btn-secondary btn-sm">
          <Printer className="h-3.5 w-3.5" />
          Print
        </button>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        {rows.map(([k, v, wide]) => (
          <Info key={k} label={k} value={v} wide={wide} />
        ))}
      </dl>
    </section>
  );
}

/* ───────────── Timetable ───────────── */

interface Timetable {
  classSec: string;
  setupNeeded: boolean;
  todayDay: number;
  periods: { id: string; label: string; start: string; end: string; isBreak: boolean }[];
  days: Record<string, Record<string, { subject: string; teacher: string | null }>>;
}
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function TimetableSection({ id }: { id: string }) {
  const q = useLoad<Timetable>(`/api/student-profile/${enc(id)}/timetable`);
  const [pick, setPick] = useState<number | null>(null);
  return (
    <Load q={q} title="Timetable">
      {(d) => {
        if (d.setupNeeded || !d.periods.length)
          return (
            <Card title="Timetable">
              <Nothing>The timetable has not been made yet.</Nothing>
            </Card>
          );
        const dayNo = pick ?? (d.todayDay >= 1 && d.todayDay <= 6 ? d.todayDay : 1);
        const lessons = d.days[String(dayNo)] || {};
        return (
          <Card
            title={`Timetable · ${d.classSec}`}
            action={
              <div className="module-tabs flex gap-1 rounded-lg bg-slate-100 p-1">
                {DAYS.map((w, i) => (
                  <button key={w} type="button" onClick={() => setPick(i + 1)} className={`rounded-md px-2.5 py-1 text-xs font-semibold ${dayNo === i + 1 ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                    {w}
                  </button>
                ))}
              </div>
            }
          >
            <ul className="divide-y divide-slate-100">
              {d.periods.map((p) => {
                const l = lessons[p.id];
                return (
                  <li key={p.id} className={`flex items-center gap-3 px-4 py-2.5 text-sm ${p.isBreak ? "text-slate-400" : ""}`}>
                    <span className="w-28 shrink-0 text-xs tabular-nums text-slate-500">
                      {p.start}–{p.end}
                    </span>
                    <span className="min-w-0 flex-1 font-semibold text-slate-900">{p.isBreak ? p.label || "Break" : l?.subject || "—"}</span>
                    {!p.isBreak && l?.teacher && <span className="truncate text-xs text-slate-500">{l.teacher}</span>}
                  </li>
                );
              })}
            </ul>
          </Card>
        );
      }}
    </Load>
  );
}

/* ───────────── Edit history ───────────── */

interface History {
  setupNeeded: boolean;
  items: { id: string; at: string; actor_name: string | null; actor_role: string | null; action: string; changes: any; note: string | null }[];
}
const show = (v: unknown) => (v === null || v === undefined || v === "" ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v));

export function HistorySection({ id }: { id: string }) {
  const q = useLoad<History>(`/api/student-profile/${enc(id)}/history`);
  return (
    <Load q={q} title="Edit history" sql>
      {(d) => (
        <Card title="Edit history">
          {d.items.length === 0 ? (
            <Nothing>No changes recorded yet.</Nothing>
          ) : (
            <ul className="divide-y divide-slate-100">
              {d.items.map((h) => (
                <li key={h.id} className="px-4 py-2.5 text-sm">
                  <div className="font-semibold text-slate-900">{h.action}</div>
                  <div className="text-xs text-slate-500">{[when(h.at), h.actor_name, h.actor_role].filter(Boolean).join(" · ")}</div>
                  {Array.isArray(h.changes) ? (
                    <ul className="mt-1 space-y-0.5 text-xs text-slate-700">
                      {h.changes.map((c: any, i: number) => (
                        <li key={i} className="break-words">
                          <span className="font-medium">{c.field}</span>: <span className="text-slate-400 line-through">{show(c.from)}</span> → {show(c.to)}
                        </li>
                      ))}
                    </ul>
                  ) : h.changes ? (
                    <p className="mt-1 break-words text-xs text-slate-700">
                      {Object.entries(h.changes)
                        .filter(([, v]) => v !== null && v !== undefined && v !== "")
                        .map(([k, v]) => `${k}: ${show(v)}`)
                        .join(" · ")}
                    </p>
                  ) : null}
                  {h.note && <p className="mt-0.5 text-xs text-slate-500">{h.note}</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </Load>
  );
}
