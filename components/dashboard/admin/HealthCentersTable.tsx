"use client";

import { useState } from "react";
import {
  blockCenter,
  unblockCenter,
  updateHealthCenterForAdmin,
  deleteHealthCenterForAdmin,
} from "@/lib/actions/admin";
import type { HealthCenterRow } from "@/lib/actions/admin";
import { COUNTRIES, getCitiesForCountry } from "@/lib/constants/locations";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HealthCentersTableProps {
  centers: HealthCenterRow[];
}

export function HealthCentersTable({ centers: initialCenters }: HealthCentersTableProps) {
  const [centers, setCenters] = useState(initialCenters);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editCenter, setEditCenter] = useState<HealthCenterRow | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteCenter, setDeleteCenter] = useState<HealthCenterRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editCountry, setEditCountry] = useState("");

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

  function openEdit(c: HealthCenterRow) {
    setEditCenter(c);
    setEditCountry(c.country ?? "");
    setEditError(null);
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!editCenter) return;
    e.preventDefault();
    setEditError(null);
    setEditLoading(true);
    const form = e.currentTarget;
    const formData = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      country: (form.elements.namedItem("country") as HTMLSelectElement).value,
      city: (form.elements.namedItem("city") as HTMLSelectElement).value,
      address: (form.elements.namedItem("address") as HTMLInputElement).value || undefined,
      latitude: (form.elements.namedItem("latitude") as HTMLInputElement).value || undefined,
      longitude: (form.elements.namedItem("longitude") as HTMLInputElement).value || undefined,
      description: (form.elements.namedItem("description") as HTMLInputElement).value || undefined,
    };
    const result = await updateHealthCenterForAdmin(editCenter.id, formData);
    if (result.error) setEditError(result.error);
    else {
      setCenters((prev) =>
        prev.map((c) =>
          c.id === editCenter.id
            ? {
                ...c,
                name: formData.name,
                country: formData.country || null,
                city: formData.city,
                address: formData.address ?? null,
                description: formData.description ?? null,
                latitude: formData.latitude ?? null,
                longitude: formData.longitude ?? null,
              }
            : c
        )
      );
      setEditCenter(null);
    }
    setEditLoading(false);
  }

  async function handleDeleteConfirm() {
    if (!deleteCenter) return;
    setDeleteError(null);
    setDeleteLoading(true);
    const result = await deleteHealthCenterForAdmin(deleteCenter.id);
    if (result.error) setDeleteError(result.error);
    else {
      setCenters((prev) => prev.filter((c) => c.id !== deleteCenter.id));
      setDeleteCenter(null);
    }
    setDeleteLoading(false);
  }

  const cityOptions = getCitiesForCountry(editCountry);

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
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loadingId === c.id}
                    onClick={() => openEdit(c)}
                  >
                    Edit
                  </Button>
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
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loadingId === c.id || deleteLoading}
                    onClick={() => {
                      setDeleteCenter(c);
                      setDeleteError(null);
                    }}
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editCenter} onOpenChange={(o) => !o && setEditCenter(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit health center</DialogTitle>
          </DialogHeader>
          {editCenter && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  required
                  className="rounded-xl mt-1"
                  defaultValue={editCenter.name}
                  placeholder="Center name"
                />
              </div>
              <div>
                <Label htmlFor="edit-country">Country</Label>
                <select
                  id="edit-country"
                  name="country"
                  value={editCountry}
                  onChange={(e) => setEditCountry(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-xl border border-input bg-white dark:bg-slate-900 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((co) => (
                    <option key={co.value} value={co.value}>
                      {co.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-city">City</Label>
                <select
                  id="edit-city"
                  name="city"
                  required
                  disabled={!editCountry}
                  defaultValue={editCenter.city}
                  className="mt-1 flex h-10 w-full rounded-xl border border-input bg-white dark:bg-slate-900 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                >
                  <option value="">Select city</option>
                  {cityOptions.map((co) => (
                    <option key={co.value} value={co.value}>
                      {co.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-address">Address (optional)</Label>
                <Input
                  id="edit-address"
                  name="address"
                  className="rounded-xl mt-1"
                  defaultValue={editCenter.address ?? ""}
                  placeholder="Street, area"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description (optional)</Label>
                <Input
                  id="edit-description"
                  name="description"
                  className="rounded-xl mt-1"
                  defaultValue={editCenter.description ?? ""}
                  placeholder="Brief description"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="edit-latitude">Latitude (optional)</Label>
                  <Input
                    id="edit-latitude"
                    name="latitude"
                    type="text"
                    className="rounded-xl mt-1"
                    defaultValue={editCenter.latitude ?? ""}
                    placeholder="-1.2921"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-longitude">Longitude (optional)</Label>
                  <Input
                    id="edit-longitude"
                    name="longitude"
                    type="text"
                    className="rounded-xl mt-1"
                    defaultValue={editCenter.longitude ?? ""}
                    placeholder="36.8219"
                  />
                </div>
              </div>
              {editError && (
                <p className="text-sm text-red-600 dark:text-red-400">{editError}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditCenter(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editLoading}>
                  {editLoading ? "Saving…" : "Save"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteCenter}
        onOpenChange={(o) => !o && setDeleteCenter(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete health center?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteCenter?.name} will be permanently removed. This cannot be undone. You can
              only delete centers with no staff assigned and no queues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
