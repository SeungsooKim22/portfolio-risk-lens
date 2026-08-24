export type CaptureCandidate = {
  name: string;
  weight: number;
  source: "percent" | "amount";
  confidence: "high" | "medium" | "low";
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

  const percentRows = lines.flatMap(parsePercentLine);
  if (percentRows.length > 0) return combineRows(percentRows);

  const amountRows = lines.flatMap(parseAmountLine);
  const totalAmount = amountRows.reduce((sum, row) => sum + row.amount, 0);
  if (totalAmount <= 0) return [];

  return combineRows(
    amountRows.map((row) => ({
      name: row.name,
      weight: (row.amount / totalAmount) * 100,
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

function parsePercentLine(line: string): CaptureCandidate[] {
  const matches = [...line.matchAll(/(-?\d+(?:[.,]\d+)?)\s*%/g)];
  if (matches.length === 0 || looksLikePerformanceLine(line)) return [];

  const match = matches[matches.length - 1];
  const weight = Number.parseFloat(match[1].replace(",", "."));
  if (!Number.isFinite(weight) || weight <= 0 || weight > 100) return [];

  const name = extractName(line.slice(0, match.index ?? 0));
  if (!name) return [];

  return [{ name, weight, source: "percent", confidence: "high" }];
}

function parseAmountLine(line: string): { name: string; amount: number }[] {
  const matches = [...line.matchAll(/(?:₩|\$)?\s*(\d[\d,]{3,})(?:\.\d+)?\s*(?:원|KRW|USD|달러)?/gi)];
  if (matches.length === 0) return [];

  const amounts = matches
    .map((match) => Number.parseFloat(match[1].replace(/,/g, "")))
    .filter((value) => Number.isFinite(value) && value > 0);
  if (amounts.length === 0) return [];

  const firstNumberIndex = matches[0].index ?? line.length;
  const name = extractName(line.slice(0, firstNumberIndex));
  if (!name) return [];

  return [{ name, amount: Math.max(...amounts) }];
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
    .replace(/보통주|우선주|ETF|ETN|주식회사|주식|종목명|종목|국내|해외/gi, " ")
    .replace(/[^A-Za-z0-9가-힣.&\-\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || /^\d+$/.test(cleaned) || cleaned.length < 2) return "";
  return cleaned;
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
    existing.weight += row.weight;
    existing.confidence = existing.confidence === "high" && row.confidence === "high" ? "high" : "medium";
  });
  return [...byName.values()].sort((a, b) => b.weight - a.weight);
}

function roundWeight(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}
