"use client";

import { useState } from "react";
import { approveStaff, rejectStaff } from "@/lib/actions/admin";
import type { PendingStaffRequest } from "@/lib/actions/admin";
import { COUNTRIES } from "@/lib/constants/locations";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
interface StaffRegistrationsTableProps {
  requests: PendingStaffRequest[];
}

export function StaffRegistrationsTable({ requests }: StaffRegistrationsTableProps) {
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState(requests);

  async function handleApprove(id: string) {
    setError(null);
    setApprovingId(id);
    const result = await approveStaff(id);
    if (result.error) {
      setError(result.error);
    } else {
      setList((prev) => prev.filter((r) => r.id !== id));
    }
    setApprovingId(null);
  }

  async function handleReject(id: string) {
    setError(null);
    setRejectingId(id);
    const result = await rejectStaff(id);
    if (result.error) {
      setError(result.error);
    } else {
      setList((prev) => prev.filter((r) => r.id !== id));
    }
    setRejectingId(null);
  }

  if (list.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No pending staff registrations.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Health Center</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.requester_name}</TableCell>
              <TableCell>{r.requester_email}</TableCell>
              <TableCell>{r.requester_phone}</TableCell>
              <TableCell>{r.health_center_name ?? "—"}</TableCell>
              <TableCell>{r.health_center_country ? (COUNTRIES.find((c) => c.value === r.health_center_country)?.label ?? r.health_center_country) : "—"}</TableCell>
              <TableCell>
                {r.created_at
                  ? new Date(r.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={approvingId === r.id || rejectingId === r.id}
                    onClick={() => handleReject(r.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                  >
                    {rejectingId === r.id ? "Processing…" : "Reject"}
                  </Button>
                  <Button
                    size="sm"
                    disabled={approvingId === r.id || rejectingId === r.id}
                    onClick={() => handleApprove(r.id)}
                  >
                    {approvingId === r.id ? "Processing…" : "Approve"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
