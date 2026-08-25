import type { Portfolio } from "./portfolio.ts";
import type { ImportWarning, ResolvedExtractedPosition, ScreenshotImportSession } from "./screenshotImport.ts";

export type PortfolioImportResult = {
  portfolioCandidate: Portfolio;
  positions: ResolvedExtractedPosition[];
  warnings: ImportWarning[];
  confidence: number;
  requiresReview: boolean;
  screenshotSession?: ScreenshotImportSession;
};

export type PortfolioImporter<TInput = unknown> = {
  import(input: TInput): Promise<PortfolioImportResult>;
};
