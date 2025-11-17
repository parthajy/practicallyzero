import React from "react";
import type { PlanType } from "../../store/userStore";

type PlanBadgeProps = {
  plan: PlanType;
};

export const PlanBadge: React.FC<PlanBadgeProps> = ({ plan }) => {
  let label = "Free chaos";
  let color =
    "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-200 dark:border-neutral-700";

  if (plan === "pro") {
    label = "Pro chaos";
    color =
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700/60";
  } else if (plan === "lifetime") {
    label = "Lifetime chaos";
    color =
      "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-700/60";
  }

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        color,
      ].join(" ")}
    >
      {label}
    </span>
  );
};
