import React, { useState } from "react";
import { useUpgradeStore } from "../../store/upgradeStore";
import {
  DODO_PRO_MONTHLY_URL,
  DODO_LIFETIME_URL,
} from "../../lib/billingConfig";

export const UpgradeModal: React.FC = () => {
  const { open, reason, modeLabel, closeUpgrade } = useUpgradeStore();
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "lifetime">("pro");
  const [redirecting, setRedirecting] = useState(false);

  if (!open) return null;

  let title = "Unlock full stupidity";
  let description =
    "Upgrade to Pro to remove limits and unlock all chaos levels.";
  if (reason === "thread_limit") {
    description =
      "Free users can create up to 10 threads. Pro gives you unlimited chaos threads.";
  } else if (reason === "chaos_limit") {
    description =
      "Free users are capped at Chaos 80. Pro gives you Chaos 100 and Ultra modes.";
  } else if (reason === "pro_mode") {
    description = `“${modeLabel ?? "This mode"}” is a Pro-only stupidity mode. Upgrade to use it.`;
  }

  const handleUpgrade = () => {
    const url =
      selectedPlan === "pro" ? DODO_PRO_MONTHLY_URL : DODO_LIFETIME_URL;

    if (!url) {
      alert(
        "Payment link not configured yet. Set VITE_DODO_PRO_MONTHLY_URL / VITE_DODO_LIFETIME_URL."
      );
      return;
    }

    setRedirecting(true);
    // simple redirect to Dodo checkout
    window.location.href = url;
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
          <button
            type="button"
            onClick={closeUpgrade}
            className="text-neutral-400 hover:text-neutral-600 text-xs"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-neutral-700 mb-3">{description}</p>

        <ul className="text-[11px] text-neutral-600 mb-3 list-disc pl-4 space-y-1">
          <li>All stupidity modes unlocked (including Profanity & Ultra).</li>
          <li>Chaos level up to 100.</li>
          <li>Unlimited threads.</li>
        </ul>

        {/* Plan picker */}
        <div className="mb-3 flex gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => setSelectedPlan("pro")}
            className={`flex-1 rounded-lg border px-2 py-2 text-left ${
              selectedPlan === "pro"
                ? "border-black bg-black text-white"
                : "border-neutral-300 bg-white text-neutral-800"
            }`}
          >
            <div className="font-semibold">Pro</div>
            <div className="mt-0.5 text-[10px] text-neutral-400">
              $3.99 / month · ₹199
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlan("lifetime")}
            className={`flex-1 rounded-lg border px-2 py-2 text-left ${
              selectedPlan === "lifetime"
                ? "border-purple-700 bg-purple-700 text-white"
                : "border-neutral-300 bg-white text-neutral-800"
            }`}
          >
            <div className="font-semibold">Lifetime</div>
            <div className="mt-0.5 text-[10px] text-neutral-400">
              One-time $199
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={handleUpgrade}
          disabled={redirecting}
          className="w-full rounded-lg bg-black text-white text-sm py-2 mb-2 disabled:opacity-60"
        >
          {redirecting ? "Redirecting…" : "Continue to payment"}
        </button>

        <div className="text-[11px] text-neutral-500 text-center">
          Payments handled securely by Dodo Payments.
        </div>
      </div>
    </div>
  );
};
