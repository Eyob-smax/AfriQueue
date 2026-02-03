import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { getStaffHealthCenter, getStaffPatientLogs } from "@/lib/actions/queue";
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

export default async function StaffLogsPage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");
  if (user.role !== "STAFF") redirect("/dashboard");

  const center = await getStaffHealthCenter();
  const logs = center ? await getStaffPatientLogs(center.health_center_id, 50) : [];

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-2xl font-bold text-[#0d1b1a] dark:text-white">
        Patient Logs
      </h1>
      <p className="text-[#4c9a93]">Recent reservations for your health center (latest first).</p>
      {!center ? (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p>No health center assigned. Patient logs will appear here once assigned.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <h2 className="font-semibold">Recent activity ({logs.length})</h2>
            <p className="text-sm text-muted-foreground">
              Reservations across all queues at your center.
            </p>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No patient logs yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date / Time</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Queue</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground text-sm">
                        {log.created_at
                          ? new Date(log.created_at).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </TableCell>
                      <TableCell className="font-medium">{log.client_name ?? "—"}</TableCell>
                      <TableCell>
                        {log.queue_service ?? "—"}
                        {log.queue_date
                          ? ` • ${new Date(log.queue_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                          : ""}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.status ?? "—"}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
