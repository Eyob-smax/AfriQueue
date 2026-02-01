import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { StaffLayout } from "@/components/dashboard/staff/StaffLayout";
import { ProfileCompletionBanner } from "@/components/dashboard/ProfileCompletionBanner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");

  if (user.role === "STAFF" || user.role === "ADMIN") {
    return (
      <div className="font-display">
        {user.needsOnboarding && <ProfileCompletionBanner />}
        <StaffLayout>{children}</StaffLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark font-display">
      {user.needsOnboarding && <ProfileCompletionBanner />}
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
