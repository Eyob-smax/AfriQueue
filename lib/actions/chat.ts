"use server";

import { getSessionUser } from "@/lib/auth-session";
import { db } from "@/drizzle";
import {
  users,
  conversations,
  conversationParticipants,
  messages,
  healthCenters,
  staffProfiles,
} from "@/drizzle/schema";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { emitToRoom } from "@/lib/socket-emit";
import { createNotification } from "@/lib/actions/notifications";

export type ChatContactAdmin = { id: string; full_name: string | null };
export type ChatContactStaff = { id: string; full_name: string | null; health_center_name: string | null };
export type ChatContactsForClient = { admins: ChatContactAdmin[]; staff: ChatContactStaff[] };

/** For CLIENT role: admins + staff of health centers in the client's city/country. */
export async function getChatContactsForClient(): Promise<ChatContactsForClient | null> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;

  const [clientRow] = await db
    .select({ role: users.role, city: users.city, country: users.country })
    .from(users)
    .where(eq(users.id, sessionUser.id));
  if (!clientRow || clientRow.role !== "CLIENT") return null;

  const city = clientRow.city?.trim() ?? "";
  const country = clientRow.country?.trim() ?? "";
  if (!city) return { admins: [], staff: [] };

  const cityLower = city.toLowerCase();
  const countryLower = country ? country.toLowerCase() : null;

  const admins = await db
    .select({ id: users.id, full_name: users.full_name })
    .from(users)
    .where(inArray(users.role, ["ADMIN", "SUPER_ADMIN"]))
    .orderBy(users.full_name);

  const hcCondition = countryLower
    ? and(
        sql`lower(trim(${healthCenters.city})) = ${cityLower}`,
        sql`(${healthCenters.country} IS NULL OR lower(trim(${healthCenters.country})) = ${countryLower})`,
        eq(healthCenters.is_blocked, false)
      )
    : and(
        sql`lower(trim(${healthCenters.city})) = ${cityLower}`,
        eq(healthCenters.is_blocked, false)
      );

  const staffRows = await db
    .select({
      id: users.id,
      full_name: users.full_name,
      health_center_name: healthCenters.name,
    })
    .from(users)
    .innerJoin(staffProfiles, eq(users.id, staffProfiles.user_id))
    .innerJoin(healthCenters, eq(staffProfiles.health_center_id, healthCenters.id))
    .where(
      and(eq(users.role, "STAFF"), hcCondition)
    )
    .orderBy(users.full_name);

  return {
    admins: admins.map((a) => ({ id: a.id, full_name: a.full_name })),
    staff: staffRows.map((s) => ({
      id: s.id,
      full_name: s.full_name,
      health_center_name: s.health_center_name ?? null,
    })),
  };
}

export async function createConversation(
  participantIds: string[],
  type: "DIRECT" | "SUPPORT" | "GROUP"
): Promise<{ error?: string; conversationId?: string }> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { error: "Not authenticated" };

  const [conv] = await db
    .insert(conversations)
    .values({ type })
    .returning({ id: conversations.id });

  if (!conv) return { error: "Failed to create conversation" };

  const allIds = [...new Set([sessionUser.id, ...participantIds])];
  await db.insert(conversationParticipants).values(
    allIds.map((user_id) => ({
      conversation_id: conv.id,
      user_id,
    }))
  );

  return { conversationId: conv.id };
}

export async function getConversations(): Promise<
  { id: string; type: string; participantNames: string[] }[]
> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return [];

  const participants = await db
    .select({ conversation_id: conversationParticipants.conversation_id })
    .from(conversationParticipants)
    .where(eq(conversationParticipants.user_id, sessionUser.id));

  const convIds = participants.map((p) => p.conversation_id);
  if (convIds.length === 0) return [];

  const userConvs = await db
    .select({ id: conversations.id, type: conversations.type })
    .from(conversations)
    .where(
      and(inArray(conversations.id, convIds), eq(conversations.is_active, true))
    );
  const result: { id: string; type: string; participantNames: string[] }[] = [];

  for (const c of userConvs) {
    const parts = await db
      .select({ user_id: conversationParticipants.user_id, full_name: users.full_name })
      .from(conversationParticipants)
      .leftJoin(users, eq(conversationParticipants.user_id, users.id))
      .where(eq(conversationParticipants.conversation_id, c.id));
    const names = parts
      .filter((p) => p.user_id !== sessionUser.id)
      .map((p) => p.full_name ?? "Unknown");
    result.push({
      id: c.id,
      type: c.type ?? "DIRECT",
      participantNames: names,
    });
  }

  return result;
}

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  content_type: string | null;
  sent_at: Date | null;
  sender_name: string | null;
};

export async function getMessages(conversationId: string): Promise<MessageRow[]> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return [];

  // Verify user is a participant in this conversation
  const [participant] = await db
    .select({ user_id: conversationParticipants.user_id })
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversation_id, conversationId),
        eq(conversationParticipants.user_id, sessionUser.id)
      )
    )
    .limit(1);

  if (!participant) {
    console.error("User not authorized to view this conversation");
    return [];
  }

  const rows = await db
    .select({
      id: messages.id,
      conversation_id: messages.conversation_id,
      sender_id: messages.sender_id,
      content: messages.content,
      content_type: messages.content_type,
      sent_at: messages.sent_at,
      full_name: users.full_name,
    })
    .from(messages)
    .leftJoin(users, eq(messages.sender_id, users.id))
    .where(eq(messages.conversation_id, conversationId))
    .orderBy(desc(messages.sent_at))
    .limit(100);

  return rows
    .reverse()
    .map((r) => ({
      id: r.id,
      conversation_id: r.conversation_id,
      sender_id: r.sender_id,
      content: r.content,
      content_type: r.content_type,
      sent_at: r.sent_at,
      sender_name: r.full_name ?? null,
    }));
}

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<{ error?: string; messageId?: string; message?: MessageRow }> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { error: "Not authenticated" };

  // Verify user is a participant in this conversation
  const [participant] = await db
    .select({ user_id: conversationParticipants.user_id })
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversation_id, conversationId),
        eq(conversationParticipants.user_id, sessionUser.id)
      )
    )
    .limit(1);

  if (!participant) {
    return { error: "Not authorized to send messages in this conversation" };
  }

  const [msg] = await db
    .insert(messages)
    .values({
      conversation_id: conversationId,
      sender_id: sessionUser.id,
      content,
      content_type: "TEXT",
    })
    .returning({
      id: messages.id,
      conversation_id: messages.conversation_id,
      sender_id: messages.sender_id,
      content: messages.content,
      content_type: messages.content_type,
      sent_at: messages.sent_at,
    });

  if (!msg) return { error: "Failed to send message" };

  const participants = await db
    .select({ user_id: conversationParticipants.user_id })
    .from(conversationParticipants)
    .where(eq(conversationParticipants.conversation_id, conversationId));
  for (const p of participants) {
    if (p.user_id !== sessionUser.id) {
      await createNotification(p.user_id, "CHAT_MESSAGE", msg.id);
    }
  }

  const [senderRow] = await db
    .select({ full_name: users.full_name })
    .from(users)
    .where(eq(users.id, sessionUser.id));
  const senderName = senderRow?.full_name ?? "You";
  const payload = {
    id: msg.id,
    conversation_id: msg.conversation_id,
    sender_id: msg.sender_id,
    content: msg.content,
    content_type: msg.content_type,
    sent_at: msg.sent_at,
    sender_name: senderName,
  };

  await emitToRoom(`conversation:${conversationId}`, "chat:message:sent", payload);

  const message: MessageRow = {
    id: msg.id,
    conversation_id: msg.conversation_id ?? conversationId,
    sender_id: msg.sender_id ?? sessionUser.id,
    content: msg.content,
    content_type: msg.content_type ?? "TEXT",
    sent_at: msg.sent_at,
    sender_name: senderName,
  };
  return { messageId: msg.id, message };
}

/** Get or create a DIRECT conversation between current user and another user. */
export async function getOrCreateDirectConversation(
  otherUserId: string
): Promise<{ error?: string; conversationId?: string }> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { error: "Not authenticated" };
  if (otherUserId === sessionUser.id) return { error: "Cannot chat with yourself" };

  const myParticipations = await db
    .select({ conversation_id: conversationParticipants.conversation_id })
    .from(conversationParticipants)
    .where(eq(conversationParticipants.user_id, sessionUser.id));
  const convIds = myParticipations.map((p) => p.conversation_id);
  if (convIds.length === 0) return createConversation([otherUserId], "DIRECT");

  const directConvs = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(
      and(
        inArray(conversations.id, convIds),
        eq(conversations.type, "DIRECT"),
        eq(conversations.is_active, true)
      )
    );

  for (const c of directConvs) {
    const participants = await db
      .select({ user_id: conversationParticipants.user_id })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.conversation_id, c.id));
    const ids = new Set(participants.map((p) => p.user_id));
    if (ids.has(sessionUser.id) && ids.has(otherUserId) && ids.size === 2) {
      return { conversationId: c.id };
    }
  }

  return createConversation([otherUserId], "DIRECT");
}

/** Get or create a SUPPORT conversation (staff with admin). Returns one admin's conversation. */
export async function getOrCreateSupportConversation(): Promise<{
  error?: string;
  conversationId?: string;
}> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { error: "Not authenticated" };

  const adminUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(inArray(users.role, ["ADMIN", "SUPER_ADMIN"]))
    .limit(1);
  const adminId = adminUsers[0]?.id;
  if (!adminId) return { error: "No admin available for support" };

  const myParticipations = await db
    .select({ conversation_id: conversationParticipants.conversation_id })
    .from(conversationParticipants)
    .where(eq(conversationParticipants.user_id, sessionUser.id));
  const convIds = myParticipations.map((p) => p.conversation_id);
  if (convIds.length > 0) {
    const supportConvs = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(
        and(
          inArray(conversations.id, convIds),
          eq(conversations.type, "SUPPORT"),
          eq(conversations.is_active, true)
        )
      );
    for (const c of supportConvs) {
      const participants = await db
        .select({ user_id: conversationParticipants.user_id })
        .from(conversationParticipants)
        .where(eq(conversationParticipants.conversation_id, c.id));
      const ids = new Set(participants.map((p) => p.user_id));
      if (ids.has(sessionUser.id) && ids.has(adminId)) {
        return { conversationId: c.id };
      }
    }
  }

  return createConversation([adminId], "SUPPORT");
}
