import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { verifyAdminSessionCookie } from "@/lib/admin-session";

const ADMIN_SESSION_COOKIE = "admin_session";

/**
 * Returns response and user (if any) for middleware.
 * Checks admin cookie first, then Better Auth session cookie.
 * Cookie-only check (no DB); full validation happens in server actions/pages.
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Admin session (DB-only cookie)
  const adminCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const adminSession = await verifyAdminSessionCookie(adminCookie);
  if (adminSession) {
    return { response, user: { id: adminSession.userId } };
  }

  // Better Auth session cookie (cookie-only; full validation in server actions/pages)
  const sessionCookie = getSessionCookie(request);
  return { response, user: sessionCookie ? { id: "session" } : null };
}
