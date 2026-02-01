import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { getConversations } from "@/lib/actions/chat";
import { ChatPageClient } from "@/components/dashboard/ChatPageClient";

export default async function ChatPage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");

  const conversations = await getConversations();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#0d1b1a] dark:text-white">
        Messages
      </h1>
      <ChatPageClient
        initialConversations={conversations}
        userId={user.userId}
      />
    </div>
  );
}
