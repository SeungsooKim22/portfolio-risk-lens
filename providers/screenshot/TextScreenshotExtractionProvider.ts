import { detectBrokerFromText } from "../../lib/screenshot/detectBroker.ts";
import { parseCaptureText } from "../../lib/portfolio/captureImport.ts";
import type { BrokerageParsingProfile, RawScreenshotExtraction, UploadedScreenshot } from "../../types/screenshotImport.ts";
import type { ScreenshotExtractionProvider } from "./ScreenshotExtractionProvider.ts";

export class TextScreenshotExtractionProvider implements ScreenshotExtractionProvider {
  async extract(image: UploadedScreenshot, context?: BrokerageParsingProfile): Promise<RawScreenshotExtraction> {
    const text = image.text ?? "";
    const detection = detectBrokerFromText(text);
    const rows = parseCaptureText(text);

    return {
      metadata: {
        broker: detection.broker,
        app: detection.app,
        screenType: detection.screenType,
        platform: "unknown",
        theme: "unknown",
        market: "unknown",
        confidence: detection.confidence,
      },
      positions: rows.map((row) => ({
        rawName: row.name,
        weight: row.weight,
        marketValue: row.marketValue,
        marketValueCurrency: row.currency,
        confidence: {
          overall: scoreFor(row.confidence),
          name: scoreFor(row.confidence),
          weight: row.source === "percent" ? scoreFor(row.confidence) : 0.78,
          marketValue: row.source === "amount" ? 0.82 : undefined,
        },
        sourceScreenshotIds: row.sourceScreenshotIds?.length ? row.sourceScreenshotIds : [image.id],
        warnings: row.warnings,
      })),
      warnings: [],
      confidence: rows.length > 0 ? Math.max(0.55, Math.min(0.9, rows.length / 8 + Math.max(detection.confidence, context ? 0.45 : 0) / 2)) : 0.2,
    };
  }
}

function scoreFor(confidence: "high" | "medium" | "low") {
  if (confidence === "high") return 0.94;
  if (confidence === "medium") return 0.78;
  return 0.55;
}
