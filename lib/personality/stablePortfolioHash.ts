import type { NormalizedPosition } from "../../types/portfolio.ts";

export function stablePortfolioKey(holdings: NormalizedPosition[]) {
  return [...holdings]
    .sort((a, b) => a.ticker.localeCompare(b.ticker))
    .map((item) => `${item.ticker}:${(item.weight / 100).toFixed(4)}`)
    .join("|");
}

export function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function pickStable<T>(items: T[], seed: number) {
  return items[seed % items.length];
}
