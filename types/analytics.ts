import type { NormalizedPosition } from "./portfolio.ts";

export type AnalysisConfidence = "high" | "medium" | "limited";

export type PortfolioFeatures = {
  risk: number;
  volatility: number;
  downsideRisk: number;
  concentration: number;
  sectorConcentration: number;
  thematicConcentration: number;
  diversification: number;
  leverage: number;
  marketBeta: number;
  idiosyncraticRisk: number;
  growthTilt: number;
  defensiveTilt: number;
  rateSensitivity: number;
  equityExposure: number;
  bondExposure: number;
  commodityExposure: number;
  cashExposure: number;
  cryptoExposure: number;
  broadEtfExposure: number;
  leveragedExposure: number;
  dominantSector?: string;
  dominantTheme?: string;
  largestPositionTicker?: string;
  largestPositionName?: string;
  largestPositionWeight?: number;
  topThreeWeight: number;
  hhi: number;
  sectorHhi: number;
  themeHhi: number;
  effectiveNumberOfPositions: number;
  annualizedVolatility: number;
  downsideMethod: "historical-cvar" | "downside-deviation" | "stress-fallback" | "volatility-fallback";
  betaMethod: "historical-regression" | "asset-class-fallback";
};

export type RiskComponentKey = "volatility" | "downside" | "concentration" | "beta" | "leverage" | "idiosyncratic";

export type RiskBreakdownItem = {
  key: RiskComponentKey;
  labelKo: string;
  labelEn: string;
  score: number;
  weight: number;
  contribution: number;
};

export type RiskResult = {
  score: number;
  components: Record<RiskComponentKey, number>;
  breakdown: RiskBreakdownItem[];
  confidence: AnalysisConfidence;
};

export type ScenarioResult = {
  key: "techSelloff" | "rateShock" | "recession" | "dollarDrop";
  labelKo: string;
  labelEn: string;
  value: number;
};

export type AnalysisResult = {
  portfolio: {
    positions: NormalizedPosition[];
    unknownWeight: number;
  };
  features: PortfolioFeatures;
  risk: RiskResult;
  scenarios: ScenarioResult[];
};
