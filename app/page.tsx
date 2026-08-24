"use client";

import { useMemo, useState } from "react";
import { determinePortfolioBadges, determineRiskCharacter } from "./lib/characterEngine";

type Lang = "ko" | "en";

type Holding = {
  ticker: string;
  displayName: string;
  weight: number;
  name: string;
  asset: string;
  sector: string;
  region: string;
  volatility: number;
  stress: {
    techSelloff: number;
    rateShock: number;
    recession: number;
    dollarDrop: number;
  };
};

const labels = {
  ko: {
    brand: "포트폴리오 리스크 렌즈",
    headline: "내 포트폴리오 성향을 한 장으로 보여주세요.",
    subhead: "종목과 비중을 넣으면 집중도, 섹터 쏠림, 위기 시나리오를 보기 쉬운 공유 카드와 상세 분석으로 정리합니다.",
    input: "포트폴리오 입력",
    sample: "샘플 불러오기",
    save: "이미지 저장",
    share: "바로 공유",
    story: "내 포트폴리오 성향",
    investorType: "당신의 투자자 유형은",
    earnedBadges: "획득한 칭호",
    score: "리스크 점수",
    style: "투자 성향",
    mainRisk: "가장 눈에 띄는 위험",
    top3: "상위 3종목 비중",
    largest: "가장 큰 비중",
    vol: "변동성",
    assets: "자산 구성",
    sectors: "섹터 노출",
    regions: "국내/해외 분산",
    scenarios: "하락장 시뮬레이션",
    readout: "간단한 분석",
    feedback: "리스크 줄이는 힌트",
    details: "상세 분석",
    notice: "",
    placeholder: "예: AAPL 25%",
    unmatched: "아직 모르는 종목은 임시값으로 계산해요. 종목 데이터가 늘어날수록 더 정확해집니다.",
    noShare: "이 브라우저에서는 이미지 저장으로 공유해주세요.",
  },
  en: {
    brand: "Portfolio Risk Lens",
    headline: "Turn your allocation into a shareable risk snapshot.",
    subhead: "Enter tickers and weights to see concentration, exposures, stress scenarios, and a clean visual card.",
    input: "Portfolio input",
    sample: "Load sample",
    save: "Save image",
    share: "Share",
    story: "Portfolio persona",
    investorType: "Your investor type",
    earnedBadges: "Badges earned",
    score: "Risk score",
    style: "Investor style",
    mainRisk: "Main risk",
    top3: "Top 3 concentration",
    largest: "Largest holding",
    vol: "Estimated volatility",
    assets: "Asset mix",
    sectors: "Sector exposure",
    regions: "Regional exposure",
    scenarios: "Downside simulator",
    readout: "Quick read",
    feedback: "Risk-reduction ideas",
    details: "Detailed view",
    notice: "Educational estimate only. Not financial advice.",
    placeholder: "Example: AAPL 25%",
    unmatched: "Unclassified tickers use conservative default estimates.",
    noShare: "This browser cannot share files directly. Please save the image.",
  },
};

const library: Record<string, Omit<Holding, "ticker" | "weight">> = {
  AAPL: { name: "Apple", asset: "US Equity", sector: "Technology", region: "United States", volatility: 24, stress: { techSelloff: -24, rateShock: -9, recession: -18, dollarDrop: -3 } },
  MSFT: { name: "Microsoft", asset: "US Equity", sector: "Technology", region: "United States", volatility: 22, stress: { techSelloff: -22, rateShock: -8, recession: -16, dollarDrop: -3 } },
  NVDA: { name: "NVIDIA", asset: "US Equity", sector: "Technology", region: "United States", volatility: 45, stress: { techSelloff: -35, rateShock: -14, recession: -25, dollarDrop: -4 } },
  AMZN: { name: "Amazon", asset: "US Equity", sector: "Consumer Discretionary", region: "United States", volatility: 32, stress: { techSelloff: -24, rateShock: -11, recession: -20, dollarDrop: -2 } },
  GOOGL: { name: "Alphabet", asset: "US Equity", sector: "Communication Services", region: "United States", volatility: 29, stress: { techSelloff: -24, rateShock: -9, recession: -18, dollarDrop: -3 } },
  META: { name: "Meta", asset: "US Equity", sector: "Communication Services", region: "United States", volatility: 36, stress: { techSelloff: -28, rateShock: -11, recession: -20, dollarDrop: -3 } },
  TSLA: { name: "Tesla", asset: "US Equity", sector: "Consumer Discretionary", region: "United States", volatility: 55, stress: { techSelloff: -34, rateShock: -18, recession: -28, dollarDrop: -2 } },
  SPY: { name: "S&P 500 ETF", asset: "US Equity ETF", sector: "Broad Market", region: "United States", volatility: 18, stress: { techSelloff: -17, rateShock: -7, recession: -22, dollarDrop: -2 } },
  QQQ: { name: "Nasdaq 100 ETF", asset: "US Equity ETF", sector: "Technology Tilt", region: "United States", volatility: 24, stress: { techSelloff: -26, rateShock: -10, recession: -24, dollarDrop: -2 } },
  VTI: { name: "Total US Market ETF", asset: "US Equity ETF", sector: "Broad Market", region: "United States", volatility: 18, stress: { techSelloff: -17, rateShock: -7, recession: -22, dollarDrop: -2 } },
  VXUS: { name: "International Equity ETF", asset: "Global Equity ETF", sector: "Broad Market", region: "International", volatility: 19, stress: { techSelloff: -13, rateShock: -5, recession: -20, dollarDrop: 5 } },
  TLT: { name: "20+ Year Treasury ETF", asset: "Long Bonds", sector: "Rates", region: "United States", volatility: 16, stress: { techSelloff: 5, rateShock: -16, recession: 8, dollarDrop: -1 } },
  IEF: { name: "7-10 Year Treasury ETF", asset: "Bonds", sector: "Rates", region: "United States", volatility: 9, stress: { techSelloff: 3, rateShock: -8, recession: 5, dollarDrop: -1 } },
  BND: { name: "Total Bond ETF", asset: "Bonds", sector: "Rates", region: "United States", volatility: 7, stress: { techSelloff: 2, rateShock: -5, recession: 3, dollarDrop: -1 } },
  GLD: { name: "Gold ETF", asset: "Commodity", sector: "Gold", region: "Global", volatility: 17, stress: { techSelloff: 4, rateShock: -3, recession: 7, dollarDrop: 8 } },
  BTC: { name: "Bitcoin", asset: "Crypto", sector: "Digital Assets", region: "Global", volatility: 70, stress: { techSelloff: -25, rateShock: -18, recession: -35, dollarDrop: 4 } },
  CASH: { name: "Cash", asset: "Cash", sector: "Cash", region: "Local", volatility: 1, stress: { techSelloff: 0, rateShock: 1, recession: 0, dollarDrop: -2 } },
  "005930": { name: "Samsung Electronics", asset: "Korea Equity", sector: "Technology", region: "South Korea", volatility: 28, stress: { techSelloff: -22, rateShock: -8, recession: -20, dollarDrop: 3 } },
  "000660": { name: "SK hynix", asset: "Korea Equity", sector: "Technology", region: "South Korea", volatility: 40, stress: { techSelloff: -32, rateShock: -12, recession: -26, dollarDrop: 4 } },
  "035420": { name: "NAVER", asset: "Korea Equity", sector: "Communication Services", region: "South Korea", volatility: 34, stress: { techSelloff: -24, rateShock: -10, recession: -20, dollarDrop: 2 } },
  "035720": { name: "Kakao", asset: "Korea Equity", sector: "Communication Services", region: "South Korea", volatility: 42, stress: { techSelloff: -28, rateShock: -13, recession: -25, dollarDrop: 2 } },
  "005380": { name: "Hyundai Motor", asset: "Korea Equity", sector: "Consumer Discretionary", region: "South Korea", volatility: 30, stress: { techSelloff: -14, rateShock: -8, recession: -24, dollarDrop: 3 } },
  "000270": { name: "Kia", asset: "Korea Equity", sector: "Consumer Discretionary", region: "South Korea", volatility: 31, stress: { techSelloff: -14, rateShock: -8, recession: -24, dollarDrop: 3 } },
  "373220": { name: "LG Energy Solution", asset: "Korea Equity", sector: "Industrials", region: "South Korea", volatility: 38, stress: { techSelloff: -22, rateShock: -12, recession: -25, dollarDrop: 3 } },
  "207940": { name: "Samsung Biologics", asset: "Korea Equity", sector: "Health Care", region: "South Korea", volatility: 27, stress: { techSelloff: -10, rateShock: -6, recession: -12, dollarDrop: 1 } },
  "051910": { name: "LG Chem", asset: "Korea Equity", sector: "Materials", region: "South Korea", volatility: 37, stress: { techSelloff: -18, rateShock: -10, recession: -28, dollarDrop: 3 } },
  "006400": { name: "Samsung SDI", asset: "Korea Equity", sector: "Industrials", region: "South Korea", volatility: 39, stress: { techSelloff: -22, rateShock: -12, recession: -26, dollarDrop: 3 } },
  MU: { name: "Micron", asset: "US Equity", sector: "Technology", region: "United States", volatility: 44, stress: { techSelloff: -34, rateShock: -13, recession: -28, dollarDrop: -3 } },
  SQ: { name: "Block", asset: "US Equity", sector: "Financials", region: "United States", volatility: 54, stress: { techSelloff: -24, rateShock: -16, recession: -32, dollarDrop: -2 } },
  AMD: { name: "AMD", asset: "US Equity", sector: "Technology", region: "United States", volatility: 48, stress: { techSelloff: -34, rateShock: -14, recession: -28, dollarDrop: -3 } },
  AVGO: { name: "Broadcom", asset: "US Equity", sector: "Technology", region: "United States", volatility: 31, stress: { techSelloff: -27, rateShock: -10, recession: -21, dollarDrop: -3 } },
  TSM: { name: "TSMC", asset: "Global Equity", sector: "Technology", region: "International", volatility: 33, stress: { techSelloff: -30, rateShock: -10, recession: -23, dollarDrop: 2 } },
  SNDK: { name: "SanDisk", asset: "US Equity", sector: "Technology", region: "United States", volatility: 42, stress: { techSelloff: -30, rateShock: -12, recession: -28, dollarDrop: -3 } },
  VOO: { name: "Vanguard S&P 500 ETF", asset: "US Equity ETF", sector: "Broad Market", region: "United States", volatility: 18, stress: { techSelloff: -17, rateShock: -7, recession: -22, dollarDrop: -2 } },
  IVV: { name: "iShares Core S&P 500 ETF", asset: "US Equity ETF", sector: "Broad Market", region: "United States", volatility: 18, stress: { techSelloff: -17, rateShock: -7, recession: -22, dollarDrop: -2 } },
  VT: { name: "Total World Stock ETF", asset: "Global Equity ETF", sector: "Broad Market", region: "Global", volatility: 18, stress: { techSelloff: -14, rateShock: -6, recession: -20, dollarDrop: 2 } },
  TQQQ: { name: "ProShares UltraPro QQQ", asset: "Leveraged ETF", sector: "Technology", region: "United States", volatility: 72, stress: { techSelloff: -58, rateShock: -28, recession: -55, dollarDrop: -5 } },
  SOXL: { name: "Direxion Daily Semiconductor Bull 3X", asset: "Leveraged ETF", sector: "Technology", region: "United States", volatility: 88, stress: { techSelloff: -65, rateShock: -32, recession: -60, dollarDrop: -5 } },
  UPRO: { name: "ProShares UltraPro S&P500", asset: "Leveraged ETF", sector: "Broad Market", region: "United States", volatility: 58, stress: { techSelloff: -42, rateShock: -21, recession: -55, dollarDrop: -4 } },
  BRK: { name: "Berkshire Hathaway", asset: "US Equity", sector: "Financials", region: "United States", volatility: 18, stress: { techSelloff: -8, rateShock: -4, recession: -16, dollarDrop: -2 } },
  "BRK.B": { name: "Berkshire Hathaway", asset: "US Equity", sector: "Financials", region: "United States", volatility: 18, stress: { techSelloff: -8, rateShock: -4, recession: -16, dollarDrop: -2 } },
  PLTR: { name: "Palantir", asset: "US Equity", sector: "Technology", region: "United States", volatility: 58, stress: { techSelloff: -36, rateShock: -18, recession: -35, dollarDrop: -3 } },
  ABCL: { name: "AbCellera", asset: "US Equity", sector: "Health Care", region: "United States", volatility: 68, stress: { techSelloff: -22, rateShock: -16, recession: -40, dollarDrop: -2 } },
};

const aliases: Record<string, string> = {
  apple: "AAPL",
  애플: "AAPL",
  아이폰: "AAPL",
  microsoft: "MSFT",
  ms: "MSFT",
  마이크로소프트: "MSFT",
  마소: "MSFT",
  nvidia: "NVDA",
  엔비디아: "NVDA",
  nvda: "NVDA",
  amazon: "AMZN",
  아마존: "AMZN",
  google: "GOOGL",
  alphabet: "GOOGL",
  구글: "GOOGL",
  알파벳: "GOOGL",
  meta: "META",
  메타: "META",
  facebook: "META",
  페이스북: "META",
  tesla: "TSLA",
  테슬라: "TSLA",
  삼성전자: "005930",
  삼성: "005930",
  삼전: "005930",
  samsung: "005930",
  samsungelectronics: "005930",
  하이닉스: "000660",
  sk하이닉스: "000660",
  skhynix: "000660",
  hynix: "000660",
  네이버: "035420",
  naver: "035420",
  카카오: "035720",
  kakao: "035720",
  현대차: "005380",
  현대자동차: "005380",
  hyundaimotor: "005380",
  기아: "000270",
  kia: "000270",
  lg에너지솔루션: "373220",
  lg엔솔: "373220",
  삼성바이오로직스: "207940",
  삼바: "207940",
  lg화학: "051910",
  삼성sdi: "006400",
  마이크론: "MU",
  마이크로: "MU",
  micron: "MU",
  block: "SQ",
  블록: "SQ",
  스퀘어: "SQ",
  실sq: "SQ",
  sq: "SQ",
  amd: "AMD",
  암드: "AMD",
  브로드컴: "AVGO",
  broadcom: "AVGO",
  tsmc: "TSM",
  대만반도체: "TSM",
  샌디스크: "SNDK",
  sandisk: "SNDK",
  sndk: "SNDK",
  voo: "VOO",
  ivv: "IVV",
  vt: "VT",
  tqqq: "TQQQ",
  soxl: "SOXL",
  upro: "UPRO",
  brk: "BRK",
  "brk.b": "BRK.B",
  버크셔: "BRK.B",
  버크셔해서웨이: "BRK.B",
  pltr: "PLTR",
  팔란티어: "PLTR",
  palantir: "PLTR",
  abcl: "ABCL",
  앱셀레라: "ABCL",
  abcellera: "ABCL",
  비트코인: "BTC",
  bitcoin: "BTC",
  금: "GLD",
  골드: "GLD",
  cash: "CASH",
  현금: "CASH",
};

const translations: Record<string, string> = {
  "US Equity": "미국 주식",
  "US Equity ETF": "미국 주식 ETF",
  "Global Equity ETF": "글로벌 주식 ETF",
  "Global Equity": "글로벌 주식",
  "Korea Equity": "한국 주식",
  "Long Bonds": "장기채",
  Bonds: "채권",
  Commodity: "원자재",
  Crypto: "가상자산",
  Cash: "현금",
  "Unclassified Equity": "미분류 주식",
  Technology: "기술",
  "Consumer Discretionary": "경기소비재",
  "Communication Services": "커뮤니케이션",
  "Broad Market": "광범위 시장",
  "Technology Tilt": "기술주 중심",
  Rates: "금리",
  Gold: "금",
  "Digital Assets": "디지털 자산",
  Unknown: "정보 부족",
  "United States": "미국",
  "South Korea": "한국",
  International: "해외",
  Global: "글로벌",
  Local: "현지",
};

const sampleInput = "AAPL 25%\nMSFT 20%\nNVDA 20%\nSPY 20%\nTLT 10%\nGLD 5%";

function localize(label: string, lang: Lang) {
  return lang === "ko" ? translations[label] ?? label : label;
}

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/보통주|우선주|우\b|주식회사|주식|inc\.?|corp\.?|corporation|co\.?|ltd\.?|plc/g, "")
    .replace(/[^a-z0-9가-힣.]/g, "");
}

function editDistance(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[a.length][b.length];
}

function resolveTicker(rawName: string) {
  const normalized = normalizeName(rawName);
  const upper = rawName.trim().toUpperCase();
  if (library[upper]) return upper;
  if (library[normalized.toUpperCase()]) return normalized.toUpperCase();
  if (aliases[normalized]) return aliases[normalized];

  const fuzzy = Object.entries(aliases)
    .map(([alias, ticker]) => ({ alias, ticker, distance: editDistance(normalized, alias) }))
    .filter(({ alias, distance }) => normalized.length >= 3 && distance <= Math.max(1, Math.floor(alias.length * 0.25)))
    .sort((a, b) => a.distance - b.distance || a.alias.length - b.alias.length)[0];

  return fuzzy?.ticker ?? upper;
}

function parsePortfolio(value: string): Holding[] {
  return value
    .split(/\n|,/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/(.+?)\s+(-?\d+(?:\.\d+)?)\s*%?$/);
      const rawName = match?.[1]?.trim() || line;
      const rawWeight = match?.[2] || "0";
      const ticker = resolveTicker(rawName);
      const base = library[ticker] ?? {
        name: rawName,
        asset: "Unclassified Equity",
        sector: "Unknown",
        region: "Unknown",
        volatility: 30,
        stress: { techSelloff: -18, rateShock: -8, recession: -20, dollarDrop: -2 },
      };
      const weight = Number.parseFloat(rawWeight);
      const displayName = /^[A-Z0-9.]+$/.test(rawName.trim()) ? base.name : rawName;
      return { ticker, displayName, weight: Number.isFinite(weight) ? weight : 0, ...base };
    })
    .filter((item) => item.ticker && item.weight > 0);
}

function groupBy(items: Holding[], key: keyof Pick<Holding, "asset" | "sector" | "region">, lang: Lang) {
  const grouped = items.reduce<Record<string, number>>((acc, item) => {
    const label = localize(item[key], lang);
    acc[label] = (acc[label] || 0) + item.weight;
    return acc;
  }, {});
  return Object.entries(grouped).sort((a, b) => b[1] - a[1]);
}

function weighted(items: Holding[], selector: (item: Holding) => number) {
  const total = items.reduce((sum, item) => sum + item.weight, 0) || 1;
  return items.reduce((sum, item) => sum + selector(item) * (item.weight / total), 0);
}

function fmt(value: number) {
  return `${value.toFixed(1)}%`;
}

function isUnknownLabel(label: string) {
  return ["Unknown", "미분류", "정보 부족", "Unclassified Equity", "미분류 주식"].includes(label);
}

function getTone(score: number) {
  if (score < 35) {
    return {
      page: "#edf9ef",
      ink: "#10231f",
      muted: "#4d6f61",
      card: "#f8fff9",
      cardSoft: "#dff7e8",
      accent: "#24c86b",
      accentSoft: "#147a45",
      stat: "#ffffff",
      warning: "#d85b37",
    };
  }
  if (score < 55) {
    return {
      page: "#fff7df",
      ink: "#2b2411",
      muted: "#746333",
      card: "#fffdf4",
      cardSoft: "#fff0b8",
      accent: "#f4be2a",
      accentSoft: "#8a6400",
      stat: "#ffffff",
      warning: "#c45b22",
    };
  }
  if (score < 75) {
    return {
      page: "#fff0e5",
      ink: "#2f1d12",
      muted: "#7c5742",
      card: "#fff9f3",
      cardSoft: "#ffd9bf",
      accent: "#f27a36",
      accentSoft: "#9a4216",
      stat: "#ffffff",
      warning: "#c84825",
    };
  }
  return {
    page: "#fff0f0",
    ink: "#2f1515",
    muted: "#7e4d4d",
    card: "#fff8f8",
    cardSoft: "#ffd6d6",
    accent: "#ec4e4e",
    accentSoft: "#9d2525",
    stat: "#ffffff",
    warning: "#b92f2f",
  };
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      line = word;
    } else {
      line = next;
    }
  });
  if (line) ctx.fillText(line, x, y);
}

export default function Home() {
  const [input, setInput] = useState(sampleInput);
  const [lang, setLang] = useState<Lang>("ko");
  const t = labels[lang];

  const holdings = useMemo(() => parsePortfolio(input), [input]);
  const totalWeight = holdings.reduce((sum, item) => sum + item.weight, 0);
  const normalized = holdings.map((item) => ({ ...item, weight: (item.weight / (totalWeight || 1)) * 100 }));
  const sectors = groupBy(normalized, "sector", lang);
  const assets = groupBy(normalized, "asset", lang);
  const regions = groupBy(normalized, "region", lang);
  const sorted = [...normalized].sort((a, b) => b.weight - a.weight);
  const topHolding = sorted[0] ?? null;
  const topThree = sorted.slice(0, 3).reduce((sum, item) => sum + item.weight, 0);
  const volatility = weighted(normalized, (item) => item.volatility);
  const rawSectorGroups = groupBy(normalized, "sector", "en").filter(([label]) => !isUnknownLabel(label));
  const topSectorWeight = rawSectorGroups[0]?.[1] ?? 0;
  const concentrationScore = Math.min(
    100,
    (topHolding?.weight || 0) * 0.9 + topThree * 0.25 + topSectorWeight * 0.45,
  );
  const riskScore = Math.round(Math.min(100, volatility * 1.35 + concentrationScore * 0.3));
  const defensiveWeight = normalized
    .filter((item) => ["Bonds", "Long Bonds", "Commodity", "Cash"].includes(item.asset))
    .reduce((sum, item) => sum + item.weight, 0);
  const tone = getTone(riskScore);
  const metrics = {
    riskScore,
    topHolding,
    topThree,
    volatility,
    defensiveWeight,
    positionCount: normalized.length,
  };
  const personality = determineRiskCharacter(metrics, lang);
  const badges = determinePortfolioBadges(normalized, metrics, lang);
  const knownSectors = sectors.filter(([label]) => !isUnknownLabel(label));
  const unknownWeight = sectors.find(([label]) => isUnknownLabel(label))?.[1] ?? 0;
  const mainRisk = getMainRisk({
    lang,
    topHolding,
    topSector: knownSectors[0],
    unknownWeight,
  });
  const scenarios = [
    [lang === "ko" ? "나스닥 -20% 하락 시" : "If Nasdaq falls 20%", weighted(normalized, (item) => item.stress.techSelloff)],
    [lang === "ko" ? "금리 1%p 상승 시" : "If rates rise 1%", weighted(normalized, (item) => item.stress.rateShock)],
    [lang === "ko" ? "경기침체 시" : "In a recession", weighted(normalized, (item) => item.stress.recession)],
    [lang === "ko" ? "달러 약세 시" : "If USD weakens", weighted(normalized, (item) => item.stress.dollarDrop)],
  ] as const;

  const insights = [
    unknownWeight > 35
      ? lang === "ko"
        ? `입력한 종목 중 ${fmt(unknownWeight)}는 아직 데이터가 부족해요.`
        : `${fmt(unknownWeight)} of the portfolio uses fallback classifications.`
      : topHolding && topHolding.weight > 25
      ? lang === "ko"
        ? `${topHolding.displayName} 하나가 전체의 ${fmt(topHolding.weight)}를 차지해요.`
        : `${topHolding.displayName} alone drives ${fmt(topHolding.weight)} of the portfolio.`
      : lang === "ko"
        ? "단일 종목 집중도는 비교적 안정적이에요."
        : "Single-name concentration is controlled.",
    sectors[0] && sectors[0][1] > 45
      ? lang === "ko"
        ? `${sectors[0][0]} 노출이 ${fmt(sectors[0][1])}로 높은 편이에요.`
        : `${sectors[0][0]} exposure is high at ${fmt(sectors[0][1])}.`
      : lang === "ko"
        ? "섹터 쏠림은 과하지 않은 편이에요."
        : "Sector exposure is reasonably balanced.",
    regions[0] && regions[0][1] > 80
      ? lang === "ko"
        ? `${regions[0][0]} 중심 포트폴리오라 지역 분산은 약해요.`
        : `${regions[0][0]} dominates regional exposure.`
      : lang === "ko"
        ? "지역 분산이 어느 정도 들어가 있어요."
        : "Regional exposure adds some diversification.",
  ];
  const feedback = getFeedback({
    lang,
    topHolding,
    topSector: knownSectors[0],
    unknownWeight,
    topThree,
    volatility,
    assets,
  });

  function drawCard() {
    const canvas = document.createElement("canvas");
    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = tone.page;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = tone.card;
    ctx.fillRect(56, 56, width - 112, height - 112);
    ctx.fillStyle = tone.accent;
    ctx.fillRect(56, 56, width - 112, 18);
    ctx.fillStyle = tone.ink;
    ctx.font = "800 42px Arial";
    ctx.fillText(t.brand, 104, 150);
    ctx.font = "700 100px Arial";
    ctx.fillText(`${riskScore}`, 104, 330);
    ctx.font = "800 42px Arial";
    ctx.fillStyle = tone.accent;
    ctx.fillText(`/100 ${t.score}`, 325, 330);
    ctx.fillStyle = tone.muted;
    ctx.font = "800 34px Arial";
    ctx.fillText(t.investorType, 104, 430);
    ctx.fillStyle = tone.ink;
    ctx.font = "800 74px Arial";
    wrapText(ctx, personality.name, 104, 525, 820, 82);
    ctx.font = "700 34px Arial";
    wrapText(ctx, `"${personality.quote}"`, 104, 660, 820, 42);

    ctx.fillStyle = tone.ink;
    ctx.font = "800 34px Arial";
    ctx.fillText(t.earnedBadges, 104, 780);
    badges.slice(0, 3).forEach((badge, index) => {
      const y = 825 + index * 116;
      ctx.fillStyle = tone.cardSoft;
      ctx.fillRect(104, y, 872, 92);
      ctx.fillStyle = tone.ink;
      ctx.font = "800 30px Arial";
      ctx.fillText(`${badge.emoji} ${badge.title}`, 132, y + 38);
      ctx.font = "500 23px Arial";
      ctx.fillText(badge.description, 132, y + 70);
    });

    const statY = 1185;
    [
      [t.top3, fmt(topThree)],
      [t.largest, topHolding ? `${topHolding.displayName} ${fmt(topHolding.weight)}` : "-"],
      [t.vol, fmt(volatility)],
    ].forEach(([label, value], index) => {
      const x = 104 + index * 296;
      ctx.fillStyle = tone.stat;
      ctx.fillRect(x, statY, 252, 170);
      ctx.fillStyle = tone.ink;
      ctx.font = "700 28px Arial";
      ctx.fillText(label, x + 24, statY + 55);
      ctx.font = "800 38px Arial";
      wrapText(ctx, value, x + 24, statY + 112, 205, 44);
    });

    ctx.fillStyle = tone.ink;
    ctx.font = "800 34px Arial";
    ctx.fillText(t.scenarios, 104, 1480);
    ctx.font = "700 34px Arial";
    scenarios.slice(0, 3).forEach(([label, value], index) => {
      const y = 1560 + index * 90;
      ctx.fillStyle = tone.muted;
      ctx.fillText(label, 104, y);
      ctx.fillStyle = value < 0 ? tone.warning : tone.accentSoft;
      ctx.fillText(`-> ${value > 0 ? "+" : ""}${fmt(value)}`, 760, y);
    });
    return canvas;
  }

  function saveImage() {
    const canvas = drawCard();
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = lang === "ko" ? "portfolio-risk-story.png" : "portfolio-risk-card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function shareImage() {
    const canvas = drawCard();
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "portfolio-risk-lens.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: t.brand, text: personality.name, files: [file] });
      } else {
        alert(t.noShare);
      }
    });
  }

  return (
    <main className="min-h-screen text-[#10231f]" style={{ backgroundColor: tone.page }}>
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8">
        <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:h-[calc(100vh-48px)]">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-[#10231f] text-lg font-black text-[#f2b84b]">R</div>
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#42665c]">{t.brand}</span>
            </div>
            <div className="grid grid-cols-2 rounded-md border border-[#d7cfc1] bg-white p-1 text-sm font-black">
              <button onClick={() => setLang("ko")} className={`rounded px-3 py-2 ${lang === "ko" ? "bg-[#10231f] text-white" : "text-[#52655f]"}`}>KO</button>
              <button onClick={() => setLang("en")} className={`rounded px-3 py-2 ${lang === "en" ? "bg-[#10231f] text-white" : "text-[#52655f]"}`}>EN</button>
            </div>
          </header>

          <div>
            <h1 className="text-4xl font-black leading-tight text-[#10231f] sm:text-5xl">{t.headline}</h1>
            <p className="mt-4 text-base leading-7 text-[#4a5f59]">{t.subhead}</p>
          </div>

          <section className="rounded-lg border border-[#d6cec0] bg-white p-4 shadow-sm">
            <label htmlFor="portfolio-input" className="text-sm font-black">{t.input}</label>
            <textarea
              id="portfolio-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t.placeholder}
              spellCheck={false}
              className="mt-3 min-h-48 w-full resize-none rounded-md border border-[#d6cec0] bg-[#fffdf8] p-4 font-mono text-sm leading-7 outline-none transition focus:border-[#2f7d6d] focus:ring-4 focus:ring-[#2f7d6d]/15"
            />
            <div className="mt-4 grid grid-cols-3 gap-3">
              <button onClick={() => setInput(sampleInput)} className="rounded-md bg-[#10231f] px-3 py-3 text-sm font-black text-white transition hover:bg-[#1c3c35]">{t.sample}</button>
              <button onClick={saveImage} className="rounded-md bg-[#f2b84b] px-3 py-3 text-sm font-black text-[#10231f] transition hover:bg-[#e6a92e]">{t.save}</button>
              <button onClick={shareImage} className="rounded-md bg-[#2f7d6d] px-3 py-3 text-sm font-black text-white transition hover:bg-[#286c5e]">{t.share}</button>
            </div>
            <p className="mt-4 text-xs leading-5 text-[#6d7b76]">{t.unmatched}</p>
          </section>
        </div>

        <div className="grid gap-5">
          <section className="grid gap-5 xl:grid-cols-[390px_1fr]">
            <StoryCard
              t={t}
              riskScore={riskScore}
              personality={personality}
              badges={badges}
              topThree={topThree}
              topHolding={topHolding}
              volatility={volatility}
              scenarios={scenarios}
              tone={tone}
            />
            <section className="rounded-lg border border-black/10 p-5 shadow-xl" style={{ backgroundColor: tone.card, color: tone.ink }}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.16em]" style={{ color: tone.accentSoft }}>{t.score}</p>
                  <h2 className="mt-2 text-4xl font-black">{riskScore}/100</h2>
                </div>
                <div className="rounded-md px-4 py-3 text-right" style={{ backgroundColor: tone.cardSoft }}>
                  <p className="text-xs" style={{ color: tone.muted }}>{t.story}</p>
                  <p className="max-w-56 text-xl font-black" style={{ color: tone.accent }}>{personality.name}</p>
                </div>
              </div>
              <div className="mt-5 h-4 rounded-full bg-black/10">
                <div className="h-4 rounded-full" style={{ width: `${riskScore}%`, backgroundColor: tone.accent }} />
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Metric label={t.top3} value={fmt(topThree)} tone={tone} />
                <Metric label={t.largest} value={topHolding ? `${topHolding.displayName} ${fmt(topHolding.weight)}` : "-"} tone={tone} />
                <Metric label={t.vol} value={fmt(volatility)} tone={tone} />
              </div>
              <div className="mt-5 rounded-md p-4" style={{ backgroundColor: tone.cardSoft }}>
                <p className="text-xs uppercase tracking-[0.14em]" style={{ color: tone.accentSoft }}>{t.earnedBadges}</p>
                <div className="mt-3 grid gap-2">
                  {badges.map((badge) => (
                    <p key={badge.id} className="text-sm font-black">{badge.emoji} {badge.title}</p>
                  ))}
                </div>
              </div>
            </section>
          </section>

          <section className="grid gap-5 md:grid-cols-3">
            <Panel title={t.assets} data={assets} accent="#2f7d6d" />
            <Panel title={t.sectors} data={sectors} accent="#d86847" />
            <Panel title={t.regions} data={regions} accent="#5b68b9" />
          </section>

          <section className="rounded-lg border border-[#d6cec0] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">{t.scenarios}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {scenarios.map(([label, value]) => (
                <div key={label} className="rounded-md bg-[#f6f3ec] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-black">{label}</span>
                    <span className={`text-xl font-black ${value < 0 ? "text-[#c34e32]" : "text-[#2f7d6d]"}`}>→ {value > 0 ? "+" : ""}{fmt(value)}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-[#e1dacd]">
                    <div className={`h-2 rounded-full ${value < 0 ? "bg-[#d86847]" : "bg-[#2f7d6d]"}`} style={{ width: `${Math.min(100, Math.abs(value) * 3)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[#d6cec0] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">{t.readout}</h2>
            <div className="mt-4 grid gap-3">
              {insights.map((text) => (
                <p key={text} className="rounded-md bg-[#eef6f2] px-4 py-3 text-sm font-bold text-[#234940]">{text}</p>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[#d6cec0] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">{t.feedback}</h2>
            <div className="mt-4 grid gap-3">
              {feedback.map((text) => (
                <p key={text} className="rounded-md bg-[#fff7df] px-4 py-3 text-sm font-bold text-[#5d4310]">{text}</p>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function getStyle(score: number, lang: Lang, topThree: number, defensiveWeight: number) {
  if (score >= 78 && topThree > 72) return lang === "ko" ? "하이 리스크 하이 텐션" : "High-risk high-conviction";
  if (score >= 78) return lang === "ko" ? "스릴을 즐기는 투자자" : "Thrill-seeking investor";
  if (score >= 58 && topThree > 70) return lang === "ko" ? "한 방을 노리는 성장러" : "Big-swing growth hunter";
  if (score >= 58) return lang === "ko" ? "하이 리스크 하이 리턴 후보" : "High-risk high-return contender";
  if (score >= 38 && defensiveWeight > 25) return lang === "ko" ? "버핏의 애제자" : "Buffett's favorite pupil";
  if (score >= 38) return lang === "ko" ? "균형 잡힌 성장형" : "Balanced growth investor";
  if (defensiveWeight > 35) return lang === "ko" ? "분산투자의 신" : "Diversification master";
  return lang === "ko" ? "차분한 생존형" : "Calm survivor";
}

function getMainRisk({
  lang,
  topHolding,
  topSector,
  unknownWeight,
}: {
  lang: Lang;
  topHolding: Holding | null;
  topSector?: [string, number];
  unknownWeight: number;
}) {
  if (topSector && topSector[1] > 45) {
    return lang === "ko" ? `${topSector[0]} 쏠림` : `${topSector[0]} concentration`;
  }
  if (topHolding && topHolding.weight > 26) {
    return lang === "ko" ? `${topHolding.displayName} 비중 과다` : `${topHolding.displayName} concentration`;
  }
  if (unknownWeight > 35) {
    return lang === "ko" ? "종목 정보 부족" : "Limited ticker data";
  }
  return lang === "ko" ? "하락장 민감도" : "Market drawdown sensitivity";
}

function getFeedback({
  lang,
  topHolding,
  topSector,
  unknownWeight,
  topThree,
  volatility,
  assets,
}: {
  lang: Lang;
  topHolding: Holding | null;
  topSector?: [string, number];
  unknownWeight: number;
  topThree: number;
  volatility: number;
  assets: [string, number][];
}) {
  const bondWeight = assets
    .filter(([label]) => ["채권", "장기채", "Bonds", "Long Bonds"].includes(label))
    .reduce((sum, [, value]) => sum + value, 0);
  const ideas: string[] = [];

  if (topHolding && topHolding.weight > 28) {
    ideas.push(
      lang === "ko"
        ? `${topHolding.displayName} 비중을 조금 낮추면 한 종목에 끌려가는 위험이 줄어요.`
        : `Trimming ${topHolding.displayName} would reduce single-name dependency.`,
    );
  }
  if (topSector && topSector[1] > 45) {
    ideas.push(
      lang === "ko"
        ? `${topSector[0]} 비중이 커서 같은 업황에 함께 흔들릴 수 있어요. 다른 섹터를 섞으면 점수가 내려갑니다.`
        : `Adding sectors beyond ${topSector[0]} would make the portfolio less one-sided.`,
    );
  }
  if (bondWeight < 15 && volatility > 24) {
    ideas.push(
      lang === "ko"
        ? "변동성이 부담된다면 채권, 현금, 금 같은 완충 자산을 조금 넣어볼 수 있어요."
        : "If the swings feel too large, bonds, cash, or gold can add a buffer.",
    );
  }
  if (topThree > 70) {
    ideas.push(
      lang === "ko"
        ? "상위 3개 비중이 커서, 새 종목을 사기보다 기존 큰 비중을 나누는 게 먼저예요."
        : "The top three positions dominate, so splitting the largest weights matters before adding more tickers.",
    );
  }
  if (unknownWeight > 25) {
    ideas.push(
      lang === "ko"
        ? "아직 데이터가 부족한 종목이 많아요. 다음 버전에서는 직접 자산군을 고르게 하면 분석이 더 좋아집니다."
        : "Several tickers use fallback data. Manual asset tags would make the next version more precise.",
    );
  }

  if (ideas.length === 0) {
    ideas.push(
      lang === "ko"
        ? "큰 쏠림은 적은 편이에요. 리밸런싱 주기만 정해도 리스크 관리가 훨씬 쉬워져요."
        : "No major concentration stands out. A simple rebalancing schedule may be enough.",
    );
  }

  return ideas.slice(0, 3);
}

function Metric({ label, value, tone }: { label: string; value: string; tone: ReturnType<typeof getTone> }) {
  return (
    <div className="rounded-md p-4" style={{ backgroundColor: tone.stat }}>
      <p className="text-xs" style={{ color: tone.muted }}>{label}</p>
      <p className="mt-1 break-words text-xl font-black">{value}</p>
    </div>
  );
}

function StoryCard({
  t,
  riskScore,
  personality,
  badges,
  topThree,
  topHolding,
  volatility,
  scenarios,
  tone,
}: {
  t: (typeof labels)[Lang];
  riskScore: number;
  personality: { name: string; quote: string };
  badges: { id: string; emoji: string; title: string; description: string }[];
  topThree: number;
  topHolding: Holding | null;
  volatility: number;
  scenarios: readonly (readonly [string, number])[];
  tone: ReturnType<typeof getTone>;
}) {
  return (
    <section className="mx-auto w-full max-w-[390px] rounded-lg border border-black/10 p-5 shadow-xl" style={{ backgroundColor: tone.card, color: tone.ink }}>
      <div className="aspect-[9/16] rounded-md border border-black/10 p-6" style={{ backgroundColor: tone.card }}>
        <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: tone.accent }} />
        <p className="mt-8 text-sm font-black uppercase tracking-[0.16em]" style={{ color: tone.accentSoft }}>{t.story}</p>
        <p className="mt-5 text-7xl font-black tracking-normal">{riskScore}</p>
        <p className="text-2xl font-black" style={{ color: tone.accent }}>/100 {t.score}</p>
        <p className="mt-7 text-sm font-black" style={{ color: tone.muted }}>{t.investorType}</p>
        <h2 className="mt-2 text-4xl font-black leading-tight">{personality.name}</h2>
        <p className="mt-3 text-base font-bold leading-6" style={{ color: tone.muted }}>&quot;{personality.quote}&quot;</p>
        <div className="mt-6 rounded-md p-4" style={{ backgroundColor: tone.cardSoft }}>
          <p className="text-xs font-black uppercase tracking-[0.14em]" style={{ color: tone.accentSoft }}>{t.earnedBadges}</p>
          <div className="mt-3 grid gap-2">
            {badges.slice(0, 3).map((badge) => (
              <div key={badge.id} className="rounded-md bg-white/70 p-2">
                <p className="text-sm font-black">{badge.emoji} {badge.title}</p>
                <p className="mt-1 text-[11px] font-bold" style={{ color: tone.muted }}>{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-[#10231f]">
          <SmallStat label={t.top3} value={fmt(topThree)} tone={tone} />
          <SmallStat label={t.largest} value={topHolding ? topHolding.displayName : "-"} tone={tone} />
          <SmallStat label={t.vol} value={fmt(volatility)} tone={tone} />
        </div>
        <div className="mt-5 space-y-2">
          {scenarios.slice(0, 3).map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 text-sm font-black">
              <span style={{ color: tone.muted }}>{label}</span>
              <span style={{ color: value < 0 ? tone.warning : tone.accentSoft }}>→ {value > 0 ? "+" : ""}{fmt(value)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SmallStat({ label, value, tone }: { label: string; value: string; tone: ReturnType<typeof getTone> }) {
  return (
    <div className="rounded-md p-3" style={{ backgroundColor: tone.stat }}>
      <p className="text-[10px] font-bold text-[#60716b]">{label}</p>
      <p className="mt-1 break-words text-sm font-black">{value}</p>
    </div>
  );
}

function Panel({ title, data, accent }: { title: string; data: [string, number][]; accent: string }) {
  return (
    <section className="rounded-lg border border-[#d6cec0] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black">{title}</h2>
      <div className="mt-4 grid gap-3">
        {data.slice(0, 5).map(([label, value]) => (
          <div key={label}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-bold">{label}</span>
              <span className="text-[#586a64]">{fmt(value)}</span>
            </div>
            <div className="h-2 rounded-full bg-[#ebe4d8]">
              <div className="h-2 rounded-full" style={{ width: `${value}%`, backgroundColor: accent }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
