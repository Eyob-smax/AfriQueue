import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { getStaffHealthCenter, getQueuesByHealthCenter, getStaffClinicInsights } from "@/lib/actions/queue";
import { QueueBoard } from "@/components/dashboard/QueueBoard";

export default async function StaffDashboardPage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");
  if (user.role !== "STAFF") redirect("/dashboard");

  const center = await getStaffHealthCenter();
  const [queues, clinicInsights] = center
    ? await Promise.all([
        getQueuesByHealthCenter(center.health_center_id),
        getStaffClinicInsights(center.health_center_id),
      ])
    : [[], null];

  return (
    <QueueBoard
      userId={user.userId}
      healthCenterId={center?.health_center_id ?? null}
      healthCenterName={center?.health_center_name ?? null}
      initialQueues={queues}
      initialClinicInsights={clinicInsights}
    />
  );
}
