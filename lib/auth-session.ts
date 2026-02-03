import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionCookie,
} from "@/lib/admin-session";
import { db } from "@/drizzle";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export type SessionUser = { id: string; role?: string };

/**
 * Returns the current session user from either Better Auth or the admin cookie.
 * Use in middleware and server code to know if the request is authenticated.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const adminSession = await verifyAdminSessionCookie(adminCookie);
  if (adminSession) {
    return { id: adminSession.userId, role: adminSession.role };
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) return null;
  return { id: session.user.id, role: (session.user as { role?: string }).role };
}

/**
 * Returns the app user row (from public.users) for the current session, or null.
 * Call syncAuthUserToAppUser before this when the session may be from a fresh login
 * (e.g. after OAuth callback or phone verify) so the app user row exists.
 */
export async function getAppUserBySession() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.id, sessionUser.id));
  return row ?? null;
}
