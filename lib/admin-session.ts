/**
 * Admin session cookie and password hashing.
 * Uses Web Crypto so it works in both Node and Edge (middleware).
 */

const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Dev-only fallback so admin sign-in works locally without .env (never used in production). */
const DEV_SESSION_SECRET = "arifqueue-admin-session-dev-only-min-32-chars";

function getSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.CRYPTO_SECRET ??
    (process.env.NODE_ENV === "development" ? DEV_SESSION_SECRET : "")
  );
}

/** Encode payload and sign with HMAC-SHA256. Works in Node and Edge. */
export async function createSignedAdminSession(
  userId: string,
  role: string
): Promise<string> {
  const secret = getSecret();
  if (!secret) {
    throw new Error(
      "Set ADMIN_SESSION_SECRET (or AUTH_SECRET) for admin session signing."
    );
  }
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = JSON.stringify({ userId, role, exp });
  const payloadBase64 = btoa(unescape(encodeURIComponent(payload)));

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadBase64)
  );
  const sigBase64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${payloadBase64}.${sigBase64}`;
}

/** Verify cookie and return { userId, role } or null. Works in Node and Edge. */
export async function verifyAdminSessionCookie(
  cookieValue: string | undefined
): Promise<{ userId: string; role: string } | null> {
  if (!cookieValue || !cookieValue.includes(".")) return null;
  const [payloadBase64, sigBase64] = cookieValue.split(".");
  if (!payloadBase64 || !sigBase64) return null;

  let payload: { userId?: string; role?: string; exp?: number };
  try {
    payload = JSON.parse(decodeURIComponent(escape(atob(payloadBase64))));
  } catch {
    return null;
  }
  if (!payload?.userId || !payload?.role || typeof payload.exp !== "number") return null;
  if (payload.exp < Date.now()) return null;

  const secret = getSecret();
  if (!secret) return null;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const expectedSig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadBase64)
  );
  const expectedBytes = new Uint8Array(expectedSig);
  let sigBytes: Uint8Array;
  try {
    sigBytes = new Uint8Array(
      atob(sigBase64)
        .split("")
        .map((c) => c.charCodeAt(0))
    );
  } catch {
    return null;
  }
  if (sigBytes.length !== expectedBytes.length) return null;
  let same = true;
  for (let i = 0; i < sigBytes.length; i++) {
    if (sigBytes[i] !== expectedBytes[i]) same = false;
  }
  if (!same) return null;

  return { userId: payload.userId, role: payload.role };
}

export { ADMIN_SESSION_COOKIE };
