"use client";

import { io as ioClient, type Socket } from "socket.io-client";
import { createClient } from "@/lib/supabase/client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";
let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export async function connectSocket(): Promise<Socket> {
  if (socket?.connected) return socket;
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) {
    throw new Error("Not authenticated");
  }
  socket = ioClient(WS_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
