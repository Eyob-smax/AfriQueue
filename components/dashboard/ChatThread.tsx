"use client";

import { useState, useEffect, useRef } from "react";
import { connectSocket } from "@/lib/socket-client";
import { sendMessage, getMessages } from "@/lib/actions/chat";
import type { MessageRow } from "@/lib/actions/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MaterialIcon } from "@/components/ui/material-icon";

interface ChatThreadProps {
  conversationId: string;
  currentUserId: string;
  participantNames: string[];
}

export function ChatThread({
  conversationId,
  currentUserId,
  participantNames,
}: ChatThreadProps) {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMessages(conversationId).then(setMessages);
  }, [conversationId]);

  useEffect(() => {
    connectSocket()
      .then((s) => {
        s.emit("chat:join", { conversationId });
        s.on("chat:message:sent", (msg: MessageRow & { sender_id?: string }) => {
          if (msg.conversation_id === conversationId) {
            const newMsg: MessageRow = {
              id: msg.id,
              conversation_id: msg.conversation_id,
              sender_id: msg.sender_id ?? "",
              content: msg.content,
              content_type: msg.content_type ?? "TEXT",
              sent_at: msg.sent_at ? new Date(msg.sent_at) : null,
              sender_name: (msg as { sender_name?: string }).sender_name ?? null,
            };
            setMessages((prev) =>
              prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
            );
          }
        });
        return () => {
          s.off("chat:message:sent");
        };
      })
      .catch(() => {});
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    // #region agent log
    fetch("http://127.0.0.1:7245/ingest/76b9be47-6856-4e89-a9e9-f4766eb51cb4",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({location:"ChatThread.tsx:handleSend:entry",message:"handleSend called",data:{conversationId},timestamp:Date.now(),sessionId:"debug-session",hypothesisId:"H3"})}).catch(()=>{});
    // #endregion
    setError(null);
    setSending(true);
    const result = await sendMessage(conversationId, text);
    if (result.error) {
      setError(result.error);
    } else {
      setInput("");
      if (result.message) {
        const newMsg = result.message;
        setMessages((prev) =>
          prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
        );
      }
    }
    setSending(false);
  }

  const title = participantNames.length > 0 ? participantNames.join(", ") : "Chat";

  return (
    <div className="flex flex-col h-[400px] border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900">
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 min-w-0">
        <h3 className="font-semibold text-sm text-[#0d1b1a] dark:text-white truncate" title={title}>
          {title}
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}
            >
              {!isMe && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary/20 text-primary">
                    {(msg.sender_name ?? "?")[0]}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[80%] min-w-0 rounded-lg px-3 py-2 text-sm ${
                  isMe
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-100 dark:bg-slate-800 text-[#0d1b1a] dark:text-white"
                }`}
              >
                {!isMe && (
                  <>
                    <p className="text-xs font-medium text-muted-foreground truncate pb-1.5 border-b border-slate-200 dark:border-slate-600 mb-1.5" title={msg.sender_name ?? undefined}>
                      {msg.sender_name ?? "Unknown"}
                    </p>
                    <p className="break-words">{msg.content}</p>
                  </>
                )}
                {isMe && <p className="break-words">{msg.content}</p>}
              </div>
              {isMe && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    You
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 px-4">{error}</p>
      )}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          className="flex-1 bg-[#f8fcfb] dark:bg-slate-800"
        />
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90"
          onClick={handleSend}
          disabled={sending || !input.trim()}
        >
          <MaterialIcon icon="arrow_forward" size={18} />
        </Button>
      </div>
    </div>
  );
}
