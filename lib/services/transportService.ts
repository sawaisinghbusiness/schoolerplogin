import { api } from "@/lib/apiClient";

export interface Stop {
  name: string;
  time: string;
}

export interface BusRoute {
  id: string;
  name: string;
  stops: Stop[];
  vehicle_no: string | null;
  capacity: number | null;
  driver_name: string | null;
  driver_mobile: string | null;
  conductor_name: string | null;
  conductor_mobile: string | null;
  students: number;
}

export interface Rider {
  id: string;
  name: string;
  classSec: string;
  fatherName: string;
  gender: string;
  mobile: string;
  stop: string;
}

export type RouteInput = Omit<BusRoute, "id" | "students" | "capacity"> & { capacity: string };

type Done = { success: boolean; error?: string };
const done = async <T extends Done>(p: Promise<{ ok: boolean; data?: T; error?: string }>): Promise<T> => {
  const r = await p;
  return r.ok && r.data?.success ? r.data : ({ success: false, error: r.data?.error || r.error || "Could not reach the server." } as T);
};

export const transportService = {
  async list(): Promise<{ routes: BusRoute[]; total: number; unassigned: number; setupNeeded: boolean; error?: string }> {
    const r = await api.get<{ routes: BusRoute[]; total: number; unassigned: number; setupNeeded: boolean }>("/api/transport");
    return r.ok && r.data ? r.data : { routes: [], total: 0, unassigned: 0, setupNeeded: false, error: r.error };
  },
  async riders(id: string): Promise<{ data: Rider[]; error?: string }> {
    const r = await api.get<{ data: Rider[] }>(`/api/transport/${id}/students`);
    return r.ok && r.data ? r.data : { data: [], error: r.error };
  },
  save: (input: RouteInput, id?: string) => done(id ? api.patch<Done & { data?: BusRoute }>(`/api/transport/${id}`, input) : api.post<Done & { data?: BusRoute }>("/api/transport", input)),
  remove: (id: string) => done(api.del<Done>(`/api/transport/${id}`)),
  assign: (routeId: string, studentIds: string[], stop: string) => done(api.post<Done & { moved?: number }>("/api/transport/assign", { routeId, studentIds, stop })),
};
