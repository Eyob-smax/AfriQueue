import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { getPendingStaff } from "@/lib/actions/admin";
import { StaffRegistrationsTable } from "@/components/dashboard/admin/StaffRegistrationsTable";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function StaffRegistrationsPage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const pending = await getPendingStaff();

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-2xl font-bold text-[#0d1b1a] dark:text-white">
        Staff Registrations
      </h1>
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <h2 className="font-semibold">Pending approval ({pending.length})</h2>
          <p className="text-sm text-muted-foreground">
            Approve or reject staff registration requests. Approved staff can log in and manage their health center.
          </p>
        </CardHeader>
        <CardContent>
          <StaffRegistrationsTable requests={pending} />
        </CardContent>
      </Card>
    </div>
  );
}
