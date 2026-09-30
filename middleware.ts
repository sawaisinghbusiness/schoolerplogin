import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/sessionConstants";

/**
 * Page-level guard. Data/auth now live on the backend server, which is the real
 * authorization boundary (it verifies the signed cookie on every request). Here
 * we only check that a session cookie is PRESENT and bounce anonymous visitors
 * to /login — we don't verify the signature, since the signing secret lives on
 * the backend. In local dev the backend cookie is visible here because both run
 * on localhost; in production, host the frontend and backend on the same parent
 * domain (or gate purely client-side) so the cookie is readable.
 */

const PUBLIC_PAGES = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PAGES.includes(pathname)) {
    return NextResponse.next();
  }

  const hasCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  if (!hasCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Pages only — API routes are served by the backend now.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|ico|webp)$).*)",
  ],
};
