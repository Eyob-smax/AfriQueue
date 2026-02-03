import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { getHealthCentersByCity } from "@/lib/actions/queue";
import { getCityCenter } from "@/lib/constants/locations";
import { ClinicsNearYou } from "@/components/dashboard/ClinicsNearYou";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Button } from "@/components/ui/button";

export default async function ClientDashboardPage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");
  if (user.role !== "CLIENT") redirect("/dashboard");
  if (!user.city || !user.country) redirect("/onboarding");

  const city = user.city;
  const centers = await getHealthCentersByCity(city);
  const mapCenter = getCityCenter(user.city);
  const defaultMapCenter = mapCenter ? { lat: mapCenter[0], lng: mapCenter[1] } : undefined;

  return (
    <div className="relative flex flex-col overflow-x-hidden">
      <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-8">
        <div className="mb-6 flex items-center justify-between px-4 py-2 bg-[#e7f3f2] dark:bg-[#1a3330] rounded-lg border border-[#cfe7e5] dark:border-[#2d4d4a]">
          <div className="flex items-center gap-2 text-xs font-medium text-[#4c9a93]">
            <MaterialIcon icon="wifi_tethering" size={16} />
            <span>Live data sync active</span>
          </div>
          <div className="text-xs text-[#4c9a93]">Last updated: Just now</div>
        </div>

        <section className="mb-12">
          <div className="rounded-xl overflow-hidden bg-white dark:bg-[#1a3330] border border-[#cfe7e5] dark:border-[#2d4d4a] shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight text-[#0d1b1a] dark:text-white">
                  Feeling Unwell?
                </h1>
                <p className="text-lg text-[#4c9a93] dark:text-gray-300 mb-8 max-w-[500px]">
                  Use our AI Symptom Assistant for a quick health check and get
                  matched with the right clinic.
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Link href="/dashboard/symptom-checker">
                    <Button className="flex min-w-[180px] items-center justify-center rounded-xl h-12 px-6 bg-primary text-[#0d1b1a] text-base font-bold shadow-lg hover:brightness-105 transition-all">
                      Start Assessment
                    </Button>
                  </Link>
                  <Link href="/dashboard/symptom-checker#how-it-works">
                    <Button
                      variant="outline"
                      className="flex items-center justify-center rounded-xl h-12 px-6 bg-[#e7f3f2] dark:bg-[#2d4d4a] text-[#0d1b1a] dark:text-white text-base font-bold border-0"
                    >
                      How it works
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="w-full md:w-1/3 aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <MaterialIcon
                  icon="vital_signs"
                  size={120}
                  className="text-primary/40"
                />
                <div className="absolute inset-0 border-[20px] border-white/10 dark:border-black/10 rounded-2xl" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <ClinicsNearYou
            initialCenters={centers}
            city={city}
            country={user.country ?? undefined}
            userId={user.userId}
            defaultMapCenter={defaultMapCenter}
          />
        </section>
      </div>

      <footer className="mt-auto border-t border-[#cfe7e5] dark:border-[#2d4d4a] bg-white dark:bg-[#1a3330] px-6 py-8">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-[#4c9a93]">
            <MaterialIcon icon="health_and_safety" size={20} />
            <span className="text-sm font-bold">AfriCare Health Network © 2024</span>
          </div>
          <div className="flex gap-8">
            <Link
              href="#"
              className="text-xs font-medium text-[#4c9a93] hover:text-primary transition-colors"
            >
              Emergency Support
            </Link>
            <Link
              href="#"
              className="text-xs font-medium text-[#4c9a93] hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-xs font-medium text-[#4c9a93] hover:text-primary transition-colors"
            >
              Clinic Registration
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
