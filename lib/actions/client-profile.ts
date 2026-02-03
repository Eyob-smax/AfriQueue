"use server";

import { getSessionUser } from "@/lib/auth-session";
import { db } from "@/drizzle";
import { clientProfiles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export type UpdateClientProfileResult = { error?: string };

export async function updateClientProfile(formData: FormData): Promise<UpdateClientProfileResult> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { error: "Not authenticated" };

  const healthCondition = (formData.get("health_condition") as string)?.trim() || null;
  const healthHistory = (formData.get("health_history") as string)?.trim() || null;
  const chronicIllnesses = (formData.get("chronic_illnesses") as string)?.trim() || null;
  const bloodType = (formData.get("blood_type") as string)?.trim() || null;
  const emergencyContact = (formData.get("emergency_contact") as string)?.trim() || null;
  const anyDisabilities = formData.get("any_disabilities") === "true" || formData.get("any_disabilities") === "on";

  const bloodTypeVal = bloodType && bloodType.length > 5 ? bloodType.slice(0, 5) : bloodType;

  await db
    .insert(clientProfiles)
    .values({
      user_id: sessionUser.id,
      health_condition: healthCondition,
      health_history: healthHistory,
      chronic_illnesses: chronicIllnesses,
      blood_type: bloodTypeVal,
      emergency_contact: emergencyContact,
      any_disabilities: anyDisabilities,
    })
    .onConflictDoUpdate({
      target: clientProfiles.user_id,
      set: {
        health_condition: healthCondition,
        health_history: healthHistory,
        chronic_illnesses: chronicIllnesses,
        blood_type: bloodTypeVal,
        emergency_contact: emergencyContact,
        any_disabilities: anyDisabilities,
      },
    });

  return {};
}
