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

// ============= Better Auth tables (identity: user, session, account, verification) =============
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow().$onUpdate(() => new Date()),
  // phone number plugin
  phoneNumber: text("phoneNumber"),
  phoneNumberVerified: boolean("phoneNumberVerified").default(false),
  // app sync: optional role (CLIENT, STAFF) for upsert into public.users
  role: text("role"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow().$onUpdate(() => new Date()),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow().$onUpdate(() => new Date()),
});

// JWT plugin: jwks table
export const jwks = pgTable("jwks", {
  id: text("id").primaryKey(),
  publicKey: text("publicKey").notNull(),
  privateKey: text("privateKey").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  expiresAt: timestamp("expiresAt"),
});

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
  password_hash: text("password_hash"), // optional when using Better Auth (email/OAuth/phone)
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
  status: varchar("status", [20]).default("OPEN"),
  description: text("description"),
  services: text("services"),
  specialties: varchar("specialties", { length: 100 }).array(),
  operating_status: varchar("operating_status", [20]).default("OPEN"),
  queue_availability: boolean("queue_availability").default(true),
  is_blocked: boolean("is_blocked").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

export const queues = pgTable("queues", {
  id: uuid("id").primaryKey().defaultRandom(),
  health_center_id: uuid("health_center_id").references(() => healthCenters.id),
  service_type: text("service_type"),
  queue_date: timestamp("queue_date").notNull(),
  max_capacity: integer("max_capacity"),
  status: varchar("status", [20]).default("ACTIVE"),
  created_at: timestamp("created_at").defaultNow(),
});

export const reservations = pgTable("reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  queue_id: uuid("queue_id").references(() => queues.id),
  client_id: uuid("client_id").references(() => users.id),
  queue_number: integer("queue_number"),
  status: reservationStatusEnum("status").default("PENDING"),
  created_at: timestamp("created_at").defaultNow(),
  completed_at: timestamp("completed_at"),
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

  reviewed_by: uuid("reviewed_by").references(() => users.id),

  status: roleRequestStatusEnum("status").default("PENDING"),

  reason: text("reason"),

  health_center_name: text("health_center_name"),
  health_center_description: text("health_center_description"),
  health_center_location: text("health_center_location"),
  health_center_country: text("health_center_country"),

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

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  admin_id: uuid("admin_id")
    .references(() => users.id)
    .notNull(),
  action: varchar("action", [100]).notNull(),
  target_type: varchar("target_type", [50]).notNull(),
  target_id: uuid("target_id"),
  details: text("details"),
  created_at: timestamp("created_at").defaultNow(),
});
