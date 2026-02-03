import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

// Strip sslmode from URL to avoid pg-connection-string deprecation warning; set ssl in config instead.
function connectionStringWithoutSslMode(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.delete("sslmode");
    u.searchParams.delete("uselibpqcompat");
    return u.toString();
  } catch {
    return url;
  }
}

const rawUrl = process.env.DATABASE_URL!;
const connectionString = connectionStringWithoutSslMode(rawUrl);
const needsSsl = /neon\.tech|\.neon\.tech|supabase|vercel\.postgres|pooler\./i.test(rawUrl);

const pool = new Pool({
  connectionString,
  ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
});

const db = drizzle({ client: pool });
export { db };
