"use client";

import { useState } from "react";
import { ChatThread } from "@/components/dashboard/ChatThread";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";

interface Conv {
  id: string;
  type: string;
  participantNames: string[];
}

interface ChatPageClientProps {
  initialConversations: Conv[];
  userId: string;
  initialOpenConversationId?: string;
}

export function ChatPageClient({
  initialConversations,
  userId,
  initialOpenConversationId,
}: ChatPageClientProps) {
  const [conversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (initialOpenConversationId && initialConversations.some((c) => c.id === initialOpenConversationId)) {
      return initialOpenConversationId;
    }
    return conversations[0]?.id ?? null;
  });

  const selected = conversations.find((c) => c.id === selectedId);

  return (
    <div className="grid gap-4 md:grid-cols-[240px_1fr]">
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-2">
          {conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center">
              No conversations yet.
            </p>
          ) : (
            <ul className="space-y-1">
              {conversations.map((c) => (
                <li key={c.id}>
                  <Button
                    variant={selectedId === c.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => setSelectedId(c.id)}
                  >
                    <MaterialIcon icon="chat" size={18} className="mr-2 text-primary" />
                    {c.participantNames.length > 0
                      ? c.participantNames.join(", ")
                      : "Chat"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <div>
        {selected ? (
          <ChatThread
            conversationId={selected.id}
            currentUserId={userId}
            participantNames={selected.participantNames}
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
