import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { getConversations } from "@/lib/actions/chat";
import { ChatPageClient } from "@/components/dashboard/ChatPageClient";

export default async function AdminChatPage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const conversations = await getConversations();

  return (
    <div className="space-y-4 p-8">
      <h1 className="text-2xl font-bold text-[#0d1b1a] dark:text-white">
        Chat
      </h1>
      <p className="text-sm text-muted-foreground">
        Message staff for support and requests.
      </p>
      <ChatPageClient
        initialConversations={conversations}
        userId={user.userId}
      />
    </div>
  );
}
