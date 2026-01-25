// stores/useQueueStore.ts
import { create } from "zustand";

interface HealthCenter {
  id: string;
  name: string;
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status: "OPEN" | "CLOSED";
  created_at: Date;
}

interface QueueState {
  healthCenters: HealthCenter[];
  selectedHealthCenter: string | null;
  queues: number[];
  selectedQueue: string | null;
  setHealthCenters: (centers: HealthCenter[]) => void;
  setSelectedHealthCenter: (id: string) => void;
  setQueues: (queues: number[]) => void;
  setSelectedQueue: (id: string) => void;
  reset: () => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  healthCenters: [],
  selectedHealthCenter: null,
  queues: [],
  selectedQueue: null,
  setHealthCenters: (centers) => set({ healthCenters: centers }),
  setSelectedHealthCenter: (id) => set({ selectedHealthCenter: id }),
  setQueues: (queues) => set({ queues }),
  setSelectedQueue: (id) => set({ selectedQueue: id }),
  reset: () => set({ selectedHealthCenter: null, selectedQueue: null }),
}));
