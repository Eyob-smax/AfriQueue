import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { getConversations, getChatContactsForClient } from "@/lib/actions/chat";
import { ChatPageClientWrapper } from "@/components/dashboard/ChatPageClientWrapper";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>;
}) {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");

  const [conversations, contacts] = await Promise.all([
    getConversations(),
    user.role === "CLIENT" ? getChatContactsForClient() : Promise.resolve(null),
  ]);
  const { conversation: openConversationId } = await searchParams;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#0d1b1a] dark:text-white">
        Chat
      </h1>
      <ChatPageClientWrapper
        initialConversations={conversations}
        userId={user.userId}
        initialOpenConversationId={openConversationId ?? undefined}
        contacts={contacts ?? undefined}
      />
    </div>
  );
}
