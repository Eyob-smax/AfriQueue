// stores/useReservationStore.ts
import { create } from "zustand";

interface Reservation {
  id: string;
  queue_id: string;
  client_id: string;
  queue_number: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  created_at: Date;
}

interface ReservationState {
  reservations: Reservation[];
  addReservation: (reservation: Reservation) => void;
  updateReservation: (id: string, data: Partial<Reservation>) => void;
  removeReservation: (id: string) => void;
  clearReservations: () => void;
}

export const useReservationStore = create<ReservationState>((set) => ({
  reservations: [],
  addReservation: (reservation) =>
    set((state) => ({ reservations: [...state.reservations, reservation] })),
  updateReservation: (id, data) =>
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === id ? { ...r, ...data } : r,
      ),
    })),
  removeReservation: (id) =>
    set((state) => ({
      reservations: state.reservations.filter((r) => r.id !== id),
    })),
  clearReservations: () => set({ reservations: [] }),
}));
