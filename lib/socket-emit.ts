/**
 * Server-side helper to emit events to the Socket.IO server.
 * Call from Server Actions after DB updates.
 */
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";
const EMIT_SECRET = process.env.SOCKET_EMIT_SECRET || "internal-secret";

export async function emitToRoom(
  room: string,
  event: string,
  data: unknown
): Promise<void> {
  try {
    const res = await fetch(`${WS_URL}/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${EMIT_SECRET}`,
      },
      body: JSON.stringify({ room, event, data }),
    });
    if (!res.ok) {
      console.error("Socket emit failed", res.status);
    }
  } catch (err) {
    console.error("Socket emit error", err);
  }
}

export async function emitToRooms(
  rooms: string[],
  event: string,
  data: unknown
): Promise<void> {
  try {
    const res = await fetch(`${WS_URL}/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${EMIT_SECRET}`,
      },
      body: JSON.stringify({ rooms, event, data }),
    });
    if (!res.ok) {
      console.error("Socket emit failed", res.status);
    }
  } catch (err) {
    console.error("Socket emit error", err);
  }
}
