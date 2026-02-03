import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { getClientsForAdmin } from "@/lib/actions/admin";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ClientsTable } from "@/components/dashboard/admin/ClientsTable";

export default async function AdminClientsPage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const clients = await getClientsForAdmin();

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-2xl font-bold text-[#0d1b1a] dark:text-white">
        Clients
      </h1>
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <h2 className="font-semibold">All clients ({clients.length})</h2>
          <p className="text-sm text-muted-foreground">
            View and manage client accounts. You can suspend or activate access.
          </p>
        </CardHeader>
        <CardContent>
          <ClientsTable clients={clients} />
        </CardContent>
      </Card>
    </div>
  );
}
