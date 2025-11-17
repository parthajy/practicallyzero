import React from "react";
import { MODES } from "../../lib/modes";
import type { ModeKey } from "../../lib/modes";
import type { PlanType } from "../../store/userStore";
import { useUpgradeStore } from "../../store/upgradeStore";

type ModeSelectorProps = {
  mode: ModeKey;
  onChange: (mode: ModeKey) => void;
  plan: PlanType;
};

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  mode,
  onChange,
  plan,
}) => {
  const isFree = plan === "free";
  const { openUpgrade } = useUpgradeStore();

  return (
    <div className="flex flex-wrap gap-2">
      {MODES.map((m) => {
        const locked = isFree && m.proOnly;
        const selected = mode === m.key;
        return (
          <button
            key={m.key}
            type="button"
            onClick={() => {
              if (locked) {
                openUpgrade("pro_mode", m.label);
                return;
              }
              onChange(m.key);
            }}
            className={`px-3 py-1.5 rounded-full text-xs border flex items-center gap-1 ${
              selected
                ? "bg-black text-white border-black"
                : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500"
            } ${locked ? "opacity-60" : ""}`}
          >
            <span>{m.label}</span>
            {locked && (
              <span className="text-[9px] uppercase tracking-wide">Pro</span>
            )}
          </button>
        );
      })}
    </div>
  );
};