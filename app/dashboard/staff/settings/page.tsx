import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { getHealthCenterForStaff } from "@/lib/actions/health-center";
import { StaffHealthCenterSettingsForm } from "@/components/dashboard/staff/StaffHealthCenterSettingsForm";

export default async function StaffSettingsPage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");
  if (user.role !== "STAFF") redirect("/dashboard");

  const center = await getHealthCenterForStaff();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#0d1b1a] dark:text-white">
        Settings
      </h1>
      <p className="text-[#4c9a93] mt-2">Clinic and system settings.</p>
      {center ? (
        <div className="mt-8">
          <StaffHealthCenterSettingsForm center={center} />
        </div>
      ) : (
        <p className="mt-6 text-muted-foreground">
          No health center assigned. Contact an admin to get assigned to a center.
        </p>
      )}
    </div>
  );
}
