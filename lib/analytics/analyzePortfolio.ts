import type { AnalysisResult, ScenarioResult } from "../../types/analytics.ts";
import { importManualPortfolio } from "../portfolio/normalizePortfolio.ts";
import { calculateFeatures, weighted } from "./calculateFeatures.ts";
import { calculateRiskScore } from "./calculateRiskScore.ts";

export function analyzePortfolioText(input: string): AnalysisResult {
  const portfolio = importManualPortfolio(input);
  const features = calculateFeatures(portfolio.positions);
  const risk = calculateRiskScore(features);
  features.risk = risk.score;
  const unknownWeight = portfolio.positions
    .filter((item) => item.resolution === "fallback" || item.security.sector === "Unknown")
    .reduce((sum, item) => sum + item.weight, 0);

  const scenarios: ScenarioResult[] = [
    { key: "techSelloff", labelKo: "나스닥 -20% 하락 시", labelEn: "If Nasdaq falls 20%", value: weighted(portfolio.positions, (item) => item.security.stress?.techSelloff ?? -20) },
    { key: "rateShock", labelKo: "금리 1%p 상승 시", labelEn: "If rates rise 1%", value: weighted(portfolio.positions, (item) => item.security.stress?.rateShock ?? -9) },
    { key: "recession", labelKo: "경기침체 시", labelEn: "In a recession", value: weighted(portfolio.positions, (item) => item.security.stress?.recession ?? -22) },
    { key: "dollarDrop", labelKo: "달러 약세 시", labelEn: "If USD weakens", value: weighted(portfolio.positions, (item) => item.security.stress?.dollarDrop ?? -2) },
  ];

  return {
    portfolio: { positions: portfolio.positions, unknownWeight },
    features,
    risk,
    scenarios,
  };
}
