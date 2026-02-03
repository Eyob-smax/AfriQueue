import { redirect } from "next/navigation";
import { BackgroundGlow } from "@/components/onboarding/BackgroundGlow";
import { Logo } from "@/components/onboarding/Logo";
import { ProgressBar } from "@/components/onboarding/ProgressBar";
import { LocationSelect } from "@/components/onboarding/LocationSelect";
import { CompleteProfileForm } from "@/components/onboarding/CompleteProfileForm";
import { getCurrentUserRole } from "@/lib/actions/auth";

export default async function OnboardingPage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");
  if (user.role !== "CLIENT") redirect("/dashboard");

  const needsLocation = !user.country || !user.city;
  const step = needsLocation ? 1 : 2;
  const totalSteps = 2;

  return (
    <main className="relative min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-4 font-display">
      <BackgroundGlow />

      <div className="relative z-10 w-full max-w-[600px] flex flex-col gap-6">
        <div className="flex justify-center mb-2">
          <Logo />
        </div>
        <ProgressBar step={step} total={totalSteps} />
        {needsLocation ? <LocationSelect /> : <CompleteProfileForm />}

        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-[#4c9a93] dark:text-gray-500 text-sm">
            Can&apos;t find your location?{" "}
            <a href="#" className="text-primary font-semibold hover:underline">
              Suggest a clinic
            </a>
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-[#4c9a93] dark:text-gray-500 text-xs hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
            <span className="text-[#4c9a93] dark:text-gray-700 text-xs">•</span>
            <a
              href="#"
              className="text-[#4c9a93] dark:text-gray-500 text-xs hover:text-primary transition-colors"
            >
              Support Center
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
