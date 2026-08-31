import { generatedSecurityUniverse } from "../../data/generatedSecurityUniverse.ts";
import type { Security, StressProfile } from "../../types/security.ts";

type GeneratedRecord = {
  ticker: string;
  companyName: string;
  exchange: string;
  sector: string;
  industry: string;
  country: string;
  assetType: string;
};

const generatedRecords = generatedSecurityUniverse.map(([ticker, companyName, exchange, sector, industry, country, assetType]) => ({
  ticker,
  companyName,
  exchange,
  sector,
  industry,
  country,
  assetType,
}));

export const generatedSecurityMap = new Map(generatedRecords.map((record) => [record.ticker, record]));

export function generatedSecurities() {
  return generatedRecords.map(securityFromGeneratedRecord);
}

export function securityFromGeneratedTicker(ticker: string) {
  const record = generatedSecurityMap.get(ticker);
  return record ? securityFromGeneratedRecord(record) : null;
}

function securityFromGeneratedRecord(record: GeneratedRecord): Security {
  const assetType = normalizeAssetType(record.assetType);
  const sector = normalizeSector(record.sector);
  const region = regionFor(record.country);
  const isETF = assetType === "etf" || /ETF|Fund|Trust/i.test(record.companyName);
  const primaryTheme = themeFor(sector, record.industry, isETF);

  return {
    ticker: record.ticker,
    exchange: record.exchange,
    companyName: record.companyName,
    assetType,
    assetLabel: assetLabelFor(assetType, region, isETF),
    sector,
    industry: record.industry || undefined,
    country: record.country,
    currency: record.country === "South Korea" ? "KRW" : "USD",
    region,
    isETF,
    isBroadMarketETF: isETF && isBroadMarketName(record.companyName),
    diversificationUnits: isETF ? (isBroadMarketName(record.companyName) ? 45 : 18) : undefined,
    themes: [primaryTheme],
    primaryTheme,
    expectedVolatility: volatilityFor(assetType, sector, record.exchange),
    beta: betaFor(assetType, sector),
    stress: stressFor(assetType, sector),
  };
}

function normalizeAssetType(value: string): Security["assetType"] {
  if (value === "etf") return "etf";
  if (value === "reit") return "reit";
  return "equity";
}

function normalizeSector(sector: string) {
  if (!sector || sector === "Miscellaneous") return "Industrials";
  return sector;
}

function regionFor(country: string) {
  if (country === "United States") return "United States";
  if (country === "South Korea") return "South Korea";
  if (!country || country === "Global") return "Global";
  return "International";
}

function assetLabelFor(assetType: Security["assetType"], region: string, isETF: boolean) {
  if (assetType === "reit") return region === "South Korea" ? "Korea REIT" : "US REIT";
  if (isETF) return region === "United States" ? "US Equity ETF" : "Global Equity ETF";
  if (region === "South Korea") return "Korea Equity";
  if (region === "United States") return "US Equity";
  return "Global Equity";
}

function themeFor(sector: string, industry: string, isETF: boolean) {
  const text = `${sector} ${industry}`.toLowerCase();
  if (isETF && /s&p|total market|nasdaq|index|large cap|broad/.test(text)) return "broad-market";
  if (/semiconductor|반도체|chip/.test(text)) return "semiconductor";
  if (/biotech|pharmaceutical|제약|바이오|의약/.test(text)) return "biotech";
  if (/software|computer|internet|cloud|ai|data|소프트웨어|인터넷|데이터/.test(text)) return "technology";
  if (/bank|insurance|금융|은행|보험/.test(text)) return "financials";
  if (/energy|oil|gas|에너지|석유|가스/.test(text)) return "energy";
  if (/auto|자동차|battery|전지/.test(text)) return "growth";
  if (sector === "Consumer Staples" || sector === "Utilities") return "defensive";
  if (sector === "Real Estate") return "real-estate";
  return sector.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "market";
}

function volatilityFor(assetType: Security["assetType"], sector: string, exchange: string) {
  if (assetType === "etf") return 22;
  if (assetType === "reit") return 28;
  const base: Record<string, number> = {
    Technology: 38,
    "Health Care": 36,
    Financials: 28,
    "Consumer Discretionary": 32,
    "Consumer Staples": 20,
    Industrials: 29,
    Materials: 32,
    Energy: 35,
    "Communication Services": 31,
    "Real Estate": 28,
    Utilities: 18,
  };
  return (base[sector] ?? 32) + (exchange === "KOSPI" ? 2 : 0);
}

function betaFor(assetType: Security["assetType"], sector: string) {
  if (assetType === "etf") return 1;
  if (assetType === "reit") return 0.9;
  const base: Record<string, number> = {
    Technology: 1.25,
    "Health Care": 0.95,
    Financials: 1.1,
    "Consumer Discretionary": 1.15,
    "Consumer Staples": 0.65,
    Industrials: 1.05,
    Materials: 1.1,
    Energy: 1.15,
    "Communication Services": 1.05,
    "Real Estate": 0.9,
    Utilities: 0.55,
  };
  return base[sector] ?? 1.05;
}

function stressFor(assetType: Security["assetType"], sector: string): StressProfile {
  if (assetType === "etf") return { techSelloff: -18, rateShock: -7, recession: -20, dollarDrop: -2 };
  if (assetType === "reit") return { techSelloff: -12, rateShock: -14, recession: -22, dollarDrop: -2 };
  const base: Record<string, StressProfile> = {
    Technology: { techSelloff: -28, rateShock: -12, recession: -24, dollarDrop: -3 },
    "Health Care": { techSelloff: -14, rateShock: -8, recession: -18, dollarDrop: -1 },
    Financials: { techSelloff: -12, rateShock: -10, recession: -28, dollarDrop: -2 },
    "Consumer Discretionary": { techSelloff: -18, rateShock: -10, recession: -27, dollarDrop: -2 },
    "Consumer Staples": { techSelloff: -8, rateShock: -4, recession: -10, dollarDrop: -2 },
    Industrials: { techSelloff: -14, rateShock: -8, recession: -23, dollarDrop: -2 },
    Materials: { techSelloff: -13, rateShock: -7, recession: -25, dollarDrop: 1 },
    Energy: { techSelloff: -10, rateShock: -7, recession: -24, dollarDrop: 2 },
    "Communication Services": { techSelloff: -20, rateShock: -9, recession: -20, dollarDrop: -2 },
    "Real Estate": { techSelloff: -12, rateShock: -14, recession: -22, dollarDrop: -2 },
    Utilities: { techSelloff: -6, rateShock: -9, recession: -8, dollarDrop: -1 },
  };
  return base[sector] ?? { techSelloff: -16, rateShock: -9, recession: -22, dollarDrop: -2 };
}

function isBroadMarketName(name: string) {
  return /S&P 500|Total Market|Total Stock|Russell|Nasdaq|Dow Jones|MSCI|Index/i.test(name);
}
