import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { QueueBoard } from "@/components/dashboard/QueueBoard";

export default async function StaffDashboardPage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");
  if (user.role !== "STAFF") redirect("/dashboard");

  return <QueueBoard userId={user.userId} />;
}
