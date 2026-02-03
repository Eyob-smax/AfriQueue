"use server";

import { db } from "@/drizzle";
import { users, clientProfiles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

const VALID_ROLES = ["CLIENT", "STAFF", "ADMIN", "SUPER_ADMIN"] as const;
type UserRole = (typeof VALID_ROLES)[number];
const MAX_VARCHAR = 100;

export type AuthUserForSync = {
  id: string;
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  image?: string | null;
  role?: string | null;
};

function truncate(str: string | null | undefined, max: number): string | undefined {
  if (str == null || str === "") return undefined;
  const s = String(str).trim();
  return s.length > max ? s.slice(0, max) : s;
}

/**
 * Idempotent sync from Better Auth user to application users table.
 * Safe for OAuth (missing email/name), phone-only (email placeholder), and invited users.
 */
export async function syncAuthUserToAppUser(authUser: AuthUserForSync): Promise<void> {
  const rawRole = authUser.role ?? "CLIENT";
  const role: UserRole = VALID_ROLES.includes(rawRole as UserRole) ? (rawRole as UserRole) : "CLIENT";
  const email =
    authUser.email?.trim() ||
    (authUser.phoneNumber ? `${authUser.phoneNumber.replace(/\D/g, "")}@phone.arifqueue.local` : null);
  if (!email) return;

  const fullName =
    (authUser.name && authUser.name.trim()) || authUser.email?.split("@")[0] || authUser.phoneNumber || "User";
  const phone = (authUser.phoneNumber && authUser.phoneNumber.trim()) ? authUser.phoneNumber.trim() : "—";

  await db
    .insert(users)
    .values({
      id: authUser.id,
      full_name: fullName,
      email,
      phone,
      role,
      status: "ACTIVE",
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        full_name: fullName,
        email,
        phone,
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
