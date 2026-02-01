"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/drizzle";
import { notifications } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { emitToRoom } from "@/lib/socket-emit";

export type NotificationRow = {
  id: string;
  user_id: string | null;
  type: string;
  reference_id: string | null;
  is_read: boolean | null;
  created_at: Date | null;
};

export async function createNotification(
  userId: string,
  type: string,
  referenceId?: string
): Promise<void> {
  const [n] = await db
    .insert(notifications)
    .values({
      user_id: userId,
      type,
      reference_id: referenceId ?? null,
      is_read: false,
    })
    .returning({ id: notifications.id });

  if (n) {
    await emitToRoom(`user:${userId}`, "notification:new", {
      id: n.id,
      type,
      reference_id: referenceId,
      created_at: new Date(),
    });
  }
}

export async function getNotifications(userId: string): Promise<NotificationRow[]> {
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.user_id, userId))
    .orderBy(desc(notifications.created_at))
    .limit(50);

  return rows.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    type: r.type,
    reference_id: r.reference_id,
    is_read: r.is_read,
    created_at: r.created_at,
  }));
}

export async function markNotificationRead(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { error: "Not authenticated" };

  await db
    .update(notifications)
    .set({ is_read: true })
    .where(eq(notifications.id, id));

  return {};
}

export async function getUnreadCount(userId: string): Promise<number> {
  const rows = await db
    .select({ is_read: notifications.is_read })
    .from(notifications)
    .where(eq(notifications.user_id, userId));
  return rows.filter((n) => !n.is_read).length;
}
