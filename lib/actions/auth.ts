"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/drizzle";
import { users, clientProfiles, roleRequests } from "@/drizzle/schema";
import { createNotification } from "@/lib/actions/notifications";
import {
  createSignedAdminSession,
  ADMIN_SESSION_COOKIE,
  verifyAdminPassword,
} from "@/lib/admin-session";
import { cookies } from "next/headers";

type UserRole = "CLIENT" | "STAFF" | "ADMIN" | "SUPER_ADMIN";
import { eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";

export type AuthResult = { error?: string };

/** Admin login: DB-only check against public.users (no Supabase Auth API). */
export async function signInAdmin(formData: FormData): Promise<AuthResult> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  if (!email || !password) {
    return { error: "Email and password are required" };
  }
  const [row] = await db
    .select({
      id: users.id,
      role: users.role,
      status: users.status,
      password_hash: users.password_hash,
    })
    .from(users)
    .where(eq(users.email, email));

  if (!row) {
    return { error: "Invalid email or password" };
  }
  if (row.role !== "ADMIN" && row.role !== "SUPER_ADMIN") {
    return { error: "This account is not an administrator" };
  }
  if (row.status !== "ACTIVE") {
    return { error: "This account is not active" };
  }
  if (!verifyAdminPassword(password, row.password_hash)) {
    return { error: "Invalid email or password" };
  }

  const sessionValue = await createSignedAdminSession(row.id, row.role);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
  redirect("/dashboard");
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  if (!email || !password) {
    return { error: "Email and password are required" };
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  await syncUserToApp(supabase);
  const [row] = await db
    .select({ role: users.role, status: users.status })
    .from(users)
    .where(eq(users.email, email));
  if (row?.role === "STAFF" && row?.status !== "ACTIVE") {
    redirect("/auth/pending-approval");
  }
  redirect("/dashboard");
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = (formData.get("fullName") as string) || email?.split("@")[0] || "User";
  const phone = (formData.get("phone") as string) || "";
  const country = (formData.get("country") as string) || "";
  const city = (formData.get("city") as string) || "";
  if (!email || !password) {
    return { error: "Email and password are required" };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone, role: "CLIENT", country, city },
    },
  });
  if (error) return { error: error.message };
  try {
    // Use user from signUp response so we don't rely on session cookie in same request
    if (data?.user) {
      await syncUserToAppWithUser(data.user);
    } else {
      await syncUserToApp(supabase);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const logPath = path.join(process.cwd(), ".cursor", "debug.log");
      fs.mkdirSync(path.dirname(logPath), { recursive: true });
      fs.appendFileSync(
        logPath,
        `${new Date().toISOString()} signUp/syncUserToApp error: ${message}\n${stack ?? ""}\n\n`
      );
    } catch (_) {}
    return {
      error: process.env.NODE_ENV === "development"
        ? `Database error saving new user: ${message}`
        : "Database error saving new user. Please try again or contact support.",
    };
  }
  redirect("/auth/login?confirm_email=1");
}

export async function signUpStaff(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const fullName = (formData.get("fullName") as string)?.trim() || "Staff";
  const phone = (formData.get("phone") as string)?.trim() || "";
  const healthCenterName = (formData.get("healthCenterName") as string)?.trim() || "";
  const healthCenterDescription = (formData.get("healthCenterDescription") as string)?.trim() || "";
  const healthCenterLocation = (formData.get("healthCenterLocation") as string)?.trim() || "";
  const healthCenterCountry = (formData.get("healthCenterCountry") as string)?.trim() || "";
  if (!email || !password) {
    return { error: "Email and password are required" };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        role: "STAFF",
        health_center_name: healthCenterName,
        health_center_description: healthCenterDescription,
        health_center_location: healthCenterLocation,
        health_center_country: healthCenterCountry || undefined,
      },
    },
  });
  if (error) return { error: error.message };
  const authUser = data.user;
  if (!authUser?.id) {
    return { error: "Account created but could not complete registration. Please contact support." };
  }
  try {
    await db
      .insert(users)
      .values({
        id: authUser.id,
        full_name: fullName,
        email,
        phone: phone || "—",
        role: "STAFF",
        status: "PENDING_APPROVAL",
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          full_name: fullName,
          email,
          phone: phone || "—",
          role: "STAFF",
          status: "PENDING_APPROVAL",
        },
      });
    const [inserted] = await db
      .insert(roleRequests)
      .values({
        requester_id: authUser.id,
        requested_role: "STAFF",
        status: "PENDING",
        health_center_name: healthCenterName || null,
        health_center_description: healthCenterDescription || null,
        health_center_location: healthCenterLocation || null,
        health_center_country: healthCenterCountry || null,
      })
      .returning({ id: roleRequests.id });
    const roleRequestId = inserted?.id;
    if (roleRequestId) {
      const adminRows = await db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(inArray(users.role, ["ADMIN", "SUPER_ADMIN"]));
      for (const admin of adminRows) {
        await createNotification(admin.id, "STAFF_REGISTRATION", roleRequestId);
      }
      const adminEmails = adminRows.map((a) => a.email).filter(Boolean) as string[];
      if (adminEmails.length > 0) {
        const { sendStaffRegistrationToAdmins } = await import("@/lib/email");
        await sendStaffRegistrationToAdmins(adminEmails, fullName, email, healthCenterName);
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[signUpStaff] Database error:", message, stack ?? "");
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const logPath = path.join(process.cwd(), ".cursor", "debug.log");
      fs.mkdirSync(path.dirname(logPath), { recursive: true });
      fs.appendFileSync(
        logPath,
        `${new Date().toISOString()} signUpStaff DB error: ${message}\n${stack ?? ""}\n\n`
      );
    } catch (_) {}
    return {
      error:
        process.env.NODE_ENV === "development"
          ? `Database error saving new user: ${message}`
          : "Database error saving new user. Please try again or contact support.",
    };
  }
  redirect("/auth/pending-approval");
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export async function syncUserAfterPhoneAuth() {
  const supabase = await createClient();
  await syncUserToApp(supabase);
}

type AuthUser = { id: string; email?: string | null; phone?: string | null; user_metadata?: Record<string, unknown> };

async function syncUserFromAuthUser(authUser: AuthUser): Promise<void> {
  const metadata = authUser.user_metadata || {};
  const fullName =
    (metadata.full_name as string) ||
    (metadata.name as string) ||
    (metadata.given_name as string) ||
    authUser.email?.split("@")[0] ||
    authUser.phone ||
    "User";
  const phone = (metadata.phone as string) || authUser.phone || "";
  const role = ((metadata.role as UserRole) || "CLIENT") as UserRole;
  const email =
    authUser.email ?? (authUser.phone ? `${authUser.phone}@phone.africare.local` : null);
  const country = (metadata.country as string) ?? null;
  const city = (metadata.city as string) ?? null;
  if (!email) return;

  await db
    .insert(users)
    .values({
      id: authUser.id,
      full_name: fullName,
      email,
      phone: phone || authUser.phone || "—",
      role,
      status: "ACTIVE",
      country: country || undefined,
      city: city || undefined,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        full_name: fullName,
        email,
        phone: phone || authUser.phone || "—",
        role,
        ...(country != null && country !== "" && { country }),
        ...(city != null && city !== "" && { city }),
      },
    });

  if (role === "CLIENT") {
    await db
      .insert(clientProfiles)
      .values({ user_id: authUser.id })
      .onConflictDoNothing({ target: clientProfiles.user_id });
  }
}

/** Sync a single auth user (e.g. from signUp response) to public.users. */
export async function syncUserToAppWithUser(authUser: AuthUser): Promise<void> {
  await syncUserFromAuthUser(authUser);
}

export async function syncUserToApp(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return;
  await syncUserFromAuthUser(authUser as AuthUser);
}

export async function getCurrentUserRole(): Promise<{
  userId: string;
  role: UserRole;
  status: string;
  needsOnboarding: boolean;
  city: string | null;
  country: string | null;
} | null> {
  const { verifyAdminSessionCookie } = await import("@/lib/admin-session");
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const adminSession = await verifyAdminSessionCookie(adminCookie);
  if (adminSession) {
    const [row] = await db
      .select({
        role: users.role,
        status: users.status,
        country: users.country,
        city: users.city,
      })
      .from(users)
      .where(eq(users.id, adminSession.userId));
    if (!row) return null;
    return {
      userId: adminSession.userId,
      role: row.role as UserRole,
      status: row.status ?? "ACTIVE",
      needsOnboarding: !row.country || !row.city,
      city: row.city ?? null,
      country: row.country ?? null,
    };
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  await syncUserToApp(supabase);

  const [row] = await db
    .select({ role: users.role, status: users.status, country: users.country, city: users.city })
    .from(users)
    .where(eq(users.id, authUser.id));

  if (!row) return null;

  const needsOnboarding = !row.country || !row.city;
  const status = row.status ?? "ACTIVE";

  return {
    userId: authUser.id,
    role: row.role as UserRole,
    status,
    needsOnboarding,
    city: row.city ?? null,
    country: row.country ?? null,
  };
}
