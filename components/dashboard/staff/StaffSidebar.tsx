"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions/auth";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard/staff", label: "Live Queue", icon: "group" },
  { href: "/dashboard/staff/insights", label: "Insights", icon: "analytics" },
  { href: "/dashboard/staff/logs", label: "Patient Logs", icon: "receipt_long" },
  { href: "/dashboard/staff/schedule", label: "Staff Schedule", icon: "calendar_month" },
];

interface StaffSidebarProps {
  healthCenterName?: string;
}

export function StaffSidebar({ healthCenterName }: StaffSidebarProps = {}) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-[#cfe7e5] dark:border-[#1e3a37] flex flex-col justify-between p-4 bg-white dark:bg-[#152a28] shrink-0">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-background-dark shrink-0">
            <MaterialIcon icon="health_metrics" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-[#0d1b1a] dark:text-white">
              {healthCenterName ?? "Clinic"}
            </h1>
            <div className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              <p className="text-[#4c9a93] text-xs font-medium">Sync Active</p>
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? "bg-primary/10 text-[#0d1b1a] dark:text-primary"
                    : "text-[#4c9a93] hover:bg-background-light dark:hover:bg-background-dark"
                }`}
              >
                <MaterialIcon
                  icon={item.icon as "group" | "analytics" | "receipt_long" | "calendar_month"}
                  size={22}
                  className={isActive ? "fill-primary" : ""}
                />
                <p className={`text-sm font-medium ${isActive ? "font-bold" : ""}`}>
                  {item.label}
                </p>
              </Link>
            );
          })}
          <Link
            href="/dashboard/chat"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors mt-4 ${
              pathname === "/dashboard/chat"
                ? "bg-primary/10 text-[#0d1b1a] dark:text-primary"
                : "text-[#4c9a93] hover:bg-background-light dark:hover:bg-background-dark"
            }`}
          >
            <MaterialIcon icon="chat" size={22} className={pathname === "/dashboard/chat" ? "fill-primary" : ""} />
            <p className={`text-sm font-medium ${pathname === "/dashboard/chat" ? "font-bold" : ""}`}>Messages</p>
          </Link>
        </nav>
      </div>
      <div className="flex flex-col gap-2 pt-4 border-t border-[#cfe7e5] dark:border-[#1e3a37]">
        <form action={signOut} className="w-full">
          <Button
            type="submit"
            variant="outline"
            className="w-full justify-start gap-3 h-11 rounded-xl border-[#cfe7e5] dark:border-[#1e3a37] text-[#0d1b1a] dark:text-white hover:bg-primary/10 hover:border-primary/30 dark:hover:border-primary/30"
          >
            <MaterialIcon icon="logout" size={22} />
            Logout
          </Button>
        </form>
      </div>
    </aside>
  );
}
