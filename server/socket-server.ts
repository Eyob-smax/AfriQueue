import { createServer, type IncomingMessage, type ServerResponse } from "http";
import { Server } from "socket.io";
import { createClient } from "@supabase/supabase-js";

const PORT = process.env.SOCKET_PORT || 3001;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const EMIT_SECRET = process.env.SOCKET_EMIT_SECRET || "internal-secret";

function handleEmitRequest(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST" || req.url !== "/emit") return false;
  let body = "";
  req.on("data", (chunk) => { body += chunk; });
  req.on("end", () => {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${EMIT_SECRET}`) {
      res.writeHead(401);
      res.end();
      return;
    }
    try {
      const parsed = JSON.parse(body);
      const { event, room, rooms, data } = parsed;
      if (room) io.to(room).emit(event, data);
      if (Array.isArray(rooms)) rooms.forEach((r: string) => io.to(r).emit(event, data));
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    } catch {
      res.writeHead(400);
      res.end();
    }
  });
  return true;
}

const httpServer = createServer((req, res) => {
  if (handleEmitRequest(req, res)) return;
  res.writeHead(404);
  res.end();
});

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface AuthenticatedSocket {
  userId: string;
  role?: string;
}

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token as string | undefined;
  if (!token) {
    return next(new Error("Authentication required"));
  }
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    return next(new Error("Invalid token"));
  }
  (socket as unknown as AuthenticatedSocket).userId = user.id;
  (socket as unknown as AuthenticatedSocket).role = user.user_metadata?.role;
  return next();
});

io.on("connection", (socket) => {
  const { userId } = socket as unknown as AuthenticatedSocket;
  socket.join(`user:${userId}`);

  socket.on("queue:subscribe", (payload: { queueId?: string; healthCenterId?: string }) => {
    if (payload.queueId) socket.join(`queue:${payload.queueId}`);
    if (payload.healthCenterId) socket.join(`healthCenter:${payload.healthCenterId}`);
  });

  socket.on("queue:leave", (payload: { queueId?: string; healthCenterId?: string }) => {
    if (payload.queueId) socket.leave(`queue:${payload.queueId}`);
    if (payload.healthCenterId) socket.leave(`healthCenter:${payload.healthCenterId}`);
  });

  socket.on("chat:join", async (payload: { conversationId: string }) => {
    const { conversationId } = payload;
    socket.join(`conversation:${conversationId}`);
  });

  socket.on("chat:typing", (payload: { conversationId: string }) => {
    socket.to(`conversation:${payload.conversationId}`).emit("chat:typing", {
      conversationId: payload.conversationId,
      userId,
    });
  });

  socket.on("chat:read", (payload: { conversationId: string; messageIds: string[] }) => {
    socket.to(`conversation:${payload.conversationId}`).emit("chat:read", {
      conversationId: payload.conversationId,
      messageIds: payload.messageIds,
      userId,
    });
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});

export function emitToQueue(queueId: string, event: string, data: unknown) {
  io.to(`queue:${queueId}`).emit(event, data);
}

export function emitToUser(userId: string, event: string, data: unknown) {
  io.to(`user:${userId}`).emit(event, data);
}

export function emitToConversation(conversationId: string, event: string, data: unknown) {
  io.to(`conversation:${conversationId}`).emit(event, data);
}
