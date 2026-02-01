"use client";

import { useState } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Button } from "@/components/ui/button";

interface ProfileCompletionBannerProps {
  onDismiss?: () => void;
}

export function ProfileCompletionBanner({ onDismiss }: ProfileCompletionBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  function handleDismiss() {
    setDismissed(true);
    onDismiss?.();
  }

  if (dismissed) return null;

  return (
    <div className="z-40 w-full shrink-0 bg-primary/15 dark:bg-primary/10 border-b border-primary/30">
      <div className="flex items-center justify-between gap-4 px-4 md:px-6 py-3 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 size-10 rounded-full bg-primary/20 flex items-center justify-center">
            <MaterialIcon icon="person_add" size={24} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[#0d1b1a] dark:text-white text-sm md:text-base">
              Complete your profile
            </p>
            <p className="text-xs md:text-sm text-[#4c9a93] truncate">
              Add your location and health details to get personalized clinic recommendations.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/onboarding">
            <Button className="h-9 px-4 rounded-lg bg-primary text-[#0d1b1a] text-sm font-bold hover:bg-primary/90">
              Complete Profile
            </Button>
          </Link>
          <button
            onClick={handleDismiss}
            className="size-9 rounded-lg flex items-center justify-center text-[#4c9a93] hover:bg-primary/10 transition-colors"
            aria-label="Dismiss"
          >
            <MaterialIcon icon="close" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
