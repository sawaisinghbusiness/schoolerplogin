import { SignJWT, jwtVerify } from "jose";

/**
 * Server-side session helpers. A signed JWT is stored in an httpOnly cookie
 * (see /api/auth routes), so the browser can't tamper with the role and it
 * never lives in localStorage where any script could read it.
 */

export const SESSION_COOKIE = "schooldesk_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

export type SessionRole = "admin" | "teacher" | "exam_cell" | "accountant" | "parent" | "student";

export interface SessionPayload {
  sub: string; // user id
  name: string;
  role: SessionRole;
  identifier: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET is missing or too short (need >= 32 chars). Set it in .env.local."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      sub: String(payload.sub),
      name: String(payload.name),
      role: payload.role as SessionRole,
      identifier: String(payload.identifier),
    };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};
