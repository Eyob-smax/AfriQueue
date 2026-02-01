"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/drizzle";
import {
  users,
  healthCenters,
  queues,
  reservations,
} from "@/drizzle/schema";
import { eq, and, sql, max, inArray } from "drizzle-orm";
import { emitToRoom } from "@/lib/socket-emit";
import { haversineKm } from "@/lib/geo";
import { createNotification } from "@/lib/actions/notifications";

export async function joinQueue(queueId: string): Promise<{ error?: string; reservationId?: string }> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { error: "Not authenticated" };

  const [maxNum] = await db
    .select({ n: max(reservations.queue_number) })
    .from(reservations)
    .where(eq(reservations.queue_id, queueId));
  const nextNumber = (maxNum?.n ?? 0) + 1;

  const [res] = await db
    .insert(reservations)
    .values({
      queue_id: queueId,
      client_id: authUser.id,
      queue_number: nextNumber,
      status: "PENDING",
    })
    .returning({ id: reservations.id, queue_number: reservations.queue_number });

  if (!res) return { error: "Failed to join queue" };

  const snapshot = await getQueueState(queueId);
  await emitToRoom(`queue:${queueId}`, "queue:joined", {
    reservationId: res.id,
    queueNumber: res.queue_number,
    clientId: authUser.id,
    snapshot,
  });
  await createNotification(
    authUser.id,
    "QUEUE_JOINED",
    res.id
  );

  return { reservationId: res.id };
}

export async function advanceQueue(reservationId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { error: "Not authenticated" };

  const [res] = await db
    .select({ queue_id: reservations.queue_id })
    .from(reservations)
    .where(eq(reservations.id, reservationId));
  if (!res) return { error: "Reservation not found" };

  const [reservationRow] = await db
    .select({ client_id: reservations.client_id })
    .from(reservations)
    .where(eq(reservations.id, reservationId));

  await db
    .update(reservations)
    .set({ status: "COMPLETED" })
    .where(eq(reservations.id, reservationId));

  const snapshot = await getQueueState(res.queue_id!);
  await emitToRoom(`queue:${res.queue_id}`, "queue:advanced", { snapshot });
  if (reservationRow?.client_id) {
    await createNotification(
      reservationRow.client_id,
      "QUEUE_COMPLETED",
      reservationId
    );
  }

  return {};
}

export async function cancelReservation(reservationId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { error: "Not authenticated" };

  const [res] = await db
    .select({ queue_id: reservations.queue_id })
    .from(reservations)
    .where(eq(reservations.id, reservationId));
  if (!res) return { error: "Reservation not found" };

  await db
    .update(reservations)
    .set({ status: "CANCELLED" })
    .where(eq(reservations.id, reservationId));

  const snapshot = await getQueueState(res.queue_id!);
  await emitToRoom(`queue:${res.queue_id}`, "queue:advanced", { snapshot });

  return {};
}

export type QueueReservation = {
  id: string;
  queue_id: string;
  client_id: string;
  queue_number: number | null;
  status: string;
  created_at: Date | null;
  client_name?: string;
};

export type QueueState = {
  queueId: string;
  reservations: QueueReservation[];
  count: number;
};

export async function getQueueState(queueId: string): Promise<QueueState | null> {
  const rows = await db
    .select({
      id: reservations.id,
      queue_id: reservations.queue_id,
      client_id: reservations.client_id,
      queue_number: reservations.queue_number,
      status: reservations.status,
      created_at: reservations.created_at,
      full_name: users.full_name,
    })
    .from(reservations)
    .leftJoin(users, eq(reservations.client_id, users.id))
    .where(
      and(
        eq(reservations.queue_id, queueId),
        inArray(reservations.status, ["PENDING", "CONFIRMED"])
      )
    )
    .orderBy(reservations.queue_number);

  if (rows.length === 0) {
    const [q] = await db.select().from(queues).where(eq(queues.id, queueId));
    if (!q) return null;
    return { queueId, reservations: [], count: 0 };
  }

  const reservationsList: QueueReservation[] = rows.map((r) => ({
    id: r.id,
    queue_id: r.queue_id,
    client_id: r.client_id ?? "",
    queue_number: r.queue_number,
    status: r.status ?? "PENDING",
    created_at: r.created_at,
    client_name: r.full_name ?? undefined,
  }));

  return {
    queueId,
    reservations: reservationsList,
    count: reservationsList.length,
  };
}

export type HealthCenterWithQueues = {
  id: string;
  name: string;
  city: string;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  status: string | null;
  queues: { id: string; service_type: string | null; queue_date: Date | null; count: number }[];
};

export async function getHealthCentersByCity(city: string): Promise<HealthCenterWithQueues[]> {
  const centers = await db
    .select()
    .from(healthCenters)
    .where(eq(healthCenters.city, city));

  const result: HealthCenterWithQueues[] = [];
  for (const hc of centers) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const queueRows = await db
      .select({
        id: queues.id,
        service_type: queues.service_type,
        queue_date: queues.queue_date,
      })
      .from(queues)
      .where(eq(queues.health_center_id, hc.id));

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

    result.push({
      id: hc.id,
      name: hc.name,
      city: hc.city,
      address: hc.address ?? null,
      latitude: hc.latitude,
      longitude: hc.longitude,
      status: hc.status,
      queues: queuesWithCount,
    });
  }
  return result;
}

export type NearbyCenter = HealthCenterWithQueues & { distanceKm?: number };

export async function getNearbyHealthCenters(
  userLat?: number,
  userLng?: number,
  city?: string
): Promise<NearbyCenter[]> {
  if (city) {
    const byCity = await getHealthCentersByCity(city);
    if (userLat != null && userLng != null) {
      return byCity
        .map((hc) => {
          const lat = hc.latitude ? parseFloat(hc.latitude) : null;
          const lng = hc.longitude ? parseFloat(hc.longitude) : null;
          const distanceKm =
            lat != null && lng != null
              ? haversineKm(userLat, userLng, lat, lng)
              : undefined;
          return { ...hc, distanceKm };
        })
        .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    }
    return byCity;
  }

  if (userLat == null || userLng == null) return [];

  const allCenters = await db
    .select()
    .from(healthCenters)
    .where(
      sql`${healthCenters.latitude} IS NOT NULL AND ${healthCenters.longitude} IS NOT NULL`
    );

  const withDistance: NearbyCenter[] = allCenters.map((hc) => {
    const lat = hc.latitude ? parseFloat(hc.latitude) : null;
    const lng = hc.longitude ? parseFloat(hc.longitude) : null;
    const distanceKm =
      lat != null && lng != null
        ? haversineKm(userLat, userLng, lat, lng)
        : undefined;
    const queuesWithCount: HealthCenterWithQueues["queues"] = [];
    return {
      id: hc.id,
      name: hc.name,
      city: hc.city,
      address: hc.address ?? null,
      latitude: hc.latitude,
      longitude: hc.longitude,
      status: hc.status,
      queues: queuesWithCount,
      distanceKm,
    };
  });

  withDistance.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));

  for (const hc of withDistance) {
    const queueRows = await db
      .select({
        id: queues.id,
        service_type: queues.service_type,
        queue_date: queues.queue_date,
      })
      .from(queues)
      .where(eq(queues.health_center_id, hc.id));
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
    hc.queues = queuesWithCount;
  }

  return withDistance;
}
