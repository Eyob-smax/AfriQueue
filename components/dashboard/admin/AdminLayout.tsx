"use client";

import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex flex-1 min-h-0 w-full overflow-hidden bg-background-light dark:bg-background-dark">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-0 overflow-auto">
        {children}
      </div>
    </div>
  );
}
