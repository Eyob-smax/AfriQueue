import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { getQueuesByCenterForAdmin } from "@/lib/actions/admin";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AdminReportsPage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const queues = await getQueuesByCenterForAdmin();

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-2xl font-bold text-[#0d1b1a] dark:text-white">
        Reports
      </h1>
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <h2 className="font-semibold">Queue status by center</h2>
          <p className="text-sm text-muted-foreground">
            Queues and current reservation count per health center.
          </p>
        </CardHeader>
        <CardContent>
          {queues.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No queues yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Health Center</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Reservations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queues.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.health_center_name ?? "—"}</TableCell>
                    <TableCell>{q.service_type ?? "—"}</TableCell>
                    <TableCell>
                      {q.queue_date
                        ? new Date(q.queue_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{q.status ?? "ACTIVE"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{q.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
