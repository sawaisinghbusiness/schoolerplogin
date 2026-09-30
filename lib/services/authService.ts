import { api } from "@/lib/apiClient";

export interface AuthenticatedUser {
  id: string;
  name: string;
  role: "admin" | "teacher" | "exam_cell" | "accountant" | "parent" | "student";
  identifier: string;
}

/**
 * Auth goes through the backend (/api/auth/*), which verifies the bcrypt
 * password hash and sets an httpOnly session cookie. The base URL is controlled
 * by NEXT_PUBLIC_API_URL (falls back to same-origin Next.js routes when unset).
 */
export const authService = {
  async login(
    identifier: string,
    passwordAttempt: string
  ): Promise<{ success: boolean; user?: AuthenticatedUser; error?: string }> {
    const res = await api.post<{ success: boolean; user?: AuthenticatedUser; error?: string }>(
      "/api/auth/login",
      { identifier, password: passwordAttempt }
    );
    if (!res.ok || !res.data?.success) {
      return { success: false, error: res.error || res.data?.error || "Invalid credentials." };
    }
    return { success: true, user: res.data.user };
  },

  async logout(): Promise<void> {
    await api.post("/api/auth/logout");
  },

  async currentUser(): Promise<AuthenticatedUser | null> {
    const res = await api.get<{ authenticated: boolean; user?: AuthenticatedUser }>("/api/auth/me");
    return res.ok && res.data?.authenticated ? res.data.user ?? null : null;
  },
};
