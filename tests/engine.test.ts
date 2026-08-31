import assert from "node:assert/strict";
import test from "node:test";
import { analyzePortfolioText } from "../lib/analytics/analyzePortfolio.ts";
import { generateBadges } from "../lib/personality/generateBadges.ts";
import { generateCharacter } from "../lib/personality/generateCharacter.ts";
import { ScreenshotPortfolioImporter } from "../lib/importers/ScreenshotPortfolioImporter.ts";
import { calculatePositionWeights } from "../lib/screenshot/calculateWeights.ts";
import { validateRawExtraction } from "../lib/screenshot/validateExtraction.ts";
import { candidatesToManualInput, parseCaptureText } from "../lib/portfolio/captureImport.ts";
import { MockScreenshotExtractionProvider } from "../providers/screenshot/MockScreenshotExtractionProvider.ts";
import { aliases } from "../data/aliases.ts";
import { badgeDefinitions } from "../data/badgeDefinitions.ts";
import { archetypeDefinitions, riskModifierPools } from "../data/characterDefinitions.ts";
import { memeProfiles } from "../data/memeProfiles.ts";
import { securityMaster } from "../data/securityMaster.ts";

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

test("release copy avoids unclear or unsafe meme wording", () => {
  const copy = JSON.stringify({
    archetypeDefinitions,
    badgeDefinitions,
    memeProfiles,
    riskModifierPools,
  });
  const forbidden = [
    "서버 냄새",
    "데이터센터 냄새",
    "한강뷰 아니면 한강",
    "패자의 변명",
    "목숨 두 개인",
    "칼 한센의 아들",
    "Server-scented",
    "Smells like servers",
    "Penthouse or pavement",
    "Two-lives",
  ];

  for (const phrase of forbidden) {
    assert.equal(copy.includes(phrase), false, `${phrase} should not ship in public copy`);
  }
});

test("supported security dataset is internally consistent", () => {
  const requiredTickers = ["AAPL", "MSFT", "NVDA", "TSLA", "MRNA", "ABCL", "XE", "LAES", "RKLB", "LPTH", "WMT", "SCHD", "JEPQ", "QQQ", "SPY", "BRK.B", "005930", "000660", "005380", "207940"];
  assert.ok(Object.keys(securityMaster).length >= 40);

  for (const [alias, ticker] of Object.entries(aliases)) {
    assert.ok(securityMaster[ticker], `${alias} points to missing ticker ${ticker}`);
  }

  for (const ticker of requiredTickers) {
    assert.ok(securityMaster[ticker], `${ticker} should be in the release dataset`);
  }

  for (const [ticker, security] of Object.entries(securityMaster)) {
    assert.ok(security.assetLabel, `${ticker} is missing assetLabel`);
    assert.ok(security.sector, `${ticker} is missing sector`);
    assert.ok(security.region, `${ticker} is missing region`);
    assert.ok(Number.isFinite(security.expectedVolatility), `${ticker} is missing expectedVolatility`);
    assert.ok(Number.isFinite(security.beta), `${ticker} is missing beta`);
    assert.ok(security.stress, `${ticker} is missing stress profile`);
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

test("capture parser connects separated name and percent lines", () => {
  const rows = parseCaptureText("앱셀레라 바이오로직스\n8,937,917원 78.8%\n엑스에너지\n1,254,233원 11.0%\n로켓 랩\n959,526원 8.4%\n라이트패스 테크놀로지\n186,370원 1.6%");
  assert.deepEqual(rows.map((row) => row.name), ["앱셀레라 바이오로직스", "엑스에너지", "로켓 랩", "라이트패스 테크놀로지"]);
  assert.deepEqual(rows.map((row) => row.weight), [78.8, 11, 8.4, 1.6]);
});

test("uploaded screenshot names resolve to securities", () => {
  const input = candidatesToManualInput(parseCaptureText("앱셀레라 바이오로직스 78.8%\n엑스에너지 11.0%\n로켓 랩 8.4%\n라이트패스 테크놀로지 1.6%"));
  const { analysis } = summarize(input);
  assert.deepEqual(analysis.portfolio.positions.map((item) => item.ticker), ["ABCL", "XE", "RKLB", "LPTH"]);
});

test("screenshot extraction schema validation accepts valid positions", () => {
  const validated = validateRawExtraction({
    positions: [{ rawName: "AAPL", weight: 25, confidence: { overall: 0.95 }, sourceScreenshotIds: ["s1"] }],
    confidence: 0.92,
  });
  assert.equal(validated.positions.length, 1);
  assert.equal(validated.warnings?.length, 0);
});

test("screenshot weights can be derived from market values", () => {
  const result = calculatePositionWeights([
    { rawName: "AAPL", marketValue: 5000, confidence: { overall: 0.9, marketValue: 0.9 }, sourceScreenshotIds: ["s1"] },
    { rawName: "NVDA", marketValue: 3000, confidence: { overall: 0.9, marketValue: 0.9 }, sourceScreenshotIds: ["s1"] },
    { rawName: "ABCL", marketValue: 2000, confidence: { overall: 0.9, marketValue: 0.9 }, sourceScreenshotIds: ["s1"] },
  ]);
  assert.deepEqual(result.positions.map((item) => Number(item.weight?.toFixed(1))), [50, 30, 20]);
});

test("screenshot importer normalizes rounded weights", async () => {
  const importer = new ScreenshotPortfolioImporter(
    new MockScreenshotExtractionProvider({
      s1: {
        positions: ["AAPL", "NVDA", "ABCL"].map((name) => ({ rawName: name, weight: 33.3, confidence: { overall: 0.95, weight: 0.95 }, sourceScreenshotIds: ["s1"] })),
        confidence: 0.95,
      },
    }),
  );
  const result = await importer.import({ screenshots: [{ id: "s1", text: "AAPL 33.3 NVDA 33.3 ABCL 33.3" }] });
  const total = result.portfolioCandidate.positions.reduce((sum, item) => sum + item.weight, 0);
  assert.ok(Math.abs(total - 100) < 1e-9);
});

test("capture parser does not treat return percent as allocation", () => {
  const rows = parseCaptureText("AAPL\n수익률 +18.4%\nNVDA 3,000,000원\nABCL 2,000,000원");
  assert.equal(rows.some((row) => row.name === "AAPL" && row.weight === 18.4), false);
  assert.deepEqual(rows.map((row) => row.name), ["NVDA", "ABCL"]);
});

test("duplicate screenshots are not blindly doubled", async () => {
  const importer = new ScreenshotPortfolioImporter(
    new MockScreenshotExtractionProvider({
      s1: { positions: [{ rawName: "AAPL", weight: 50, confidence: { overall: 0.95, weight: 0.95 }, sourceScreenshotIds: ["s1"] }], confidence: 0.95 },
      s2: {
        positions: [
          { rawName: "AAPL", weight: 50, confidence: { overall: 0.95, weight: 0.95 }, sourceScreenshotIds: ["s2"] },
          { rawName: "NVDA", weight: 50, confidence: { overall: 0.95, weight: 0.95 }, sourceScreenshotIds: ["s2"] },
        ],
        confidence: 0.95,
      },
    }),
  );
  const result = await importer.import({ screenshots: [{ id: "s1" }, { id: "s2" }] });
  assert.deepEqual(result.portfolioCandidate.positions.map((item) => item.ticker), ["AAPL", "NVDA"]);
  assert.equal(result.warnings.some((item) => item.code === "DUPLICATE_POSITION"), true);
});

test("unknown security does not crash screenshot import", async () => {
  const importer = new ScreenshotPortfolioImporter(
    new MockScreenshotExtractionProvider({
      s1: { positions: [{ rawName: "UNKNOWNXYZ", weight: 100, confidence: { overall: 0.7, weight: 0.8 }, sourceScreenshotIds: ["s1"] }], confidence: 0.7 },
    }),
  );
  const result = await importer.import({ screenshots: [{ id: "s1" }] });
  assert.equal(result.portfolioCandidate.positions[0].ticker, "UNKNOWNXYZ");
  assert.equal(result.warnings.some((item) => item.code === "UNKNOWN_SECURITY"), true);
});

test("user correction replaces OCR candidate before analysis", async () => {
  const importer = new ScreenshotPortfolioImporter();
  const result = await importer.import({
    screenshots: [{ id: "review" }],
    correctedPositions: [{ rawName: "AVGO", weight: 100, confidence: { overall: 1, weight: 1 }, sourceScreenshotIds: ["review"] }],
  });
  assert.equal(result.portfolioCandidate.positions[0].ticker, "AVGO");
});

test("multi-image screenshot import combines positions into one portfolio", async () => {
  const importer = new ScreenshotPortfolioImporter(
    new MockScreenshotExtractionProvider({
      s1: { positions: [{ rawName: "AAPL", weight: 60, confidence: { overall: 0.95, weight: 0.95 }, sourceScreenshotIds: ["s1"] }], confidence: 0.95 },
      s2: { positions: [{ rawName: "TLT", weight: 40, confidence: { overall: 0.95, weight: 0.95 }, sourceScreenshotIds: ["s2"] }], confidence: 0.95 },
    }),
  );
  const result = await importer.import({ screenshots: [{ id: "s1" }, { id: "s2" }] });
  assert.deepEqual(result.portfolioCandidate.positions.map((item) => item.ticker), ["AAPL", "TLT"]);
});

test("portfolio total warning appears for incomplete detected allocation", async () => {
  const importer = new ScreenshotPortfolioImporter(
    new MockScreenshotExtractionProvider({
      s1: { positions: [{ rawName: "AAPL", weight: 78, confidence: { overall: 0.95, weight: 0.95 }, sourceScreenshotIds: ["s1"] }], confidence: 0.95 },
    }),
  );
  const result = await importer.import({ screenshots: [{ id: "s1" }] });
  assert.equal(result.warnings.some((item) => item.code === "PORTFOLIO_TOTAL_TOO_LOW"), true);
});

test("screenshot importer is deterministic for the same extraction payload", async () => {
  const provider = new MockScreenshotExtractionProvider({
    s1: {
      positions: [
        { rawName: "QQQ", weight: 70, confidence: { overall: 0.95, weight: 0.95 }, sourceScreenshotIds: ["s1"] },
        { rawName: "SCHD", weight: 30, confidence: { overall: 0.95, weight: 0.95 }, sourceScreenshotIds: ["s1"] },
      ],
      confidence: 0.95,
    },
  });
  const importer = new ScreenshotPortfolioImporter(provider);
  const a = await importer.import({ screenshots: [{ id: "s1" }] });
  const b = await importer.import({ screenshots: [{ id: "s1" }] });
  const serialize = (result: typeof a) => result.portfolioCandidate.positions.map((item) => `${item.ticker}:${item.weight.toFixed(4)}`);
  assert.deepEqual(serialize(a), serialize(b));
});

test("v1 personality fixtures produce diverse and relevant results", () => {
  const fixtures = [
    "AAPL 100",
    "VOO 45\nSCHD 25\nBND 20\nGLD 10",
    "NVDA 35\nAMD 20\nTSM 15\nQQQ 30",
    "ABCL 70\nMRNA 20\nCASH 10",
    "TQQQ 60\nQQQ 25\nCASH 15",
    "CASH 40\nTLT 35\nBND 25",
    "AAPL 5\nMSFT 5\nNVDA 5\nAMZN 5\nGOOGL 5\nMETA 5\nTSLA 5\nMRNA 5\nABCL 5\nPLTR 5\nMU 5\nAMD 5\nAVGO 5\nTSM 5\nSNDK 5\nWMT 5\nSPY 5\nQQQ 5\nTLT 5\nGLD 5",
    "AAPL 25\nMSFT 25\nNVDA 25\nGOOGL 25",
    "RKLB 40\nSPACEX 30\nSATL 20\nCASH 10",
    "QQQ 35\nSCHD 25\n삼성전자 20\n하이닉스 10\nGLD 10",
    "ABCL 85\nCASH 15",
    "NVDA 85\nCASH 15",
  ];

  const summaries = fixtures.map((input) => summarize(input));
  const names = new Set(summaries.map((item) => item.character.name));
  const quotes = new Set(summaries.map((item) => item.character.quote));
  const badgeTitles = new Set(summaries.flatMap((item) => item.badges.map((badge) => badge.title)));

  assert.ok(names.size >= 8);
  assert.ok(quotes.size >= 8);
  assert.ok(badgeTitles.size >= 14);
  assert.ok(summaries[1].badges.length <= 2);
  assert.ok(summaries[4].badges.length === 3);
  assert.notEqual(summaries[10].character.quote, summaries[11].character.quote);
});
