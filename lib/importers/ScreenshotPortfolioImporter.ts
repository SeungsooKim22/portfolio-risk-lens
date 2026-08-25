import { detectBrokerFromScreenshot, profileForDetection } from "../screenshot/detectBroker.ts";
import { calculatePositionWeights } from "../screenshot/calculateWeights.ts";
import { reconcileExtractedPositions } from "../screenshot/reconcileScreenshots.ts";
import { resolveExtractedSecurities } from "../screenshot/resolveExtractedSecurities.ts";
import { dedupeWarnings, validateImageQuality, validateRawExtraction, warning } from "../screenshot/validateExtraction.ts";
import { normalizePortfolio } from "../portfolio/normalizePortfolio.ts";
import { TextScreenshotExtractionProvider } from "../../providers/screenshot/TextScreenshotExtractionProvider.ts";
import type { ScreenshotExtractionProvider } from "../../providers/screenshot/ScreenshotExtractionProvider.ts";
import type { PortfolioInputLine } from "../../types/portfolio.ts";
import type { PortfolioImportResult, PortfolioImporter } from "../../types/portfolioImport.ts";
import type { ExtractedPosition, RawScreenshotExtraction, ScreenshotImportSession, UploadedScreenshot } from "../../types/screenshotImport.ts";

export type ScreenshotPortfolioImportInput = {
  screenshots: UploadedScreenshot[];
  extractions?: RawScreenshotExtraction[];
  correctedPositions?: ExtractedPosition[];
};

export class ScreenshotPortfolioImporter implements PortfolioImporter<ScreenshotPortfolioImportInput> {
  private readonly provider: ScreenshotExtractionProvider;

  constructor(provider: ScreenshotExtractionProvider = new TextScreenshotExtractionProvider()) {
    this.provider = provider;
  }

  async import(input: ScreenshotPortfolioImportInput): Promise<PortfolioImportResult> {
    const detectedBrokerages = input.screenshots.map(detectBrokerFromScreenshot);
    const qualityWarnings = input.screenshots.flatMap(validateImageQuality);
    const extractionPayloads =
      input.correctedPositions !== undefined
        ? [{ positions: input.correctedPositions, warnings: [], confidence: 1 }]
        : input.extractions ?? (await this.extractScreenshots(input.screenshots));

    const validated = extractionPayloads.map((extraction, index) => validateRawExtraction(extraction, input.screenshots[index]?.id));
    const extractedPositions = validated.flatMap((extraction) => extraction.positions);
    const extractionWarnings = validated.flatMap((extraction) => extraction.warnings ?? []);
    const reconciled = reconcileExtractedPositions(extractedPositions);
    const weighted = calculatePositionWeights(reconciled.positions);
    const resolved = resolveExtractedSecurities(weighted.positions);
    const lines = resolved.positions
      .filter((position) => position.weight !== undefined && position.weight > 0)
      .map<PortfolioInputLine>((position, index) => ({
        rawLine: `${position.canonicalTicker ?? position.rawName ?? position.ticker ?? `Unknown ${index + 1}`} ${position.weight}`,
        rawName: position.canonicalTicker ?? position.rawName ?? position.ticker ?? `Unknown ${index + 1}`,
        inputWeight: position.weight ?? 0,
      }));

    const portfolioCandidate = normalizePortfolio(lines);
    const totalAllocation = weighted.totalAllocation;
    const allWarnings = dedupeWarnings([
      ...qualityWarnings,
      ...extractionWarnings,
      ...reconciled.warnings,
      ...weighted.warnings,
      ...resolved.warnings,
      ...(detectedBrokerages.some((item) => item.broker === "unknown") ? [warning("UNKNOWN_BROKER", "증권사 앱은 자동 인식하지 못했지만 일반 추출로 계속 진행했습니다.", "info")] : []),
      ...(resolved.positions.length === 0 ? [warning("NO_POSITIONS_FOUND", "확인할 종목이 없습니다.", "warning")] : []),
    ]);

    const session: ScreenshotImportSession = {
      id: `session-${hashInput(input.screenshots.map((item) => `${item.id}:${item.text ?? ""}`).join("|"))}`,
      screenshots: input.screenshots,
      detectedBrokerages,
      extractedPositions,
      resolvedPositions: resolved.positions,
      warnings: allWarnings,
      status: "needs-review",
      duplicates: reconciled.duplicates,
      totalAllocation,
    };

    return {
      portfolioCandidate,
      positions: resolved.positions,
      warnings: allWarnings,
      confidence: averageConfidence(validated.map((item) => item.confidence), resolved.positions.map((item) => item.confidence.overall)),
      requiresReview: true,
      screenshotSession: session,
    };
  }

  private async extractScreenshots(screenshots: UploadedScreenshot[]) {
    const extractions: RawScreenshotExtraction[] = [];
    for (const screenshot of screenshots) {
      const detection = detectBrokerFromScreenshot(screenshot);
      extractions.push(await this.provider.extract(screenshot, profileForDetection(detection)));
    }
    return extractions;
  }
}

function averageConfidence(...groups: number[][]) {
  const values = groups.flat().filter((value) => Number.isFinite(value));
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function hashInput(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash.toString(36);
}
