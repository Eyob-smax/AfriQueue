import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";

export default async function StaffSettingsPage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");
  if (user.role !== "STAFF") redirect("/dashboard");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#0d1b1a] dark:text-white">
        Settings
      </h1>
      <p className="text-[#4c9a93] mt-2">Clinic and system settings.</p>
    </div>
  );
}
