"use client";

import { useState } from "react";
import { setClientStatus } from "@/lib/actions/admin";
import type { ClientListItem } from "@/lib/actions/admin";
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
import { COUNTRIES } from "@/lib/constants/locations";

interface ClientsTableProps {
  clients: ClientListItem[];
}

export function ClientsTable({ clients: initialClients }: ClientsTableProps) {
  const [clients, setClients] = useState(initialClients);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle(userId: string, currentStatus: string | null) {
    setError(null);
    setLoadingId(userId);
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const result = await setClientStatus(userId, newStatus);
    if (result.error) setError(result.error);
    else
      setClients((prev) =>
        prev.map((c) => (c.user_id === userId ? { ...c, status: newStatus } : c))
      );
    setLoadingId(null);
  }

  if (clients.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No clients yet.
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
            <TableHead>Location</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((c) => (
            <TableRow key={c.user_id}>
              <TableCell className="font-medium">{c.full_name}</TableCell>
              <TableCell>{c.email}</TableCell>
              <TableCell>{c.phone}</TableCell>
              <TableCell>
                {c.country
                  ? COUNTRIES.find((x) => x.value === c.country)?.label ?? c.country
                  : "—"}
                {c.city ? ` · ${c.city}` : ""}
              </TableCell>
              <TableCell>
                {c.created_at
                  ? new Date(c.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </TableCell>
              <TableCell>
                {c.status === "ACTIVE" ? (
                  <Badge variant="default">Active</Badge>
                ) : (
                  <Badge variant="destructive">Suspended</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loadingId === c.user_id}
                  onClick={() => handleToggle(c.user_id, c.status)}
                >
                  {loadingId === c.user_id
                    ? "…"
                    : c.status === "ACTIVE"
                      ? "Suspend"
                      : "Activate"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
