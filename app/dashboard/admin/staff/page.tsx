import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { getStaffList } from "@/lib/actions/admin";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StaffAccountsTable } from "@/components/dashboard/admin/StaffAccountsTable";

export default async function AdminStaffPage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const staff = await getStaffList();

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-2xl font-bold text-[#0d1b1a] dark:text-white">
        Staff Accounts
      </h1>
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <h2 className="font-semibold">All staff ({staff.length})</h2>
          <p className="text-sm text-muted-foreground">
            Activate or deactivate staff accounts. Deactivated staff cannot log in.
          </p>
        </CardHeader>
        <CardContent>
          <StaffAccountsTable staff={staff} />
        </CardContent>
      </Card>
    </div>
  );
}
