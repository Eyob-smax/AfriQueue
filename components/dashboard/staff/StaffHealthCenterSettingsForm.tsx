"use client";

import { useState } from "react";
import { updateHealthCenter } from "@/lib/actions/health-center";
import type { HealthCenterForStaff } from "@/lib/actions/health-center";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const OPERATING_STATUSES = ["OPEN", "CLOSED", "MAINTENANCE"] as const;

export function StaffHealthCenterSettingsForm({
  center,
}: {
  center: HealthCenterForStaff;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [specialtiesInput, setSpecialtiesInput] = useState(
    center.specialties?.join(", ") ?? ""
  );
  const [operatingStatus, setOperatingStatus] = useState<string>(
    center.operating_status ?? "OPEN"
  );
  const [queueAvailability, setQueueAvailability] = useState(
    center.queue_availability ?? true
  );

  function parseSpecialties(s: string): string[] {
    return s
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    const form = e.currentTarget;
    const formData = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      city: (form.elements.namedItem("city") as HTMLInputElement).value,
      address: (form.elements.namedItem("address") as HTMLInputElement).value || undefined,
      latitude: (form.elements.namedItem("latitude") as HTMLInputElement).value || undefined,
      longitude: (form.elements.namedItem("longitude") as HTMLInputElement).value || undefined,
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value || undefined,
      services: (form.elements.namedItem("services") as HTMLTextAreaElement).value || undefined,
      specialties: parseSpecialties(specialtiesInput),
      operating_status: operatingStatus as "OPEN" | "CLOSED" | "MAINTENANCE",
      queue_availability: queueAvailability,
    };
    const result = await updateHealthCenter(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  const specialtiesList = parseSpecialties(specialtiesInput);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          className="rounded-xl"
          defaultValue={center.name}
          placeholder="Health center name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          name="city"
          required
          className="rounded-xl"
          defaultValue={center.city}
          placeholder="City"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address (optional)</Label>
        <Input
          id="address"
          name="address"
          className="rounded-xl"
          defaultValue={center.address ?? ""}
          placeholder="Street, area"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          name="description"
          className="rounded-xl min-h-[80px] resize-none"
          defaultValue={center.description ?? ""}
          placeholder="Brief description of the center"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="services">Services (optional)</Label>
        <Textarea
          id="services"
          name="services"
          className="rounded-xl min-h-[60px] resize-none"
          defaultValue={center.services ?? ""}
          placeholder="Comma-separated or one per line"
        />
      </div>
      <div className="space-y-2">
        <Label>Specialties (optional)</Label>
        <Input
          className="rounded-xl"
          value={specialtiesInput}
          onChange={(e) => setSpecialtiesInput(e.target.value)}
          placeholder="e.g. General, Pediatrics, Surgery (comma-separated)"
        />
        {specialtiesList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {specialtiesList.map((s) => (
              <Badge key={s} variant="secondary" className="rounded-lg">
                {s}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude (optional)</Label>
          <Input
            id="latitude"
            name="latitude"
            type="text"
            className="rounded-xl"
            defaultValue={center.latitude ?? ""}
            placeholder="-1.2921"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude (optional)</Label>
          <Input
            id="longitude"
            name="longitude"
            type="text"
            className="rounded-xl"
            defaultValue={center.longitude ?? ""}
            placeholder="36.8219"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Operating status</Label>
        <Select value={operatingStatus} onValueChange={setOperatingStatus}>
          <SelectTrigger className="rounded-xl w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {OPERATING_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-3">
        <Switch
          id="queue_availability"
          checked={queueAvailability}
          onCheckedChange={setQueueAvailability}
        />
        <Label htmlFor="queue_availability" className="cursor-pointer">
          Queue availability (accept new reservations)
        </Label>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Settings saved successfully.
        </p>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="rounded-xl">
          {loading ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
