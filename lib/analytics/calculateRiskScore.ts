import { riskWeights } from "../../config/riskWeights.ts";
import { clamp } from "../../config/riskNormalization.ts";
import type { PortfolioFeatures, RiskBreakdownItem, RiskComponentKey, RiskResult } from "../../types/analytics.ts";

const labels: Record<RiskComponentKey, { ko: string; en: string }> = {
  volatility: { ko: "변동성 위험", en: "Volatility risk" },
  downside: { ko: "하방 위험", en: "Downside risk" },
  concentration: { ko: "집중 위험", en: "Concentration risk" },
  beta: { ko: "시장 민감도", en: "Market sensitivity" },
  leverage: { ko: "레버리지 위험", en: "Leverage risk" },
  idiosyncratic: { ko: "개별기업 위험", en: "Company-specific risk" },
};

export function calculateRiskScore(features: PortfolioFeatures): RiskResult {
  const components: Record<RiskComponentKey, number> = {
    volatility: features.volatility,
    downside: features.downsideRisk,
    concentration: features.concentration,
    beta: features.marketBeta,
    leverage: features.leverage,
    idiosyncratic: features.idiosyncraticRisk,
  };
  const keys = Object.keys(components) as RiskComponentKey[];
  const rawScore = keys.reduce((sum, key) => sum + components[key] * riskWeights[key], 0);
  const score = clamp(rawScore);
  const breakdown: RiskBreakdownItem[] = keys.map((key) => ({
    key,
    labelKo: labels[key].ko,
    labelEn: labels[key].en,
    score: components[key],
    weight: riskWeights[key],
    contribution: components[key] * riskWeights[key],
  }));

  return {
    score,
    components,
    breakdown,
    confidence: "limited",
  };
}
