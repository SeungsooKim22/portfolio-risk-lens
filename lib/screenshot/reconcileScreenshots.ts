import { normalizeSecurityName, resolveSecurity } from "../portfolio/resolveSecurity.ts";
import type { DuplicateCandidate, ExtractedPosition, ImportWarning } from "../../types/screenshotImport.ts";
import { warning } from "./validateExtraction.ts";

export type ReconciliationResult = {
  positions: ExtractedPosition[];
  duplicates: DuplicateCandidate[];
  warnings: ImportWarning[];
};

export function reconcileExtractedPositions(positions: ExtractedPosition[]): ReconciliationResult {
  const byKey = new Map<string, ExtractedPosition>();
  const duplicates: DuplicateCandidate[] = [];
  const warnings: ImportWarning[] = [];

  positions.forEach((position) => {
    const key = duplicateKey(position);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { ...position, sourceScreenshotIds: [...new Set(position.sourceScreenshotIds)] });
      return;
    }

    const confidence = duplicateConfidence(existing, position);
    duplicates.push({ positionA: existing, positionB: position, confidence });
    warnings.push(warning("DUPLICATE_POSITION", "겹쳐 찍힌 종목일 수 있어 한 번만 반영했습니다.", "warning", position.sourceScreenshotIds[0], position.rawName || position.ticker));

    const preferred = preferPosition(existing, position);
    byKey.set(key, {
      ...preferred,
      sourceScreenshotIds: [...new Set([...existing.sourceScreenshotIds, ...position.sourceScreenshotIds])],
      warnings: [...new Set([...(preferred.warnings ?? []), "DUPLICATE_POSITION"])],
      confidence: {
        ...preferred.confidence,
        overall: Math.min(preferred.confidence.overall, confidence >= 0.9 ? 0.86 : 0.72),
      },
    });
  });

  return { positions: [...byKey.values()], duplicates, warnings };
}

function duplicateKey(position: ExtractedPosition) {
  const query = position.ticker || position.rawName || position.companyName || "";
  const resolved = resolveSecurity(query);
  if (resolved.resolution !== "fallback") return resolved.ticker;
  return normalizeSecurityName(query);
}

function duplicateConfidence(a: ExtractedPosition, b: ExtractedPosition) {
  const sameWeight = a.weight !== undefined && b.weight !== undefined && Math.abs(a.weight - b.weight) <= 0.15;
  const sameValue = a.marketValue !== undefined && b.marketValue !== undefined && Math.abs(a.marketValue - b.marketValue) <= Math.max(1, a.marketValue * 0.001);
  const differentScreens = a.sourceScreenshotIds.some((id) => !b.sourceScreenshotIds.includes(id));
  if ((sameWeight || sameValue) && differentScreens) return 0.95;
  if (sameWeight || sameValue) return 0.86;
  return 0.7;
}

function preferPosition(a: ExtractedPosition, b: ExtractedPosition) {
  if ((b.confidence.overall ?? 0) > (a.confidence.overall ?? 0)) return b;
  if (a.weight === undefined && b.weight !== undefined) return b;
  if (a.marketValue === undefined && b.marketValue !== undefined) return b;
  return a;
}
