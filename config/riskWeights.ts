import type { RiskComponentKey } from "../types/analytics.ts";

export const riskWeights: Record<RiskComponentKey, number> = {
  volatility: 0.35,
  downside: 0.2,
  concentration: 0.15,
  beta: 0.1,
  leverage: 0.1,
  idiosyncratic: 0.1,
};
