// stores/useUserStore.ts
import { create } from "zustand";

interface UserState {
  id: string | null;
  fullName: string;
  email: string;
  phone: string;
  role: "CLIENT" | "STAFF" | "ADMIN" | null;
  city?: string;
  region?: string;
  healthInfo?: {
    healthCondition?: string;
    bloodType?: string;
    chronicIllnesses?: string[];
  };
  setUser: (data: Partial<UserState>) => void;
  resetUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  id: null,
  fullName: "",
  email: "",
  phone: "",
  role: null,
  city: "",
  region: "",
  healthInfo: {},
  setUser: (data) => set((state) => ({ ...state, ...data })),
  resetUser: () =>
    set({
      id: null,
      fullName: "",
      email: "",
      phone: "",
      role: null,
      city: "",
      region: "",
      healthInfo: {},
    }),
}));
