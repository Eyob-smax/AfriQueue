import { NextResponse } from "next/server";

/**
 * Legacy OAuth callback URL. Better Auth handles OAuth at /api/auth/callback/:provider.
 * This route redirects to dashboard for any old links.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/dashboard";
  const redirectTo = next.startsWith("/") ? next : `/${next}`;
  return NextResponse.redirect(`${origin}${redirectTo}`);
}
