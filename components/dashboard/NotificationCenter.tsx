"use client";

import { useState, useEffect } from "react";
import { connectSocket } from "@/lib/socket-client";
import { markNotificationRead } from "@/lib/actions/notifications";
import type { NotificationRow } from "@/lib/actions/notifications";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";

interface NotificationCenterProps {
  initialNotifications: NotificationRow[];
}

const typeLabels: Record<string, string> = {
  QUEUE_JOINED: "You joined a queue",
  QUEUE_COMPLETED: "Your turn is complete",
  CHAT_MESSAGE: "New message",
};

export function NotificationCenter({
  initialNotifications,
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState(initialNotifications);

  useEffect(() => {
    connectSocket()
      .then((s) => {
        s.on("notification:new", (n: NotificationRow) => {
          setNotifications((prev) => [
            {
              id: n.id,
              user_id: n.user_id,
              type: n.type,
              reference_id: n.reference_id ?? null,
              is_read: false,
              created_at: n.created_at ? new Date(n.created_at) : null,
            },
            ...prev,
          ]);
        });
        return () => s.off("notification:new");
      })
      .catch(() => {});
  }, []);

  async function handleMarkRead(id: string) {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }

  if (notifications.length === 0) {
    return (
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <MaterialIcon icon="notifications" size={48} className="mb-4 text-primary/50" />
          <p>No notifications yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((n) => (
        <Card
          key={n.id}
          className={`border-slate-200 dark:border-slate-800 ${
            !n.is_read ? "bg-primary/5 border-primary/20" : ""
          }`}
        >
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <MaterialIcon icon="notifications" size={20} className="text-primary shrink-0" />
              <div>
                <p className="font-medium text-sm text-[#0d1b1a] dark:text-white">
                  {typeLabels[n.type] ?? n.type}
                </p>
                <p className="text-xs text-muted-foreground">
                  {n.created_at
                    ? new Date(n.created_at).toLocaleString()
                    : ""}
                </p>
              </div>
            </div>
            {!n.is_read && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleMarkRead(n.id)}
              >
                <MaterialIcon icon="check" size={18} className="mr-1" />
                Mark read
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
