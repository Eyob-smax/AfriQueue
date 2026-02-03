"use server";

import { getSessionUser } from "@/lib/auth-session";
import { db } from "@/drizzle";
import {
  users,
  healthCenters,
  queues,
  reservations,
  staffProfiles,
} from "@/drizzle/schema";
import { eq, and, sql, max, inArray, desc, gte, lt } from "drizzle-orm";
import { emitToRoom } from "@/lib/socket-emit";
import { haversineKm } from "@/lib/geo";
import { createNotification } from "@/lib/actions/notifications";

export async function joinQueue(queueId: string): Promise<{ error?: string; reservationId?: string }> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { error: "Not authenticated" };

  const [maxNum] = await db
    .select({ n: max(reservations.queue_number) })
    .from(reservations)
    .where(eq(reservations.queue_id, queueId));
  const nextNumber = (maxNum?.n ?? 0) + 1;

  const [res] = await db
    .insert(reservations)
    .values({
      queue_id: queueId,
      client_id: sessionUser.id,
      queue_number: nextNumber,
      status: "PENDING",
    })
    .returning({ id: reservations.id, queue_number: reservations.queue_number });

  if (!res) return { error: "Failed to join queue" };

  const snapshot = await getQueueState(queueId);
  await emitToRoom(`queue:${queueId}`, "queue:joined", {
    reservationId: res.id,
    queueNumber: res.queue_number,
    clientId: sessionUser.id,
    snapshot,
  });
  await createNotification(
    sessionUser.id,
    "QUEUE_JOINED",
    res.id
  );

  return { reservationId: res.id };
}

export async function advanceQueue(reservationId: string): Promise<{ error?: string }> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { error: "Not authenticated" };

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
    .set({ status: "COMPLETED", completed_at: new Date() })
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
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { error: "Not authenticated" };

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
  client_phone?: string | null;
  client_email?: string | null;
};

export type StaffCenter = {
  health_center_id: string;
  health_center_name: string;
} | null;

export async function getStaffHealthCenter(): Promise<StaffCenter> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;
  const [row] = await db
    .select({
      health_center_id: staffProfiles.health_center_id,
      name: healthCenters.name,
    })
    .from(staffProfiles)
    .leftJoin(healthCenters, eq(staffProfiles.health_center_id, healthCenters.id))
    .where(eq(staffProfiles.user_id, sessionUser.id));
  if (!row?.health_center_id || !row.name) return null;
  return { health_center_id: row.health_center_id, health_center_name: row.name };
}

export type QueueForStaff = {
  id: string;
  service_type: string | null;
  queue_date: Date | null;
  status: string | null;
  count: number;
};

export async function getQueuesByHealthCenter(healthCenterId: string): Promise<QueueForStaff[]> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return [];
  const [staff] = await db
    .select({ health_center_id: staffProfiles.health_center_id })
    .from(staffProfiles)
    .where(eq(staffProfiles.user_id, sessionUser.id));
  if (!staff || staff.health_center_id !== healthCenterId) return [];
  const queueRows = await db
    .select({
      id: queues.id,
      service_type: queues.service_type,
      queue_date: queues.queue_date,
      status: queues.status,
    })
    .from(queues)
    .where(eq(queues.health_center_id, healthCenterId))
    .orderBy(queues.queue_date);
  const result: QueueForStaff[] = [];
  for (const q of queueRows) {
    const [c] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reservations)
      .where(
        and(
          eq(reservations.queue_id, q.id),
          inArray(reservations.status, ["PENDING", "CONFIRMED"])
        )
      );
    result.push({
      id: q.id,
      service_type: q.service_type,
      queue_date: q.queue_date,
      status: q.status ?? null,
      count: Number(c?.count ?? 0),
    });
  }
  return result;
}

export async function createQueue(healthCenterId: string, payload: {
  service_type?: string;
  queue_date: Date;
  max_capacity?: number;
  status?: string;
}): Promise<{ error?: string; queueId?: string }> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { error: "Not authenticated" };
  const [staff] = await db
    .select({ health_center_id: staffProfiles.health_center_id })
    .from(staffProfiles)
    .where(eq(staffProfiles.user_id, sessionUser.id));
  if (!staff || staff.health_center_id !== healthCenterId) return { error: "Forbidden" };
  const [inserted] = await db
    .insert(queues)
    .values({
      health_center_id: healthCenterId,
      service_type: payload.service_type ?? null,
      queue_date: payload.queue_date,
      max_capacity: payload.max_capacity ?? null,
      status: payload.status ?? "ACTIVE",
    })
    .returning({ id: queues.id });
  if (!inserted) return { error: "Failed to create queue" };
  return { queueId: inserted.id };
}

export async function updateQueue(queueId: string, payload: {
  service_type?: string;
  max_capacity?: number;
  status?: string;
  queue_date?: Date;
}): Promise<{ error?: string }> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { error: "Not authenticated" };
  const [q] = await db.select({ health_center_id: queues.health_center_id }).from(queues).where(eq(queues.id, queueId));
  if (!q) return { error: "Queue not found" };
  const [staff] = await db
    .select({ health_center_id: staffProfiles.health_center_id })
    .from(staffProfiles)
    .where(eq(staffProfiles.user_id, sessionUser.id));
  if (!staff || staff.health_center_id !== q.health_center_id) return { error: "Forbidden" };
  await db
    .update(queues)
    .set({
      ...(payload.service_type !== undefined && { service_type: payload.service_type }),
      ...(payload.max_capacity !== undefined && { max_capacity: payload.max_capacity }),
      ...(payload.status !== undefined && { status: payload.status }),
      ...(payload.queue_date !== undefined && { queue_date: payload.queue_date }),
    })
    .where(eq(queues.id, queueId));
  return {};
}

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
      phone: users.phone,
      email: users.email,
    })
    .from(reservations)
    .leftJoin(users, eq(reservations.client_id, users.id))
    .where(
      and(
        eq(reservations.queue_id, queueId),
        inArray(reservations.status, ["PENDING", "CONFIRMED"])
      )
    )
    .orderBy(desc(reservations.created_at));

  if (rows.length === 0) {
    const [q] = await db.select().from(queues).where(eq(queues.id, queueId));
    if (!q) return null;
    return { queueId, reservations: [], count: 0 };
  }

  const reservationsList: QueueReservation[] = rows.map((r) => ({
    id: r.id,
    queue_id: r.queue_id ?? queueId,
    client_id: r.client_id ?? "",
    queue_number: r.queue_number,
    status: r.status ?? "PENDING",
    created_at: r.created_at,
    client_name: r.full_name ?? undefined,
    client_phone: r.phone ?? undefined,
    client_email: r.email ?? undefined,
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

export async function getHealthCentersByCity(
  city: string,
  country?: string | null
): Promise<HealthCenterWithQueues[]> {
  const conditions = country
    ? and(eq(healthCenters.city, city), eq(healthCenters.country, country))
    : eq(healthCenters.city, city);
  const centers = await db
    .select()
    .from(healthCenters)
    .where(conditions);

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
    const byCity = await getHealthCentersByCity(city, undefined);
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

// --- Staff clinic analytics (real DB data) ---

export type StaffClinicInsights = {
  avgWaitMinutes: number;
  avgWaitTrendPercent: number | null;
  patientsSeenToday: number;
  patientsSeenTrendPercent: number | null;
  peakTrafficByHour: { hour: number; count: number }[];
};

const ZERO_INSIGHTS: StaffClinicInsights = {
  avgWaitMinutes: 0,
  avgWaitTrendPercent: null,
  patientsSeenToday: 0,
  patientsSeenTrendPercent: null,
  peakTrafficByHour: [],
};

export async function getStaffClinicInsights(
  healthCenterId: string | null
): Promise<StaffClinicInsights> {
  if (!healthCenterId) return ZERO_INSIGHTS;

  const queueRows = await db
    .select({ id: queues.id })
    .from(queues)
    .where(eq(queues.health_center_id, healthCenterId));
  const queueIds = queueRows.map((q) => q.id);
  if (queueIds.length === 0) return ZERO_INSIGHTS;

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1);

  // Today: count COMPLETED and avg wait
  const todayCompleted = await db
    .select({
      count: sql<number>`count(*)::int`,
      avgMinutes: sql<number>`coalesce(avg(extract(epoch from (${reservations.completed_at} - ${reservations.created_at}))/60), 0)`,
    })
    .from(reservations)
    .where(
      and(
        inArray(reservations.queue_id, queueIds),
        eq(reservations.status, "COMPLETED"),
        gte(reservations.completed_at, todayStart),
        lt(reservations.completed_at, todayEnd)
      )
    );
  const todayCount = Number(todayCompleted[0]?.count ?? 0);
  const todayAvg = Number(todayCompleted[0]?.avgMinutes ?? 0);

  // Yesterday: count and avg for trend
  const yesterdayCompleted = await db
    .select({
      count: sql<number>`count(*)::int`,
      avgMinutes: sql<number>`coalesce(avg(extract(epoch from (${reservations.completed_at} - ${reservations.created_at}))/60), 0)`,
    })
    .from(reservations)
    .where(
      and(
        inArray(reservations.queue_id, queueIds),
        eq(reservations.status, "COMPLETED"),
        gte(reservations.completed_at, yesterdayStart),
        lt(reservations.completed_at, todayStart)
      )
    );
  const yesterdayCount = Number(yesterdayCompleted[0]?.count ?? 0);
  const yesterdayAvg = Number(yesterdayCompleted[0]?.avgMinutes ?? 0);

  let avgWaitTrendPercent: number | null = null;
  if (yesterdayAvg > 0) {
    avgWaitTrendPercent = Math.round(((todayAvg - yesterdayAvg) / yesterdayAvg) * 100);
  }
  let patientsSeenTrendPercent: number | null = null;
  if (yesterdayCount > 0) {
    patientsSeenTrendPercent = Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);
  }

  // Peak traffic by hour (last 7 days, use created_at)
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
  const hourRows = await db
    .select({
      hour: sql<number>`extract(hour from ${reservations.created_at})::int`,
      count: sql<number>`count(*)::int`,
    })
    .from(reservations)
    .where(
      and(
        inArray(reservations.queue_id, queueIds),
        gte(reservations.created_at, sevenDaysAgo)
      )
    )
    .groupBy(sql`extract(hour from ${reservations.created_at})`);

  const hourMap = new Map<number, number>();
  for (const row of hourRows) {
    const h = Number(row.hour ?? 0);
    hourMap.set(h, (hourMap.get(h) ?? 0) + Number(row.count ?? 0));
  }
  const peakTrafficByHour = [8, 10, 12, 14, 16, 18].map((hour) => ({
    hour,
    count: hourMap.get(hour) ?? 0,
  }));

  return {
    avgWaitMinutes: Math.round(todayAvg * 10) / 10,
    avgWaitTrendPercent,
    patientsSeenToday: todayCount,
    patientsSeenTrendPercent,
    peakTrafficByHour,
  };
}

export type StaffPatientLogEntry = {
  id: string;
  client_name: string | null;
  queue_service: string | null;
  queue_date: Date | null;
  status: string | null;
  created_at: Date | null;
};

export async function getStaffPatientLogs(
  healthCenterId: string | null,
  limit = 50
): Promise<StaffPatientLogEntry[]> {
  if (!healthCenterId) return [];

  const queueRows = await db
    .select({ id: queues.id })
    .from(queues)
    .where(eq(queues.health_center_id, healthCenterId));
  const queueIds = queueRows.map((q) => q.id);
  if (queueIds.length === 0) return [];

  const rows = await db
    .select({
      id: reservations.id,
      full_name: users.full_name,
      service_type: queues.service_type,
      queue_date: queues.queue_date,
      status: reservations.status,
      created_at: reservations.created_at,
    })
    .from(reservations)
    .innerJoin(queues, eq(reservations.queue_id, queues.id))
    .leftJoin(users, eq(reservations.client_id, users.id))
    .where(inArray(reservations.queue_id, queueIds))
    .orderBy(desc(reservations.created_at))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    client_name: r.full_name ?? null,
    queue_service: r.service_type ?? null,
    queue_date: r.queue_date ?? null,
    status: r.status ?? null,
    created_at: r.created_at ?? null,
  }));
}
