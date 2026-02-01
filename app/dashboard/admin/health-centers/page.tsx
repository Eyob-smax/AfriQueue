import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { getHealthCentersForAdmin } from "@/lib/actions/admin";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HealthCentersTable } from "@/components/dashboard/admin/HealthCentersTable";
import { CreateHealthCenterForm } from "@/components/dashboard/admin/CreateHealthCenterForm";

export default async function HealthCentersAdminPage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const centers = await getHealthCentersForAdmin();

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0d1b1a] dark:text-white">
          Health Centers
        </h1>
        <CreateHealthCenterForm />
      </div>
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <h2 className="font-semibold">All centers ({centers.length})</h2>
          <p className="text-sm text-muted-foreground">
            Block or unblock centers. Blocked centers are hidden from clients.
          </p>
        </CardHeader>
        <CardContent>
          <HealthCentersTable centers={centers} />
        </CardContent>
      </Card>
    </div>
  );
}
