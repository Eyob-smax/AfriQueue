"use client";

import { useState } from "react";
import { createHealthCenter } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreateHealthCenterForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      city: (form.elements.namedItem("city") as HTMLInputElement).value,
      address: (form.elements.namedItem("address") as HTMLInputElement).value || undefined,
      latitude: (form.elements.namedItem("latitude") as HTMLInputElement).value || undefined,
      longitude: (form.elements.namedItem("longitude") as HTMLInputElement).value || undefined,
      description: (form.elements.namedItem("description") as HTMLInputElement).value || undefined,
    };
    const result = await createHealthCenter(formData);
    if (result.error) setError(result.error);
    else {
      setOpen(false);
      form.reset();
      window.location.reload();
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl">Create hospital</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create health center</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required className="rounded-xl mt-1" placeholder="Center name" />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" required className="rounded-xl mt-1" placeholder="Nairobi" />
          </div>
          <div>
            <Label htmlFor="address">Address (optional)</Label>
            <Input id="address" name="address" className="rounded-xl mt-1" placeholder="Street, area" />
          </div>
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Input id="description" name="description" className="rounded-xl mt-1" placeholder="Brief description" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="latitude">Latitude (optional)</Label>
              <Input id="latitude" name="latitude" type="text" className="rounded-xl mt-1" placeholder="-1.2921" />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude (optional)</Label>
              <Input id="longitude" name="longitude" type="text" className="rounded-xl mt-1" placeholder="36.8219" />
            </div>
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
