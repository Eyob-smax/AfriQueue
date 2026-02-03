"use server";

import { getSessionUser } from "@/lib/auth-session";
import { db } from "@/drizzle";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function updateUserLocation(country: string, city: string): Promise<{ error?: string }> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { error: "Not authenticated" };

  await db
    .update(users)
    .set({ country, city })
    .where(eq(users.id, sessionUser.id));

  return {};
}
