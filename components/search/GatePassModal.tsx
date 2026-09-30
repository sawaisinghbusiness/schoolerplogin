"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Student } from "@/data/mockData";
import { gatePassService, GatePass } from "@/lib/services/gatePassService";
import { generateGatePassPDF } from "@/lib/pdfGenerator";

interface GatePassModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onIssued?: (pass: GatePass) => void;
}

const REASONS = ["Not feeling well", "Doctor / hospital visit", "Family emergency", "Family function or travel", "Sports or school event", "Principal's permission"];

const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });

/** Issues a gate pass, saves it in the database, and prints the slip. */
export function GatePassModal({ student, isOpen, onClose, onIssued }: GatePassModalProps) {
  const [reason, setReason] = useState(REASONS[0]);
  const [otherReason, setOtherReason] = useState("");
  const [escort, setEscort] = useState("father");
  const [otherEscort, setOtherEscort] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issued, setIssued] = useState<GatePass | null>(null);
  const [previous, setPrevious] = useState<GatePass[] | null>(null);

  useEffect(() => {
    if (!isOpen || !student) return;
    setReason(REASONS[0]);
    setOtherReason("");
    setEscort("father");
    setOtherEscort("");
    setError(null);
    setIssued(null);
    setPrevious(null);
    gatePassService.list({ studentId: student.id, limit: 5 }).then((r) => setPrevious(r.error ? [] : r.data));
  }, [isOpen, student?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!student) return null;
  const s = student;

  const escortText = escort === "father" ? `Father (${s.fatherName})` : escort === "mother" ? `Mother (${s.motherName})` : otherEscort.trim();
  const reasonText = reason === "other" ? otherReason.trim() : reason;

  const issue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonText) return setError("Write the reason for leaving.");
    if (!escortText) return setError("Write who is taking the student, with their relation.");
    setSaving(true);
    setError(null);
    const res = await gatePassService.issue({ studentId: s.id, reason: reasonText, escort: escortText });
    setSaving(false);
    if (!res.success || !res.data) return setError(res.error || "Could not issue the gate pass.");
    setIssued(res.data);
    setPrevious((p) => [res.data!, ...(p || [])]);
    onIssued?.(res.data);
  };

  const print = (p: GatePass) => {
    const d = new Date(p.issued_at);
    generateGatePassPDF(s, {
      passId: p.pass_no,
      time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      reason: p.reason,
      escort: p.escort,
    });
  };

  const earlier = (previous || []).filter((p) => p.id !== issued?.id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gate pass" subtitle={`${s.name} · ${s.classSec} · ${s.mobile}`} maxWidth="max-w-lg">
      <div className="space-y-4 text-sm">
        {issued ? (
          <>
            <div className="rounded-md border border-slate-300">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
                <span className="font-medium text-emerald-800">Gate pass issued</span>
                <span className="font-mono font-semibold">{issued.pass_no}</span>
              </div>
              <dl className="divide-y divide-slate-100 px-3">
                <Line label="Time" value={when(issued.issued_at)} />
                <Line label="Going with" value={issued.escort} />
                <Line label="Reason" value={issued.reason} />
                <Line label="Issued by" value={issued.issued_by_name || "Office"} />
              </dl>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
                Done
              </button>
              <button type="button" onClick={() => print(issued)} className="btn btn-primary btn-sm">
                Print slip
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={issue} className="space-y-4">
            {error && (
              <div className="alert alert-rose" role="alert">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div>
              <label htmlFor="gp-reason" className="field-label">
                Reason
              </label>
              <select id="gp-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="field w-full">
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
                <option value="other">Other…</option>
              </select>
              {reason === "other" && <input value={otherReason} onChange={(e) => setOtherReason(e.target.value)} placeholder="Write the reason" className="field mt-2 w-full" autoFocus />}
            </div>
            <div>
              <label htmlFor="gp-escort" className="field-label">
                Going with
              </label>
              <select id="gp-escort" value={escort} onChange={(e) => setEscort(e.target.value)} className="field w-full">
                <option value="father">Father{s.fatherName ? ` (${s.fatherName})` : ""}</option>
                {s.motherName && <option value="mother">Mother ({s.motherName})</option>}
                <option value="other">Someone else…</option>
              </select>
              {escort === "other" && (
                <input value={otherEscort} onChange={(e) => setOtherEscort(e.target.value)} placeholder="Name and relation, e.g. Suresh Jain (uncle)" className="field mt-2 w-full" />
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Saving…" : "Issue gate pass"}
              </button>
            </div>
          </form>
        )}

        {earlier.length > 0 && (
          <div>
            <h3 className="mb-1.5 text-xs font-medium text-slate-500">Earlier passes</h3>
            <table className="w-full border-t border-slate-200 text-[13px]">
              <tbody className="divide-y divide-slate-100">
                {earlier.map((p) => (
                  <tr key={p.id}>
                    <td className="py-1.5 pr-3 font-mono">{p.pass_no}</td>
                    <td className="py-1.5 pr-3 text-slate-600">{p.reason}</td>
                    <td className="whitespace-nowrap py-1.5 pr-3 text-slate-500">{when(p.issued_at)}</td>
                    <td className="py-1.5 text-right">
                      <button type="button" onClick={() => print(p)} className="text-brand-700 hover:underline">
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-1.5">
      <dt className="w-24 shrink-0 text-slate-500">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
