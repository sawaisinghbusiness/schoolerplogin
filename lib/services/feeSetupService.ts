import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { DEFAULT_FEE_CONFIG, FeeConfig } from "@/lib/feeEngine";

export interface FeeSetup {
  config: FeeConfig;
  saved: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
  setupMissing: boolean;
}

export interface ApplyChange {
  studentId: string;
  name: string;
  classSec: string;
  oldTotal: number;
  newTotal: number;
  oldDiscount: number;
  newDiscount: number;
  paid: number;
}

export interface ApplyResult {
  checked: number;
  unchanged: number;
  changed: number;
  raise: number;
  reduce: number;
  changes: ApplyChange[];
  blocked: ApplyChange[];
  noGroup: string[];
  applied: boolean;
}

export interface ConcessionHolder {
  studentId: string;
  name: string;
  srNo: string;
  classSec: string;
  code: string;
  discount: number;
  total: number;
  paid: number;
}

let cache: Promise<FeeConfig> | null = null;

export const feeSetupService = {
  async get(): Promise<{ data?: FeeSetup; error?: string }> {
    const res = await api.get<FeeSetup>("/api/fee-setup");
    return res.ok && res.data ? { data: res.data } : { error: res.error || "Could not load the fee setup." };
  },
  async save(config: FeeConfig): Promise<{ data?: FeeSetup; error?: string }> {
    const res = await api.put<FeeSetup & { success: boolean; error?: string }>("/api/fee-setup", { config });
    cache = null;
    return res.ok && res.data?.success ? { data: res.data } : { error: res.data?.error || res.error || "Could not save." };
  },
  async apply(dryRun: boolean): Promise<{ data?: ApplyResult; error?: string }> {
    const res = await api.post<ApplyResult & { success: boolean; error?: string }>("/api/fee-setup/apply", { dryRun });
    return res.ok && res.data?.success ? { data: res.data } : { error: res.data?.error || res.error || "Could not work out the fees." };
  },
  async concessions(): Promise<{ data: ConcessionHolder[]; error?: string }> {
    const res = await api.get<{ data: ConcessionHolder[]; error?: string }>("/api/fee-setup/concessions");
    return res.ok && res.data ? { data: res.data.data } : { data: [], error: res.error };
  },
  async setConcession(studentId: string, code: string | null): Promise<{ success: boolean; error?: string }> {
    const res = await api.put<{ success: boolean; error?: string }>("/api/fee-setup/concessions", { studentId, code });
    return res.ok && res.data?.success ? { success: true } : { success: false, error: res.data?.error || res.error || "Could not save." };
  },
};

/** The saved fee structure (loaded once per page load), falling back to the default. */
export function useFeeConfig(): FeeConfig {
  const [cfg, setCfg] = useState<FeeConfig>(DEFAULT_FEE_CONFIG);
  useEffect(() => {
    if (!cache) cache = feeSetupService.get().then((r) => r.data?.config || DEFAULT_FEE_CONFIG);
    let alive = true;
    cache.then((c) => alive && setCfg(c));
    return () => {
      alive = false;
    };
  }, []);
  return cfg;
}
