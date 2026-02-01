"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { advanceQueue, cancelReservation, getQueueState } from "@/lib/actions/queue";
import type { QueueReservation, QueueState } from "@/lib/actions/queue";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { ClinicInsights } from "@/components/dashboard/ClinicInsights";

interface QueueBoardProps {
  userId: string;
}

type FilterTab = "all" | "emergency" | "medium" | "low";

export function QueueBoard({ userId: _userId }: QueueBoardProps) {
  const [queueId, setQueueId] = useState<string | null>(null);
  const [queueState, setQueueState] = useState<QueueState | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!queueId) return;
    getQueueState(queueId).then(setQueueState);
  }, [queueId]);

  async function handleAdvance(reservationId: string) {
    setError(null);
    setLoading(true);
    const result = await advanceQueue(reservationId);
    if (result.error) setError(result.error);
    else if (queueId) getQueueState(queueId).then(setQueueState);
    setLoading(false);
  }

  async function handleCancel(reservationId: string) {
    setError(null);
    setLoading(true);
    const result = await cancelReservation(reservationId);
    if (result.error) setError(result.error);
    else if (queueId) getQueueState(queueId).then(setQueueState);
    setLoading(false);
  }

  const reservations = queueState?.reservations ?? [];
  const serving = reservations[0];
  const waiting = reservations.slice(1);
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <header className="h-16 border-b border-[#cfe7e5] dark:border-[#1e3a37] flex items-center justify-between px-8 bg-white dark:bg-[#152a28] shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md">
            <MaterialIcon
              icon="search"
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4c9a93]"
            />
            <input
              className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary text-[#0d1b1a] dark:text-white"
              placeholder="Search patient name or ID..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/notifications"
            className="p-2 text-[#4c9a93] hover:bg-background-light dark:hover:bg-background-dark rounded-lg relative"
          >
            <MaterialIcon icon="notifications" size={22} />
            <span className="absolute top-2 right-2 size-2 bg-urgency-emergency rounded-full border-2 border-white dark:border-[#152a28]" />
          </Link>
          <button className="p-2 text-[#4c9a93] hover:bg-background-light dark:hover:bg-background-dark rounded-lg">
            <MaterialIcon icon="wifi_tethering" size={22} />
          </button>
          <div className="h-8 w-[1px] bg-[#cfe7e5] dark:border-[#1e3a37] mx-2" />
          <div className="flex items-center gap-3">
            <p className="text-sm font-bold hidden sm:block text-[#0d1b1a] dark:text-white">
              Admin Sarah
            </p>
            <div className="size-10 rounded-full bg-primary/20 border-2 border-primary shrink-0" />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 flex gap-8">
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-black text-[#0d1b1a] dark:text-white leading-none">
                Queue Board
              </h2>
              <p className="text-[#4c9a93] mt-2 font-medium">
                {dateStr} • {timeStr}
              </p>
            </div>
            <Button className="flex items-center gap-2 px-6 h-12 bg-primary text-background-dark rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
              <MaterialIcon icon="campaign" size={22} />
              <span>Call Next Patient</span>
            </Button>
          </div>

          <div className="border-b border-[#cfe7e5] dark:border-[#1e3a37] flex gap-8">
            {(["all", "emergency", "medium", "low"] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`pb-4 border-b-2 font-bold text-sm transition-colors ${
                  filterTab === tab
                    ? "border-primary text-[#0d1b1a] dark:text-white"
                    : "border-transparent text-[#4c9a93]"
                }`}
              >
                {tab === "all" && `All Patients (${reservations.length})`}
                {tab === "emergency" && "Emergency (2)"}
                {tab === "medium" && "Medium (4)"}
                {tab === "low" && "Low (6)"}
              </button>
            ))}
          </div>

          {!queueId ? (
            <div className="p-6 bg-white dark:bg-[#152a28] border border-[#cfe7e5] dark:border-[#1e3a37] rounded-xl">
              <p className="text-sm text-[#4c9a93] mb-4">
                Select a queue to manage. Enter a queue ID from your clinic.
              </p>
              <input
                type="text"
                placeholder="Queue ID"
                className="w-full max-w-md rounded-xl border border-[#cfe7e5] dark:border-[#1e3a37] bg-background-light dark:bg-background-dark px-4 py-3 text-sm text-[#0d1b1a] dark:text-white"
                value={queueId ?? ""}
                onChange={(e) => setQueueId(e.target.value || null)}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
              {serving && (
                <div className="p-1 bg-gradient-to-r from-primary to-primary/40 rounded-xl">
                  <div className="bg-white dark:bg-[#152a28] rounded-[0.9rem] p-4 flex items-center justify-between border border-transparent">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-full flex items-center justify-center bg-primary/20 text-primary shrink-0">
                        <MaterialIcon icon="person" size={32} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-lg text-[#0d1b1a] dark:text-white">
                            {serving.client_name ?? `Patient #${serving.queue_number}`}
                          </h4>
                          <span className="text-[10px] bg-primary text-background-dark font-black px-2 py-0.5 rounded uppercase">
                            Now Serving
                          </span>
                        </div>
                        <p className="text-sm text-[#4c9a93] font-medium">
                          ID: #{serving.queue_number} • Consult Room 3
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="size-10 rounded-lg flex items-center justify-center bg-background-light dark:bg-background-dark text-urgency-medium border border-[#cfe7e5] dark:border-[#1e3a37]">
                        <MaterialIcon icon="pause" size={20} />
                      </button>
                      <button
                        onClick={() => handleAdvance(serving.id)}
                        disabled={loading}
                        className="size-10 rounded-lg flex items-center justify-center bg-background-light dark:bg-background-dark text-primary border border-[#cfe7e5] dark:border-[#1e3a37]"
                      >
                        <MaterialIcon icon="check_circle" size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {waiting.map((r, idx) => {
                const priority = idx === 0 ? "emergency" : "medium";
                return (
                  <div
                    key={r.id}
                    className="bg-white dark:bg-[#152a28] rounded-xl p-4 flex items-center justify-between border border-[#cfe7e5] dark:border-[#1e3a37] hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-full flex items-center justify-center bg-background-light dark:bg-background-dark text-[#4c9a93] shrink-0">
                        <MaterialIcon icon="person" size={32} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-lg text-[#0d1b1a] dark:text-white">
                            {r.client_name ?? `Patient #${r.queue_number}`}
                          </h4>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                              priority === "emergency"
                                ? "bg-urgency-emergency/10 text-urgency-emergency"
                                : "bg-urgency-medium/10 text-urgency-medium"
                            }`}
                          >
                            {priority === "emergency" ? "Emergency" : "Medium"}
                          </span>
                        </div>
                        <p className="text-sm text-[#4c9a93] font-medium">
                          ID: #{r.queue_number} • Waiting for {8 + idx * 7} mins
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 h-10 rounded-lg flex items-center gap-2 bg-background-light dark:bg-background-dark text-[#0d1b1a] dark:text-white border border-[#cfe7e5] dark:border-[#1e3a37] text-xs font-bold">
                        <MaterialIcon icon="volume_up" size={16} />
                        Call
                      </button>
                      <button className="size-10 rounded-lg flex items-center justify-center bg-background-light dark:bg-background-dark text-[#4c9a93] border border-[#cfe7e5] dark:border-[#1e3a37]">
                        <MaterialIcon icon="schedule" size={18} />
                      </button>
                      {priority === "emergency" && (
                        <button
                          onClick={() => handleCancel(r.id)}
                          disabled={loading}
                          className="size-10 rounded-lg flex items-center justify-center bg-background-light dark:bg-background-dark text-urgency-emergency/60 border border-[#cfe7e5] dark:border-[#1e3a37]"
                        >
                          <MaterialIcon icon="block" size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {reservations.length === 0 && queueId && (
                <p className="text-sm text-[#4c9a93] py-8 text-center">
                  No patients in queue.
                </p>
              )}
            </div>
          )}
        </div>
        <ClinicInsights />
      </div>
    </div>
  );
}
