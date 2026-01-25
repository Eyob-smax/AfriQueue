// stores/useAuthStore.ts
import { create } from "zustand";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  setToken: (token: string, refreshToken?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  isLoggedIn: false,
  setToken: (token, refreshToken) =>
    set({ token, refreshToken: refreshToken || null, isLoggedIn: true }),
  logout: () =>
    set({ token: null, refreshToken: null, isLoggedIn: false }),
}));
