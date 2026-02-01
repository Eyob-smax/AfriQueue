import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Building2, Users, BarChart3 } from "lucide-react";

export default async function AdminDashboardPage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") redirect("/dashboard");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0d1b1a] dark:text-white">
        Admin Overview
      </h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-sm">Health Centers</h2>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">—</p>
            <p className="text-xs text-muted-foreground">
              Register and manage centers
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-sm">Staff</h2>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">—</p>
            <p className="text-xs text-muted-foreground">
              Assign staff to centers
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-sm">Analytics</h2>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">—</p>
            <p className="text-xs text-muted-foreground">
              System-wide queue analytics
            </p>
          </CardContent>
        </Card>
      </div>
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <h2 className="font-semibold">Quick actions</h2>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Register health centers, assign staff, and monitor all queues from here. Full admin flows can be wired to these sections.</p>
        </CardContent>
      </Card>
    </div>
  );
}
