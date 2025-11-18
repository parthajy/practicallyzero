// src/lib/billingConfig.ts

// Single source of truth for Dodo checkout links
// Only Pro Monthly and Lifetime now. No Trial.

const DODO_PRO_MONTHLY_URL =
  (import.meta.env.VITE_DODO_PRO_MONTHLY_URL as string | undefined) ?? "";

const DODO_LIFETIME_URL =
  (import.meta.env.VITE_DODO_LIFETIME_URL as string | undefined) ?? "";

// Exported for use in UpgradeModal and anywhere else
export { DODO_PRO_MONTHLY_URL, DODO_LIFETIME_URL };
