import { riskNormalizationAnchors, clamp, normalizeByAnchors } from "../../config/riskNormalization.ts";
import type { PortfolioFeatures } from "../../types/analytics.ts";
import type { NormalizedPosition } from "../../types/portfolio.ts";
import { calculateHHI, concentrationFromHHI, effectiveNumberFromHHI } from "./calculateHHI.ts";

export function calculateFeatures(positions: NormalizedPosition[]): PortfolioFeatures {
  const sorted = [...positions].sort((a, b) => b.weight - a.weight || a.ticker.localeCompare(b.ticker));
  const top = sorted[0];
  const hhi = calculateHHI(positions.map((item) => item.weight));
  const effectiveNumberOfPositions = effectiveNumberFromHHI(hhi);
  const concentration = concentrationFromHHI(hhi, positions.length);
  const sectorGroups = groupWeights(positions, (item) => item.security.sector || "Unknown", { skipUnknown: true });
  const themeGroups = groupWeights(positions, (item) => item.security.primaryTheme || item.security.themes?.[0] || "unknown", { skipUnknown: true });
  const sectorHhi = calculateHHI(Object.values(sectorGroups));
  const themeHhi = calculateHHI(Object.values(themeGroups));
  const sectorConcentration = clamp(sectorHhi * 100);
  const thematicConcentration = clamp(themeHhi * 100);
  const annualizedVolatility = weighted(positions, (item) => item.security.expectedVolatility ?? 36);
  const volatility = normalizeByAnchors(annualizedVolatility, riskNormalizationAnchors.volatility);
  const recessionDownside = Math.abs(weighted(positions, (item) => item.security.stress?.recession ?? -22));
  const techDownside = Math.abs(weighted(positions, (item) => item.security.stress?.techSelloff ?? -20));
  const downsideRaw = Math.max(recessionDownside, techDownside, annualizedVolatility * 0.65);
  const downsideRisk = normalizeByAnchors(downsideRaw, riskNormalizationAnchors.downside);
  const leverageRaw = positions.reduce((sum, item) => {
    const multiple = item.security.isLeveraged ? Math.abs(item.security.leverageMultiple ?? 1) : 1;
    return sum + (multiple > 1 ? (item.weight / 100) * (multiple - 1) : 0);
  }, 0);
  const leverage = normalizeByAnchors(leverageRaw, riskNormalizationAnchors.leverage);
  const betaRaw = Math.abs(weighted(positions, (item) => item.security.beta ?? fallbackBeta(item)));
  const marketBeta = normalizeByAnchors(betaRaw, riskNormalizationAnchors.beta);
  const largestEquityWeight = top && !top.security.isETF && ["equity", "private"].includes(top.security.assetType) ? top.weight : 0;
  const idiosyncraticRaw = largestEquityWeight * 0.72 + concentration * 0.28;
  const idiosyncraticRisk = normalizeByAnchors(idiosyncraticRaw, riskNormalizationAnchors.idiosyncratic);
  const equityExposure = sumByAsset(positions, ["equity", "etf", "private"], (item) => item.security.assetType !== "bond" && item.security.assetType !== "commodity");
  const bondExposure = sumByAsset(positions, ["bond"]);
  const commodityExposure = sumByAsset(positions, ["commodity"]);
  const cashExposure = sumByAsset(positions, ["cash"]);
  const cryptoExposure = sumByAsset(positions, ["crypto"]);
  const broadEtfExposure = positions.filter((item) => item.security.isBroadMarketETF).reduce((sum, item) => sum + item.weight, 0);
  const leveragedExposure = positions.filter((item) => item.security.isLeveraged).reduce((sum, item) => sum + item.weight, 0);
  const defensiveTilt = clamp(bondExposure + commodityExposure + cashExposure);
  const growthTilt = clamp(themeWeight(themeGroups, ["technology", "semiconductor", "biotech", "ai", "growth", "space", "ev", "battery"]));
  const rateSensitivity = clamp(positions.filter((item) => item.security.primaryTheme === "rates").reduce((sum, item) => sum + item.weight, 0) * 1.4);
  const diversification = clamp((Math.min(effectiveNumberOfPositions, 25) / 25) * 100);
  const dominantSector = topGroup(sectorGroups)?.[0];
  const dominantTheme = topGroup(themeGroups)?.[0];

  return {
    risk: 0,
    volatility,
    downsideRisk,
    concentration,
    sectorConcentration,
    thematicConcentration,
    diversification,
    leverage,
    marketBeta,
    idiosyncraticRisk,
    growthTilt,
    defensiveTilt,
    rateSensitivity,
    equityExposure: clamp(equityExposure),
    bondExposure: clamp(bondExposure),
    commodityExposure: clamp(commodityExposure),
    cashExposure: clamp(cashExposure),
    cryptoExposure: clamp(cryptoExposure),
    broadEtfExposure: clamp(broadEtfExposure),
    leveragedExposure: clamp(leveragedExposure),
    dominantSector,
    dominantTheme,
    largestPositionTicker: top?.ticker,
    largestPositionName: top?.displayName,
    largestPositionWeight: top?.weight ?? 0,
    topThreeWeight: sorted.slice(0, 3).reduce((sum, item) => sum + item.weight, 0),
    hhi,
    sectorHhi,
    themeHhi,
    effectiveNumberOfPositions,
    annualizedVolatility,
    downsideMethod: "stress-fallback",
    betaMethod: "asset-class-fallback",
  };
}

export function groupWeights(
  positions: NormalizedPosition[],
  selector: (item: NormalizedPosition) => string,
  options: { skipUnknown?: boolean } = {},
) {
  return positions.reduce<Record<string, number>>((acc, item) => {
    const label = selector(item) || "Unknown";
    if (options.skipUnknown && ["Unknown", "unknown"].includes(label)) return acc;
    acc[label] = (acc[label] || 0) + item.weight;
    return acc;
  }, {});
}

export function weighted(positions: NormalizedPosition[], selector: (item: NormalizedPosition) => number) {
  const total = positions.reduce((sum, item) => sum + item.weight, 0) || 1;
  return positions.reduce((sum, item) => sum + selector(item) * (item.weight / total), 0);
}

function topGroup(groups: Record<string, number>) {
  return Object.entries(groups).sort((a, b) => b[1] - a[1])[0];
}

function themeWeight(groups: Record<string, number>, themes: string[]) {
  return themes.reduce((sum, theme) => sum + (groups[theme] || 0), 0);
}

function fallbackBeta(item: NormalizedPosition) {
  if (item.security.assetType === "bond") return 0;
  if (item.security.assetType === "cash") return 0;
  if (item.security.assetType === "commodity") return 0.2;
  if (item.security.assetType === "crypto") return 1.5;
  return 1.1;
}

function sumByAsset(positions: NormalizedPosition[], assetTypes: string[], extra?: (item: NormalizedPosition) => boolean) {
  return positions
    .filter((item) => assetTypes.includes(item.security.assetType) && (extra ? extra(item) : true))
    .reduce((sum, item) => sum + item.weight, 0);
}
