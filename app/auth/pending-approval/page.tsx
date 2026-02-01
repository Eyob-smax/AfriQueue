import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserRole, signOut } from "@/lib/actions/auth";
import { Logo } from "@/components/onboarding/Logo";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";

export default async function PendingApprovalPage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");
  if (user.role !== "STAFF") redirect("/dashboard");
  if (user.status === "ACTIVE") redirect("/dashboard");

  return (
    <main className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark items-center justify-center p-6">
      <div className="flex justify-center mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-[480px] bg-white dark:bg-[#152e2b] rounded-xl shadow-lg border border-[#e7f3f2] dark:border-[#1e3a38] p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center">
            <MaterialIcon icon="schedule" size={40} className="text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[#0d1b1a] dark:text-white mb-2">
          Account pending approval
        </h1>
        <p className="text-[#4c9a93] dark:text-gray-400 mb-6">
          Your staff registration has been submitted. An admin will review your request and activate your account. You will not be able to log in until your account is approved.
        </p>
        <p className="text-sm text-[#4c9a93] dark:text-gray-500 mb-8">
          If you have questions, contact your administrator or try again later.
        </p>
        <form action={signOut}>
          <Button type="submit" variant="outline" className="rounded-xl">
            Sign out
          </Button>
        </form>
        <p className="mt-6 text-sm">
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
