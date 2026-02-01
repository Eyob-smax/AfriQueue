import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBzOg12f8VOj6YbkocpOHiHpm0NnNcCjxTp4a4DSyMi0Mny0anYLKbGqulUh-xCutq1QzvmFv3iR3E6zcecwryvf3hdZj33q19HnED7gGm96DIuMYqz1A-4gi9i1v0lN0Z_XfQfpkiKKj-ztg7To3RRSldbLe9chXPdOHLj5K7VTSGXmKBRpRmmRXhYmFD2vVuSks9IyALl4loG15-5gWr8WwZ3aFt0AKOb87jo0Wh1C6dYJ-53jXRMK01tefAEbQB_WsPRqRZMNHk";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 overflow-x-hidden">
      <Header variant="landing" />

      <main>
        <section
          id="hero"
          className="relative overflow-hidden py-12 lg:py-20 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex flex-col gap-6 lg:w-1/2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  Smart Healthcare for Africa
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                  Skip the Queue, <br className="hidden sm:block" />
                  <span className="text-primary">Get Care Faster.</span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                  Empowering African clinics and patients with smart queue
                  management and digital healthcare tools. Say goodbye to long
                  waiting hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/auth/register">
                    <Button className="flex items-center justify-center rounded-xl h-14 px-8 bg-primary text-white text-base font-bold hover:shadow-lg hover:shadow-primary/30">
                      Start Queuing Now
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button
                      variant="outline"
                      className="flex items-center justify-center rounded-xl h-14 px-8 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-base font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      For Medical Clinics
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-4 pt-4">
                  <div className="flex -space-x-2">
                    <div className="size-8 rounded-full border-2 border-white dark:border-background-dark bg-slate-300" />
                    <div className="size-8 rounded-full border-2 border-white dark:border-background-dark bg-slate-400" />
                    <div className="size-8 rounded-full border-2 border-white dark:border-background-dark bg-slate-500" />
                  </div>
                  <p className="text-sm text-slate-500">
                    Joined by 10,000+ patients this month
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-1/2 relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full -z-10 translate-x-1/4" />
                <div
                  className="w-full aspect-video sm:aspect-[4/3] bg-center bg-no-repeat bg-cover rounded-3xl shadow-2xl border-4 border-white dark:border-slate-800"
                  style={{ backgroundImage: `url("${HERO_IMAGE}")` }}
                  aria-label="Modern African medical clinic interior with smiling doctor"
                />
                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 hidden sm:flex items-center gap-4">
                  <div className="size-12 bg-green-500 rounded-xl flex items-center justify-center text-white">
                    <MaterialIcon icon="timer" size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                      Average Wait Saved
                    </p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">
                      45 Minutes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="py-20 bg-white dark:bg-slate-900/50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center gap-4 mb-16">
              <h2 className="text-primary text-sm font-bold uppercase tracking-[0.2em]">
                Our Services
              </h2>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white max-w-2xl">
                Smart digital tools to improve your healthcare experience
              </h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group flex flex-col gap-6 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="size-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
                  <MaterialIcon icon="clinical_notes" size={32} />
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    AI Symptom Guidance
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                    Use our intelligent AI tool to check your symptoms and
                    receive personalized guidance before arriving at the clinic.
                  </p>
                </div>
              </div>
              <div className="group flex flex-col gap-6 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="size-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
                  <MaterialIcon icon="distance" size={32} />
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    Smart Discovery
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                    Find the nearest available facility with the shortest wait
                    times based on your current location and needs.
                  </p>
                </div>
              </div>
              <div className="group flex flex-col gap-6 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="size-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
                  <MaterialIcon icon="line_style" size={32} />
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    Live Digital Queuing
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                    Get real-time updates on your queue position. Wait in comfort
                    elsewhere and arrive just when it&apos;s your turn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4" id="cta">
          <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden relative bg-primary p-8 sm:p-16 text-center">
            <div
              className="absolute inset-0 opacity-10"
              aria-hidden
            >
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <pattern id="grid" patternUnits="userSpaceOnUse" width="10" height="10">
                    <path
                      d="M 10 0 L 0 0 0 10"
                      fill="none"
                      stroke="white"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-8">
              <div className="flex flex-col gap-4">
                <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                  Ready to experience <br className="hidden sm:block" /> better
                  healthcare?
                </h2>
                <p className="text-white/80 text-lg sm:text-xl font-medium max-w-2xl mx-auto">
                  Join AfriCare today and skip the wait. Manage your health
                  visits from your smartphone.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4 w-full max-w-lg">
                <Link href="/auth/register" className="flex-1 min-w-[200px]">
                  <Button className="w-full h-14 bg-white text-primary rounded-xl font-bold text-lg hover:bg-slate-50 shadow-xl">
                    Register for Free
                  </Button>
                </Link>
                <Link href="/auth/login" className="flex-1 min-w-[200px]">
                  <Button
                    variant="outline"
                    className="w-full h-14 bg-primary/20 backdrop-blur-md border border-white/30 text-white rounded-xl font-bold text-lg hover:bg-primary/30"
                  >
                    Login to My Account
                  </Button>
                </Link>
              </div>
              <p className="text-white/60 text-sm">
                No credit card required. Free for all patients.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
