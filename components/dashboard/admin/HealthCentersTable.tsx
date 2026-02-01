"use client";

import { useState } from "react";
import { blockCenter, unblockCenter } from "@/lib/actions/admin";
import type { HealthCenterRow } from "@/lib/actions/admin";
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

interface HealthCentersTableProps {
  centers: HealthCenterRow[];
}

export function HealthCentersTable({ centers: initialCenters }: HealthCentersTableProps) {
  const [centers, setCenters] = useState(initialCenters);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleBlock(id: string) {
    setError(null);
    setLoadingId(id);
    const result = await blockCenter(id);
    if (result.error) setError(result.error);
    else setCenters((prev) => prev.map((c) => (c.id === id ? { ...c, is_blocked: true } : c)));
    setLoadingId(null);
  }

  async function handleUnblock(id: string) {
    setError(null);
    setLoadingId(id);
    const result = await unblockCenter(id);
    if (result.error) setError(result.error);
    else setCenters((prev) => prev.map((c) => (c.id === id ? { ...c, is_blocked: false } : c)));
    setLoadingId(null);
  }

  if (centers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No health centers. Create one using the button above.
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
            <TableHead>City</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {centers.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell>{c.city}</TableCell>
              <TableCell>{c.address ?? "—"}</TableCell>
              <TableCell>
                {c.is_blocked ? (
                  <Badge variant="destructive">Blocked</Badge>
                ) : (
                  <Badge variant="secondary">{c.status ?? "OPEN"}</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                {c.is_blocked ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loadingId === c.id}
                    onClick={() => handleUnblock(c.id)}
                  >
                    {loadingId === c.id ? "…" : "Unblock"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loadingId === c.id}
                    onClick={() => handleBlock(c.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                  >
                    {loadingId === c.id ? "…" : "Block"}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
