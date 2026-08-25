import type { ExtractedPosition, ImportWarning, RawScreenshotExtraction, ScreenshotImportWarningCode, UploadedScreenshot } from "../../types/screenshotImport.ts";

const supportedImageTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export function validateImageQuality(screenshot: UploadedScreenshot): ImportWarning[] {
  const warnings: ImportWarning[] = [];
  if (screenshot.mimeType && !supportedImageTypes.has(screenshot.mimeType)) {
    warnings.push(warning("UNSUPPORTED_IMAGE_FORMAT", "지원하지 않는 이미지 형식입니다.", "error", screenshot.id));
  }
  if ((screenshot.width && screenshot.width < 500) || (screenshot.height && screenshot.height < 500)) {
    warnings.push(warning("LOW_IMAGE_QUALITY", "이미지가 작아서 글자를 읽기 어려울 수 있습니다.", "warning", screenshot.id));
  }
  if (screenshot.text !== undefined && screenshot.text.trim().length < 8) {
    warnings.push(warning("NO_POSITIONS_FOUND", "스크린샷에서 종목 후보를 찾지 못했습니다.", "warning", screenshot.id));
  }
  return warnings;
}

export function validateRawExtraction(extraction: RawScreenshotExtraction, screenshotId?: string): RawScreenshotExtraction {
  const positions = extraction.positions
    .map((position) => normalizePosition(position, screenshotId))
    .filter((position): position is ExtractedPosition => Boolean(position));
  const warnings = [...(extraction.warnings ?? [])];

  if (positions.length === 0) {
    warnings.push(warning("NO_POSITIONS_FOUND", "종목 후보가 없습니다.", "warning", screenshotId));
  }

  positions.forEach((position) => {
    const positionName = position.rawName || position.ticker || position.companyName || "Unknown position";
    if (!position.rawName && !position.ticker && !position.companyName) {
      warnings.push(warning("UNKNOWN_SECURITY", "종목명을 확인해야 합니다.", "warning", firstSource(position), positionName));
    }
    if (position.weight === undefined && position.marketValue === undefined && !hasQuantityAndPrice(position)) {
      warnings.push(warning("WEIGHT_NOT_FOUND", "비중이나 평가금액을 확인해야 합니다.", "warning", firstSource(position), positionName));
    }
  });

  return {
    ...extraction,
    positions,
    warnings,
    confidence: clamp01(extraction.confidence),
  };
}

export function confidenceLevel(score: number) {
  if (score >= 0.9) return "high";
  if (score >= 0.7) return "medium";
  return "low";
}

export function warning(
  code: ScreenshotImportWarningCode,
  message: string,
  severity: ImportWarning["severity"] = "warning",
  screenshotId?: string,
  positionName?: string,
): ImportWarning {
  return { code, message, severity, screenshotId, positionName };
}

export function dedupeWarnings(warnings: ImportWarning[]) {
  const seen = new Set<string>();
  return warnings.filter((item) => {
    const key = [item.code, item.screenshotId ?? "", item.positionName ?? "", item.message].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizePosition(position: ExtractedPosition, screenshotId?: string): ExtractedPosition | null {
  const next: ExtractedPosition = {
    ...position,
    rawName: cleanText(position.rawName),
    ticker: cleanText(position.ticker)?.toUpperCase(),
    companyName: cleanText(position.companyName),
    sourceScreenshotIds: position.sourceScreenshotIds.length > 0 ? position.sourceScreenshotIds : screenshotId ? [screenshotId] : [],
    confidence: {
      overall: clamp01(position.confidence?.overall ?? 0.4),
      ticker: optionalClamp(position.confidence?.ticker),
      name: optionalClamp(position.confidence?.name),
      weight: optionalClamp(position.confidence?.weight),
      marketValue: optionalClamp(position.confidence?.marketValue),
      quantity: optionalClamp(position.confidence?.quantity),
    },
    warnings: [...new Set(position.warnings ?? [])],
  };

  next.weight = optionalPositive(position.weight, 1000);
  next.marketValue = optionalPositive(position.marketValue);
  next.quantity = optionalPositive(position.quantity);
  next.averagePrice = optionalPositive(position.averagePrice);
  next.currentPrice = optionalPositive(position.currentPrice);
  next.profitLossAmount = optionalFinite(position.profitLossAmount);
  next.profitLossPercent = optionalFinite(position.profitLossPercent);

  if (!next.rawName && !next.ticker && !next.companyName) return null;
  if (position.weight !== undefined && next.weight === undefined) next.warnings?.push("POSSIBLE_RETURN_PERCENT_AS_WEIGHT");
  return next;
}

function hasQuantityAndPrice(position: ExtractedPosition) {
  return Number.isFinite(position.quantity) && Number.isFinite(position.currentPrice) && (position.quantity ?? 0) > 0 && (position.currentPrice ?? 0) > 0;
}

function firstSource(position: ExtractedPosition) {
  return position.sourceScreenshotIds[0];
}

function cleanText(value?: string) {
  return value?.replace(/\s+/g, " ").trim();
}

function optionalClamp(value?: number) {
  return value === undefined || !Number.isFinite(value) ? undefined : clamp01(value);
}

function optionalPositive(value?: number, max = Number.POSITIVE_INFINITY) {
  if (value === undefined || !Number.isFinite(value) || value < 0 || value > max) return undefined;
  return value;
}

function optionalFinite(value?: number) {
  return value === undefined || !Number.isFinite(value) ? undefined : value;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}
