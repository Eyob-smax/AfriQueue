/**
 * Clear all app data in referential integrity order (children before parents).
 * Run with: npm run db:clear-data or tsx scripts/clear-data.ts
 */
import "dotenv/config";
import { db } from "../drizzle";
import {
  messageReads,
  messages,
  conversationParticipants,
  notifications,
  reservations,
  roleRequests,
  auditLogs,
  clientProfiles,
  staffProfiles,
  adminProfiles,
  queues,
  conversations,
  healthCenters,
  users,
} from "../drizzle/schema";

async function clearData() {
  const tables = [
    { name: "message_reads", fn: () => db.delete(messageReads) },
    { name: "messages", fn: () => db.delete(messages) },
    { name: "conversation_participants", fn: () => db.delete(conversationParticipants) },
    { name: "notifications", fn: () => db.delete(notifications) },
    { name: "reservations", fn: () => db.delete(reservations) },
    { name: "role_requests", fn: () => db.delete(roleRequests) },
    { name: "audit_logs", fn: () => db.delete(auditLogs) },
    { name: "client_profiles", fn: () => db.delete(clientProfiles) },
    { name: "staff_profiles", fn: () => db.delete(staffProfiles) },
    { name: "admin_profiles", fn: () => db.delete(adminProfiles) },
    { name: "queues", fn: () => db.delete(queues) },
    { name: "conversations", fn: () => db.delete(conversations) },
    { name: "health_centers", fn: () => db.delete(healthCenters) },
    { name: "users", fn: () => db.delete(users) },
  ];

  for (const { name, fn } of tables) {
    await fn();
    console.log("Cleared:", name);
  }

  console.log("All app data cleared (referential integrity order).");
}

clearData().catch((err) => {
  console.error(err);
  process.exit(1);
});
