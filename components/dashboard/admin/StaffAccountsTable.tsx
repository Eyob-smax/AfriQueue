"use client";

import { useState } from "react";
import { setStaffStatus } from "@/lib/actions/admin";
import type { StaffListItem } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface StaffAccountsTableProps {
  staff: StaffListItem[];
}

export function StaffAccountsTable({ staff: initialStaff }: StaffAccountsTableProps) {
  const [staff, setStaff] = useState(initialStaff);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle(userId: string, currentStatus: string | null) {
    setError(null);
    setLoadingId(userId);
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const result = await setStaffStatus(userId, newStatus);
    if (result.error) setError(result.error);
    else setStaff((prev) => prev.map((s) => (s.user_id === userId ? { ...s, status: newStatus } : s)));
    setLoadingId(null);
  }

  if (staff.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No staff accounts.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Health Center</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((s) => (
            <TableRow key={s.user_id}>
              <TableCell className="font-medium">{s.full_name}</TableCell>
              <TableCell>{s.email}</TableCell>
              <TableCell>{s.phone}</TableCell>
              <TableCell>{s.health_center_name ?? "—"}</TableCell>
              <TableCell>
                {s.status === "ACTIVE" ? (
                  <Badge variant="default">Active</Badge>
                ) : (
                  <Badge variant="destructive">Suspended</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loadingId === s.user_id}
                  onClick={() => handleToggle(s.user_id, s.status)}
                >
                  {loadingId === s.user_id ? "…" : s.status === "ACTIVE" ? "Deactivate" : "Activate"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
