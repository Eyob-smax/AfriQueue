"use server";

import { getSessionUser } from "@/lib/auth-session";
import { db } from "@/drizzle";
import { healthCenters, staffProfiles, queues, reservations } from "@/drizzle/schema";
import { eq, and, inArray, sql } from "drizzle-orm";

export type HealthCenterForStaff = {
  id: string;
  name: string;
  city: string;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  description: string | null;
  services: string | null;
  specialties: string[] | null;
  operating_status: string | null;
  queue_availability: boolean | null;
  status: string | null;
};

export async function getHealthCenterForStaff(): Promise<HealthCenterForStaff | null> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;
  const [staff] = await db
    .select({ health_center_id: staffProfiles.health_center_id })
    .from(staffProfiles)
    .where(eq(staffProfiles.user_id, sessionUser.id));
  if (!staff?.health_center_id) return null;
  const [hc] = await db
    .select()
    .from(healthCenters)
    .where(eq(healthCenters.id, staff.health_center_id));
  if (!hc) return null;
  return {
    id: hc.id,
    name: hc.name,
    city: hc.city,
    address: hc.address ?? null,
    latitude: hc.latitude ?? null,
    longitude: hc.longitude ?? null,
    description: hc.description ?? null,
    services: hc.services ?? null,
    specialties: hc.specialties ?? null,
    operating_status: hc.operating_status ?? null,
    queue_availability: hc.queue_availability ?? null,
    status: hc.status ?? null,
  };
}

export async function updateHealthCenter(payload: {
  name?: string;
  city?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  description?: string;
  services?: string;
  specialties?: string[];
  operating_status?: string;
  queue_availability?: boolean;
}): Promise<{ error?: string }> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { error: "Not authenticated" };
  const [staff] = await db
    .select({ health_center_id: staffProfiles.health_center_id })
    .from(staffProfiles)
    .where(eq(staffProfiles.user_id, sessionUser.id));
  if (!staff?.health_center_id) return { error: "No health center assigned" };
  await db
    .update(healthCenters)
    .set({
      ...(payload.name !== undefined && { name: payload.name.trim() }),
      ...(payload.city !== undefined && { city: payload.city.trim() }),
      ...(payload.address !== undefined && { address: payload.address.trim() || null }),
      ...(payload.latitude !== undefined && { latitude: payload.latitude || null }),
      ...(payload.longitude !== undefined && { longitude: payload.longitude || null }),
      ...(payload.description !== undefined && { description: payload.description?.trim() || null }),
      ...(payload.services !== undefined && { services: payload.services?.trim() || null }),
      ...(payload.specialties !== undefined && { specialties: payload.specialties?.length ? payload.specialties : null }),
      ...(payload.operating_status !== undefined && { operating_status: payload.operating_status }),
      ...(payload.queue_availability !== undefined && { queue_availability: payload.queue_availability }),
    })
    .where(eq(healthCenters.id, staff.health_center_id));
  return {};
}

/** Public: get a single health center by id (for client clinic detail page). Returns null if not found or blocked. */
export type HealthCenterPublic = {
  id: string;
  name: string;
  city: string;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  description: string | null;
  services: string | null;
  specialties: string[] | null;
  operating_status: string | null;
  queue_availability: boolean | null;
  status: string | null;
  queues: { id: string; service_type: string | null; queue_date: Date | null; count: number }[];
};

export async function getHealthCenterById(id: string): Promise<HealthCenterPublic | null> {
  const [hc] = await db
    .select()
    .from(healthCenters)
    .where(eq(healthCenters.id, id));
  if (!hc || hc.is_blocked) return null;

  const queueRows = await db
    .select({
      id: queues.id,
      service_type: queues.service_type,
      queue_date: queues.queue_date,
    })
    .from(queues)
    .where(eq(queues.health_center_id, id));

  const queuesWithCount = await Promise.all(
    queueRows.map(async (q) => {
      const [c] = await db
        .select({ count: sql<number>`count(*)` })
        .from(reservations)
        .where(
          and(
            eq(reservations.queue_id, q.id),
            inArray(reservations.status, ["PENDING", "CONFIRMED"])
          )
        );
      return {
        id: q.id,
        service_type: q.service_type,
        queue_date: q.queue_date,
        count: Number(c?.count ?? 0),
      };
    })
  );

  return {
    id: hc.id,
    name: hc.name,
    city: hc.city,
    address: hc.address ?? null,
    latitude: hc.latitude ?? null,
    longitude: hc.longitude ?? null,
    description: hc.description ?? null,
    services: hc.services ?? null,
    specialties: hc.specialties ?? null,
    operating_status: hc.operating_status ?? null,
    queue_availability: hc.queue_availability ?? null,
    status: hc.status ?? null,
    queues: queuesWithCount,
  };
}
