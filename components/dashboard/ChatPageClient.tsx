"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChatThread } from "@/components/dashboard/ChatThread";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import {
  getOrCreateSupportConversation,
  getOrCreateDirectConversation,
} from "@/lib/actions/chat";
import type { ChatContactsForClient } from "@/lib/actions/chat";

interface Conv {
  id: string;
  type: string;
  participantNames: string[];
}

interface ChatPageClientProps {
  initialConversations: Conv[];
  userId: string;
  initialOpenConversationId?: string;
  contacts?: ChatContactsForClient | null;
}

export function ChatPageClient({
  initialConversations,
  userId,
  initialOpenConversationId,
  contacts,
}: ChatPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (initialOpenConversationId && initialConversations.some((c) => c.id === initialOpenConversationId)) {
      return initialOpenConversationId;
    }
    return conversations[0]?.id ?? null;
  });
  const [startingChatWith, setStartingChatWith] = useState<string | null>(null);

  // Sync selectedId with URL parameter
  useEffect(() => {
    const conversationParam = searchParams.get('conversation');
    if (conversationParam) {
      setSelectedId(conversationParam);
    }
  }, [searchParams]);

  const selected = conversations.find((c) => c.id === selectedId);

  async function handleStartChatWithAdmin() {
    setStartingChatWith("admin");
    const result = await getOrCreateSupportConversation();
    setStartingChatWith(null);
    if (result.error) return;
    if (result.conversationId) {
      setSelectedId(result.conversationId);
      router.push(`/dashboard/chat?conversation=${result.conversationId}`);
    }
  }

  async function handleStartChatWithStaff(staffId: string) {
    setStartingChatWith(staffId);
    const result = await getOrCreateDirectConversation(staffId);
    setStartingChatWith(null);
    if (result.error) return;
    if (result.conversationId) {
      setSelectedId(result.conversationId);
      router.push(`/dashboard/chat?conversation=${result.conversationId}`);
    }
  }

  const hasContacts = contacts && (contacts.admins.length > 0 || contacts.staff.length > 0);

  return (
    <div className="grid gap-4 md:grid-cols-[240px_1fr]">
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-2">
          {hasContacts && (
            <div className="mb-3">
              <p className="text-xs font-medium text-muted-foreground px-2 pb-1.5">Start chat</p>
              {contacts!.admins.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm min-w-0 overflow-hidden"
                  onClick={handleStartChatWithAdmin}
                  disabled={!!startingChatWith}
                >
                  <MaterialIcon icon="support_agent" size={18} className="mr-2 shrink-0 text-primary" />
                  <span className="truncate">
                    {startingChatWith === "admin" ? "…" : "Admin"}
                  </span>
                </Button>
              )}
              {contacts!.staff.map((s) => (
                <Button
                  key={s.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm min-w-0 overflow-hidden"
                  onClick={() => handleStartChatWithStaff(s.id)}
                  disabled={!!startingChatWith}
                >
                  <MaterialIcon icon="medical_services" size={18} className="mr-2 shrink-0 text-primary" />
                  <span className="truncate">
                    {startingChatWith === s.id ? "…" : `${s.full_name ?? "Staff"}${s.health_center_name ? ` (${s.health_center_name})` : ""}`}
                  </span>
                </Button>
              ))}
            </div>
          )}
          {hasContacts && conversations.length > 0 && (
            <p className="text-xs font-medium text-muted-foreground px-2 pb-1.5 border-t pt-2">Conversations</p>
          )}
          {conversations.length === 0 && !hasContacts ? (
            <p className="text-sm text-muted-foreground p-4 text-center">
              No conversations yet.
            </p>
          ) : (
            <ul className="space-y-1">
              {conversations.map((c) => (
                <li key={c.id}>
                  <Button
                    variant={selectedId === c.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-sm min-w-0 overflow-hidden"
                    onClick={() => setSelectedId(c.id)}
                  >
                    <MaterialIcon icon="chat" size={18} className="mr-2 shrink-0 text-primary" />
                    <span className="truncate">
                      {c.participantNames.length > 0
                        ? c.participantNames.join(", ")
                        : "Chat"}
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <div>
        {selectedId ? (
          <ChatThread
            conversationId={selectedId}
            currentUserId={userId}
            participantNames={selected?.participantNames ?? []}
          />
        ) : (
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <MaterialIcon icon="chat" size={48} className="mb-4 text-primary/50" />
              <p>Select a conversation or start a new one.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
