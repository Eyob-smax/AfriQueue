"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/onboarding/Logo";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Checkbox } from "@/components/ui/checkbox";
import { PhoneAuthForm } from "@/components/auth/PhoneAuthForm";
import { COUNTRIES, getCitiesForCountry, getCountryPhoneCode } from "@/lib/constants/locations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AuthTab = "email" | "phone";
type RegStep = 1 | 2;

export default function RegisterPage() {
  const [regStep, setRegStep] = useState<RegStep>(1);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [authTab, setAuthTab] = useState<AuthTab>("email");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [terms, setTerms] = useState(false);

  const cities = country ? getCitiesForCountry(country) : [];
  const countryLabel = COUNTRIES.find((c) => c.value === country)?.label ?? country;
  const cityLabel = cities.find((c) => c.value === city)?.label ?? city;
  const countryCode = country ? getCountryPhoneCode(country) : "";
  const canProceedFromStep1 = country && city;

  async function handleGoogleSignUp() {
    setError(null);
    setGoogleLoading(true);
    try {
      const { data, error: err } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
      if (err) {
        setError(err.message ?? "Failed to sign up with Google");
        setGoogleLoading(false);
        return;
      }
      if (data?.url) window.location.href = data.url;
    } catch (e) {
      setError("Failed to sign up with Google");
    }
    setGoogleLoading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark transition-colors duration-300">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e7f3f2] dark:border-[#1e3a38] px-6 md:px-10 py-3 bg-white dark:bg-background-dark sticky top-0 z-50">
        <Logo />
        <div className="flex flex-1 justify-end gap-6 md:gap-8">
          <div className="hidden md:flex items-center gap-9">
            <Link
              href="/"
              className="text-[#0d1b1a] dark:text-gray-300 text-sm font-medium leading-normal hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              href="/dashboard/client"
              className="text-[#0d1b1a] dark:text-gray-300 text-sm font-medium leading-normal hover:text-primary transition-colors"
            >
              Clinics
            </Link>
            <Link
              href="#"
              className="text-[#0d1b1a] dark:text-gray-300 text-sm font-medium leading-normal hover:text-primary transition-colors"
            >
              Support
            </Link>
          </div>
          <Link href="/auth/login">
            <Button className="min-w-[84px] h-10 px-4 rounded-xl bg-primary text-[#0d1b1a] text-sm font-bold hover:opacity-90 transition-opacity">
              Login
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[960px] flex flex-col gap-6">
          <div className="flex flex-wrap justify-between items-end gap-3 px-4">
            <div className="flex min-w-72 flex-col gap-3">
              <h1 className="text-[#0d1b1a] dark:text-white text-4xl font-black leading-tight tracking-tight">
                Create Your Health Profile
              </h1>
              <p className="text-[#4c9a93] dark:text-gray-400 text-base font-normal leading-normal">
                Join AfriCare Queue for accessible healthcare at your fingertips.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
              <MaterialIcon icon="assignment_ind" size={20} className="text-primary" />
              <span className="text-[#0d1b1a] dark:text-white text-sm font-bold">
                Step {regStep} of 2
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#152e2b] rounded-xl shadow-sm border border-[#e7f3f2] dark:border-[#1e3a38] overflow-hidden">
            <div className="flex flex-col gap-3 p-6 bg-primary/5">
              <div className="flex gap-6 justify-between">
                <p className="text-[#0d1b1a] dark:text-white text-base font-medium leading-normal">
                  Registration Progress
                </p>
                <p className="text-[#0d1b1a] dark:text-white text-sm font-normal leading-normal">
                  {regStep === 1 ? "50%" : "100%"}
                </p>
              </div>
              <div className="rounded-full bg-[#cfe7e5] dark:bg-gray-700 h-2 overflow-hidden">
                <div className="h-2 rounded-full bg-primary" style={{ width: regStep === 1 ? "50%" : "100%" }} />
              </div>
            </div>

            {regStep === 1 ? (
              <div className="p-8 flex flex-col gap-6">
                <p className="text-[#0d1b1a] dark:text-white text-base font-medium">
                  Select your country and city so we can show clinics near you and use the correct phone format.
                </p>
                <div className="flex flex-col gap-2">
                  <label className="flex flex-col w-full">
                    <p className="text-[#0d1b1a] dark:text-white text-sm font-medium pb-2">Country</p>
                    <Select value={country} onValueChange={(v) => { setCountry(v); setCity(""); }}>
                      <SelectTrigger className="rounded-xl h-14 bg-background-light dark:bg-background-dark border-[#cfe7e5] dark:border-[#1e3a38]">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="flex flex-col w-full">
                    <p className="text-[#0d1b1a] dark:text-white text-sm font-medium pb-2">City</p>
                    <Select value={city} onValueChange={setCity} disabled={!country}>
                      <SelectTrigger className="rounded-xl h-14 bg-background-light dark:bg-background-dark border-[#cfe7e5] dark:border-[#1e3a38]">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                </div>
                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                <Button
                  type="button"
                  disabled={!canProceedFromStep1}
                  onClick={() => { setRegStep(2); setError(null); }}
                  className="w-full h-14 rounded-xl bg-primary text-[#0d1b1a] font-bold text-lg"
                >
                  Continue to create account
                  <MaterialIcon icon="arrow_forward" size={20} className="ml-2" />
                </Button>
              </div>
            ) : (
              <>
            <div className="flex border-b border-[#e7f3f2] dark:border-[#1e3a38] mx-8 mt-4">
              <button
                type="button"
                onClick={() => { setAuthTab("email"); setError(null); }}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  authTab === "email"
                    ? "text-primary border-b-2 border-primary"
                    : "text-[#4c9a93] hover:text-[#0d1b1a] dark:hover:text-white"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab("phone"); setError(null); }}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  authTab === "phone"
                    ? "text-primary border-b-2 border-primary"
                    : "text-[#4c9a93] hover:text-[#0d1b1a] dark:hover:text-white"
                }`}
              >
                Phone
              </button>
            </div>

            {authTab === "phone" ? (
              <div className="p-8">
                <PhoneAuthForm
                  mode="signup"
                  countryCode={countryCode}
                  countryLabel={countryLabel}
                  cityLabel={cityLabel}
                />
                <div className="mt-6 flex flex-col gap-3">
                  <Button
                    type="button"
                    onClick={handleGoogleSignUp}
                    disabled={googleLoading}
                    variant="outline"
                    className="w-full h-12 rounded-xl border-2 border-[#cfe7e5] dark:border-[#1e3a38]"
                  >
                    {googleLoading ? "Connecting…" : "Or continue with Google"}
                  </Button>
                  <Link href="/auth/login" className="text-center">
                    <Button type="button" variant="outline" className="w-full h-12 rounded-xl">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <input type="hidden" name="country" value={countryLabel} />
              <input type="hidden" name="city" value={cityLabel} />
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-[#0d1b1a] dark:text-white text-2xl font-bold leading-tight pb-2">
                    Personal Details
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Please provide your details as they appear on your ID.
                  </p>
                  <p className="text-xs text-[#4c9a93] mt-1">
                    Location: {countryLabel}, {cityLabel}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="fullName" className="flex flex-col w-full">
                    <p className="text-[#0d1b1a] dark:text-white text-sm font-medium leading-normal pb-2">
                      Full Name <span className="text-[#4c9a93]">(optional)</span>
                    </p>
                    <div className="relative">
                      <MaterialIcon
                        icon="person"
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4c9a93]"
                      />
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        className="rounded-xl h-14 bg-background-light dark:bg-background-dark border-[#cfe7e5] dark:border-[#1e3a38] pl-12 pr-4 focus:ring-primary/50 focus:ring-2"
                      />
                    </div>
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="flex flex-col w-full">
                    <p className="text-[#0d1b1a] dark:text-white text-sm font-medium leading-normal pb-2">
                      Email
                    </p>
                    <div className="relative">
                      <MaterialIcon
                        icon="mail"
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4c9a93]"
                      />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        className="rounded-xl h-14 bg-background-light dark:bg-background-dark border-[#cfe7e5] dark:border-[#1e3a38] pl-12 pr-4 focus:ring-primary/50 focus:ring-2"
                      />
                    </div>
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="flex flex-col w-full">
                    <p className="text-[#0d1b1a] dark:text-white text-sm font-medium leading-normal pb-2">
                      Phone (optional)
                    </p>
                    <div className="relative">
                      <MaterialIcon
                        icon="call"
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4c9a93]"
                      />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+234 800 000 0000"
                        className="rounded-xl h-14 bg-background-light dark:bg-background-dark border-[#cfe7e5] dark:border-[#1e3a38] pl-12 pr-4 focus:ring-primary/50 focus:ring-2"
                      />
                    </div>
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="password" className="flex flex-col w-full">
                    <p className="text-[#0d1b1a] dark:text-white text-sm font-medium leading-normal pb-2">
                      Password
                    </p>
                    <div className="relative">
                      <MaterialIcon
                        icon="lock"
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4c9a93]"
                      />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Min 6 characters"
                        required
                        minLength={6}
                        className="rounded-xl h-14 bg-background-light dark:bg-background-dark border-[#cfe7e5] dark:border-[#1e3a38] pl-12 pr-4 focus:ring-primary/50 focus:ring-2"
                      />
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex flex-col justify-between bg-background-light/50 dark:bg-background-dark/30 rounded-xl p-6 border border-dashed border-primary/30">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/20 p-2 rounded-lg shrink-0">
                      <MaterialIcon icon="security" size={24} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0d1b1a] dark:text-white">
                        Secure Registration
                      </h4>
                      <p className="text-sm text-[#4c9a93]">
                        We use bank-grade encryption to protect your health data.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/20 p-2 rounded-lg shrink-0">
                      <MaterialIcon icon="speed" size={24} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0d1b1a] dark:text-white">
                        Skip the Wait
                      </h4>
                      <p className="text-sm text-[#4c9a93]">
                        Registered users get prioritized access to digital check-ins.
                      </p>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-[#e7f3f2] dark:border-[#1e3a38]">
                    <label htmlFor="terms-checkbox" className="flex items-start gap-3 cursor-pointer group">
                      <Checkbox
                        id="terms-checkbox"
                        checked={terms}
                        onCheckedChange={(v) => setTerms(v === true)}
                        className="mt-1 rounded border-[#cfe7e5] dark:border-[#1e3a38] text-primary focus:ring-primary"
                      />
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-[#0d1b1a] dark:text-white group-hover:text-primary transition-colors">
                          I agree to the Terms & Conditions
                        </p>
                        <p className="text-xs text-[#4c9a93]">
                          I understand how my health data will be processed by
                          AfriCare.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
                <div className="mt-8 flex flex-col gap-3">
                  {error && (
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  )}
                  <Button
                    type="button"
                    onClick={handleGoogleSignUp}
                    disabled={googleLoading}
                    variant="outline"
                    className="w-full h-14 rounded-xl border-2 border-[#cfe7e5] dark:border-[#1e3a38] bg-white dark:bg-transparent text-[#0d1b1a] dark:text-white text-base font-semibold hover:bg-[#f8fcfb] dark:hover:bg-white/5 flex items-center justify-center gap-3"
                  >
                    {googleLoading ? (
                      <>Connecting…</>
                    ) : (
                      <>
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </Button>
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-[#cfe7e5] dark:border-[#1e3a38]" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-background-light/50 dark:bg-background-dark/30 px-2 text-[#4c9a93]">or</span>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || !country || !city}
                    className="w-full h-14 bg-primary rounded-xl text-[#0d1b1a] font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating account…" : "Sign Up"}
                    <MaterialIcon icon="arrow_forward" size={20} />
                  </Button>
                  <Link href="/auth/login">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 bg-white dark:bg-transparent border border-[#cfe7e5] dark:border-[#1e3a38] rounded-xl text-[#0d1b1a] dark:text-white font-medium text-sm hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            </form>
            )}
              <div className="px-8 pb-4">
                <button
                  type="button"
                  onClick={() => setRegStep(1)}
                  className="text-sm text-[#4c9a93] hover:text-primary"
                >
                  ← Change country or city
                </button>
              </div>
              </>
            )}
          </div>

          <div className="flex justify-center gap-4 py-4">
            <Link
              href="#"
              className="text-xs font-medium text-[#4c9a93] hover:text-primary flex items-center gap-1"
            >
              <MaterialIcon icon="language" size={14} />
              English (UK)
            </Link>
            <Link
              href="#"
              className="text-xs font-medium text-[#4c9a93] hover:text-primary flex items-center gap-1"
            >
              <MaterialIcon icon="help_outline" size={14} />
              Help Center
            </Link>
          </div>
        </div>
      </div>

      <footer className="p-8 text-center text-[10px] text-[#4c9a93] uppercase tracking-[0.2em]">
        © 2024 AfriCare Healthcare Systems. All Rights Reserved.
      </footer>
    </main>
  );
}
