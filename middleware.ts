import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/auth-middleware";

export async function middleware(request: NextRequest) {
  const { response: res, user } = await updateSession(request);
  const { pathname } = request.nextUrl;
  const hasSession = !!user;

  const response = res ?? NextResponse.next();

  if (pathname.startsWith("/auth/")) {
    // Only redirect to dashboard when having a session and not already on login.
    // Skipping redirect from /auth/login avoids a loop when the session cookie exists
    // but the session is invalid or the app user row is missing (layout would send back to login).
    // Also allow /auth/pending-approval so staff awaiting approval are not sent back to dashboard (layout would redirect again → loop).
    const isLoginPage = pathname === "/auth/login" || pathname.startsWith("/auth/login?");
    const isPendingApproval = pathname === "/auth/pending-approval" || pathname.startsWith("/auth/pending-approval?");
    if (hasSession && !isLoginPage && !isPendingApproval) {
      const redirectRes = NextResponse.redirect(new URL("/dashboard", request.url));
      try {
        res.cookies.getAll().forEach((c) => redirectRes.cookies.set(c.name, c.value, c));
      } catch (_) {}
      return redirectRes;
    }
    return response;
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding")) {
    if (!hasSession) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
