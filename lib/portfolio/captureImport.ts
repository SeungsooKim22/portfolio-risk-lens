import type { ScreenshotImportWarningCode } from "../../types/screenshotImport.ts";

export type CaptureCandidate = {
  name: string;
  weight: number;
  marketValue?: number;
  currency?: string;
  source: "percent" | "amount";
  confidence: "high" | "medium" | "low";
  warnings?: ScreenshotImportWarningCode[];
  sourceScreenshotIds?: string[];
};

const ignorePatterns = [
  /총\s*자산|총\s*평가|합계|계좌|예수금|주문|매수|매도|평가손익|수익률|평균단가|현재가|보유수량|잔고|원화|외화|추정/i,
  /portfolio|account|cash|total|profit|loss|return|quantity|average|price|balance/i,
];

export function parseCaptureText(text: string): CaptureCandidate[] {
  const lines = text
    .split(/\r?\n/)
    .map(cleanLine)
    .filter((line) => line.length >= 3 && !ignorePatterns.some((pattern) => pattern.test(line)));

  const percentRows = lines.flatMap((line, index) => parsePercentLine(line, lines, index));
  const amountRows = lines.flatMap((line, index) => parseAmountLine(line, lines, index));

  if (percentRows.length > 0 && amountRows.length <= percentRows.length) return combineRows(percentRows);

  const totalAmount = amountRows.reduce((sum, row) => sum + row.amount, 0);
  if (totalAmount <= 0) return combineRows(percentRows);

  return combineRows(
    amountRows.map((row) => ({
      name: row.name,
      weight: (row.amount / totalAmount) * 100,
      marketValue: row.amount,
      currency: row.currency,
      source: "amount",
      confidence: "medium",
    })),
  );
}

export function candidatesToManualInput(rows: CaptureCandidate[]) {
  return rows
    .filter((row) => row.name.trim() && Number.isFinite(row.weight) && row.weight > 0)
    .map((row) => `${row.name.trim()} ${roundWeight(row.weight)}%`)
    .join("\n");
}

function parsePercentLine(line: string, lines: string[], index: number): CaptureCandidate[] {
  const matches = [...line.matchAll(/(-?\d+(?:[.,]\d+)?)\s*%/g)];
  if (matches.length === 0 || looksLikePerformanceLine(line)) return [];

  const match = matches[matches.length - 1];
  const weight = Number.parseFloat(match[1].replace(",", "."));
  if (!Number.isFinite(weight) || weight <= 0 || weight > 100) return [];

  const name = bestName(line.slice(0, match.index ?? 0), lines, index);
  if (!name) return [];

  return [{ name, weight, source: "percent", confidence: "high" }];
}

function parseAmountLine(line: string, lines: string[], index: number): { name: string; amount: number; currency?: string }[] {
  const matches = [...line.matchAll(/(₩|\$)?\s*(\d[\d,]{3,})(?:\.\d+)?\s*(원|KRW|USD|달러)?/gi)];
  if (matches.length === 0) return [];

  const parsed = matches
    .map((match) => ({
      amount: Number.parseFloat(match[2].replace(/,/g, "")),
      currency: detectCurrency(match[1], match[3]),
    }))
    .filter((value) => Number.isFinite(value.amount) && value.amount > 0);
  const amounts = parsed.map((item) => item.amount);
  if (amounts.length === 0) return [];

  const firstNumberIndex = matches[0].index ?? line.length;
  const name = bestName(line.slice(0, firstNumberIndex), lines, index);
  if (!name) return [];

  const largest = parsed.sort((a, b) => b.amount - a.amount)[0];
  return [{ name, amount: largest.amount, currency: largest.currency }];
}

function cleanLine(line: string) {
  return line
    .replace(/[|]/g, " ")
    .replace(/[·•]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractName(value: string) {
  const cleaned = value
    .replace(/\([^)]*\)/g, " ")
    .replace(/(?:₩|\$)?\s*\d[\d,]*(?:\.\d+)?\s*(?:원|KRW|USD|달러)?/gi, " ")
    .replace(/\d+(?:[.,]\d+)?\s*%/g, " ")
    .replace(/보통주|우선주|ETF|ETN|주식회사|주식|종목명|종목|국내|해외/gi, " ")
    .replace(/[^A-Za-z0-9가-힣.&\-\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || /^\d+$/.test(cleaned) || cleaned.length < 2) return "";
  return cleaned;
}

function bestName(prefix: string, lines: string[], index: number) {
  const direct = extractName(prefix);
  if (isUsableName(direct)) return direct;

  for (let offset = 1; offset <= 3; offset += 1) {
    const previous = lines[index - offset];
    if (!previous || /%/.test(previous) || looksLikePerformanceLine(previous)) continue;
    const candidate = extractName(previous);
    if (isUsableName(candidate)) return candidate;
  }

  return direct;
}

function isUsableName(name: string) {
  if (!name) return false;
  if (!/[A-Za-z가-힣]/.test(name)) return false;
  if (/^[\d\s,.$₩원KRWUSD달러]+$/i.test(name)) return false;
  return true;
}

function looksLikePerformanceLine(line: string) {
  return /수익률|손익률|등락률|profit|loss|return|change/i.test(line);
}

function combineRows(rows: CaptureCandidate[]) {
  const byName = new Map<string, CaptureCandidate>();
  rows.forEach((row) => {
    const key = row.name.toLowerCase().replace(/\s+/g, "");
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, row);
      return;
    }
    const sameWeight = Math.abs(existing.weight - row.weight) <= 0.15;
    const sameValue =
      existing.marketValue !== undefined &&
      row.marketValue !== undefined &&
      Math.abs(existing.marketValue - row.marketValue) <= Math.max(1, existing.marketValue * 0.001);
    const preferred = confidenceRank(row.confidence) > confidenceRank(existing.confidence) ? row : existing;
    byName.set(key, {
      ...preferred,
      warnings: [...new Set([...(existing.warnings ?? []), ...(row.warnings ?? []), "DUPLICATE_POSITION", ...(sameWeight || sameValue ? [] : ["NEEDS_USER_REVIEW"])])],
      sourceScreenshotIds: [...new Set([...(existing.sourceScreenshotIds ?? []), ...(row.sourceScreenshotIds ?? [])])],
      confidence: sameWeight || sameValue ? "medium" : "low",
    });
  });
  return [...byName.values()].sort((a, b) => b.weight - a.weight);
}

function detectCurrency(prefix?: string, suffix?: string) {
  const value = `${prefix ?? ""}${suffix ?? ""}`.toUpperCase();
  if (value.includes("$") || value.includes("USD") || value.includes("달러")) return "USD";
  if (value.includes("₩") || value.includes("KRW") || value.includes("원")) return "KRW";
  return undefined;
}

function confidenceRank(value: CaptureCandidate["confidence"]) {
  if (value === "high") return 3;
  if (value === "medium") return 2;
  return 1;
}

function roundWeight(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}
