"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/drizzle";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function updateUserLocation(country: string, city: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { error: "Not authenticated" };

  await db
    .update(users)
    .set({ country, city })
    .where(eq(users.id, authUser.id));

  return {};
}
