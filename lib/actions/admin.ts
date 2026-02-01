"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/drizzle";
import {
  users,
  healthCenters,
  queues,
  reservations,
  roleRequests,
  staffProfiles,
  auditLogs,
} from "@/drizzle/schema";
import { eq, and, sql, desc, inArray } from "drizzle-orm";
import { createNotification } from "@/lib/actions/notifications";
import {
  sendStaffApproved,
  sendStaffRejected,
  sendAccountBlockedOrActivated,
} from "@/lib/email";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { error: "Not authenticated", adminId: null as string | null };
  const [row] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, authUser.id));
  if (!row || (row.role !== "ADMIN" && row.role !== "SUPER_ADMIN")) {
    return { error: "Forbidden", adminId: null as string | null };
  }
  return { error: null, adminId: authUser.id };
}

function writeAudit(adminId: string, action: string, targetType: string, targetId: string | null, details: string | null) {
  return db.insert(auditLogs).values({
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    details,
  });
}

export type PendingStaffRequest = {
  id: string;
  requester_id: string;
  status: string;
  health_center_name: string | null;
  health_center_description: string | null;
  health_center_location: string | null;
  health_center_country: string | null;
  created_at: Date | null;
  requester_email: string;
  requester_name: string;
  requester_phone: string;
};

export async function getPendingStaff(): Promise<PendingStaffRequest[]> {
  const { adminId } = await requireAdmin();
  if (!adminId) return [];

  const rows = await db
    .select({
      id: roleRequests.id,
      requester_id: roleRequests.requester_id,
      status: roleRequests.status,
      health_center_name: roleRequests.health_center_name,
      health_center_description: roleRequests.health_center_description,
      health_center_location: roleRequests.health_center_location,
      health_center_country: roleRequests.health_center_country,
      created_at: roleRequests.created_at,
      email: users.email,
      full_name: users.full_name,
      phone: users.phone,
    })
    .from(roleRequests)
    .innerJoin(users, eq(roleRequests.requester_id, users.id))
    .where(
      and(
        eq(roleRequests.requested_role, "STAFF"),
        eq(roleRequests.status, "PENDING")
      )
    )
    .orderBy(desc(roleRequests.created_at));

  return rows.map((r) => ({
    id: r.id,
    requester_id: r.requester_id!,
    status: r.status ?? "PENDING",
    health_center_name: r.health_center_name,
    health_center_description: r.health_center_description,
    health_center_location: r.health_center_location,
    health_center_country: r.health_center_country ?? null,
    created_at: r.created_at,
    requester_email: r.email ?? "",
    requester_name: r.full_name ?? "",
    requester_phone: r.phone ?? "",
  }));
}

export async function approveStaff(requestId: string): Promise<{ error?: string }> {
  const { error, adminId: aid } = await requireAdmin();
  if (error || !aid) return { error: error ?? "Forbidden" };

  const [req] = await db
    .select()
    .from(roleRequests)
    .where(eq(roleRequests.id, requestId));
  if (!req || req.status !== "PENDING" || req.requested_role !== "STAFF") {
    return { error: "Request not found or already processed" };
  }

  const userId = req.requester_id;

  let healthCenterId: string | null = null;
  const hcName = req.health_center_name?.trim() || "New Health Center";
  const [existingHc] = await db
    .select({ id: healthCenters.id })
    .from(healthCenters)
    .where(eq(healthCenters.name, hcName))
    .limit(1);
  if (existingHc) {
    healthCenterId = existingHc.id;
  } else {
    const [inserted] = await db
      .insert(healthCenters)
      .values({
        name: hcName,
        city: req.health_center_location ?? "Nairobi",
        address: req.health_center_location ?? null,
        description: req.health_center_description ?? null,
        status: "OPEN",
      })
      .returning({ id: healthCenters.id });
    healthCenterId = inserted?.id ?? null;
  }

  const now = new Date();
  await db
    .update(roleRequests)
    .set({
      status: "APPROVED",
      reviewed_by: aid,
      reviewed_at: now,
    })
    .where(eq(roleRequests.id, requestId));

  await db
    .update(users)
    .set({ status: "ACTIVE" })
    .where(eq(users.id, userId));

  await db
    .insert(staffProfiles)
    .values({
      user_id: userId,
      health_center_id: healthCenterId,
      approved_date: now,
    })
    .onConflictDoUpdate({
      target: staffProfiles.user_id,
      set: {
        health_center_id: healthCenterId,
        approved_date: now,
      },
    });

  await createNotification(userId, "STAFF_APPROVED", requestId);
  const [staffUser] = await db.select({ email: users.email, full_name: users.full_name }).from(users).where(eq(users.id, userId));
  if (staffUser?.email) {
    await sendStaffApproved(staffUser.email, staffUser.full_name ?? "Staff");
  }
  await writeAudit(aid, "approve_staff", "role_request", requestId, userId);
  return {};
}

export async function rejectStaff(requestId: string): Promise<{ error?: string }> {
  const { error, adminId: aid } = await requireAdmin();
  if (error || !aid) return { error: error ?? "Forbidden" };

  const [req] = await db
    .select({ requester_id: roleRequests.requester_id })
    .from(roleRequests)
    .where(eq(roleRequests.id, requestId));
  if (!req || req.requester_id === null) return { error: "Request not found" };

  await db
    .update(roleRequests)
    .set({
      status: "REJECTED",
      reviewed_by: aid,
      reviewed_at: new Date(),
    })
    .where(eq(roleRequests.id, requestId));

  await createNotification(req.requester_id, "STAFF_REJECTED", requestId);
  const [staffUser] = await db
    .select({ email: users.email, full_name: users.full_name })
    .from(users)
    .where(eq(users.id, req.requester_id));
  if (staffUser?.email) {
    await sendStaffRejected(staffUser.email, staffUser.full_name ?? "Staff");
  }
  await writeAudit(aid!, "reject_staff", "role_request", requestId, null);
  return {};
}

export type HealthCenterRow = {
  id: string;
  name: string;
  city: string;
  address: string | null;
  status: string | null;
  is_blocked: boolean | null;
};

export async function getHealthCentersForAdmin(): Promise<HealthCenterRow[]> {
  const { adminId } = await requireAdmin();
  if (!adminId) return [];

  const rows = await db.select().from(healthCenters).orderBy(healthCenters.name);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    city: r.city,
    address: r.address ?? null,
    status: r.status ?? null,
    is_blocked: r.is_blocked ?? false,
  }));
}

export async function blockCenter(healthCenterId: string): Promise<{ error?: string }> {
  const { error, adminId: aid } = await requireAdmin();
  if (error || !aid) return { error: error ?? "Forbidden" };

  await db
    .update(healthCenters)
    .set({ is_blocked: true })
    .where(eq(healthCenters.id, healthCenterId));
  await writeAudit(aid, "block_center", "health_center", healthCenterId, null);
  return {};
}

export async function unblockCenter(healthCenterId: string): Promise<{ error?: string }> {
  const { error, adminId: aid } = await requireAdmin();
  if (error || !aid) return { error: error ?? "Forbidden" };

  await db
    .update(healthCenters)
    .set({ is_blocked: false })
    .where(eq(healthCenters.id, healthCenterId));
  await writeAudit(aid, "unblock_center", "health_center", healthCenterId, null);
  return {};
}

export async function createHealthCenter(formData: {
  name: string;
  city: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  description?: string;
}): Promise<{ error?: string; id?: string }> {
  const { error, adminId: aid } = await requireAdmin();
  if (error || !aid) return { error: error ?? "Forbidden" };

  const [inserted] = await db
    .insert(healthCenters)
    .values({
      name: formData.name.trim(),
      city: formData.city.trim(),
      address: formData.address?.trim() ?? null,
      latitude: formData.latitude ?? null,
      longitude: formData.longitude ?? null,
      description: formData.description?.trim() ?? null,
      status: "OPEN",
    })
    .returning({ id: healthCenters.id });

  if (inserted) {
    await writeAudit(aid, "create_center", "health_center", inserted.id, formData.name);
    return { id: inserted.id };
  }
  return { error: "Failed to create" };
}

export type StaffListItem = {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string | null;
  health_center_id: string | null;
  health_center_name: string | null;
};

export async function getStaffList(): Promise<StaffListItem[]> {
  const { adminId } = await requireAdmin();
  if (!adminId) return [];

  const rows = await db
    .select({
      user_id: users.id,
      full_name: users.full_name,
      email: users.email,
      phone: users.phone,
      status: users.status,
      health_center_id: staffProfiles.health_center_id,
      health_center_name: healthCenters.name,
    })
    .from(users)
    .leftJoin(staffProfiles, eq(users.id, staffProfiles.user_id))
    .leftJoin(healthCenters, eq(staffProfiles.health_center_id, healthCenters.id))
    .where(eq(users.role, "STAFF"))
    .orderBy(users.full_name);

  return rows.map((r) => ({
    user_id: r.user_id,
    full_name: r.full_name,
    email: r.email,
    phone: r.phone,
    status: r.status ?? null,
    health_center_id: r.health_center_id ?? null,
    health_center_name: r.health_center_name ?? null,
  }));
}

export async function setStaffStatus(userId: string, status: "ACTIVE" | "SUSPENDED"): Promise<{ error?: string }> {
  const { error, adminId: aid } = await requireAdmin();
  if (error || !aid) return { error: error ?? "Forbidden" };

  const [target] = await db.select({ email: users.email, full_name: users.full_name }).from(users).where(eq(users.id, userId));
  await db.update(users).set({ status }).where(eq(users.id, userId));
  await createNotification(userId, status === "SUSPENDED" ? "ACCOUNT_BLOCKED" : "ACCOUNT_ACTIVATED", userId);
  if (target?.email) {
    await sendAccountBlockedOrActivated(
      target.email,
      target.full_name ?? "User",
      status === "SUSPENDED" ? "blocked" : "activated"
    );
  }
  await writeAudit(aid, status === "ACTIVE" ? "activate_staff" : "deactivate_staff", "user", userId, null);
  return {};
}

export type AdminOverview = {
  healthCentersCount: number;
  staffCount: number;
  reservationsCount: number;
  queuesCount: number;
};

export async function getAdminOverview(): Promise<AdminOverview | null> {
  const { adminId } = await requireAdmin();
  if (!adminId) return null;

  const [hcCount] = await db.select({ count: sql<number>`count(*)` }).from(healthCenters);
  const [staffCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(and(eq(users.role, "STAFF"), eq(users.status, "ACTIVE")));
  const [resCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(reservations)
    .where(inArray(reservations.status, ["PENDING", "CONFIRMED"]));
  const [qCount] = await db.select({ count: sql<number>`count(*)` }).from(queues);

  return {
    healthCentersCount: Number(hcCount?.count ?? 0),
    staffCount: Number(staffCount?.count ?? 0),
    reservationsCount: Number(resCount?.count ?? 0),
    queuesCount: Number(qCount?.count ?? 0),
  };
}

export type QueueSummary = {
  id: string;
  health_center_id: string | null;
  health_center_name: string | null;
  service_type: string | null;
  queue_date: Date | null;
  status: string | null;
  count: number;
};

export async function getQueuesByCenterForAdmin(): Promise<QueueSummary[]> {
  const { adminId } = await requireAdmin();
  if (!adminId) return [];

  const queueRows = await db
    .select({
      id: queues.id,
      health_center_id: queues.health_center_id,
      service_type: queues.service_type,
      queue_date: queues.queue_date,
      status: queues.status,
      name: healthCenters.name,
    })
    .from(queues)
    .leftJoin(healthCenters, eq(queues.health_center_id, healthCenters.id));

  const result: QueueSummary[] = [];
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
      health_center_id: q.health_center_id,
      health_center_name: q.name ?? null,
      service_type: q.service_type,
      queue_date: q.queue_date,
      status: q.status ?? null,
      count: Number(c?.count ?? 0),
    });
  }
  return result;
}

export type AuditEntry = {
  id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: string | null;
  created_at: Date | null;
};

export async function getAuditLogs(limit = 50): Promise<AuditEntry[]> {
  const { adminId } = await requireAdmin();
  if (!adminId) return [];

  const rows = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      target_type: auditLogs.target_type,
      target_id: auditLogs.target_id,
      details: auditLogs.details,
      created_at: auditLogs.created_at,
    })
    .from(auditLogs)
    .orderBy(desc(auditLogs.created_at))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    target_type: r.target_type,
    target_id: r.target_id ?? null,
    details: r.details ?? null,
    created_at: r.created_at ?? null,
  }));
}
