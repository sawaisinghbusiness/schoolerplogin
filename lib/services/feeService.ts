import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export interface FeeHeads {
  tuition_fee: number;
  exam_fee: number;
  transport_fee: number;
  late_fine?: number;
}

export interface FeeTransaction {
  id: string;
  receipt_no: number;
  student_id: string;
  amount_paid: number;
  payment_mode: "Cash" | "UPI" | "Cheque" | "Net Banking";
  transaction_id?: string | null;
  fee_heads: FeeHeads;
  collected_by: string;
  payment_date: string;
  remarks?: string | null;
  student?: {
    name: string;
    sr_no: string;
    admission_no?: string;
    class_name?: string;
    section?: string;
    father_name?: string;
    contact_phone?: string;
  };
}

// In-memory transactions cache for fallback
let localTransactions: FeeTransaction[] = [];
let localReceiptCounter = 1001;

/**
 * Convert numeric Indian currency to English words
 * Example: 4500 -> "Four Thousand Five Hundred Rupees Only"
 */
export function numberToWordsIndian(num: number): string {
  if (num === 0) return "Zero Rupees Only";

  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertTwoDigits(n: number): string {
    if (n < 20) return a[n];
    return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
  }

  function convertGroup(n: number): string {
    let str = "";
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n > 0) {
      str += convertTwoDigits(n);
    }
    return str.trim();
  }

  const rounded = Math.round(num);
  const crore = Math.floor(rounded / 10000000);
  const lakh = Math.floor((rounded % 10000000) / 100000);
  const thousand = Math.floor((rounded % 100000) / 1000);
  const remainder = rounded % 1000;

  let words = "";
  if (crore > 0) words += convertGroup(crore) + " Crore ";
  if (lakh > 0) words += convertGroup(lakh) + " Lakh ";
  if (thousand > 0) words += convertGroup(thousand) + " Thousand ";
  if (remainder > 0) words += convertGroup(remainder);

  return words.trim() + " Rupees Only";
}

export const feeService = {
  /**
   * Record a new fee payment transaction in Supabase and update student balance
   */
  async recordPayment(params: {
    studentId: string;
    studentDetails: {
      name: string;
      sr_no: string;
      admission_no?: string;
      class_name?: string;
      section?: string;
      father_name?: string;
      contact_phone?: string;
    };
    amountPaid: number;
    feeHeads: FeeHeads;
    paymentMode: "Cash" | "UPI" | "Cheque" | "Net Banking";
    transactionId?: string;
    currentDue: number;
    collectedBy?: string;
    remarks?: string;
  }): Promise<{
    success: boolean;
    transaction?: FeeTransaction;
    newDue: number;
    error?: string;
  }> {
    const {
      studentId,
      studentDetails,
      amountPaid,
      feeHeads,
      paymentMode,
      transactionId,
      currentDue,
      collectedBy = "Admin Office",
      remarks = "",
    } = params;

    const newDue = Math.max(0, currentDue - amountPaid);

    if (isSupabaseConfigured) {
      try {
        // 1. Insert transaction into Supabase fee_transactions table
        const insertPayload = {
          student_id: studentId,
          amount_paid: amountPaid,
          payment_mode: paymentMode,
          transaction_id: transactionId || null,
          fee_heads: feeHeads,
          collected_by: collectedBy,
          remarks: remarks || null,
        };

        const { data, error } = await supabase
          .from("fee_transactions")
          .insert([insertPayload])
          .select()
          .single();

        if (error) {
          console.error("Failed to insert fee transaction:", error);
          return {
            success: false,
            newDue: currentDue,
            error: error.message || "Failed to record transaction in database.",
          };
        }

        // 2. Decrement student's fees_due in Supabase
        const { error: updateError } = await supabase
          .from("students")
          .update({ fees_due: newDue })
          .eq("id", studentId);

        if (updateError) {
          console.warn("Could not update fees_due column:", updateError.message);
          // Try fallback balance_fee column
          await supabase
            .from("students")
            .update({ balance_fee: newDue })
            .eq("id", studentId);
        }

        const transaction: FeeTransaction = {
          id: data.id,
          receipt_no: data.receipt_no,
          student_id: data.student_id,
          amount_paid: Number(data.amount_paid),
          payment_mode: data.payment_mode,
          transaction_id: data.transaction_id,
          fee_heads: data.fee_heads,
          collected_by: data.collected_by || collectedBy,
          payment_date: data.payment_date || new Date().toISOString(),
          remarks: data.remarks,
          student: studentDetails,
        };

        localTransactions.unshift(transaction);
        return { success: true, transaction, newDue };
      } catch (err: any) {
        console.error("Supabase record payment exception:", err);
        return { success: false, newDue: currentDue, error: err.message };
      }
    }

    // Local fallback
    const mockTx: FeeTransaction = {
      id: `tx-${Date.now()}`,
      receipt_no: localReceiptCounter++,
      student_id: studentId,
      amount_paid: amountPaid,
      payment_mode: paymentMode,
      transaction_id: transactionId || null,
      fee_heads: feeHeads,
      collected_by: collectedBy,
      payment_date: new Date().toISOString(),
      remarks: remarks || null,
      student: studentDetails,
    };

    localTransactions.unshift(mockTx);
    return { success: true, transaction: mockTx, newDue };
  },

  /**
   * Fetch recent fee transactions (for audit & reprinting)
   */
  async fetchRecentTransactions(limit = 10): Promise<FeeTransaction[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("fee_transactions")
          .select(`
            *,
            students (
              name,
              sr_no,
              admission_no,
              class_name,
              section,
              father_name,
              contact_phone
            )
          `)
          .order("payment_date", { ascending: false })
          .limit(limit);

        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            receipt_no: d.receipt_no,
            student_id: d.student_id,
            amount_paid: Number(d.amount_paid),
            payment_mode: d.payment_mode,
            transaction_id: d.transaction_id,
            fee_heads: d.fee_heads,
            collected_by: d.collected_by,
            payment_date: d.payment_date,
            remarks: d.remarks,
            student: d.students || undefined,
          }));
        }
      } catch (err) {
        console.warn("fetchRecentTransactions error:", err);
      }
    }

    return localTransactions.slice(0, limit);
  },
};
