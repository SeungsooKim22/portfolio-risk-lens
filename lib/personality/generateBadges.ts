import { badgeDefinitions, companyBadgeTitle } from "../../data/badgeDefinitions.ts";
import type { PortfolioFeatures, RiskResult } from "../../types/analytics.ts";
import type { NormalizedPosition } from "../../types/portfolio.ts";
import type { Badge, Lang } from "../../types/personality.ts";
import { pickStable, stableHash, stablePortfolioKey } from "./stablePortfolioHash.ts";

export function generateBadges(holdings: NormalizedPosition[], features: PortfolioFeatures, risk: RiskResult, lang: Lang): Badge[] {
  const seed = stableHash(stablePortfolioKey(holdings));
  const context = { holdings, features, risk };
  const eligible = badgeDefinitions
    .filter((definition) => definition.eligibility(context))
    .sort((a, b) => b.priority - a.priority);
  const byFamily = new Map<string, Badge>();

  eligible.forEach((definition, index) => {
    if (byFamily.has(definition.family)) return;
    const variant = pickStable(definition.variants, seed + index);
    const localized = variant[lang];
    const companyTitle =
      definition.id === "company_extreme" && features.largestPositionTicker && features.largestPositionWeight
        ? companyBadgeTitle(features.largestPositionTicker, features.largestPositionWeight)
        : null;
    byFamily.set(definition.family, {
      id: definition.id,
      family: definition.family,
      priority: definition.priority,
      emoji: variant.emoji,
      title: lang === "ko" && companyTitle ? companyTitle : localized.title,
      description: localized.description,
    });
  });

  return [...byFamily.values()].sort((a, b) => b.priority - a.priority).slice(0, 3);
}
