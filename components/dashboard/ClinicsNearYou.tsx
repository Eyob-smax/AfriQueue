"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { connectSocket } from "@/lib/socket-client";
import { joinQueue, leaveQueue, getQueueState } from "@/lib/actions/queue";
import type { HealthCenterWithQueues, QueueState, MyQueueReservation } from "@/lib/actions/queue";
import { ClinicsMap } from "@/components/dashboard/ClinicsMap";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { formatDistance } from "@/lib/geo";

interface ClinicsNearYouProps {
  initialCenters: HealthCenterWithQueues[];
  initialMyReservations?: MyQueueReservation[];
  city: string;
  country?: string | null;
  userId: string;
  userLat?: number;
  userLng?: number;
  /** When no geolocation, center the map on the user's city. */
  defaultMapCenter?: { lat: number; lng: number };
}

type FilterTab = "nearest" | "shortest-wait" | "specialty";

function estimateWaitMinutes(count: number): string {
  if (count <= 3) return "15m";
  if (count <= 8) return "45m";
  return "1h 20m";
}

export function ClinicsNearYou({
  initialCenters,
  initialMyReservations = [],
  city,
  country,
  userId,
  userLat,
  userLng,
  defaultMapCenter,
}: ClinicsNearYouProps) {
  const locationLabel = country ? `${city}, ${country}` : city;
  const [centers, setCenters] = useState(initialCenters);
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("nearest");
  const [subscribedQueueId, setSubscribedQueueId] = useState<string | null>(
    () => initialMyReservations[0]?.queueId ?? null
  );
  const [queueState, setQueueState] = useState<QueueState | null>(null);
  const [queueCountByQueueId, setQueueCountByQueueId] = useState<Record<string, number>>({});
  const [myReservations, setMyReservations] = useState<Record<string, { reservationId: string; queueNumber: number | null }>>(
    () => Object.fromEntries(initialMyReservations.map((r) => [r.queueId, { reservationId: r.reservationId, queueNumber: r.queueNumber }]))
  );
  const [joiningQueueId, setJoiningQueueId] = useState<string | null>(null);
  const [leavingQueueId, setLeavingQueueId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allQueueIds = centers.flatMap((c) => c.queues.map((q) => q.id));

  useEffect(() => {
    let socket: Awaited<ReturnType<typeof connectSocket>> | null = null;
    connectSocket()
      .then((s) => {
        socket = s;
        s.on("queue:joined", (data: { snapshot?: QueueState }) => {
          if (data.snapshot) {
            setQueueState((prev) => (prev?.queueId === data.snapshot!.queueId ? data.snapshot! : prev));
            setQueueCountByQueueId((prev) => ({ ...prev, [data.snapshot!.queueId]: data.snapshot!.count }));
          }
        });
        s.on("queue:advanced", (data: { snapshot?: QueueState }) => {
          if (data.snapshot) {
            setQueueState((prev) => (prev?.queueId === data.snapshot!.queueId ? data.snapshot! : prev));
            setQueueCountByQueueId((prev) => ({ ...prev, [data.snapshot!.queueId]: data.snapshot!.count }));
          }
        });
      })
      .catch(() => {});
    return () => {
      if (subscribedQueueId && socket) {
        socket.emit("queue:leave", { queueId: subscribedQueueId });
      }
    };
  }, []);

  useEffect(() => {
    if (allQueueIds.length === 0) return;
    connectSocket()
      .then((s) => {
        allQueueIds.forEach((queueId) => s.emit("queue:subscribe", { queueId }));
      })
      .catch(() => {});
    return () => {
      connectSocket().then((s) => {
        allQueueIds.forEach((queueId) => s.emit("queue:leave", { queueId }));
      });
    };
  }, [allQueueIds.join(",")]);

  useEffect(() => {
    if (!subscribedQueueId) return;
    connectSocket()
      .then((s) => s.emit("queue:subscribe", { queueId: subscribedQueueId }))
      .catch(() => {});
    getQueueState(subscribedQueueId).then(setQueueState);
    return () => {
      connectSocket().then((s) => {
        s.emit("queue:leave", { queueId: subscribedQueueId });
      });
    };
  }, [subscribedQueueId]);

  async function handleJoinQueue(queueId: string, e: React.MouseEvent) {
    e.stopPropagation();
    setError(null);
    setJoiningQueueId(queueId);
    const result = await joinQueue(queueId);
    if (result.error) {
      setError(result.error);
      setJoiningQueueId(null);
      return;
    }
    setMyReservations((prev) => ({
      ...prev,
      [queueId]: { reservationId: result.reservationId!, queueNumber: result.queueNumber ?? null },
    }));
    setSubscribedQueueId(queueId);
    setQueueCountByQueueId((prev) => ({ ...prev, [queueId]: (prev[queueId] ?? 0) + 1 }));
    setJoiningQueueId(null);
  }

  async function handleLeaveQueue(queueId: string, e: React.MouseEvent) {
    e.stopPropagation();
    setError(null);
    setLeavingQueueId(queueId);
    const result = await leaveQueue(queueId);
    if (result.error) {
      setError(result.error);
      setLeavingQueueId(null);
      return;
    }
    setMyReservations((prev) => {
      const next = { ...prev };
      delete next[queueId];
      return next;
    });
    if (subscribedQueueId === queueId) setSubscribedQueueId(null);
    setLeavingQueueId(null);
  }

  const countForQueue = (queueId: string) => {
    if (queueCountByQueueId[queueId] !== undefined) return queueCountByQueueId[queueId];
    if (queueState?.queueId === queueId) return queueState.count;
    const center = centers.find((c) => c.queues.some((q) => q.id === queueId));
    const q = center?.queues.find((q) => q.id === queueId);
    return q?.count ?? 0;
  };

  const sortedCenters = [...centers].sort((a, b) => {
    if (filterTab === "shortest-wait") {
      const aCount = a.queues[0] ? countForQueue(a.queues[0].id) : 999;
      const bCount = b.queues[0] ? countForQueue(b.queues[0].id) : 999;
      return aCount - bCount;
    }
    if (filterTab === "specialty") {
      return (a.queues[0]?.service_type ?? "").localeCompare(b.queues[0]?.service_type ?? "");
    }
    return 0;
  });

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "nearest", label: "Nearest" },
    { id: "shortest-wait", label: "Shortest Wait" },
    { id: "specialty", label: "Specialty" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-[#0d1b1a] dark:text-white">
          Clinics Near You
        </h2>
        <div className="flex border-b border-[#cfe7e5] dark:border-[#2d4d4a] gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-2 transition-colors ${
                filterTab === tab.id
                  ? "border-primary text-[#0d1b1a] dark:text-white font-bold text-sm"
                  : "border-transparent text-[#4c9a93] font-bold text-sm hover:text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCenters.map((hc, idx) => {
          const q = hc.queues[0];
          const count = q ? countForQueue(q.id) : 0;
          const isJoining = q ? joiningQueueId === q.id : false;
          const distanceKm = (hc as { distanceKm?: number }).distanceKm ?? (idx + 1) * 0.8;
          const status = hc.status === "BUSY" ? "BUSY" : "OPEN";
          const isBusy = status === "BUSY";

          return (
            <div
              key={hc.id}
              className={`bg-white dark:bg-[#1a3330] rounded-xl border border-[#cfe7e5] dark:border-[#2d4d4a] p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                selectedCenterId === hc.id ? "ring-2 ring-primary" : ""
              } ${isBusy ? "opacity-90" : ""}`}
              onClick={() => setSelectedCenterId(hc.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0d1b1a] dark:text-white">
                    {hc.name}
                  </h3>
                  <p className="text-sm text-[#4c9a93]">
                    {formatDistance(distanceKm)} • {hc.address ?? hc.city}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                    isBusy
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  }`}
                >
                  {status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-background-light dark:bg-[#102220] p-3 rounded-lg border border-[#cfe7e5] dark:border-[#2d4d4a]">
                  <p className="text-[10px] uppercase font-bold text-[#4c9a93] mb-1">
                    Queue Position
                  </p>
                  <p className="text-2xl font-black text-[#0d1b1a] dark:text-white">
                    {count}
                  </p>
                </div>
                <div className="bg-background-light dark:bg-[#102220] p-3 rounded-lg border border-[#cfe7e5] dark:border-[#2d4d4a]">
                  <p className="text-[10px] uppercase font-bold text-[#4c9a93] mb-1">
                    Est. Wait
                  </p>
                  <p className="text-2xl font-black text-[#0d1b1a] dark:text-white">
                    {estimateWaitMinutes(count)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {q ? (
                  myReservations[q.id] ? (
                    <>
                      <span
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg h-11 text-sm font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200 border border-orange-300 dark:border-orange-700"
                        title={`Position ${myReservations[q.id]?.queueNumber ?? "—"}`}
                      >
                        <MaterialIcon icon="check_circle" size={18} />
                        Joined
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg h-11 px-4 text-sm font-bold border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                        onClick={(e) => handleLeaveQueue(q.id, e)}
                        disabled={!!leavingQueueId}
                      >
                        {leavingQueueId === q.id ? (
                          <MaterialIcon icon="sync" size={18} className="animate-spin" />
                        ) : (
                          "Leave"
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="flex-1 rounded-lg bg-primary text-[#0d1b1a] h-11 text-sm font-bold hover:bg-primary/90"
                      onClick={(e) => handleJoinQueue(q.id, e)}
                      disabled={isJoining}
                    >
                      {isJoining ? (
                        <MaterialIcon icon="sync" size={18} className="animate-spin" />
                      ) : (
                        "Join Queue"
                      )}
                    </Button>
                  )
                ) : (
                  <Button
                    className="flex-1 rounded-lg bg-primary text-[#0d1b1a] h-11 text-sm font-bold"
                    disabled
                  >
                    No queue
                  </Button>
                )}
                <Link
                  href={`/dashboard/client/clinics/${hc.id}`}
                  className="w-11 h-11 flex items-center justify-center rounded-lg bg-[#e7f3f2] dark:bg-[#2d4d4a] text-[#0d1b1a] dark:text-white hover:bg-[#cfe7e5] transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  title="View details"
                >
                  <MaterialIcon icon="info" size={20} />
                </Link>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${hc.latitude},${hc.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 flex items-center justify-center rounded-lg bg-[#e7f3f2] dark:bg-[#2d4d4a] text-[#0d1b1a] dark:text-white hover:bg-[#cfe7e5] transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MaterialIcon icon="directions" size={20} />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {centers.length === 0 && (
        <p className="text-center text-[#4c9a93] py-8">
          No clinics in {locationLabel} yet. Check back later or suggest a clinic.
        </p>
      )}

      <section className="mt-12">
        <div className="relative w-full h-[300px] rounded-xl overflow-hidden border border-[#cfe7e5] dark:border-[#2d4d4a]">
          <ClinicsMap
            centers={centers}
            selectedId={selectedCenterId}
            onSelect={setSelectedCenterId}
            userLat={userLat ?? defaultMapCenter?.lat}
            userLng={userLng ?? defaultMapCenter?.lng}
          />
          <div className="absolute bottom-4 left-4 z-10 bg-white dark:bg-[#1a3330] p-3 rounded-lg shadow-lg border border-[#cfe7e5] dark:border-[#2d4d4a] pointer-events-none">
            <p className="text-xs font-bold flex items-center gap-2 text-[#0d1b1a] dark:text-white">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              You are here: {locationLabel}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
