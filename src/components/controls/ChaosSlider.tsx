import React from "react";
import type { PlanType } from "../../store/userStore";
import { useUpgradeStore } from "../../store/upgradeStore";

type ChaosSliderProps = {
  value: number;
  onChange: (value: number) => void;
  plan: PlanType;
};

export const ChaosSlider: React.FC<ChaosSliderProps> = ({
  value,
  onChange,
  plan,
}) => {
  const isFree = plan === "free";
  const max = isFree ? 80 : 100;
  const { openUpgrade } = useUpgradeStore();

  const handleChange = (raw: string) => {
    const next = Number(raw);
    if (isFree && next > 80) {
      openUpgrade("chaos_limit");
      return;
    }
    onChange(next);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-neutral-500 w-10">Chaos</span>
      <input
        type="range"
        min={1}
        max={max}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="flex-1 accent-black"
      />
      <span className="text-xs text-neutral-600 w-8 text-right">
        {value}
      </span>
    </div>
  );
};
