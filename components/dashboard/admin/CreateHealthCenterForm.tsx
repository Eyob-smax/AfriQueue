"use client";

import { useState } from "react";
import { createHealthCenter } from "@/lib/actions/admin";
import { COUNTRIES, getCitiesForCountry } from "@/lib/constants/locations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SELECT_Z = "z-[110]";

export function CreateHealthCenterForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const cityOptions = getCitiesForCountry(country);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      country,
      city,
      address: (form.elements.namedItem("address") as HTMLInputElement).value || undefined,
      latitude: (form.elements.namedItem("latitude") as HTMLInputElement).value || undefined,
      longitude: (form.elements.namedItem("longitude") as HTMLInputElement).value || undefined,
      description: (form.elements.namedItem("description") as HTMLInputElement).value || undefined,
    };
    if (!formData.country || !formData.city) {
      setError("Country and city are required");
      setLoading(false);
      return;
    }
    const result = await createHealthCenter(formData);
    if (result.error) setError(result.error);
    else {
      setOpen(false);
      setCountry("");
      setCity("");
      form.reset();
      window.location.reload();
    }
    setLoading(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setCountry("");
          setCity("");
        }
      }}
    >
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
            <Label htmlFor="country">Country</Label>
            <Select
              required
              value={country}
              onValueChange={(v) => {
                setCountry(v);
                setCity("");
              }}
            >
              <SelectTrigger
                id="country"
                className="mt-1 h-10 w-full rounded-xl border border-input bg-white dark:bg-slate-900 px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className={SELECT_Z} position="popper">
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Select
              key={`city-select-${country}`}
              required
              value={city}
              onValueChange={setCity}
              disabled={!country}
            >
              <SelectTrigger
                id="city"
                className="mt-1 h-10 w-full rounded-xl border border-input bg-white dark:bg-slate-900 px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
              >
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent key={`city-content-${country}`} className={SELECT_Z} position="popper">
                {cityOptions.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    {country ? "No cities" : "Select country first"}
                  </SelectItem>
                ) : (
                  cityOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
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
