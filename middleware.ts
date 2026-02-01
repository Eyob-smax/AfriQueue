import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response: res, user } = await updateSession(request);
  const { pathname } = request.nextUrl;
  const hasSession = !!user;

  const response = res ?? NextResponse.next();

  if (pathname.startsWith("/auth/")) {
    if (hasSession) {
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
