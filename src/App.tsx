import { useEffect, useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { ChatWindow } from "./components/chat/ChatWindow";
import { Header } from "./components/layout/Header";
import { supabase } from "./lib/supabaseClient";
import { useUserStore } from "./store/userStore";
import type { PlanType } from "./store/userStore";
import { UpgradeModal } from "./components/billing/UpgradeModal";
import { AuthPanel } from "./components/auth/AuthPanel";

// Helper: create/fetch profile and return plan
async function fetchOrCreateProfile(
  userId: string,
  email: string | null
): Promise<PlanType> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, email }, { onConflict: "id" })
    .select("plan")
    .single();

  if (error) {
    console.error("Error fetching/creating profile", error);
    return "free";
  }

  return (data?.plan ?? "free") as PlanType;
}

const App = () => {
  const { userId, email, setUser, setPlan, reset, plan } = useUserStore();
  const [mobileThreadsOpen, setMobileThreadsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // 1) On first mount, if we already have a stored userId, refresh plan from DB
  useEffect(() => {
    const syncPlan = async () => {
      if (!userId) {
        console.log("[PZ] No stored userId on init; skipping plan sync.");
        return;
      }

      console.log("[PZ] Found stored userId on init, syncing plan from DB…");
      const freshPlan = await fetchOrCreateProfile(userId, email ?? null);
      console.log("[PZ] Synced plan from DB:", freshPlan);
      setPlan(freshPlan);
    };

    syncPlan();
  }, [userId, email, setPlan]);

  // 2) Listen for auth state changes (login/logout)
  useEffect(() => {
    console.log("[PZ] Subscribing to supabase.auth.onAuthStateChange");
    const { data } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(
          "[PZ] onAuthStateChange event:",
          event,
          "session:",
          session
        );

        // On first load Supabase fires INITIAL_SESSION.
        // If it's null, don't touch our persisted user state.
        if (event === "INITIAL_SESSION" && !session) {
          console.log(
            "[PZ] INITIAL_SESSION with no session – keeping stored user as-is."
          );
          return;
        }

        if (session?.user) {
          const user = session.user;
          const userPlan = await fetchOrCreateProfile(
            user.id,
            user.email ?? null
          );
          console.log(
            "[PZ] Auth change -> user logged in/updated. Plan:",
            userPlan
          );
          setUser(user.id, user.email ?? null);
          setPlan(userPlan);
          return;
        }

        // No session AND not INITIAL_SESSION => real logout
        console.log("[PZ] Auth change -> no session, treating as logged out.");
        reset();
      }
    );

    const subscription = data?.subscription;

    return () => {
      console.log("[PZ] Cleaning up auth listener");
      subscription?.unsubscribe();
    };
  }, [setUser, setPlan, reset]);

  const effectivePlan: PlanType = plan ?? "free";

  const closeMobileThreads = () => setMobileThreadsOpen(false);

  return (
    <>
      <div className="h-screen w-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 flex flex-col md:flex-row">
        {/* Sidebar: desktop only */}
        <div className="hidden md:block md:w-64 lg:w-72 border-r border-neutral-200 dark:border-neutral-800">
          <Sidebar plan={effectivePlan} />
        </div>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-h-0">
          <Header
            onOpenThreadsMobile={() => setMobileThreadsOpen(true)}
            onOpenAuth={() => setAuthOpen(true)}
          />
          <ChatWindow plan={effectivePlan} />
        </main>

        {/* Mobile Threads Drawer */}
        {mobileThreadsOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={closeMobileThreads}
            />

            {/* Drawer panel */}
            <div className="relative z-50 w-72 max-w-[80%] h-full bg-neutral-50 dark:bg-neutral-950 shadow-xl border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
              <Sidebar plan={effectivePlan} />
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={closeMobileThreads}
              className="absolute top-3 right-4 z-50 rounded-full bg-neutral-900 text-white text-xs px-2 py-1 shadow-md"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Auth modal */}
      {authOpen && <AuthPanel onClose={() => setAuthOpen(false)} />}

      {/* Upgrade modal lives at root */}
      <UpgradeModal />
    </>
  );
};

export default App;
