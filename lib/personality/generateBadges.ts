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
    .map((definition) => ({ definition, relevance: definition.relevance?.(context) ?? definition.priority }))
    .filter((item) => item.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance || b.definition.priority - a.definition.priority);
  const byFamily = new Map<string, Badge & { relevance: number }>();

  eligible.forEach(({ definition, relevance }, index) => {
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
      relevance,
      emoji: variant.emoji,
      title: lang === "ko" && companyTitle ? companyTitle : localized.title,
      description: localized.description,
    });
  });

  return [...byFamily.values()]
    .sort((a, b) => b.relevance - a.relevance || b.priority - a.priority)
    .slice(0, badgeTargetCount(features, risk))
    .map((badge) => ({
      id: badge.id,
      family: badge.family,
      priority: badge.priority,
      emoji: badge.emoji,
      title: badge.title,
      description: badge.description,
    }));
}

function badgeTargetCount(features: PortfolioFeatures, risk: RiskResult) {
  const distinctive =
    risk.score >= 60 ||
    (features.largestPositionWeight ?? 0) >= 35 ||
    features.leveragedExposure >= 25 ||
    features.thematicConcentration >= 55 ||
    features.cryptoExposure >= 20;

  if (distinctive) return 3;
  if (features.broadEtfExposure >= 70 && risk.score < 35) return 2;
  if (features.defensiveTilt >= 45 && risk.score < 45) return 2;
  return 2;
}
