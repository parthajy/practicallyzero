// src/lib/billingConfig.ts

// Single source of truth for Dodo checkout links

// Trial / Pro monthly – for now we just treat your "₹1 test" as the Pro plan.
// You only *have* to set VITE_DODO_TRIAL in .env/.env.production
const DODO_TRIAL =
  (import.meta.env.VITE_DODO_TRIAL as string | undefined) ?? "";

// Optional: real monthly and lifetime if/when you add them later
const DODO_PRO_MONTHLY =
  (import.meta.env.VITE_DODO_PRO_MONTHLY_URL as string | undefined) ?? "";
const DODO_LIFETIME =
  (import.meta.env.VITE_DODO_LIFETIME_URL as string | undefined) ?? "";

// What the app actually uses today
export const DODO_PRO_MONTHLY_URL =
  DODO_TRIAL || DODO_PRO_MONTHLY || ""; // prefers trial, falls back to real monthly if you add it

export const DODO_LIFETIME_URL = DODO_LIFETIME; // leave empty for now if you don't want lifetime
