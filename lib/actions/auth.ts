"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/drizzle";
import { users, clientProfiles } from "@/drizzle/schema";

type UserRole = "CLIENT" | "STAFF" | "ADMIN" | "SUPER_ADMIN";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export type AuthResult = { error?: string };

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
  redirect("/dashboard");
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = (formData.get("fullName") as string) || email?.split("@")[0] || "User";
  const phone = (formData.get("phone") as string) || "";
  if (!email || !password) {
    return { error: "Email and password are required" };
  }
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone, role: "CLIENT" },
    },
  });
  if (error) return { error: error.message };
  await syncUserToApp(supabase);
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export async function syncUserAfterPhoneAuth() {
  const supabase = await createClient();
  await syncUserToApp(supabase);
}

export async function syncUserToApp(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return;

  const metadata = authUser.user_metadata || {};
  const fullName =
    metadata.full_name || metadata.name || metadata.given_name || authUser.email?.split("@")[0] || authUser.phone || "User";
  const phone = metadata.phone || authUser.phone || "";
  const role = (metadata.role as UserRole) || "CLIENT";
  const email = authUser.email ?? (authUser.phone ? `${authUser.phone}@phone.africare.local` : null);
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
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        full_name: fullName,
        email,
        phone: phone || authUser.phone || "—",
        role,
      },
    });

  if (role === "CLIENT") {
    await db
      .insert(clientProfiles)
      .values({ user_id: authUser.id })
      .onConflictDoNothing({ target: clientProfiles.user_id });
  }
}

export async function getCurrentUserRole(): Promise<{
  userId: string;
  role: UserRole;
  needsOnboarding: boolean;
  city: string | null;
  country: string | null;
} | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  await syncUserToApp(supabase);

  const [row] = await db
    .select({ role: users.role, country: users.country, city: users.city })
    .from(users)
    .where(eq(users.id, authUser.id));

  if (!row) return null;

  const needsOnboarding = !row.country || !row.city;

  return {
    userId: authUser.id,
    role: row.role as UserRole,
    needsOnboarding,
    city: row.city ?? null,
    country: row.country ?? null,
  };
}
