"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/drizzle";
import { users, roleRequests, clientProfiles } from "@/drizzle/schema";
import { createNotification } from "@/lib/actions/notifications";
import {
  createSignedAdminSession,
  ADMIN_SESSION_COOKIE,
} from "@/lib/admin-session";
import { verifyAdminPassword } from "@/lib/admin-password";
import { cookies } from "next/headers";
import { syncAuthUserToAppUser } from "@/lib/sync-app-user";
import { eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";

type UserRole = "CLIENT" | "STAFF" | "ADMIN" | "SUPER_ADMIN";

export type AuthResult = { error?: string };

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
    maxAge: 7 * 24 * 60 * 60,
  });
  redirect("/dashboard");
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  if (!email || !password) {
    return { error: "Email and password are required" };
  }
  try {
    const res = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
    const signInRes = res as { error?: { message?: string } };
    if (signInRes?.error) return { error: signInRes.error.message ?? "Invalid email or password" };
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user) {
      await syncAuthUserToAppUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        phoneNumber: (session.user as { phoneNumber?: string }).phoneNumber,
        image: session.user.image,
        role: (session.user as { role?: string }).role,
      });
    }
    const [row] = await db
      .select({ role: users.role, status: users.status })
      .from(users)
      .where(eq(users.email, email));
    if (row?.role === "STAFF" && row?.status !== "ACTIVE") {
      redirect("/auth/pending-approval");
    }
    redirect("/dashboard");
  } catch (err) {
    const digest = (err as { digest?: string })?.digest;
    if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) throw err;
    const msg = err instanceof Error ? err.message : String(err);
    const isAuthError = /invalid email or password|unauthorized|user not found|invalid credentials/i.test(msg);
    return { error: isAuthError ? "Invalid email or password" : msg || "Invalid email or password" };
  }
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const fullName =
    (formData.get("fullName") as string) || email?.split("@")[0] || "User";
  const country = (formData.get("country") as string)?.trim();
  const city = (formData.get("city") as string)?.trim();

  if (!email || !password) {
    return { error: "Email and password are required" };
  }
  if (!country || !city) {
    return { error: "Country and city are required" };
  }
  try {
    const res = await auth.api.signUpEmail({
      body: { email, password, name: fullName, role: "CLIENT" },
      headers: await headers(),
    });
    const signUpErr = (res as { error?: { message?: string } })?.error;
    if (signUpErr) return { error: signUpErr.message };
    const userId = (res as { user?: { id: string } })?.user?.id;
    if (userId) {
      const countryVal = country.length > 100 ? country.slice(0, 100) : country;
      const cityVal = city.length > 100 ? city.slice(0, 100) : city;
      await db
        .update(users)
        .set({ country: countryVal, city: cityVal })
        .where(eq(users.id, userId));
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isLengthOrTypeError =
      /value too long|character varying|varchar|exceeds maximum|truncat/i.test(message);
    const hint =
      process.env.NODE_ENV === "development" && isLengthOrTypeError
        ? " Run database migrations (npm run db:migrate) and try again."
        : "";
    return {
      error:
        process.env.NODE_ENV === "development"
          ? `Database error saving new user: ${message}${hint}`
          : isLengthOrTypeError
            ? "Database setup is incomplete. Please contact support or try again later."
            : "Database error saving new user. Please try again or contact support.",
    };
  }
  redirect("/auth/login?confirm_email=1");
}

export async function signUpStaff(formData: FormData): Promise<AuthResult> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const fullName = (formData.get("fullName") as string)?.trim() || "Staff";
  const phone = (formData.get("phone") as string)?.trim() || "";
  const healthCenterId = (formData.get("healthCenterId") as string)?.trim() || "";
  const healthCenterName = (formData.get("healthCenterName") as string)?.trim() || "";
  const healthCenterCountry = (formData.get("healthCenterCountry") as string)?.trim() || "";
  const healthCenterCity = (formData.get("healthCenterCity") as string)?.trim() || "";
  if (!email || !password) {
    return { error: "Email and password are required" };
  }
  if (!healthCenterId || !healthCenterCountry || !healthCenterCity) {
    return { error: "Please select a clinic, country, and city" };
  }
  const res = await auth.api.signUpEmail({
    body: { email, password, name: fullName, role: "STAFF" },
    headers: await headers(),
  });
  if ((res as { error?: { message: string } })?.error)
    return { error: (res as { error?: { message: string } }).error?.message };
  const userId = (res as { user?: { id: string } })?.user?.id;
  if (!userId) {
    return { error: "Account created but could not complete registration. Please contact support." };
  }
  try {
    await db
      .update(users)
      .set({ status: "PENDING_APPROVAL", phone: phone || "—" })
      .where(eq(users.id, userId));
    const [inserted] = await db
      .insert(roleRequests)
      .values({
        requester_id: userId,
        requested_role: "STAFF",
        status: "PENDING",
        health_center_id: healthCenterId || null,
        health_center_name: healthCenterName || null,
        health_center_country: healthCenterCountry || null,
        health_center_city: healthCenterCity || null,
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

export async function signOut(): Promise<never> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  await auth.api.signOut({ headers: await headers() });
  redirect("/auth/login");
}

export async function syncUserAfterPhoneAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return;
  await syncAuthUserToAppUser({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    phoneNumber: (session.user as { phoneNumber?: string }).phoneNumber,
    image: session.user.image,
    role: (session.user as { role?: string }).role,
  });
}

/** Sync a single auth user to public.users (e.g. after OAuth or phone verify). */
export async function syncUserToAppWithUser(authUser: {
  id: string;
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  role?: string | null;
}): Promise<void> {
  await syncAuthUserToAppUser(authUser);
}

export async function getCurrentUserRole(): Promise<{
  userId: string;
  role: UserRole;
  status: string;
  needsOnboarding: boolean;
  city: string | null;
  country: string | null;
} | null> {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const { verifyAdminSessionCookie } = await import("@/lib/admin-session");
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

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  await syncAuthUserToAppUser({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    phoneNumber: (session.user as { phoneNumber?: string }).phoneNumber,
    image: session.user.image,
    role: (session.user as { role?: string }).role,
  });

  const [row] = await db
    .select({ role: users.role, status: users.status, country: users.country, city: users.city })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!row) return null;

  let hasCompletedHealthProfile = true;
  if (row.role === "CLIENT") {
    const [profile] = await db
      .select({
        health_condition: clientProfiles.health_condition,
        health_history: clientProfiles.health_history,
        chronic_illnesses: clientProfiles.chronic_illnesses,
        blood_type: clientProfiles.blood_type,
        emergency_contact: clientProfiles.emergency_contact,
        any_disabilities: clientProfiles.any_disabilities,
      })
      .from(clientProfiles)
      .where(eq(clientProfiles.user_id, session.user.id));
    hasCompletedHealthProfile =
      !!profile &&
      (profile.health_condition != null ||
        profile.health_history != null ||
        profile.chronic_illnesses != null ||
        profile.blood_type != null ||
        profile.emergency_contact != null ||
        profile.any_disabilities === true);
  }

  const needsOnboarding =
    !row.country || !row.city || (row.role === "CLIENT" && !hasCompletedHealthProfile);

  return {
    userId: session.user.id,
    role: row.role as UserRole,
    status: row.status ?? "ACTIVE",
    needsOnboarding,
    city: row.city ?? null,
    country: row.country ?? null,
  };
}
