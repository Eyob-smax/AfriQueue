"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { advanceQueue, cancelReservation, getQueueState, createQueue, updateQueue, getQueuesByHealthCenter } from "@/lib/actions/queue";
import type { QueueReservation, QueueState, QueueForStaff } from "@/lib/actions/queue";
import { getOrCreateDirectConversation } from "@/lib/actions/chat";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { ClinicInsights } from "@/components/dashboard/ClinicInsights";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QueueBoardProps {
  userId: string;
  healthCenterId: string | null;
  healthCenterName: string | null;
  initialQueues: QueueForStaff[];
}

type FilterTab = "all" | "emergency" | "medium" | "low";

export function QueueBoard({ userId: _userId, healthCenterId, healthCenterName, initialQueues }: QueueBoardProps) {
  const router = useRouter();
  const [queueId, setQueueId] = useState<string | null>(null);
  const [queues, setQueues] = useState<QueueForStaff[]>(initialQueues);
  const [queueState, setQueueState] = useState<QueueState | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newServiceType, setNewServiceType] = useState("");
  const [newQueueDate, setNewQueueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [messageLoadingClientId, setMessageLoadingClientId] = useState<string | null>(null);

  useEffect(() => {
    if (!queueId) return;
    getQueueState(queueId).then(setQueueState);
  }, [queueId]);

  async function refreshQueues() {
    if (!healthCenterId) return;
    const list = await getQueuesByHealthCenter(healthCenterId);
    setQueues(list);
  }

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

  async function handleCreateQueue(e: React.FormEvent) {
    e.preventDefault();
    if (!healthCenterId) return;
    setCreateLoading(true);
    setError(null);
    const result = await createQueue(healthCenterId, {
      service_type: newServiceType || undefined,
      queue_date: new Date(newQueueDate),
      status: "ACTIVE",
    });
    if (result.error) setError(result.error);
    else {
      setCreateOpen(false);
      setNewServiceType("");
      setNewQueueDate(new Date().toISOString().slice(0, 10));
      await refreshQueues();
      router.refresh();
    }
    setCreateLoading(false);
  }

  async function handleUpdateQueueStatus(qId: string, status: string) {
    setError(null);
    setLoading(true);
    const result = await updateQueue(qId, { status });
    if (result.error) setError(result.error);
    else await refreshQueues();
    setLoading(false);
  }

  async function handleMessageClient(clientId: string) {
    setError(null);
    setMessageLoadingClientId(clientId);
    const result = await getOrCreateDirectConversation(clientId);
    setMessageLoadingClientId(null);
    if (result.error) setError(result.error);
    else if (result.conversationId) router.push(`/dashboard/chat?conversation=${result.conversationId}`);
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
              {healthCenterName ?? "Staff"}
            </p>
            <div className="size-10 rounded-full bg-primary/20 border-2 border-primary shrink-0" />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 flex gap-8">
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-black text-[#0d1b1a] dark:text-white leading-none">
                Queue Board
              </h2>
              <p className="text-[#4c9a93] mt-2 font-medium">
                {dateStr} • {timeStr}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {healthCenterId && (
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      Create queue
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create queue</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateQueue} className="space-y-4">
                      <div>
                        <Label htmlFor="service_type">Service type</Label>
                        <Input id="service_type" value={newServiceType} onChange={(e) => setNewServiceType(e.target.value)} placeholder="e.g. General" className="rounded-xl mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="queue_date">Date</Label>
                        <Input id="queue_date" type="date" value={newQueueDate} onChange={(e) => setNewQueueDate(e.target.value)} className="rounded-xl mt-1" />
                      </div>
                      <Button type="submit" disabled={createLoading}>{createLoading ? "Creating…" : "Create"}</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
              {serving && (
                <Button className="flex items-center gap-2 px-6 h-12 bg-primary text-background-dark rounded-xl font-bold shadow-lg shadow-primary/20" onClick={() => handleAdvance(serving.id)} disabled={loading}>
                  <MaterialIcon icon="campaign" size={22} />
                  <span>Call Next Patient</span>
                </Button>
              )}
            </div>
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

          {!healthCenterId ? (
            <div className="p-6 bg-white dark:bg-[#152a28] border border-[#cfe7e5] dark:border-[#1e3a37] rounded-xl">
              <p className="text-sm text-[#4c9a93]">No health center assigned. Contact admin to assign your account to a center.</p>
            </div>
          ) : !queueId ? (
            <div className="p-6 bg-white dark:bg-[#152a28] border border-[#cfe7e5] dark:border-[#1e3a37] rounded-xl">
              <p className="text-sm text-[#4c9a93] mb-4">Select a queue to manage.</p>
              {queues.length === 0 ? (
                <p className="text-sm text-muted-foreground">No queues yet. Create one using the button above.</p>
              ) : (
                <Select value={queueId || ""} onValueChange={(v) => setQueueId(v || null)}>
                  <SelectTrigger className="w-full max-w-md rounded-xl h-12">
                    <SelectValue placeholder="Select queue" />
                  </SelectTrigger>
                  <SelectContent>
                    {queues.map((q) => (
                      <SelectItem key={q.id} value={q.id}>
                        {q.service_type ?? "Queue"} • {q.queue_date ? new Date(q.queue_date).toLocaleDateString() : ""} ({q.count} waiting)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
                    <div className="flex gap-2 flex-wrap">
                      {serving.client_phone && (
                        <a href={`tel:${serving.client_phone.replace(/\s/g, "")}`} className="inline-flex">
                          <Button variant="outline" size="sm" className="rounded-lg gap-1">
                            <MaterialIcon icon="call" size={18} />
                            Call
                          </Button>
                        </a>
                      )}
                      {serving.client_email && (
                        <a href={`mailto:${serving.client_email}`} className="inline-flex">
                          <Button variant="outline" size="sm" className="rounded-lg gap-1">
                            <MaterialIcon icon="mail" size={18} />
                            Email
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg gap-1"
                        onClick={() => handleMessageClient(serving.client_id)}
                        disabled={messageLoadingClientId === serving.client_id}
                      >
                        <MaterialIcon icon="chat" size={18} />
                        Message
                      </Button>
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
                    <div className="flex gap-2 flex-wrap">
                      {r.client_phone && (
                        <a href={`tel:${r.client_phone.replace(/\s/g, "")}`} className="inline-flex">
                          <Button variant="outline" size="sm" className="rounded-lg gap-1 text-xs">
                            <MaterialIcon icon="call" size={16} />
                            Call
                          </Button>
                        </a>
                      )}
                      {r.client_email && (
                        <a href={`mailto:${r.client_email}`} className="inline-flex">
                          <Button variant="outline" size="sm" className="rounded-lg gap-1 text-xs">
                            <MaterialIcon icon="mail" size={16} />
                            Email
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg gap-1 text-xs"
                        onClick={() => handleMessageClient(r.client_id)}
                        disabled={messageLoadingClientId === r.client_id}
                      >
                        <MaterialIcon icon="chat" size={16} />
                        Message
                      </Button>
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
