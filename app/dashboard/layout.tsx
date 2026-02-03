import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { getStaffHealthCenter } from "@/lib/actions/queue";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { StaffLayout } from "@/components/dashboard/staff/StaffLayout";
import { AdminLayout } from "@/components/dashboard/admin/AdminLayout";
import { ProfileCompletionBanner } from "@/components/dashboard/ProfileCompletionBanner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");

  // Staff with non-ACTIVE status must stay on pending-approval; middleware must NOT redirect /auth/pending-approval → /dashboard or we get a redirect loop.
  if (user.role === "STAFF" && user.status !== "ACTIVE") {
    redirect("/auth/pending-approval");
  }

  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    return (
      <div className="font-display flex flex-col min-h-screen">
        <div className="flex-1 flex min-h-0">
          <AdminLayout>{children}</AdminLayout>
        </div>
      </div>
    );
  }

  if (user.role === "STAFF") {
    const staffCenter = await getStaffHealthCenter();
    return (
      <div className="font-display flex flex-col min-h-screen">
        <div className="flex-1 flex min-h-0">
          <StaffLayout healthCenterName={staffCenter?.health_center_name ?? null}>{children}</StaffLayout>
        </div>
      </div>
    );
  }

  // Client dashboard: show complete-profile banner only for CLIENT when onboarding incomplete
  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark font-display">
      {user.role === "CLIENT" && user.needsOnboarding && <ProfileCompletionBanner />}
      <DashboardNav
        userId={user.userId}
        role={user.role}
        city={user.city}
        country={user.country}
      />
      <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
    </div>
  );
}
