/**
 * Server-side helper to emit events to the Socket.IO server.
 * Call from Server Actions after DB updates.
 * If the WS server is not running, emit fails silently so actions (e.g. staff approval) still succeed.
 */
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";
const EMIT_SECRET = process.env.SOCKET_EMIT_SECRET || "internal-secret";
const EMIT_TIMEOUT_MS = 2000;

export async function emitToRoom(
  room: string,
  event: string,
  data: unknown
): Promise<void> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), EMIT_TIMEOUT_MS);
    const res = await fetch(`${WS_URL}/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${EMIT_SECRET}`,
      },
      body: JSON.stringify({ room, event, data }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) {
      console.warn("[socket-emit] emit failed", res.status);
    }
  } catch {
    // WS server often not running in dev; avoid blocking or spamming logs
  }
}

export async function emitToRooms(
  rooms: string[],
  event: string,
  data: unknown
): Promise<void> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), EMIT_TIMEOUT_MS);
    const res = await fetch(`${WS_URL}/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${EMIT_SECRET}`,
      },
      body: JSON.stringify({ rooms, event, data }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) {
      console.warn("[socket-emit] emit failed", res.status);
    }
  } catch {
    // WS server often not running in dev; avoid blocking or spamming logs
  }
}
