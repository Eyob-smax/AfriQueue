import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { getAdminOverview } from "@/lib/actions/admin";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Building2, Users, BarChart3, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const overview = await getAdminOverview();

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-2xl font-bold text-[#0d1b1a] dark:text-white">
        Admin Overview
      </h1>
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-sm">Health Centers</h2>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{overview?.healthCentersCount ?? 0}</p>
            <Link href="/dashboard/admin/health-centers">
              <Button variant="link" className="p-0 h-auto text-xs text-primary">
                Manage centers
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-sm">Active Staff</h2>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{overview?.staffCount ?? 0}</p>
            <Link href="/dashboard/admin/staff">
              <Button variant="link" className="p-0 h-auto text-xs text-primary">
                Staff accounts
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <CalendarCheck className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-sm">Active Reservations</h2>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{overview?.reservationsCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">Pending or confirmed</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-sm">Queues</h2>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{overview?.queuesCount ?? 0}</p>
            <Link href="/dashboard/admin/reports">
              <Button variant="link" className="p-0 h-auto text-xs text-primary">
                View reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <h2 className="font-semibold">Quick actions</h2>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 text-sm">
          <Link href="/dashboard/admin/staff-registrations">
            <Button variant="outline" size="sm" className="rounded-xl">
              Staff registrations
            </Button>
          </Link>
          <Link href="/dashboard/admin/health-centers">
            <Button variant="outline" size="sm" className="rounded-xl">
              Health centers
            </Button>
          </Link>
          <Link href="/dashboard/admin/audit">
            <Button variant="outline" size="sm" className="rounded-xl">
              Audit log
            </Button>
          </Link>
          <Link href="/dashboard/chat">
            <Button variant="outline" size="sm" className="rounded-xl">
              Chat
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
