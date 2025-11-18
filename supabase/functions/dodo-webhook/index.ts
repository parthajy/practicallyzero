// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const PROJECT_URL = Deno.env.get("PROJECT_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;

const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("[dodo-webhook] incoming payload:", payload);

    // TODO: match your Dodo payload shape.
    // Example: if payload has customer_email + status === "paid"
    const email = payload?.customer_email ?? payload?.customer?.email ?? null;
    const status = payload?.status ?? payload?.payment_status ?? null;

    if (email && status === "paid") {
      const { error } = await supabase
        .from("profiles")
        .update({ plan: "pro" })
        .eq("email", email);

      if (error) {
        console.error("[dodo-webhook] error updating plan:", error.message);
      } else {
        console.log("[dodo-webhook] upgraded user to pro:", email);
      }
    }

    return new Response("ok", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("[dodo-webhook] error:", err);
    return new Response("error", { status: 500, headers: corsHeaders });
  }
});
