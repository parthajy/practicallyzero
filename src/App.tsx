import { useEffect, useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { ChatWindow } from "./components/chat/ChatWindow";
import { Header } from "./components/layout/Header";
import { supabase } from "./lib/supabaseClient";
import { useUserStore } from "./store/userStore";
import type { PlanType } from "./store/userStore";
import { UpgradeModal } from "./components/billing/UpgradeModal";
import { AuthPanel } from "./components/auth/AuthPanel";

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

function App() {
  const { setUser, setPlan, plan } = useUserStore();
  const [mobileThreadsOpen, setMobileThreadsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // Initialise auth session + profile
  useEffect(() => {
    const init = async () => {
      console.log("[PZ] App init: calling supabase.auth.getSession()");
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("[PZ] getSession error:", error.message);
      } else {
        console.log("[PZ] getSession session:", session);
      }

      if (session?.user) {
        const user = session.user;
        console.log("[PZ] Found existing session for user:", user.id);
        const userPlan = await fetchOrCreateProfile(
          user.id,
          user.email ?? null
        );
        console.log("[PZ] Profile plan from DB:", userPlan);
        setUser(user.id, user.email ?? null);
        setPlan(userPlan);
      } else {
        console.log("[PZ] No session on init – treating as logged out");
        setUser(null, null);
        setPlan("free");
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[PZ] onAuthStateChange event:", event, "session:", session);

        if (session?.user) {
          const user = session.user;
          const userPlan = await fetchOrCreateProfile(
            user.id,
            user.email ?? null
          );
          console.log(
            "[PZ] onAuthStateChange -> user logged in. Plan:",
            userPlan
          );
          setUser(user.id, user.email ?? null);
          setPlan(userPlan);
        } else {
          console.log("[PZ] onAuthStateChange -> no session (logged out)");
          setUser(null, null);
          setPlan("free");
        }
      }
    );

    return () => {
      console.log("[PZ] Cleaning up auth listener");
      listener.subscription.unsubscribe();
    };
  }, [setUser, setPlan]);

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
}

export default App;
