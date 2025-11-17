export type ModeKey =
  | "classic"
  | "nonsense"
  | "overconfident"
  | "broken"
  | "profanity"
  | "villain"
  | "grandma"
  | "corporate"
  | "ultra";

export type ModeConfig = {
  key: ModeKey;
  label: string;
  description: string;
  proOnly?: boolean;
};

export const MODES: ModeConfig[] = [
  {
    key: "classic",
    label: "Classic Stupid",
    description: "Confident idiot energy.",
  },
  {
    key: "nonsense",
    label: "Nonsense",
    description: "Surreal, wrong, and weird.",
  },
  {
    key: "overconfident",
    label: "Overconfident Wrong",
    description: "Absolutely sure, absolutely wrong.",
  },
  {
    key: "broken",
    label: "Broken Logic",
    description: "Contradictions and circular reasoning.",
  },
  {
    key: "profanity",
    label: "Profanity",
    description: "Rude, sweary stupidity.",
    proOnly: true,
  },
  {
    key: "villain",
    label: "Villain",
    description: "Cartoon supervillain stupid.",
    proOnly: true,
  },
  {
    key: "grandma",
    label: "Grandma",
    description: "Sweet, but terrible advice.",
    proOnly: true,
  },
  {
    key: "corporate",
    label: "Corporate",
    description: "Buzzwords and fake metrics.",
    proOnly: true,
  },
  {
    key: "ultra",
    label: "Ultra Chaos",
    description: "Maximum chaos within safety.",
    proOnly: true,
  },
];
