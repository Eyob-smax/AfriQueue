"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import type { HealthCenterWithQueues } from "@/lib/actions/queue";

const defaultCenter: [number, number] = [-1.2921, 36.8219]; // Nairobi

interface ClinicsMapInnerProps {
  centers: HealthCenterWithQueues[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  userLat?: number;
  userLng?: number;
  mapKey?: string;
}

function FlyToSelected({
  selectedId,
  centers,
}: {
  selectedId: string | null;
  centers: HealthCenterWithQueues[];
}) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const c = centers.find((x) => x.id === selectedId);
    if (c?.latitude && c?.longitude) {
      map.flyTo(
        [parseFloat(c.latitude), parseFloat(c.longitude)],
        14,
        { duration: 0.5 }
      );
    }
  }, [selectedId, centers, map]);
  return null;
}

export function ClinicsMapInner({
  centers,
  selectedId,
  onSelect,
  userLat,
  userLng,
  mapKey,
}: ClinicsMapInnerProps) {
  const centerLat = userLat ?? defaultCenter[0];
  const centerLng = userLng ?? defaultCenter[1];
  const center: [number, number] = [centerLat, centerLng];

  const centersWithCoords = centers.filter(
    (c) => c.latitude != null && c.longitude != null
  );

  return (
    <MapContainer
      key={mapKey}
      center={center}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {userLat != null && userLng != null && (
        <Marker position={[userLat, userLng]}>
          <Popup>You are here</Popup>
        </Marker>
      )}
      {centersWithCoords.map((hc) => {
        const lat = parseFloat(hc.latitude!);
        const lng = parseFloat(hc.longitude!);
        return (
          <Marker
            key={hc.id}
            position={[lat, lng]}
            eventHandlers={{
              click: () => onSelect(hc.id),
            }}
          >
            <Popup>
              <span className="font-medium">{hc.name}</span>
              <br />
              <span className="text-sm text-muted-foreground">
                {hc.address ?? hc.city}
              </span>
            </Popup>
          </Marker>
        );
      })}
      <FlyToSelected selectedId={selectedId} centers={centers} />
    </MapContainer>
  );
}
