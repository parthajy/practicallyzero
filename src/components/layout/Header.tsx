import React, { useEffect, useState } from "react";
import { useUserStore } from "../../store/userStore";
import { useUpgradeStore } from "../../store/upgradeStore";
import { PlanBadge } from "../controls/PlanBadge";

type Theme = "light" | "dark";

const THEME_KEY = "pz-theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

type HeaderProps = {
  onOpenThreadsMobile?: () => void;
  onOpenAuth?: () => void; // open login/signup modal
};

export const Header: React.FC<HeaderProps> = ({
  onOpenThreadsMobile,
  onOpenAuth,
}) => {
  const { plan, userId } = useUserStore();
  const { openUpgrade } = useUpgradeStore();
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    try {
      const stored = (localStorage.getItem(THEME_KEY) as Theme | null) ?? "light";
      setTheme(stored);
      applyTheme(stored);
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // ignore
    }
    applyTheme(next);
  };

  const isLoggedIn = !!userId;
  const isFree = plan === "free";

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 px-4 py-2 flex items-center justify-between bg-neutral-50/90 dark:bg-neutral-900/90 backdrop-blur-sm">
      {/* Left: page title only now */}
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          Talk to PracticallyZero
        </span>
        <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
          Ask anything, get the worst answer.
        </span>
      </div>

      {/* Right: mobile threads, plan badge, theme, auth, upgrade */}
      <div className="flex items-center gap-2">
        {onOpenThreadsMobile && (
          <button
            type="button"
            onClick={onOpenThreadsMobile}
            className="md:hidden inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-700 px-2.5 py-1 text-[11px] text-neutral-600 dark:text-neutral-300 bg-white/80 dark:bg-neutral-900/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            Threads
          </button>
        )}

        {/* Plan badge only when logged in */}
        {isLoggedIn && (
          <div className="hidden sm:block">
            <PlanBadge plan={plan ?? "free"} />
          </div>
        )}

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center gap-1 rounded-full border border-neutral-200 dark:border-neutral-700 px-2 py-1 text-[11px] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          <span
            className={`inline-flex h-3 w-3 items-center justify-center rounded-full text-[9px] ${
              theme === "dark"
                ? "bg-neutral-900 text-yellow-300"
                : "bg-yellow-300 text-neutral-900"
            }`}
          >
            {theme === "dark" ? "☾" : "☼"}
          </span>
          <span>{theme === "dark" ? "Dark" : "Light"}</span>
        </button>

        {/* When logged OUT: show Login button */}
        {!isLoggedIn && onOpenAuth && (
          <button
            type="button"
            onClick={onOpenAuth}
            className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-[11px] text-neutral-700 dark:text-neutral-200 bg-white/80 dark:bg-neutral-900/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            Log in
          </button>
        )}

        {/* When logged IN & free: show upgrade CTA */}
        {isLoggedIn && isFree && (
          <button
            type="button"
            onClick={() => openUpgrade("header_cta" as any)}
            className="hidden sm:inline-flex items-center rounded-full bg-neutral-900 text-white text-[11px] px-3 py-1.5 hover:bg-neutral-800 transition shadow-sm"
          >
            Unlock full chaos
          </button>
        )}
      </div>
    </header>
  );
};
