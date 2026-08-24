import type { Security } from "./security.ts";

export type PortfolioInputLine = {
  rawLine: string;
  rawName: string;
  inputWeight: number;
};

export type ResolvedPosition = PortfolioInputLine & {
  ticker: string;
  displayName: string;
  security: Security;
  resolution: "local" | "alias" | "fuzzy" | "fallback";
};

export type NormalizedPosition = ResolvedPosition & {
  weight: number;
};

export type Portfolio = {
  positions: NormalizedPosition[];
  totalInputWeight: number;
};

export type PortfolioImporter<TInput = unknown> = {
  import(input: TInput): Promise<Portfolio>;
};
