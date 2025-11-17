import { create } from "zustand";

type ChaosState = {
  value: number;
  setValue: (value: number) => void;
};

const DEFAULT_CHAOS = 50;

export const useChaosStore = create<ChaosState>((set) => ({
  value: DEFAULT_CHAOS,
  setValue: (value) => set({ value }),
}));
