import "dotenv/config";
import { randomUUID } from "node:crypto";
import { db } from "../drizzle";
import { users, adminProfiles } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { hashAdminPassword } from "../lib/admin-session";

const ADMIN_EMAIL = "eyobsmax@gmail.com";
const ADMIN_PHONE = "+251980263141";
const ADMIN_FULL_NAME = "Admin";

/** Default admin password when BOOTSTRAP_ADMIN_PASSWORD is not set. Change after first login. */
const DEFAULT_ADMIN_PASSWORD = "Admin1!";

/**
 * Bootstrap admin in public.users only (no Supabase Auth API).
 * Admin login uses DB-only check and admin_session cookie.
 */
async function bootstrapAdmin() {
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
  const usedDefault = !process.env.BOOTSTRAP_ADMIN_PASSWORD;

  const passwordHash = hashAdminPassword(password);
  const [existingInDb] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL));

  if (existingInDb) {
    await db
      .update(users)
      .set({ password_hash: passwordHash })
      .where(eq(users.id, existingInDb.id));
    console.log("Admin user already exists in app DB; password_hash updated.");
    console.log("Email:", ADMIN_EMAIL);
    console.log("Log in at /auth/login?as=admin with this email and your password.");
    process.exit(0);
  }

  const userId = randomUUID();
  await db.insert(users).values({
    id: userId,
    full_name: ADMIN_FULL_NAME,
    email: ADMIN_EMAIL,
    phone: ADMIN_PHONE,
    role: "ADMIN",
    status: "ACTIVE",
    password_hash: passwordHash,
  });

  await db.insert(adminProfiles).values({
    user_id: userId,
    city_assigned: ["Nairobi"],
    region: "EAST_AFRICA",
  });

  console.log("Admin user created successfully (public.users only, no Supabase Auth).");
  console.log("Email:", ADMIN_EMAIL);
  if (usedDefault) {
    console.log("Password (default):", DEFAULT_ADMIN_PASSWORD, "- change after first login.");
  } else {
    console.log("Log in at /auth/login?as=admin with this email and BOOTSTRAP_ADMIN_PASSWORD.");
  }
  process.exit(0);
}

bootstrapAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
