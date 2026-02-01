"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import type { HealthCenterWithQueues } from "@/lib/actions/queue";

import "leaflet/dist/leaflet.css";

const defaultCenter: [number, number] = [-1.2921, 36.8219]; // Nairobi

interface ClinicsMapProps {
  centers: HealthCenterWithQueues[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  userLat?: number;
  userLng?: number;
}

const mapPlaceholder = (
  <div className="h-[300px] rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 animate-pulse" />
);

export function ClinicsMap({
  centers,
  selectedId,
  onSelect,
  userLat,
  userLng,
}: ClinicsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const [mounted, setMounted] = useState(false);

  const centerLat = userLat ?? defaultCenter[0];
  const centerLng = userLng ?? defaultCenter[1];
  const center: [number, number] = [centerLat, centerLng];

  const centersWithCoords = centers.filter(
    (c) => c.latitude != null && c.longitude != null
  );

  // Create map imperatively in useEffect so we control lifecycle and avoid "already initialized"
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined" || !containerRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet") as typeof import("leaflet");

    // Fix default icon in Next.js
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });

    const container = containerRef.current;
    // Guard: Leaflet will throw if this container was already used
    if ((container as HTMLElement & { _leaflet_id?: number })._leaflet_id != null) return;

    const map = L.map(container, {
      center,
      zoom: 12,
      scrollWheelZoom: true,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // User marker
    if (userLat != null && userLng != null) {
      const userMarker = L.marker([userLat, userLng]).addTo(map);
      userMarker.bindPopup("You are here");
      markersRef.current.push(userMarker);
    }

    // Clinic markers
    centersWithCoords.forEach((hc) => {
      const lat = parseFloat(hc.latitude!);
      const lng = parseFloat(hc.longitude!);
      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(
        `<span class="font-medium">${escapeHtml(hc.name)}</span><br/><span class="text-sm text-muted-foreground">${escapeHtml(hc.address ?? hc.city ?? "")}</span>`
      );
      marker.on("click", () => onSelect(hc.id));
      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only create map once on mount to avoid "already initialized"
  }, [mounted]);

  // Fly to selected clinic
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const c = centers.find((x) => x.id === selectedId);
    if (c?.latitude && c?.longitude) {
      map.flyTo(
        [parseFloat(c.latitude), parseFloat(c.longitude)],
        14,
        { duration: 0.5 }
      );
    }
  }, [selectedId, centers]);

  if (!mounted) {
    return mapPlaceholder;
  }

  return (
    <div
      ref={containerRef}
      className="h-[300px] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 [&_.leaflet-container]:rounded-lg"
      style={{ minHeight: 300 }}
    />
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
