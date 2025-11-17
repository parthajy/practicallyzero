// src/components/layout/Sidebar.tsx
import React, { useEffect } from "react";
import { useGuestStore } from "../../store/guestStore";
import type { PlanType } from "../../store/userStore";
import { useUpgradeStore } from "../../store/upgradeStore";
import { ChaosSlider } from "../controls/ChaosSlider";
import { useChaosStore } from "../../lib/chaos";
import { supabase } from "../../lib/supabaseClient";
import { useUserStore } from "../../store/userStore";

type SidebarProps = {
  plan: PlanType;
};

export const Sidebar: React.FC<SidebarProps> = ({ plan }) => {
  const {
    hydrated,
    hydrate,
    threads,
    threadOrder,
    activeThreadId,
    newThread,
    selectThread,
    deleteThread,
  } = useGuestStore();

  const { value: chaosLevel, setValue: setChaos } = useChaosStore();
  const { openUpgrade } = useUpgradeStore();

  const userId = useUserStore((s) => s.userId);
  const resetUser = useUserStore((s) => s.reset);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    console.log("[PZ] Sidebar rendered. plan =", plan);
  }, [plan]);

  const threadCount = threadOrder.length;
  const isFree = plan === "free";
  const isLoggedIn = !!userId;

  const handleLogout = async () => {
    console.log("[PZ] Logout button clicked");

    try {
      console.log("[PZ] Calling supabase.auth.signOut() …");
      const { error } = await supabase.auth.signOut();
      console.log(
        "[PZ] supabase.auth.signOut result:",
        error ? error.message : "ok (no error)"
      );
    } catch (err) {
      console.error("[PZ] Error in supabase.auth.signOut:", err);
    }

    // Kill any local user state regardless of Supabase result
    try {
      console.log("[PZ] Resetting user store");
      resetUser();
    } catch (err) {
      console.error("[PZ] Error resetting user store:", err);
    }

    // HARD NUKE: remove auth tokens from localStorage
    try {
      console.log("[PZ] Clearing sb-* auth keys from localStorage");
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => {
        console.log("[PZ] Removing localStorage key:", k);
        localStorage.removeItem(k);
      });
    } catch (storageErr) {
      console.error("[PZ] Error clearing localStorage sb-* keys:", storageErr);
    }

    console.log("[PZ] Forcing full reload after logout");
    window.location.reload();
  };

  return (
    <aside className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
      {/* Top: logo + app name */}
      <div className="px-3 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
        {/* Just the icon, no rounded background */}
        <img
          src="/pz-logo.svg"
          alt="PracticallyZero logo"
          className="h-7 w-7 object-contain"
          onError={(e) => {
            const t = e.currentTarget;
            t.style.display = "none";
          }}
        />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            PracticallyZero
          </span>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Artificial stupidity engine
          </span>
        </div>
      </div>

      {/* New chaos + plan + chaos slider */}
      <div className="px-3 pt-3 pb-2 border-b border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
        <button
          onClick={() => {
            if (plan === "free" && threadOrder.length >= 10) {
              openUpgrade("thread_limit");
              return;
            }
            newThread();
          }}
          className="w-full rounded-lg bg-black text-white text-sm py-2 px-3 hover:bg-neutral-800 transition"
        >
          New chaos
        </button>

        {isFree && (
          <div className="text-[11px] text-neutral-500">
            Free plan · {threadCount}/10 threads
          </div>
        )}

        <ChaosSlider value={chaosLevel} onChange={setChaos} plan={plan} />
      </div>

      {/* Threads list – scrolls independently */}
      <div className="flex-1 overflow-y-auto mt-1">
        {threadOrder.map((id) => {
          const t = threads[id];
          if (!t) return null;
          const isActive = id === activeThreadId;

          return (
            <button
              key={id}
              onClick={() => selectThread(id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm ${
                isActive
                  ? "bg-white dark:bg-neutral-900"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-900/60"
              }`}
            >
              <span className="truncate">
                {t.title || "Untitled chaos"}
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Delete this thread?")) deleteThread(id);
                }}
                className="text-xs text-neutral-400 hover:text-red-500"
              >
                ×
              </span>
            </button>
          );
        })}

        {threadOrder.length === 0 && (
          <div className="px-3 py-4 text-xs text-neutral-400">
            No threads yet. Click <strong>New chaos</strong> to start.
          </div>
        )}
      </div>

      {/* Footer: logout only if logged in */}
      {isLoggedIn && (
        <div className="px-3 py-3 border-t border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Log out
          </button>
        </div>
      )}
    </aside>
  );
};
