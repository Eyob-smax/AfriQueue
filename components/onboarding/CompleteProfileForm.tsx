"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MaterialIcon } from "@/components/ui/material-icon";
import { updateClientProfile } from "@/lib/actions/client-profile";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export function CompleteProfileForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anyDisabilities, setAnyDisabilities] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateClientProfile(formData);
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
          Complete your health profile
        </h1>
        <p className="text-[#4c9a93] dark:text-gray-400 text-base font-normal leading-relaxed max-w-[400px] mx-auto">
          Add your health details so we can give you better clinic recommendations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-8 pb-10 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="flex flex-col w-full">
            <div className="flex items-center gap-2 pb-2">
              <MaterialIcon icon="medical_services" size={20} className="text-primary" />
              <p className="text-[#0d1b1a] dark:text-gray-200 text-base font-medium leading-normal">
                Current health condition (optional)
              </p>
            </div>
            <Input
              name="health_condition"
              placeholder="e.g. Hypertension, Diabetes"
              className="rounded-xl h-12 bg-[#f8fcfb] dark:bg-slate-800 border-[#cfe7e5] dark:border-slate-700"
            />
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex flex-col w-full">
            <div className="flex items-center gap-2 pb-2">
              <MaterialIcon icon="history" size={20} className="text-primary" />
              <p className="text-[#0d1b1a] dark:text-gray-200 text-base font-medium leading-normal">
                Health history (optional)
              </p>
            </div>
            <Textarea
              name="health_history"
              placeholder="Past surgeries, allergies, ongoing treatments"
              rows={3}
              className="rounded-xl bg-[#f8fcfb] dark:bg-slate-800 border-[#cfe7e5] dark:border-slate-700 resize-none"
            />
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex flex-col w-full">
            <div className="flex items-center gap-2 pb-2">
              <MaterialIcon icon="sick" size={20} className="text-primary" />
              <p className="text-[#0d1b1a] dark:text-gray-200 text-base font-medium leading-normal">
                Chronic illnesses (optional)
              </p>
            </div>
            <Input
              name="chronic_illnesses"
              placeholder="e.g. Asthma, Arthritis"
              className="rounded-xl h-12 bg-[#f8fcfb] dark:bg-slate-800 border-[#cfe7e5] dark:border-slate-700"
            />
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex flex-col w-full">
            <div className="flex items-center gap-2 pb-2">
              <MaterialIcon icon="bloodtype" size={20} className="text-primary" />
              <p className="text-[#0d1b1a] dark:text-gray-200 text-base font-medium leading-normal">
                Blood type (optional)
              </p>
            </div>
            <select
              name="blood_type"
              className="rounded-xl h-12 bg-[#f8fcfb] dark:bg-slate-800 border border-[#cfe7e5] dark:border-slate-700 text-[#0d1b1a] dark:text-white px-4 w-full"
            >
              <option value="">Select</option>
              {BLOOD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex flex-col w-full">
            <div className="flex items-center gap-2 pb-2">
              <MaterialIcon icon="contact_emergency" size={20} className="text-primary" />
              <p className="text-[#0d1b1a] dark:text-gray-200 text-base font-medium leading-normal">
                Emergency contact (optional)
              </p>
            </div>
            <Input
              name="emergency_contact"
              placeholder="Name and phone number"
              className="rounded-xl h-12 bg-[#f8fcfb] dark:bg-slate-800 border-[#cfe7e5] dark:border-slate-700"
            />
          </label>
        </div>

        <div className="flex items-start gap-3">
          <input
            type="hidden"
            name="any_disabilities"
            value={anyDisabilities ? "true" : "false"}
          />
          <Checkbox
            id="any_disabilities"
            checked={anyDisabilities}
            onCheckedChange={(v) => setAnyDisabilities(v === true)}
            className="mt-1 rounded border-[#cfe7e5] dark:border-slate-700 text-primary focus:ring-primary"
          />
          <label htmlFor="any_disabilities" className="text-sm text-[#0d1b1a] dark:text-gray-200 cursor-pointer">
            I have a disability or accessibility need that clinics should know about
          </label>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="mt-4 w-full h-14 rounded-xl bg-primary text-white text-lg font-bold hover:brightness-105 active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          {loading ? "Saving…" : "Save and continue"}
          <MaterialIcon icon="arrow_forward" size={20} />
        </Button>
      </form>
    </div>
  );
}
