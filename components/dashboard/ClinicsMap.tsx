"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { HealthCenterWithQueues } from "@/lib/actions/queue";

import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon in Next.js
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require("leaflet");
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

const ClinicsMapInner = dynamic(
  () =>
    import("./ClinicsMapInner").then((mod) => mod.ClinicsMapInner),
  { ssr: false }
);

interface ClinicsMapProps {
  centers: HealthCenterWithQueues[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  userLat?: number;
  userLng?: number;
}

export function ClinicsMap(props: ClinicsMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[300px] rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 animate-pulse" />
    );
  }

  return (
    <div className="h-[300px] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 [&_.leaflet-container]:rounded-lg">
      <ClinicsMapInner {...props} />
    </div>
  );
}
