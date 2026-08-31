import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const sourceDir = path.join(os.tmpdir(), "portfolio-risk-data-check");
const screenerPath = path.join(sourceDir, "nasdaqScreener.json");
const nasdaqListedPath = path.join(sourceDir, "nasdaqListed.dat");
const otherListedPath = path.join(sourceDir, "otherListed.dat");
const kindKoreaPath = path.join(sourceDir, "kindKorea.dat");

const exchangeCodeMap = {
  A: "NYSEAMERICAN",
  N: "NYSE",
  P: "NYSEARCA",
  V: "IEXG",
  Z: "BATS",
};

const exchangeMap = new Map();

for (const line of fs.readFileSync(nasdaqListedPath, "utf8").split(/\r?\n/).slice(1)) {
  const parts = line.split("|");
  if (parts.length >= 7 && parts[0] && parts[3] === "N") {
    exchangeMap.set(parts[0].trim().toUpperCase(), "NASDAQ");
  }
}

for (const line of fs.readFileSync(otherListedPath, "utf8").split(/\r?\n/).slice(1)) {
  const parts = line.split("|");
  if (parts.length >= 7 && parts[0] && parts[6] === "N") {
    exchangeMap.set(parts[0].trim().toUpperCase(), exchangeCodeMap[parts[2].trim()] ?? parts[2].trim());
  }
}

const screener = JSON.parse(fs.readFileSync(screenerPath, "utf8"));
const rows = [];
const seen = new Set();

for (const row of screener.data.rows) {
  const rawSymbol = String(row.symbol ?? "");
  const rawName = String(row.name ?? "");
  if (!rawSymbol || !rawName) continue;

  const ticker = rawSymbol.trim().toUpperCase().replace(/\^/g, ".");
  if (!/^[A-Z][A-Z0-9.]{0,7}$/.test(ticker)) continue;
  if (/Warrant|Right|Unit|Preferred|Depositary Share|Notes due|Debenture|Acquisition Corp/i.test(rawName)) continue;

  const exchange = exchangeMap.get(ticker);
  if (!exchange || seen.has(ticker)) continue;

  seen.add(ticker);
  rows.push({
    ticker,
    name: cleanUsName(rawName),
    exchange,
    sector: mapUsSector(String(row.sector ?? "")),
    industry: String(row.industry ?? "").trim(),
    country: String(row.country ?? "").trim() || "United States",
    assetType: /ETF|Fund|Trust|ETN/i.test(rawName) ? "etf" : /REIT|Realty Trust/i.test(rawName) ? "reit" : "equity",
  });
}

const decoder = new TextDecoder("euc-kr");
const kind = decoder.decode(fs.readFileSync(kindKoreaPath));
for (const rowHtml of kind.matchAll(/<tr[^>]*>(.*?)<\/tr>/gis)) {
  const cells = [...rowHtml[1].matchAll(/<td[^>]*>(.*?)<\/td>/gis)].map((match) => stripHtml(match[1]));
  if (cells.length < 4) continue;

  const [name, market, code, industry] = cells;
  if (market !== "유가" || !/^\d{6}$/.test(code) || seen.has(code)) continue;

  seen.add(code);
  rows.push({
    ticker: code,
    name,
    exchange: "KOSPI",
    sector: mapKoreaSector(industry),
    industry,
    country: "South Korea",
    assetType: "equity",
  });
}

rows.sort((a, b) => a.exchange.localeCompare(b.exchange) || a.ticker.localeCompare(b.ticker));

const lines = [
  "export type GeneratedSecuritySeed = readonly [ticker: string, name: string, exchange: string, sector: string, industry: string, country: string, assetType: string];",
  "",
  "// Generated from free public symbol sources for broad name resolution.",
  "// Directly curated records in securityMaster.ts override these estimates.",
  "export const generatedSecurityUniverse = [",
  ...rows.map((row) => `  [${[row.ticker, row.name, row.exchange, row.sector, row.industry, row.country, row.assetType].map(toTsString).join(", ")}],`),
  "] as const satisfies readonly GeneratedSecuritySeed[];",
  "",
];

fs.writeFileSync(path.join("data", "generatedSecurityUniverse.ts"), lines.join("\n"), "utf8");
console.log(`generated ${rows.length} records`);
console.log([...Map.groupBy(rows, (row) => row.exchange)].map(([exchange, items]) => `${exchange}:${items.length}`).join(", "));

function cleanUsName(name) {
  return name
    .replace(/\s+/g, " ")
    .replace(/,?\s*(Inc\.|Corporation|Corp\.|Company|Co\.|Ltd\.|Limited|PLC|N\.V\.|S\.A\.)\s*$/i, "")
    .replace(/\s+(Class [A-Z] )?(Common Stock|Ordinary Shares|Common Shares|American Depositary Shares.*|ADS.*)$/i, "")
    .replace(/[,. ]+$/g, "")
    .trim();
}

function mapUsSector(sector) {
  const value = sector.trim();
  if (value === "Finance") return "Financials";
  if (value === "Telecommunications") return "Communication Services";
  if (value === "Basic Materials" || value === "Basic Industries") return "Materials";
  return value || "Unknown";
}

function mapKoreaSector(industry) {
  if (/은행|보험|금융|신탁|투자|증권|카드|저축/.test(industry)) return "Financials";
  if (/반도체|소프트웨어|컴퓨터|전자|통신|인터넷|정보|데이터|시스템|전기/.test(industry)) return "Technology";
  if (/자동차|의복|호텔|레저|유통|소매|화장품|게임|엔터|여행/.test(industry)) return "Consumer Discretionary";
  if (/식품|음료|담배|생활용품/.test(industry)) return "Consumer Staples";
  if (/의약|바이오|의료|제약|생명공학/.test(industry)) return "Health Care";
  if (/화학|철강|금속|종이|목재|시멘트|비금속|소재/.test(industry)) return "Materials";
  if (/석유|가스|전력|에너지/.test(industry)) return "Energy";
  if (/부동산|리츠/.test(industry)) return "Real Estate";
  return "Industrials";
}

function stripHtml(value) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toTsString(value) {
  return JSON.stringify(String(value ?? ""));
}
