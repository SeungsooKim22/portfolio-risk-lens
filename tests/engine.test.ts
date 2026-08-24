import assert from "node:assert/strict";
import test from "node:test";
import { analyzePortfolioText } from "../lib/analytics/analyzePortfolio.ts";
import { generateBadges } from "../lib/personality/generateBadges.ts";
import { generateCharacter } from "../lib/personality/generateCharacter.ts";
import { candidatesToManualInput, parseCaptureText } from "../lib/portfolio/captureImport.ts";

function summarize(input: string) {
  const analysis = analyzePortfolioText(input);
  const character = generateCharacter(analysis.portfolio.positions, analysis.features, analysis.risk, "ko");
  const badges = generateBadges(analysis.portfolio.positions, analysis.features, analysis.risk, "ko");
  return { analysis, character, badges };
}

test("normalization is invariant to scale and order", () => {
  const a = summarize("AAPL 50\nMSFT 30\nNVDA 20").analysis.portfolio.positions;
  const b = summarize("AAPL 0.5\nMSFT 0.3\nNVDA 0.2").analysis.portfolio.positions;
  const c = summarize("NVDA 20\nAAPL 50\nMSFT 30").analysis.portfolio.positions;
  const key = (positions: typeof a) => [...positions].sort((x, y) => x.ticker.localeCompare(y.ticker)).map((item) => `${item.ticker}:${item.weight.toFixed(4)}`);
  assert.deepEqual(key(a), key(b));
  assert.deepEqual(key(a), key(c));
});

test("HHI concentration distinguishes single stock from equal weights", () => {
  const single = summarize("AAPL 100").analysis.features;
  const equal = summarize("AAPL 25\nMSFT 25\nGOOGL 25\nAMZN 25").analysis.features;
  assert.equal(single.concentration, 100);
  assert.ok(equal.concentration < single.concentration);
});

test("sector concentration can be high even when position concentration is low", () => {
  const features = summarize("AAPL 25\nMSFT 25\nNVDA 25\nAMZN 25").analysis.features;
  assert.ok(features.concentration < 5);
  assert.ok(features.sectorConcentration > 50);
});

test("character and badges are deterministic under order changes", () => {
  const a = summarize("SK하이닉스 40\n삼성전자 30\nABCL 30");
  const b = summarize("ABCL 30\n삼성전자 30\nSK하이닉스 40");
  assert.equal(a.character.name, b.character.name);
  assert.deepEqual(a.badges.map((badge) => badge.title), b.badges.map((badge) => badge.title));
});

test("badge families are deduped and max three", () => {
  const { badges } = summarize("AAPL 80\nGLD 20");
  assert.ok(badges.length <= 3);
  assert.equal(new Set(badges.map((badge) => badge.family)).size, badges.length);
});

test("company badge threshold does not fire for ordinary 25 percent holding", () => {
  const low = summarize("AAPL 25\nMSFT 25\nNVDA 25\nGLD 25").badges;
  const high = summarize("AAPL 50\nMSFT 25\nGLD 25").badges;
  assert.equal(low.some((badge) => badge.family === "company"), false);
  assert.equal(high.some((badge) => badge.family === "company"), true);
});

test("unknown tickers do not crash and known assets still contribute", () => {
  const { analysis } = summarize("UNKNOWNXYZ 50\nAAPL 50");
  assert.ok(analysis.portfolio.unknownWeight > 0);
  assert.ok(Number.isFinite(analysis.risk.score));
});

test("risk contributions sum to total score", () => {
  const { analysis } = summarize("TQQQ 50\nQQQ 50");
  const sum = analysis.risk.breakdown.reduce((total, item) => total + item.contribution, 0);
  assert.ok(Math.abs(sum - analysis.risk.score) < 1e-9);
});

test("leverage is riskier than equivalent non-leveraged ETF", () => {
  const leveraged = summarize("TQQQ 50\nCASH 50").analysis.risk.score;
  const regular = summarize("QQQ 50\nCASH 50").analysis.risk.score;
  assert.ok(leveraged > regular);
});

test("scores stay bounded", () => {
  for (const input of ["AAPL 100", "TQQQ 90\nBTC 10", "GLD 40\nTLT 40\nCASH 20", "실sq 10\nXE 10\n모더나 20\n현대차 10\nspaceX 20\n테슬라 10\nSATL 20"]) {
    const { analysis, badges } = summarize(input);
    assert.ok(analysis.risk.score >= 0 && analysis.risk.score <= 100);
    assert.ok(badges.length <= 3);
    for (const value of Object.values(analysis.risk.components)) {
      assert.ok(value >= 0 && value <= 100);
    }
  }
});

test("ETF-heavy user portfolio resolves WMT SCHD JEPQ and avoids single-stock treatment", () => {
  const input = "QQQ 48\nSPYM 19.7\n삼성전자 17.6\n하이닉스 11.4\nWMT 1.9\nSCHD 0.6\nJEPQ 0.5";
  const { analysis } = summarize(input);
  assert.equal(analysis.portfolio.unknownWeight, 0);
  assert.ok(analysis.portfolio.positions.some((item) => item.ticker === "WMT"));
  assert.ok(analysis.portfolio.positions.some((item) => item.ticker === "SCHD"));
  assert.ok(analysis.portfolio.positions.some((item) => item.ticker === "JEPQ"));
  assert.ok(analysis.features.concentration < 15);
  assert.ok(analysis.risk.score < 45);
});

test("capture parser extracts percent rows from brokerage-like text", () => {
  const rows = parseCaptureText("QQQ 48%\nSPYM 19.7%\n삼성전자 17.6%\n하이닉스 11.4%\n수익률 3.2%");
  assert.deepEqual(rows.map((row) => row.name), ["QQQ", "SPYM", "삼성전자", "하이닉스"]);
  assert.deepEqual(rows.map((row) => row.weight), [48, 19.7, 17.6, 11.4]);
});

test("capture parser can derive weights from amounts", () => {
  const rows = parseCaptureText("QQQ 4,800,000원\n삼성전자 1,700,000원\n현금 500,000원");
  const input = candidatesToManualInput(rows);
  assert.match(input, /QQQ 68\.57%/);
  assert.match(input, /삼성전자 24\.29%/);
});
