import { BackgroundGlow } from "@/components/onboarding/BackgroundGlow";
import { Logo } from "@/components/onboarding/Logo";
import { ProgressBar } from "@/components/onboarding/ProgressBar";
import { LocationSelect } from "@/components/onboarding/LocationSelect";

export default function OnboardingPage() {
  return (
    <main className="relative min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4 font-display">
      <BackgroundGlow />

      <div className="relative z-10 w-full max-w-150 flex flex-col gap-6">
        <Logo />
        <ProgressBar step={1} total={4} />
        <LocationSelect />

        <div className="text-center text-sm text-[#4c9a93] dark:text-gray-500">
          Can’t find your location?{" "}
          <a href="#" className="text-primary font-semibold hover:underline">
            Suggest a clinic
          </a>
        </div>
      </div>
    </main>
  );
}
