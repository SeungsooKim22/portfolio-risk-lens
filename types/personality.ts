import type { NormalizedPosition } from "./portfolio.ts";
import type { PortfolioFeatures, RiskResult } from "./analytics.ts";

export type Lang = "ko" | "en";

export type RiskCharacter = {
  modifier: string;
  archetype: string;
  name: string;
  quote: string;
  dominantTrait: string;
};

export type Badge = {
  id: string;
  family: string;
  priority: number;
  emoji: string;
  title: string;
  description: string;
};

export type BadgeDefinition = {
  id: string;
  family: string;
  priority: number;
  eligibility: (context: {
    holdings: NormalizedPosition[];
    features: PortfolioFeatures;
    risk: RiskResult;
  }) => boolean;
  variants: {
    emoji: string;
    ko: { title: string; description: string };
    en: { title: string; description: string };
  }[];
};
