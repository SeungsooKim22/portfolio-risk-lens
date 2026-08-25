import { importManualPortfolio } from "../portfolio/normalizePortfolio.ts";
import type { PortfolioImportResult, PortfolioImporter } from "../../types/portfolioImport.ts";

export class ManualPortfolioImporter implements PortfolioImporter<string> {
  async import(input: string): Promise<PortfolioImportResult> {
    return {
      portfolioCandidate: importManualPortfolio(input),
      positions: [],
      warnings: [],
      confidence: 1,
      requiresReview: false,
    };
  }
}
