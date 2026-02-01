// lib/schema.ts
import {
  pgTable,
  text,
  uuid,
  varchar,
  timestamp,
  integer,
  boolean,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "CLIENT",
  "STAFF",
  "ADMIN",
  "SUPER_ADMIN",
]);

export const reservationStatusEnum = pgEnum("reservation_status", [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
]);

export const roleRequestStatusEnum = pgEnum("role_request_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const roleRequestTypeEnum = pgEnum("role_request_type", [
  "STAFF",
  "ADMIN",
]);

export const conversationTypeEnum = pgEnum("conversation_type", [
  "DIRECT",
  "SUPPORT",
  "GROUP",
]);

export const messageContentTypeEnum = pgEnum("message_content_type", [
  "TEXT",
  "IMAGE",
  "FILE",
]);

export const regions = pgEnum("regions", [
  "NORTH_AFRICA",
  "SOUTH_AFRICA",
  "EAST_AFRICA",
  "WEST_AFRICA",
  "CENTRAL_AFRICA",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  full_name: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  password_hash: text("password_hash"), // optional when synced from Supabase Auth
  role: userRoleEnum("role").notNull(),
  status: varchar("status", [20]).default("ACTIVE"),
  created_at: timestamp("created_at").defaultNow(),
  country: varchar("country", [100]),
  city: varchar("city", [100]),
  is_system_user: boolean("is_system_user").default(false),
});

export const clientProfiles = pgTable("client_profiles", {
  user_id: uuid("user_id")
    .primaryKey()
    .references(() => users.id),
  health_condition: text("health_condition"),
  health_history: text("health_history"),
  chronic_illnesses: text("chronic_illnesses"),
  blood_type: varchar("blood_type", [5]),
  emergency_contact: text("emergency_contact"),
  created_at: timestamp("created_at").defaultNow(),
  any_disabilities: boolean("any_disabilities").default(false),
});

export const staffProfiles = pgTable("staff_profiles", {
  user_id: uuid("user_id")
    .primaryKey()
    .references(() => users.id),
  health_center_id: uuid("health_center_id").references(() => healthCenters.id),
  role_in_center: varchar("role_in_center", [50]),
  department: varchar("department", [50]),
  license_number: text("license_number"),
  created_at: timestamp("created_at").defaultNow(),
  approved_date: timestamp("approved_date").notNull(),
});

export const adminProfiles = pgTable("admin_profiles", {
  user_id: uuid("user_id")
    .primaryKey()
    .references(() => users.id),
  city_assigned: varchar("city_assigned", { length: 100 }).array().notNull(),
  region: regions("region").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const healthCenters = pgTable("health_centers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  city: varchar("city").notNull(),
  address: text("address"),
  latitude: numeric("latitude", { precision: 10, scale: 6 }),
  longitude: numeric("longitude", { precision: 10, scale: 6 }),
  status: varchar("status", [10]).default("OPEN"),
  created_at: timestamp("created_at").defaultNow(),
});

export const queues = pgTable("queues", {
  id: uuid("id").primaryKey().defaultRandom(),
  health_center_id: uuid("health_center_id").references(() => healthCenters.id),
  service_type: text("service_type"),
  queue_date: timestamp("queue_date").notNull(),
  max_capacity: integer("max_capacity"),
  created_at: timestamp("created_at").defaultNow(),
});

export const reservations = pgTable("reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  queue_id: uuid("queue_id").references(() => queues.id),
  client_id: uuid("client_id").references(() => users.id),
  queue_number: integer("queue_number"),
  status: reservationStatusEnum("status").default("PENDING"),
  created_at: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: conversationTypeEnum("type").notNull(),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    conversation_id: uuid("conversation_id")
      .references(() => conversations.id)
      .notNull(),
    user_id: uuid("user_id")
      .references(() => users.id)
      .$onUpdate(() => "CASCADE")
      .notNull(),
    joined_at: timestamp("joined_at").defaultNow(),
  },
  (table) => ({
    pk: [table.conversation_id, table.user_id],
  }),
);

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversation_id: uuid("conversation_id")
    .references(() => conversations.id)
    .$onUpdate(() => "CASCADE")
    .notNull(),
  sender_id: uuid("sender_id")
    .references(() => users.id)
    .$onUpdate(() => "CASCADE")
    .notNull(),
  content: text("content").notNull(),
  content_type: messageContentTypeEnum("content_type").default("TEXT"),
  sent_at: timestamp("sent_at").defaultNow(),
});

export const messageReads = pgTable(
  "message_reads",
  {
    message_id: uuid("message_id").references(() => messages.id),
    user_id: uuid("user_id").references(() => users.id),
    read_at: timestamp("read_at").defaultNow(),
  },
  (table) => ({
    pk: [table.message_id, table.user_id],
  }),
);

export const roleRequests = pgTable("role_requests", {
  id: uuid("id").primaryKey().defaultRandom(),

  requester_id: uuid("requester_id")
    .references(() => users.id)
    .notNull(),

  requested_role: roleRequestTypeEnum("requested_role").notNull(),

  // Who approved/rejected (ADMIN or SUPER_ADMIN)
  reviewed_by: uuid("reviewed_by").references(() => users.id),

  status: roleRequestStatusEnum("status").default("PENDING"),

  reason: text("reason"),

  created_at: timestamp("created_at").defaultNow(),
  reviewed_at: timestamp("reviewed_at"),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id),
  type: varchar("type", [50]).notNull(),
  reference_id: uuid("reference_id"),
  is_read: boolean("is_read").default(false),
  created_at: timestamp("created_at").defaultNow(),
});
