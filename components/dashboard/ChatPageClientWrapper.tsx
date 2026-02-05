"use client";

import { Suspense } from "react";
import { ChatPageClient } from "./ChatPageClient";
import type { ChatContactsForClient } from "@/lib/actions/chat";

interface Conv {
  id: string;
  type: string;
  participantNames: string[];
}

interface ChatPageClientWrapperProps {
  initialConversations: Conv[];
  userId: string;
  initialOpenConversationId?: string;
  contacts?: ChatContactsForClient | null;
}

export function ChatPageClientWrapper(props: ChatPageClientWrapperProps) {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <ChatPageClient {...props} />
    </Suspense>
  );
}
