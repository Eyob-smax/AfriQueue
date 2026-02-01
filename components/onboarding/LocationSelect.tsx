"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MaterialIcon } from "@/components/ui/material-icon";
import { updateUserLocation } from "@/lib/actions/location";
import { COUNTRIES, getCitiesForCountry } from "@/lib/constants/locations";

export function LocationSelect() {
  const router = useRouter();
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cities = country ? getCitiesForCountry(country) : [];
  const canContinue = country && city && !loading;

  async function handleContinue() {
    if (!country || !city) return;
    setError(null);
    setLoading(true);
    const countryLabel = COUNTRIES.find((c) => c.value === country)?.label ?? country;
    const cityLabel = cities.find((c) => c.value === city)?.label ?? city;
    const result = await updateUserLocation(countryLabel, cityLabel);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="pt-10 pb-6 px-8 text-center">
        <h1 className="text-[32px] font-bold text-[#0d1b1a] dark:text-white tracking-tight leading-tight pb-3">
          Welcome to AfriCare
        </h1>
        <p className="text-[#4c9a93] dark:text-gray-400 text-base font-normal leading-relaxed max-w-[400px] mx-auto">
          Let&apos;s find the clinics nearest to you. Please select your location
          to get started.
        </p>
      </div>

      <div className="px-8 pb-10 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="flex flex-col w-full">
            <div className="flex items-center gap-2 pb-2">
              <MaterialIcon icon="public" size={20} className="text-primary" />
              <p className="text-[#0d1b1a] dark:text-gray-200 text-base font-medium leading-normal">
                Select Country
              </p>
            </div>
            <Select value={country} onValueChange={(v) => { setCountry(v); setCity(""); }}>
              <SelectTrigger className="appearance-none rounded-xl h-14 bg-[#f8fcfb] dark:bg-slate-800 border-[#cfe7e5] dark:border-slate-700 text-[#0d1b1a] dark:text-white focus:ring-primary/50 focus:ring-2">
                <SelectValue placeholder="Search or select a country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex flex-col w-full">
            <div className="flex items-center gap-2 pb-2">
              <MaterialIcon icon="location_on" size={20} className="text-primary" />
              <p className="text-[#0d1b1a] dark:text-gray-200 text-base font-medium leading-normal">
                Select City
              </p>
            </div>
            <Select value={city} onValueChange={setCity} disabled={!country}>
              <SelectTrigger className="appearance-none rounded-xl h-14 bg-[#f8fcfb] dark:bg-slate-800 border-[#cfe7e5] dark:border-slate-700 text-[#0d1b1a] dark:text-white focus:ring-primary/50 focus:ring-2">
                <SelectValue placeholder="Search or select a city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <Button
          disabled={!canContinue}
          onClick={handleContinue}
          className="mt-4 w-full h-14 rounded-xl bg-primary text-white text-lg font-bold hover:brightness-105 active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          {loading ? "Saving…" : "Continue"}
          <MaterialIcon icon="arrow_forward" size={20} />
        </Button>
      </div>
    </div>
  );
}
