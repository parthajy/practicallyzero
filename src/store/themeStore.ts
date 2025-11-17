import { create } from "zustand";

export type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",
  setTheme: (theme) => {
    set({ theme });

    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("pz_theme", theme);
    }
  },
  toggleTheme: () => {
    const next = get().theme === "light" ? "dark" : "light";
    get().setTheme(next);
  },
}));

export const hydrateTheme = () => {
  if (typeof window === "undefined") return;
  const stored = window.localStorage.getItem("pz_theme") as Theme | null;
  const initial: Theme = stored === "dark" ? "dark" : "light";
  useThemeStore.getState().setTheme(initial);
};
