import { createServerClient } from "@supabase/ssr";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminSessionCookie } from "@/lib/admin-session";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll(): { name: string; value: string; options?: Record<string, unknown> }[] {
          return request.cookies.getAll().map((cookie: RequestCookie) => ({
            name: cookie.name,
            value: cookie.value,
            options: {},
          }));
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, (options ?? {}) as Record<string, unknown>)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Admin login uses DB-only session cookie (no Supabase Auth)
  if (!user) {
    const adminCookie = request.cookies.get("admin_session")?.value;
    const adminSession = await verifyAdminSessionCookie(adminCookie);
    if (adminSession) {
      return { response, user: { id: adminSession.userId } as { id: string } };
    }
  }

  return { response, user };
}
