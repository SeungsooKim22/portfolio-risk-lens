import type { RawScreenshotExtraction, UploadedScreenshot } from "../../types/screenshotImport.ts";
import type { ScreenshotExtractionProvider } from "./ScreenshotExtractionProvider.ts";

export class MockScreenshotExtractionProvider implements ScreenshotExtractionProvider {
  private readonly extractions: Record<string, RawScreenshotExtraction>;

  constructor(extractions: Record<string, RawScreenshotExtraction>) {
    this.extractions = extractions;
  }

  async extract(image: UploadedScreenshot): Promise<RawScreenshotExtraction> {
    return (
      this.extractions[image.id] ?? {
        positions: [],
        warnings: [],
        confidence: 0.2,
      }
    );
  }
}
