"use client";

import { StaffSidebar } from "./StaffSidebar";

interface StaffLayoutProps {
  children: React.ReactNode;
  healthCenterName?: string | null;
}

export function StaffLayout({ children, healthCenterName }: StaffLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
      <StaffSidebar healthCenterName={healthCenterName ?? undefined} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 w-full">
        {children}
      </div>
    </div>
  );
}
