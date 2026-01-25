// stores/useChatStore.ts
import { create } from "zustand";

interface Conversation {
  id: string;
  type: "PRIVATE" | "GROUP";
  is_active: boolean;
  created_at: Date;
}

interface Messages {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  content_type: "TEXT" | "IMAGE" | "VIDEO" | "FILE";
  sent_at: Date;
}

interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Messages[]>; // key: conversationId
  addConversation: (conv: Conversation) => void;
  addMessage: (conversationId: string, msg: Messages) => void;
  clearChats: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  messages: {},
  addConversation: (conv) =>
    set((state) => ({ conversations: [...state.conversations, conv] })),
  addMessage: (conversationId, msg) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), msg],
      },
    })),
  clearChats: () => set({ conversations: [], messages: {} }),
}));
