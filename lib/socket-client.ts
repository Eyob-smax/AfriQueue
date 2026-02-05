"use client";

import { io as ioClient, type Socket } from "socket.io-client";
import { authClient } from "@/lib/auth-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";
let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export async function connectSocket(): Promise<Socket> {
  if (socket?.connected) return socket;
  try {
    // First check if user is authenticated
    const session = await authClient.getSession();
    if (!session?.data?.session) {
      throw new Error("No active session");
    }
    
    // Try to get JWT token
    const { data: tokenData, error: tokenError } = await authClient.token();
    if (tokenError || !tokenData?.token) {
      console.error("Failed to get JWT token:", tokenError);
      throw new Error("Failed to get authentication token");
    }
    
    socket = ioClient(WS_URL, {
      auth: { token: tokenData.token },
      transports: ["websocket", "polling"],
    });
    
    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });
    
    return socket;
  } catch (error) {
    console.error("Socket connection error:", error);
    throw error;
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
