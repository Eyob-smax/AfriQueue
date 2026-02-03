"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, signInAdmin } from "@/lib/actions/auth";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Logo } from "@/components/onboarding/Logo";
import { PhoneAuthForm } from "@/components/auth/PhoneAuthForm";

type AuthTab = "email" | "phone";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const signInAsAdmin = searchParams.get("as") === "admin";
  const showConfirmEmailNotice = searchParams.get("confirm_email") === "1";
  const [authTab, setAuthTab] = useState<AuthTab>("email");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [dismissConfirmNotice, setDismissConfirmNotice] = useState(false);

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    try {
      const { data, error: err } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
      if (err) {
        setError(err.message ?? "Failed to sign in with Google");
        setGoogleLoading(false);
        return;
      }
      if (data?.url) window.location.href = data.url;
    } catch (e) {
      setError("Failed to sign in with Google");
    }
    setGoogleLoading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const result = signInAsAdmin
        ? await signInAdmin(formData)
        : await signIn(formData);
      if (result?.error) {
        if (result.error === "NEXT_REDIRECT") {
          router.push("/dashboard");
          return;
        }
        setError(result.error);
        return;
      }
    } catch (err) {
      const digest = (err as { digest?: string })?.digest;
      if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) {
        const parts = digest.split(";");
        const url = parts.length >= 3 ? parts[2] : "/dashboard";
        router.push(url);
        return;
      }
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <div className="fixed inset-0 opacity-5 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary blur-3xl -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-primary blur-3xl -ml-64 -mb-64" />
      </div>

      <div className="relative z-10 w-full max-w-[600px] flex flex-col gap-6">
        <div className="flex justify-center mb-2">
          <Logo />
        </div>

        {showConfirmEmailNotice && !dismissConfirmNotice && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/40">
            <MaterialIcon icon="mail" size={24} className="text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0d1b1a] dark:text-white">
                Check your email
              </p>
              <p className="text-sm text-[#4c9a93] dark:text-gray-300 mt-1">
                We sent you a confirmation link. Click it to verify your account, then sign in below.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDismissConfirmNotice(true)}
              className="shrink-0 p-1 rounded-lg hover:bg-primary/20 text-[#4c9a93] dark:text-gray-400 hover:text-[#0d1b1a] dark:hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              <MaterialIcon icon="close" size={20} />
            </button>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="pt-10 pb-6 px-8 text-center">
            <h1 className="text-[#0d1b1a] dark:text-white tracking-tight text-[32px] font-bold leading-tight pb-3">
              {signInAsAdmin ? "Admin sign in" : "Welcome back"}
            </h1>
            <p className="text-[#4c9a93] dark:text-gray-400 text-base font-normal leading-relaxed max-w-[400px] mx-auto">
              {signInAsAdmin
                ? "Use your administrator email and password to access the admin dashboard."
                : "Login to manage your clinic queue efficiently."}
            </p>
          </div>

          <div className="flex border-b border-[#cfe7e5] dark:border-slate-700 mx-8">
            <button
              type="button"
              onClick={() => { setAuthTab("email"); setError(null); }}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${authTab === "email" ? "text-primary border-b-2 border-primary" : "text-[#4c9a93] hover:text-[#0d1b1a] dark:hover:text-white"}`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => { setAuthTab("phone"); setError(null); }}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${authTab === "phone" ? "text-primary border-b-2 border-primary" : "text-[#4c9a93] hover:text-[#0d1b1a] dark:hover:text-white"}`}
            >
              Phone
            </button>
          </div>

          <div className="px-8 pb-10">
            {authTab === "phone" ? (
              <div className="pt-6">
                <PhoneAuthForm mode="login" />
              </div>
            ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="flex flex-col w-full">
                <div className="flex items-center gap-2 pb-2">
                  <MaterialIcon icon="mail" size={20} className="text-primary" />
                  <p className="text-[#0d1b1a] dark:text-gray-200 text-base font-medium leading-normal">
                    Email
                  </p>
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="rounded-xl h-14 bg-[#f8fcfb] dark:bg-slate-800 border-[#cfe7e5] dark:border-slate-700 px-4 focus:ring-primary/50 focus:ring-2"
                />
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="flex flex-col w-full">
                <div className="flex justify-between items-center pb-2">
                  <div className="flex items-center gap-2">
                    <MaterialIcon icon="lock" size={20} className="text-primary" />
                    <p className="text-[#0d1b1a] dark:text-gray-200 text-base font-medium leading-normal">
                      Password
                    </p>
                  </div>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary font-semibold hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="rounded-xl h-14 bg-[#f8fcfb] dark:bg-slate-800 border-[#cfe7e5] dark:border-slate-700 px-4 focus:ring-primary/50 focus:ring-2"
                />
              </label>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {!signInAsAdmin && (
            <>
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              variant="outline"
              className="mt-4 w-full h-14 rounded-xl border-2 border-[#cfe7e5] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0d1b1a] dark:text-white text-base font-semibold hover:bg-[#f8fcfb] dark:hover:bg-slate-700 flex items-center justify-center gap-3"
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
                <span className="w-full border-t border-[#cfe7e5] dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-slate-900 px-2 text-[#4c9a93]">or</span>
              </div>
            </div>
            </>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-xl bg-primary text-white text-lg font-bold hover:brightness-105 active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {loading ? "Signing in…" : signInAsAdmin ? "Admin sign in" : "Log In with Email"}
              <MaterialIcon icon="arrow_forward" size={20} />
            </Button>

            <p className="flex items-center justify-center gap-2 text-xs text-[#4c9a93] dark:text-gray-500">
              <MaterialIcon icon="verified_user" size={14} />
              Secure HIPAA-compliant login
            </p>
          </form>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-[#4c9a93] dark:text-gray-500 text-sm">
            {signInAsAdmin ? (
              <>
                Not an admin?{" "}
                <Link href="/auth/login" className="text-primary font-semibold hover:underline">
                  Sign in as client or staff
                </Link>
              </>
            ) : (
              <>
                New to ArifQueue?{" "}
                <Link href="/auth/register" className="text-primary font-semibold hover:underline">
                  Create Account
                </Link>
                {" · "}
                <Link href="/auth/register/staff" className="text-primary font-semibold hover:underline">
                  Register as Staff
                </Link>
                {" · "}
                <Link href="/auth/login?as=admin" className="text-primary font-semibold hover:underline">
                  Sign in as admin
                </Link>
              </>
            )}
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-[#4c9a93] dark:text-gray-500 text-xs hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-[#4c9a93] dark:text-gray-700 text-xs">•</span>
            <Link
              href="#"
              className="text-[#4c9a93] dark:text-gray-500 text-xs hover:text-primary transition-colors"
            >
              Support Center
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
