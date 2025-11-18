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

const STORAGE_KEY = "pz_user";

// Load initial user from localStorage (if any)
function loadInitial(): Pick<UserState, "userId" | "email" | "plan"> {
  if (typeof window === "undefined") {
    return { userId: null, email: null, plan: "free" };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { userId: null, email: null, plan: "free" };
    const parsed = JSON.parse(raw);
    return {
      userId: parsed.userId ?? null,
      email: parsed.email ?? null,
      plan: (parsed.plan as PlanType) ?? "free",
    };
  } catch {
    return { userId: null, email: null, plan: "free" };
  }
}

function persistUser(partial: {
  userId: string | null;
  email: string | null;
  plan: PlanType;
}) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(partial));
  } catch {
    // ignore storage errors
  }
}

function clearPersistedUser() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

const initial = loadInitial();

export const useUserStore = create<UserState>((set) => ({
  ...initial,

  setUser: (id, email) =>
    set((state) => {
      const next = { ...state, userId: id, email };
      persistUser({
        userId: next.userId,
        email: next.email,
        plan: next.plan,
      });
      return next;
    }),

  setPlan: (plan) =>
    set((state) => {
      const next = { ...state, plan };
      persistUser({
        userId: next.userId,
        email: next.email,
        plan: next.plan,
      });
      return next;
    }),

  reset: () =>
    set(() => {
      clearPersistedUser();
      return { userId: null, email: null, plan: "free" };
    }),
}));
