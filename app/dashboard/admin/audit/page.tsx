import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { getAuditLogs } from "@/lib/actions/admin";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminAuditPage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const logs = await getAuditLogs(100);

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-2xl font-bold text-[#0d1b1a] dark:text-white">
        Audit Log
      </h1>
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <h2 className="font-semibold">Recent admin actions</h2>
          <p className="text-sm text-muted-foreground">
            Approvals, rejections, block/unblock, activate/deactivate, and create center.
          </p>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No audit entries yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="text-muted-foreground text-sm">
                      {l.created_at
                        ? new Date(l.created_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell className="font-medium">{l.action}</TableCell>
                    <TableCell>{l.target_type} {l.target_id ? `(${l.target_id.slice(0, 8)}…)` : ""}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{l.details ?? "—"}</TableCell>
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
