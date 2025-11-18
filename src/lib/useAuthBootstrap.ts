// /src/lib/useAuthBootstrap.ts
import { useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useUserStore } from "../store/userStore";

export function useAuthBootstrap() {
  useEffect(() => {
    const { setUser, setPlan, reset } = useUserStore.getState();

    async function init() {
      // 1. Grab existing session (from localStorage)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const user = session.user;
        setUser(user.id, user.email ?? null);

        // 2. Fetch plan from profiles
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .single();

        if (!error && profile?.plan) {
          setPlan(profile.plan);
        } else {
          setPlan("free");
        }
      } else {
        reset();
      }

      // 3. Keep store in sync with future auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        if (newSession?.user) {
          const user = newSession.user;
          setUser(user.id, user.email ?? null);

          const { data: profile, error } = await supabase
            .from("profiles")
            .select("plan")
            .eq("id", user.id)
            .single();

          if (!error && profile?.plan) {
            setPlan(profile.plan);
          } else {
            setPlan("free");
          }
        } else {
          reset();
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    init();
  }, []);
}
