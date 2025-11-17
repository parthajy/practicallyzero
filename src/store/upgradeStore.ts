import { create } from "zustand";

type UpgradeReason =
  | "thread_limit"
  | "chaos_limit"
  | "pro_mode";

type UpgradeState = {
  open: boolean;
  reason: UpgradeReason | null;
  modeLabel?: string;
  openUpgrade: (reason: UpgradeReason, modeLabel?: string) => void;
  closeUpgrade: () => void;
};

export const useUpgradeStore = create<UpgradeState>((set) => ({
  open: false,
  reason: null,
  modeLabel: undefined,
  openUpgrade: (reason, modeLabel) =>
    set({ open: true, reason, modeLabel }),
  closeUpgrade: () => set({ open: false, reason: null, modeLabel: undefined }),
}));
