import { create } from "zustand";

export type PlanType = "free" | "pro" | "lifetime";

type UserState = {
  userId: string | null;
  email: string | null;
  plan: PlanType;
  setUser: (id: string | null, email: string | null) => void;
  setPlan: (plan: PlanType) => void;
  reset: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  email: null,
  plan: "free",
  setUser: (id, email) => set({ userId: id, email }),
  setPlan: (plan) => set({ plan }),
  reset: () => set({ userId: null, email: null, plan: "free" }),
}));
