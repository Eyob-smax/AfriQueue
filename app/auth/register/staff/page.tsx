"use client";

import { useState } from "react";
import Link from "next/link";
import { signUpStaff } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/onboarding/Logo";
import { MaterialIcon } from "@/components/ui/material-icon";
import { COUNTRIES } from "@/lib/constants/locations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StaffRegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!country) {
      setError("Please select a country");
      return;
    }
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("healthCenterCountry", country);
    const result = await signUpStaff(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark transition-colors duration-300">
      <header className="flex items-center justify-between border-b border-[#e7f3f2] dark:border-[#1e3a38] px-6 md:px-10 py-3 bg-white dark:bg-background-dark sticky top-0 z-50">
        <Logo />
        <div className="flex items-center gap-4">
          <Link
            href="/auth/register"
            className="text-[#4c9a93] dark:text-gray-400 text-sm font-medium hover:text-primary"
          >
            Register as Client
          </Link>
          <Link href="/auth/login">
            <Button className="min-w-[84px] h-10 px-4 rounded-xl bg-primary text-[#0d1b1a] text-sm font-bold">
              Login
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[560px]">
          <div className="mb-8">
            <h1 className="text-[#0d1b1a] dark:text-white text-3xl font-black leading-tight">
              Staff Registration
            </h1>
            <p className="text-[#4c9a93] dark:text-gray-400 mt-2">
              Register your health center. An admin will review and approve your account before you can log in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#152e2b] rounded-xl shadow-sm border border-[#e7f3f2] dark:border-[#1e3a38] p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="fullName" className="text-[#0d1b1a] dark:text-white text-sm font-medium">
                Full Name
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                required
                placeholder="Your full name"
                className="rounded-xl h-12 border-[#cfe7e5] dark:border-[#1e3a38]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-[#0d1b1a] dark:text-white text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@healthcenter.com"
                className="rounded-xl h-12 border-[#cfe7e5] dark:border-[#1e3a38]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-[#0d1b1a] dark:text-white text-sm font-medium">
                Phone
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+251..."
                className="rounded-xl h-12 border-[#cfe7e5] dark:border-[#1e3a38]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="healthCenterCountry" className="text-[#0d1b1a] dark:text-white text-sm font-medium">
                Country
              </label>
              <Select
                value={country}
                onValueChange={setCountry}
                required
              >
                <SelectTrigger
                  id="healthCenterCountry"
                  className="rounded-xl h-12 border-[#cfe7e5] dark:border-[#1e3a38]"
                >
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="healthCenterName" className="text-[#0d1b1a] dark:text-white text-sm font-medium">
                Health Center Name
              </label>
              <Input
                id="healthCenterName"
                name="healthCenterName"
                type="text"
                placeholder="e.g. City Central Health"
                className="rounded-xl h-12 border-[#cfe7e5] dark:border-[#1e3a38]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="healthCenterDescription" className="text-[#0d1b1a] dark:text-white text-sm font-medium">
                Description (optional)
              </label>
              <Input
                id="healthCenterDescription"
                name="healthCenterDescription"
                type="text"
                placeholder="Brief description of your center"
                className="rounded-xl h-12 border-[#cfe7e5] dark:border-[#1e3a38]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="healthCenterLocation" className="text-[#0d1b1a] dark:text-white text-sm font-medium">
                Location (optional)
              </label>
              <Input
                id="healthCenterLocation"
                name="healthCenterLocation"
                type="text"
                placeholder="Address or city"
                className="rounded-xl h-12 border-[#cfe7e5] dark:border-[#1e3a38]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-[#0d1b1a] dark:text-white text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Min 6 characters"
                className="rounded-xl h-12 border-[#cfe7e5] dark:border-[#1e3a38]"
              />
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-xl bg-primary text-[#0d1b1a] font-bold text-lg"
            >
              {loading ? "Submitting…" : "Submit for approval"}
              <MaterialIcon icon="arrow_forward" size={20} className="ml-2" />
            </Button>

            <p className="text-xs text-[#4c9a93] text-center">
              You will be redirected to a pending-approval page. An admin will review your request and email you when your account is approved.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-[#4c9a93]">
            <Link href="/auth/login" className="font-medium hover:text-primary">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
