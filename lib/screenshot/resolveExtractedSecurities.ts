import { resolveSecurity } from "../portfolio/resolveSecurity.ts";
import type { ExtractedPosition, ImportWarning, ResolvedExtractedPosition, SecurityResolutionResult } from "../../types/screenshotImport.ts";
import { warning } from "./validateExtraction.ts";

export function resolveExtractedSecurities(positions: ExtractedPosition[]): { positions: ResolvedExtractedPosition[]; warnings: ImportWarning[] } {
  const warnings: ImportWarning[] = [];
  const resolvedPositions = positions.map((position) => {
    const resolution = resolveExtractedSecurity(position);
    if (!resolution.security || resolution.confidence < 0.45) {
      warnings.push(warning("UNKNOWN_SECURITY", "종목을 정확히 확인해야 합니다.", "warning", position.sourceScreenshotIds[0], position.rawName || position.ticker));
    }

    return {
      ...position,
      canonicalTicker: resolution.security?.ticker,
      displayName: resolution.security?.companyName ?? position.companyName ?? position.rawName ?? position.ticker ?? "Unknown position",
      security: resolution.security,
      resolutionConfidence: resolution.confidence,
      alternatives: resolution.alternatives,
      warnings: [...new Set([...(position.warnings ?? []), ...(resolution.confidence < 0.45 ? ["UNKNOWN_SECURITY" as const] : [])])],
    };
  });

  return { positions: resolvedPositions, warnings };
}

export function resolveExtractedSecurity(position: ExtractedPosition): SecurityResolutionResult {
  const query = position.ticker || position.rawName || position.companyName || "";
  if (!query.trim()) return { confidence: 0, reason: "missing-name" };

  const resolved = resolveSecurity(query);
  const confidenceByResolution = {
    local: 0.98,
    alias: 0.92,
    fuzzy: 0.74,
    fallback: 0.35,
  } satisfies Record<typeof resolved.resolution, number>;

  return {
    security: resolved.security,
    confidence: confidenceByResolution[resolved.resolution],
    alternatives: resolved.resolution === "fallback" ? [] : [resolved.security],
    reason: resolved.resolution,
  };
}
