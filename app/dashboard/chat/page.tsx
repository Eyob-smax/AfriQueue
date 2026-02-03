import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { getConversations } from "@/lib/actions/chat";
import { ChatPageClient } from "@/components/dashboard/ChatPageClient";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>;
}) {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");

  const conversations = await getConversations();
  const { conversation: openConversationId } = await searchParams;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#0d1b1a] dark:text-white">
        Chat
      </h1>
      <ChatPageClient
        initialConversations={conversations}
        userId={user.userId}
        initialOpenConversationId={openConversationId ?? undefined}
      />
    </div>
  );
}
