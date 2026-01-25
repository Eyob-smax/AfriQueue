// stores/useOnboardingStore.ts
import { create } from "zustand";

interface OnboardingState {
  step: number;
  totalSteps: number;
  country: string;
  city: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  setField: (field: keyof OnboardingState, value: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 1,
  totalSteps: 3,
  country: "",
  city: "",
  fullName: "",
  phone: "",
  email: "",
  password: "",
  setField: (field, value) => set((state) => ({ ...state, [field]: value })),
  nextStep: () =>
    set((state) => ({ step: Math.min(state.step + 1, state.totalSteps) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
  reset: () =>
    set({
      step: 1,
      country: "",
      city: "",
      fullName: "",
      phone: "",
      email: "",
      password: "",
    }),
}));
