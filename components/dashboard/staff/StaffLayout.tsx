"use client";

import { StaffSidebar } from "./StaffSidebar";

interface StaffLayoutProps {
  children: React.ReactNode;
}

export function StaffLayout({ children }: StaffLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      <StaffSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
