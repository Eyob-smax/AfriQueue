"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { syncUserAfterPhoneAuth } from "@/lib/actions/auth";
import { updateUserLocation } from "@/lib/actions/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MaterialIcon } from "@/components/ui/material-icon";
import { COUNTRIES, getCountryPhoneCode } from "@/lib/constants/locations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PhoneAuthFormProps {
  mode?: "login" | "signup";
  /** E.164 country code without + (e.g. "251" for Ethiopia). When set, phone input is locked to this prefix. */
  countryCode?: string;
  countryLabel?: string;
  cityLabel?: string;
}

export function PhoneAuthForm({
  mode = "login",
  countryCode: propCountryCode,
  countryLabel,
  cityLabel,
}: PhoneAuthFormProps) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Login: user selects country so we enforce prefix. Signup: parent passes countryCode.
  const [loginCountry, setLoginCountry] = useState("");

  const countryCode = propCountryCode ?? (loginCountry ? getCountryPhoneCode(loginCountry) : "");
  const prefix = countryCode ? `+${countryCode}` : "";
  const isEnforced = !!countryCode;

  function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 0) return "";
    if (isEnforced) {
      // Already have country code in digits or user typed national number
      if (digits.startsWith(countryCode)) return `+${digits}`;
      if (digits.startsWith("0")) return `+${countryCode}${digits.slice(1)}`;
      return `+${countryCode}${digits}`;
    }
    if (digits.startsWith("0")) return `+254${digits.slice(1)}`;
    return `+${digits}`;
  }

  function getDisplayPhone(value: string): string {
    const formatted = formatPhone(value);
    if (!formatted) return "";
    if (isEnforced && formatted.startsWith(prefix)) {
      const national = formatted.slice(prefix.length).replace(/\D/g, "");
      return national; // show only national part in input when prefix is fixed
    }
    return formatted;
  }

  function handlePhoneChange(raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (isEnforced) {
      // Store only national number (no leading 0)
      const national = digits.startsWith(countryCode)
        ? digits.slice(countryCode.length)
        : digits.startsWith("0")
          ? digits.slice(1)
          : digits;
      setPhone(national.slice(0, 12));
    } else {
      setPhone(raw);
    }
  }

  function getFullPhoneForSubmit(): string {
    if (isEnforced) return formatPhone(phone);
    return formatPhone(phone);
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formatted = getFullPhoneForSubmit();
    if (!formatted || formatted.length < 10) {
      setError(
        isEnforced
          ? `Enter a valid phone number (must start with +${countryCode})`
          : "Please enter a valid phone number with country code (e.g. +254712345678)"
      );
      setLoading(false);
      return;
    }
    if (isEnforced && !formatted.startsWith(prefix)) {
      setError(`Phone must start with ${prefix} for your selected country.`);
      setLoading(false);
      return;
    }
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithOtp({
        phone: formatted,
      });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setStep("verify");
      setError(null);
    } catch {
      setError("Failed to send code. Please try again.");
    }
    setLoading(false);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formatted = getFullPhoneForSubmit();
    const token = otp.replace(/\D/g, "");
    if (token.length !== 6) {
      setError("Please enter the 6-digit code");
      setLoading(false);
      return;
    }
    try {
      const supabase = createClient();
      const { data, error: err } = await supabase.auth.verifyOtp({
        phone: formatted,
        token,
        type: "sms",
      });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      if (data?.session) {
        await syncUserAfterPhoneAuth();
        if (mode === "signup" && countryLabel && cityLabel) {
          await updateUserLocation(countryLabel, cityLabel);
        }
        window.location.href = "/dashboard";
        return;
      }
      setError("Verification failed. Please try again.");
    } catch {
      setError("Verification failed. Please try again.");
    }
    setLoading(false);
  }

  function handleBack() {
    setStep("phone");
    setOtp("");
    setError(null);
  }

  if (step === "verify") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
          <MaterialIcon icon="sms" size={24} className="text-primary" />
          <div>
            <p className="font-bold text-sm text-[#0d1b1a] dark:text-white">
              Check your phone
            </p>
            <p className="text-xs text-[#4c9a93]">
              We sent a 6-digit code to {getFullPhoneForSubmit()}
            </p>
          </div>
        </div>

        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
          <label htmlFor="otp" className="flex flex-col w-full">
            <p className="text-[#0d1b1a] dark:text-gray-200 text-sm font-medium pb-2">
              Verification code
            </p>
            <div className="relative">
              <MaterialIcon
                icon="dialpad"
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4c9a93]"
              />
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="rounded-xl h-14 bg-[#f8fcfb] dark:bg-slate-800 border-[#cfe7e5] dark:border-slate-700 pl-12 pr-4 text-center text-lg tracking-[0.5em] font-mono focus:ring-primary/50 focus:ring-2"
              />
            </div>
          </label>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full h-14 rounded-xl bg-primary text-white text-lg font-bold hover:brightness-105 active:scale-[0.98] shadow-lg shadow-primary/20"
          >
            {loading ? "Verifying…" : "Verify and continue"}
          </Button>

          <button
            type="button"
            onClick={handleBack}
            className="text-sm text-[#4c9a93] hover:text-primary transition-colors"
          >
            ← Use a different number
          </button>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSendOtp} className="flex flex-col gap-6">
      {mode === "login" && !propCountryCode && (
        <div className="flex flex-col gap-2">
          <label className="flex flex-col w-full">
            <p className="text-[#0d1b1a] dark:text-gray-200 text-sm font-medium pb-2">
              Country
            </p>
            <Select value={loginCountry} onValueChange={(v) => { setLoginCountry(v); setPhone(""); }}>
              <SelectTrigger className="rounded-xl h-14 bg-[#f8fcfb] dark:bg-slate-800 border-[#cfe7e5] dark:border-slate-700">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label} (+{getCountryPhoneCode(c.value)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className="flex flex-col w-full">
          <div className="flex items-center gap-2 pb-2">
            <MaterialIcon icon="phone_android" size={20} className="text-primary" />
            <p className="text-[#0d1b1a] dark:text-gray-200 text-base font-medium">
              Phone number
            </p>
          </div>
          {isEnforced ? (
            <div className="flex rounded-xl overflow-hidden border border-[#cfe7e5] dark:border-slate-700 bg-[#f8fcfb] dark:bg-slate-800">
              <span className="flex items-center px-4 text-[#0d1b1a] dark:text-white font-medium border-r border-[#cfe7e5] dark:border-slate-700">
                +{countryCode}
              </span>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                placeholder="912345678"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="rounded-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pl-3"
              />
            </div>
          ) : (
            <Input
              id="phone"
              type="tel"
              placeholder="+254 712 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-xl h-14 bg-[#f8fcfb] dark:bg-slate-800 border-[#cfe7e5] dark:border-slate-700 px-4 focus:ring-primary/50 focus:ring-2"
            />
          )}
          <p className="text-xs text-[#4c9a93] mt-1">
            {isEnforced
              ? `Phone must start with +${countryCode} for your selected country.`
              : "Include country code (e.g. +254 for Kenya)"}
          </p>
        </label>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <Button
        type="submit"
        disabled={loading || (mode === "login" && !propCountryCode && !loginCountry)}
        className="w-full h-14 rounded-xl bg-primary text-white text-lg font-bold hover:brightness-105 active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
      >
        {loading ? "Sending code…" : "Send verification code"}
        <MaterialIcon icon="arrow_forward" size={20} />
      </Button>
    </form>
  );
}
