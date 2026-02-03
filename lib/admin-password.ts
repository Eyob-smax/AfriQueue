/**
 * Admin password hashing (Node only). Used by auth actions and seed scripts.
 * Do not import this from Edge middleware.
 */

const SCRYPT_KEYLEN = 64;
const SCRYPT_COST = 16384;

/** Hash password with scrypt (Node only). Store result in users.password_hash. */
export function hashAdminPassword(password: string): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require("node:crypto") as typeof import("node:crypto");
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, SCRYPT_KEYLEN, { N: SCRYPT_COST });
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

/** Verify password against stored hash (Node only). */
export function verifyAdminPassword(password: string, stored: string | null): boolean {
  if (!stored || !stored.includes(":")) return false;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require("node:crypto") as typeof import("node:crypto");
  const [saltHex, keyHex] = stored.split(":");
  if (!saltHex || !keyHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const key = crypto.scryptSync(password, salt, SCRYPT_KEYLEN, { N: SCRYPT_COST });
  const expected = Buffer.from(keyHex, "hex");
  return key.length === expected.length && crypto.timingSafeEqual(key, expected);
}
