import type { ExtractedPosition, ImportWarning } from "../../types/screenshotImport.ts";
import { warning } from "./validateExtraction.ts";

export type WeightCalculationResult = {
  positions: ExtractedPosition[];
  warnings: ImportWarning[];
  totalAllocation?: number;
};

export function calculatePositionWeights(positions: ExtractedPosition[]): WeightCalculationResult {
  const warnings: ImportWarning[] = [];
  const withDerivedValues = positions.map((position) => deriveMarketValue(position));
  const explicit = withDerivedValues.filter((position) => isPositive(position.weight));

  if (explicit.length === withDerivedValues.length && explicit.length > 0) {
    const totalAllocation = sum(explicit.map((position) => position.weight ?? 0));
    warnings.push(...portfolioTotalWarnings(totalAllocation));
    return { positions: explicit, warnings, totalAllocation };
  }

  if (explicit.length > 0) {
    withDerivedValues.forEach((position) => {
      if (!isPositive(position.weight)) {
        position.warnings = [...new Set([...(position.warnings ?? []), "WEIGHT_NOT_FOUND"])];
        warnings.push(warning("WEIGHT_NOT_FOUND", "일부 종목의 비중을 확인해야 합니다.", "warning", position.sourceScreenshotIds[0], position.rawName || position.ticker));
      }
    });
    const totalAllocation = sum(explicit.map((position) => position.weight ?? 0));
    warnings.push(...portfolioTotalWarnings(totalAllocation));
    return { positions: withDerivedValues, warnings, totalAllocation };
  }

  const marketValueRows = withDerivedValues.filter((position) => isPositive(position.marketValue));
  if (marketValueRows.length === withDerivedValues.length && marketValueRows.length > 0) {
    const currencies = new Set(marketValueRows.map((position) => position.marketValueCurrency).filter(Boolean));
    if (currencies.size > 1) {
      warnings.push(warning("MULTIPLE_CURRENCIES_DETECTED", "통화가 섞여 있어 환율 확인이 필요합니다.", "warning"));
      return { positions: withDerivedValues, warnings };
    }

    const totalValue = sum(marketValueRows.map((position) => position.marketValue ?? 0));
    if (totalValue > 0) {
      return {
        positions: marketValueRows.map((position) => ({
          ...position,
          weight: ((position.marketValue ?? 0) / totalValue) * 100,
          confidence: {
            ...position.confidence,
            weight: Math.min(position.confidence.marketValue ?? position.confidence.overall, 0.88),
            overall: Math.min(position.confidence.overall, 0.88),
          },
        })),
        warnings,
        totalAllocation: 100,
      };
    }
  }

  withDerivedValues.forEach((position) => {
    position.warnings = [...new Set([...(position.warnings ?? []), "MARKET_VALUE_NOT_FOUND"])];
    warnings.push(warning("MARKET_VALUE_NOT_FOUND", "비중을 계산할 평가금액이 부족합니다.", "warning", position.sourceScreenshotIds[0], position.rawName || position.ticker));
  });

  return { positions: withDerivedValues, warnings };
}

export function portfolioTotalWarnings(totalAllocation?: number): ImportWarning[] {
  if (totalAllocation === undefined) return [];
  if (totalAllocation < 98) {
    return [warning("PORTFOLIO_TOTAL_TOO_LOW", `감지된 비중 합계가 ${formatPercent(totalAllocation)}입니다. 누락된 종목이 있을 수 있습니다.`, "warning")];
  }
  if (totalAllocation > 102) {
    return [warning("PORTFOLIO_TOTAL_TOO_HIGH", `감지된 비중 합계가 ${formatPercent(totalAllocation)}입니다. 중복되거나 잘못 읽힌 종목이 있을 수 있습니다.`, "warning")];
  }
  return [];
}

function deriveMarketValue(position: ExtractedPosition): ExtractedPosition {
  if (isPositive(position.marketValue) || !isPositive(position.quantity) || !isPositive(position.currentPrice)) return { ...position };
  return {
    ...position,
    marketValue: (position.quantity ?? 0) * (position.currentPrice ?? 0),
    confidence: {
      ...position.confidence,
      marketValue: Math.min(position.confidence.quantity ?? 0.7, position.confidence.overall),
    },
  };
}

function isPositive(value?: number) {
  return value !== undefined && Number.isFinite(value) && value > 0;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function formatPercent(value: number) {
  return `${value.toFixed(1).replace(/\.0$/, "")}%`;
}
