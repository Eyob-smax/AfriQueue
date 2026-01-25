// stores/useNotificationStore.ts
import { create } from "zustand";

interface Notifications {
  id: string;
  user_id: string;
  type: string;
  reference_id?: string;
  is_read: boolean;
  created_at: Date;
}

interface NotificationState {
  notifications: Notifications[];
  addNotification: (n: Notifications) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (n) =>
    set((state) => ({ notifications: [...state.notifications, n] })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      ),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));
