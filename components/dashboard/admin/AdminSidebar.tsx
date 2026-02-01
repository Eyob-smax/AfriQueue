"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialIcon } from "@/components/ui/material-icon";

const navItems = [
  { href: "/dashboard/admin", label: "Overview", icon: "dashboard" },
  { href: "/dashboard/admin/staff-registrations", label: "Staff Registrations", icon: "person_add" },
  { href: "/dashboard/admin/health-centers", label: "Health Centers", icon: "local_hospital" },
  { href: "/dashboard/admin/staff", label: "Staff Accounts", icon: "group" },
  { href: "/dashboard/admin/reports", label: "Reports", icon: "bar_chart" },
  { href: "/dashboard/admin/chat", label: "Chat", icon: "chat" },
  { href: "/dashboard/admin/audit", label: "Audit Log", icon: "history" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-[#cfe7e5] dark:border-[#1e3a37] flex flex-col justify-between p-4 bg-white dark:bg-[#152a28] shrink-0">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-background-dark shrink-0">
            <MaterialIcon icon="admin_panel_settings" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-[#0d1b1a] dark:text-white">
              Admin
            </h1>
            <div className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              <p className="text-[#4c9a93] text-xs font-medium">Control Panel</p>
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
                  icon={item.icon as "dashboard" | "person_add" | "local_hospital" | "group" | "bar_chart" | "chat" | "history"}
                  size={22}
                  className={isActive ? "fill-primary" : ""}
                />
                <p className={`text-sm font-medium ${isActive ? "font-bold" : ""}`}>
                  {item.label}
                </p>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
