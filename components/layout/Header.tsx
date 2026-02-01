import Link from "next/link";
import { Logo } from "@/components/onboarding/Logo";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  variant?: "landing" | "auth";
}

export function Header({ variant = "landing" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Logo />
          {variant === "landing" && (
            <nav className="hidden md:flex items-center gap-10">
              <Link
                href="#how-it-works"
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
              >
                How it Works
              </Link>
              <Link
                href="#features"
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
              >
                Features
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
              >
                About
              </Link>
            </nav>
          )}
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="hidden sm:block">
              <Button variant="ghost" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary">
                Log In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="min-w-[120px] h-10 px-5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
