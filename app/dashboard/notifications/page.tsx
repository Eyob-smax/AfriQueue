import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { getNotifications } from "@/lib/actions/notifications";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";

export default async function NotificationsPage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");

  const notifications = await getNotifications(user.userId);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#0d1b1a] dark:text-white">
        Notifications
      </h1>
      <NotificationCenter
        initialNotifications={notifications}
      />
    </div>
  );
}
