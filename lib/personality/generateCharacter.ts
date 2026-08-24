import { archetypeDefinitions, riskModifierPools } from "../../data/characterDefinitions.ts";
import { dominantTraitThreshold } from "../../config/personalityThresholds.ts";
import type { PortfolioFeatures, RiskResult } from "../../types/analytics.ts";
import type { NormalizedPosition } from "../../types/portfolio.ts";
import type { Lang, RiskCharacter } from "../../types/personality.ts";
import { pickStable, stableHash, stablePortfolioKey } from "./stablePortfolioHash.ts";

export function generateCharacter(holdings: NormalizedPosition[], features: PortfolioFeatures, risk: RiskResult, lang: Lang): RiskCharacter {
  const seed = stableHash(stablePortfolioKey(holdings));
  const modifierRow = riskModifierPools[lang].find((item) => risk.score >= item.min && risk.score <= item.max) ?? riskModifierPools[lang][riskModifierPools[lang].length - 1];
  const modifier = pickStable(modifierRow.variants, seed);
  const dominantTrait = determineDominantTrait(features);
  const archetype = archetypeDefinitions[dominantTrait][lang];
  const archetypeName = pickStable(archetype.variants, seed + 17);
  const quote = pickStable(archetype.quotes, seed + 31);

  return {
    modifier,
    archetype: archetypeName,
    name: `${modifier} ${archetypeName}`,
    quote,
    dominantTrait,
  };
}

export function determineDominantTrait(features: PortfolioFeatures): keyof typeof archetypeDefinitions {
  const strengths: Record<keyof typeof archetypeDefinitions, number> = {
    balanced: 0,
    technology: features.dominantTheme === "technology" ? Math.max(features.growthTilt, features.thematicConcentration) : 0,
    semiconductor: features.dominantTheme === "semiconductor" ? Math.max(features.growthTilt, features.thematicConcentration) : 0,
    biotech: features.dominantTheme === "biotech" ? Math.max(features.growthTilt, features.thematicConcentration) : 0,
    leverage: Math.max(features.leverage, features.leveragedExposure),
    singleStock: Math.max(features.concentration, features.idiosyncraticRisk, features.largestPositionWeight ?? 0),
    broadEtf: features.broadEtfExposure,
    defensive: features.defensiveTilt,
    cash: features.cashExposure,
    space: features.dominantTheme === "space" ? Math.max(55, features.thematicConcentration) : 0,
    gold: features.dominantTheme === "gold" ? Math.max(55, features.commodityExposure) : 0,
    rates: features.rateSensitivity,
  };
  const best = Object.entries(strengths).sort((a, b) => b[1] - a[1])[0] as [keyof typeof archetypeDefinitions, number];
  return best[1] >= dominantTraitThreshold ? best[0] : "balanced";
}
