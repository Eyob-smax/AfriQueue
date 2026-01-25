"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, MapPin, ArrowRight } from "lucide-react";

export function LocationSelect() {
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  const canContinue = country && city;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="pt-10 pb-6 px-8 text-center">
        <h1 className="text-[32px] font-bold text-[#0d1b1a] dark:text-white">
          Welcome to AfriCare
        </h1>
        <p className="mt-2 text-[#4c9a93] dark:text-gray-400 max-w-md mx-auto">
          Let&apos;s find the clinics nearest to you. Please select your
          location to get started.
        </p>
      </div>

      {/* Form */}
      <div className="px-8 pb-10 flex flex-col gap-6">
        {/* Country */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium">
            <Globe className="text-primary w-5 h-5" />
            Select Country
          </label>

          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="h-14 bg-[#f8fcfb] dark:bg-slate-800">
              <SelectValue placeholder="Search or select a country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ethiopia">Ethiopia</SelectItem>
              <SelectItem value="kenya">Kenya</SelectItem>
              <SelectItem value="nigeria">Nigeria</SelectItem>
              <SelectItem value="ghana">Ghana</SelectItem>
              <SelectItem value="south-africa">South Africa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* City */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium">
            <MapPin className="text-primary w-5 h-5" />
            Select City
          </label>

          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="h-14 bg-[#f8fcfb] dark:bg-slate-800">
              <SelectValue placeholder="Search or select a city" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="addis-ababa">Addis Ababa</SelectItem>
              <SelectItem value="nairobi">Nairobi</SelectItem>
              <SelectItem value="lagos">Lagos</SelectItem>
              <SelectItem value="accra">Accra</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Continue */}
        <Button
          disabled={!canContinue}
          className="h-14 text-lg font-bold bg-primary hover:bg-primary/90"
        >
          Continue
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
