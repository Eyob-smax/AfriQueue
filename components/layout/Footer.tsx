import Link from "next/link";
import { Logo } from "@/components/onboarding/Logo";
import { MaterialIcon } from "@/components/ui/material-icon";

export function Footer() {
  return (
    <footer className="bg-slate-100 dark:bg-background-dark border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          <Logo />
          <div className="flex flex-wrap justify-center gap-8">
            <Link
              href="#"
              className="text-slate-500 hover:text-primary transition-colors text-sm font-medium"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-slate-500 hover:text-primary transition-colors text-sm font-medium"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-slate-500 hover:text-primary transition-colors text-sm font-medium"
            >
              Cookie Policy
            </Link>
            <Link
              href="#"
              className="text-slate-500 hover:text-primary transition-colors text-sm font-medium"
            >
              Contact Us
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="size-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-primary transition-all"
            >
              <MaterialIcon icon="leaderboard" size={20} />
            </Link>
            <Link
              href="#"
              className="size-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-primary transition-all"
            >
              <MaterialIcon icon="public" size={20} />
            </Link>
            <Link
              href="#"
              className="size-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-primary transition-all"
            >
              <MaterialIcon icon="groups" size={20} />
            </Link>
          </div>
        </div>
        <div className="text-center">
          <p className="text-slate-400 text-sm">
            © 2024 AfriCare Queue Management Systems. Supporting healthcare across
            Africa.
          </p>
        </div>
      </div>
    </footer>
  );
}
