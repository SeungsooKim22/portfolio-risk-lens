import type { Portfolio, PortfolioInputLine } from "../../types/portfolio.ts";
import { resolveSecurity } from "./resolveSecurity.ts";

export function parseManualInput(value: string): PortfolioInputLine[] {
  return value
    .split(/\n|,/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/(.+?)\s+(-?\d+(?:\.\d+)?)\s*%?$/);
      return {
        rawLine: line,
        rawName: match?.[1]?.trim() || line,
        inputWeight: Number.parseFloat(match?.[2] || "0"),
      };
    })
    .filter((item) => item.rawName && Number.isFinite(item.inputWeight) && item.inputWeight > 0);
}

export function normalizePortfolio(lines: PortfolioInputLine[]): Portfolio {
  const totalInputWeight = lines.reduce((sum, item) => sum + item.inputWeight, 0);
  const denominator = totalInputWeight || 1;
  const positions = lines.map((line) => {
    const resolved = resolveSecurity(line.rawName);
    return {
      ...line,
      ...resolved,
      weight: (line.inputWeight / denominator) * 100,
    };
  });

  return { positions, totalInputWeight };
}

export function importManualPortfolio(value: string) {
  return normalizePortfolio(parseManualInput(value));
}
