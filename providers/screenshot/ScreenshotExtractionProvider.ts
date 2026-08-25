import type { BrokerageParsingProfile } from "../../types/screenshotImport.ts";
import type { RawScreenshotExtraction, UploadedScreenshot } from "../../types/screenshotImport.ts";

export interface ScreenshotExtractionProvider {
  extract(image: UploadedScreenshot, context?: BrokerageParsingProfile): Promise<RawScreenshotExtraction>;
}
