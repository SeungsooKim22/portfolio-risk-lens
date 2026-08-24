import { clamp } from "../../config/riskNormalization.ts";

export function calculateHHI(weights: number[]) {
  const normalized = weights.map((weight) => weight / 100);
  return normalized.reduce((sum, weight) => sum + weight * weight, 0);
}

export function effectiveNumberFromHHI(hhi: number) {
  if (hhi <= 0) return 0;
  return 1 / hhi;
}

export function concentrationFromHHI(hhi: number, count: number) {
  if (count <= 1) return 100;
  const minHhi = 1 / count;
  return clamp(100 * ((hhi - minHhi) / (1 - minHhi)));
}
