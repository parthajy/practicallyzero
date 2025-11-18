// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

// Prefer SUPABASE_URL if present, else PROJECT_URL
const PROJECT_URL =
  Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");

if (!PROJECT_URL) {
  throw new Error("[dodo-webhook] PROJECT_URL / SUPABASE_URL not set");
}
if (!SERVICE_ROLE_KEY) {
  throw new Error("[dodo-webhook] SERVICE_ROLE_KEY not set");
}

const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("[dodo-webhook] incoming payload:", payload);

    const eventType = payload?.type; // "payment.succeeded"
    const data = payload?.data ?? {};

    // Correct email + status extraction for Dodo
    const email = data?.customer?.email ?? null;
    const status = data?.status ?? null; // "succeeded"
    const productCart = data?.product_cart ?? [];
    const productId = productCart[0]?.product_id ?? null;

    console.log("[dodo-webhook] parsed:", {
      eventType,
      email,
      status,
      productId,
    });

    // Minimal condition: any succeeded payment upgrades to pro
    if (eventType === "payment.succeeded" && email && status === "succeeded") {
      const { error } = await supabase
        .from("profiles")
        .update({ plan: "pro" })
        .eq("email", email);

      if (error) {
        console.error("[dodo-webhook] error updating plan:", error.message);
      } else {
        console.log("[dodo-webhook] upgraded user to pro:", email);
      }
    } else {
      console.log("[dodo-webhook] skipping update – condition not met", {
        eventType,
        email,
        status,
        productId,
      });
    }

    return new Response("ok", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("[dodo-webhook] error:", err);
    return new Response("error", { status: 500, headers: corsHeaders });
  }
});
