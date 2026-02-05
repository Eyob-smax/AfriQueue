"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/onboarding/Logo";
import { MaterialIcon } from "@/components/ui/material-icon";

type Role = "CLIENT" | "STAFF" | "ADMIN" | "SUPER_ADMIN";

interface DashboardNavProps {
  userId: string;
  role: Role;
  city?: string | null;
  country?: string | null;
}

const clientLinks = [
  { href: "/dashboard/client", label: "Clinics" },
  { href: "/dashboard/symptom-checker", label: "AI" },
  { href: "/dashboard/client/appointments", label: "My Appointments" },
  { href: "/dashboard/chat", label: "Chat" },
  { href: "/dashboard/client/history", label: "History" },
];

const staffLinks = [
  { href: "/dashboard/staff", label: "Live Queue" },
  { href: "/dashboard/staff/insights", label: "Insights" },
  { href: "/dashboard/staff/schedule", label: "Schedule" },
];

const adminLinks = [
  { href: "/dashboard/admin", label: "Overview" },
  { href: "/dashboard/admin/centers", label: "Health Centers" },
  { href: "/dashboard/admin/analytics", label: "Analytics" },
];

export function DashboardNav({ role, city, country }: DashboardNavProps) {
  const pathname = usePathname();
  const links =
    role === "CLIENT"
      ? clientLinks
      : role === "STAFF"
        ? staffLinks
        : adminLinks;

  // Static location from registration only — not editable
  const displayLocation = city && country ? `${city}, ${country}` : null;

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#cfe7e5] dark:border-[#1e3a38] bg-background-light dark:bg-background-dark px-6 md:px-20 py-4">
      <div className="flex items-center gap-8">
        <Logo href="/dashboard" />
        {role === "CLIENT" && displayLocation && (
          <div className="hidden lg:flex items-center gap-2 min-w-[200px]">
            <div
              className="flex w-full items-center rounded-xl h-10 border border-[#cfe7e5] dark:border-[#2d4d4a] bg-white dark:bg-[#1a3330] pl-3 pr-4"
              aria-label={`Location: ${displayLocation}`}
            >
              <div className="text-[#4c9a93] flex items-center justify-center shrink-0">
                <MaterialIcon icon="location_on" size={18} />
              </div>
              <span className="text-sm font-medium pl-2 text-[#0d1b1a] dark:text-white truncate">
                {displayLocation}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {role === "CLIENT" && (
          <nav className="hidden md:flex items-center gap-6 mr-6">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className={`text-sm font-semibold hover:text-primary transition-colors ${pathname === link.href ? "text-primary" : "text-[#0d1b1a] dark:text-white"}`}>
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>
        )}
        {role !== "CLIENT" && (
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button variant={pathname === link.href ? "secondary" : "ghost"} size="sm" className="text-sm">
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>
        )}
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 bg-[#cfe7e5] dark:bg-[#1a3330] text-[#0d1b1a] dark:text-white" asChild>
            <Link href="/dashboard/notifications" aria-label="Notifications">
              <MaterialIcon icon="notifications" size={22} />
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="rounded-xl h-10 px-4 bg-primary text-[#0d1b1a] text-sm font-bold hover:bg-primary/90">
                <MaterialIcon icon="person" size={18} className="mr-2" />
                Profile
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="flex items-center gap-2">
                  <MaterialIcon icon="account_circle" size={20} />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={async (e) => {
                  e.preventDefault();
                  await signOut();
                }}
                className="flex items-center gap-2"
              >
                <MaterialIcon icon="logout" size={20} />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
