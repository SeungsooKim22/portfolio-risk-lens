import type { Security } from "./security.ts";

export type ScreenshotImportWarningCode =
  | "UNKNOWN_BROKER"
  | "LOW_IMAGE_QUALITY"
  | "SCREENSHOT_TOO_CROPPED"
  | "UNSUPPORTED_IMAGE_FORMAT"
  | "NO_POSITIONS_FOUND"
  | "UNKNOWN_SECURITY"
  | "AMBIGUOUS_SECURITY"
  | "WEIGHT_NOT_FOUND"
  | "MARKET_VALUE_NOT_FOUND"
  | "DUPLICATE_POSITION"
  | "PORTFOLIO_TOTAL_TOO_LOW"
  | "PORTFOLIO_TOTAL_TOO_HIGH"
  | "POSSIBLE_RETURN_PERCENT_AS_WEIGHT"
  | "MULTIPLE_MARKETS_DETECTED"
  | "MULTIPLE_CURRENCIES_DETECTED"
  | "NEEDS_USER_REVIEW";

export type ConfidenceLevel = "high" | "medium" | "low";

export type PortfolioScreenshotMetadata = {
  broker?: string;
  app?: string;
  platform?: "ios" | "android" | "unknown";
  theme?: "light" | "dark" | "unknown";
  market?: "KR" | "US" | "mixed" | "unknown";
  screenType?: "holdings" | "portfolio" | "account-assets" | "profit-loss" | "unknown";
  appVersion?: string;
  confidence?: number;
};

export type BrokerDetectionResult = {
  broker?: string;
  app?: string;
  screenType?: PortfolioScreenshotMetadata["screenType"];
  confidence: number;
  evidence?: string[];
};

export type BrokerageParsingProfile = {
  broker: string;
  app?: string;
  knownLabels?: string[];
  likelyWeightLabels?: string[];
  likelyMarketValueLabels?: string[];
  likelyReturnLabels?: string[];
  tickerPatterns?: RegExp[];
  layoutHints?: string[];
};

export type MonetaryValue = {
  value: number;
  currency: string;
};

export type UploadedScreenshot = {
  id: string;
  fileName?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  text?: string;
};

export type PositionConfidence = {
  overall: number;
  ticker?: number;
  name?: number;
  weight?: number;
  marketValue?: number;
  quantity?: number;
};

export type ExtractedPosition = {
  rawName?: string;
  ticker?: string;
  companyName?: string;
  market?: "KR" | "US" | "mixed" | "unknown" | string;
  quantity?: number;
  marketValue?: number;
  marketValueCurrency?: string;
  weight?: number;
  averagePrice?: number;
  currentPrice?: number;
  profitLossAmount?: number;
  profitLossPercent?: number;
  confidence: PositionConfidence;
  sourceScreenshotIds: string[];
  warnings?: ScreenshotImportWarningCode[];
};

export type SecurityResolutionResult = {
  security?: Security;
  confidence: number;
  alternatives?: Security[];
  reason?: string;
};

export type ResolvedExtractedPosition = ExtractedPosition & {
  canonicalTicker?: string;
  displayName: string;
  security?: Security;
  resolutionConfidence: number;
  alternatives?: Security[];
};

export type DuplicateCandidate = {
  positionA: ExtractedPosition;
  positionB: ExtractedPosition;
  confidence: number;
};

export type ImportWarning = {
  code: ScreenshotImportWarningCode;
  message: string;
  severity: "info" | "warning" | "error";
  screenshotId?: string;
  positionName?: string;
};

export type RawScreenshotExtraction = {
  metadata?: PortfolioScreenshotMetadata;
  positions: ExtractedPosition[];
  warnings?: ImportWarning[];
  confidence: number;
};

export type ScreenshotImportSession = {
  id: string;
  screenshots: UploadedScreenshot[];
  detectedBrokerages: BrokerDetectionResult[];
  extractedPositions: ExtractedPosition[];
  resolvedPositions: ResolvedExtractedPosition[];
  warnings: ImportWarning[];
  status: "uploaded" | "processing" | "needs-review" | "confirmed" | "failed";
  duplicates?: DuplicateCandidate[];
  totalAllocation?: number;
};
