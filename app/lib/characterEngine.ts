export type EngineHolding = {
  ticker: string;
  displayName?: string;
  weight: number;
  asset: string;
  sector: string;
  volatility: number;
};

export type PortfolioMetrics = {
  riskScore: number;
  topHolding: EngineHolding | null;
  topThree: number;
  volatility: number;
  defensiveWeight: number;
  positionCount: number;
};

export type RiskCharacter = {
  name: string;
  quote: string;
};

export type Badge = {
  id: string;
  priority: number;
  emoji: string;
  title: string;
  description: string;
};

const riskCharacters = [
  { min: 0, max: 19, name: "버핏의 애제자", quote: "잃지 않는 게 버는 겁니다." },
  { min: 20, max: 34, name: "수익보다 숙면", quote: "계좌보다 혈압 관리가 먼저입니다." },
  { min: 35, max: 49, name: "월가의 모범생", quote: "오를 것도 사고, 버틸 것도 샀습니다." },
  { min: 50, max: 64, name: "적당히 미친 투자자", quote: "안전벨트는 맸습니다. 속도는 좀 냅니다." },
  { min: 65, max: 79, name: "야수의 심장", quote: "변동성? 그게 수익의 입장료 아닌가요?" },
  { min: 80, max: 89, name: "한강뷰 아니면 한강", quote: "중간은 없습니다." },
  { min: 90, max: 100, name: "계좌가 먼저 움직이고 뇌가 따라갑니다", quote: "리스크 관리팀이 보면 기절합니다." },
];

const englishCharacters = [
  { min: 0, max: 19, name: "Buffett's Favorite Pupil", quote: "Not losing money is the strategy." },
  { min: 20, max: 34, name: "Sleep Over Yield", quote: "Blood pressure first, portfolio second." },
  { min: 35, max: 49, name: "Wall Street Honor Student", quote: "Some assets rise. Some assets help you survive." },
  { min: 50, max: 64, name: "Reasonably Unreasonable", quote: "Seatbelt on. Speed still up." },
  { min: 65, max: 79, name: "Heart of a Beast", quote: "Volatility is just the ticket price." },
  { min: 80, max: 89, name: "Penthouse or Pavement", quote: "There is no middle lane." },
  { min: 90, max: 100, name: "Account Moves Before Brain", quote: "Risk managers would need a chair." },
];

const companyProfiles: Record<string, { emoji: string; title: string; description: string }> = {
  AAPL: { emoji: "🍎", title: "팀 쿡의 먼 친척", description: "아이폰 신제품보다 실적 발표가 더 기다려집니다." },
  NVDA: { emoji: "🧥", title: "젠슨 황의 가죽재킷 수제자", description: "AI가 쉬면 내 계좌도 같이 쉽니다." },
  TSLA: { emoji: "🚗", title: "머스크와 운명공동체", description: "CEO의 트윗이 내 자산가격을 흔듭니다." },
  BRK: { emoji: "🥤", title: "버핏의 애제자", description: "코카콜라를 마시며 복리를 기다립니다." },
  "BRK.B": { emoji: "🥤", title: "버핏의 애제자", description: "코카콜라를 마시며 복리를 기다립니다." },
  PLTR: { emoji: "🕵️", title: "알렉스 카프의 비밀요원", description: "무슨 회사인지 몰라도 일단 미래 같긴 합니다." },
  ABCL: { emoji: "🧬", title: "칼 한센의 아들", description: "이 정도면 AbCellera IR보다 회사를 많이 봅니다." },
  "005930": { emoji: "📱", title: "삼성전자 명예 임원", description: "반도체 사이클을 가족 행사처럼 챙깁니다." },
  "000660": { emoji: "🧠", title: "HBM 신봉자", description: "메모리 가격표가 내 심박수를 결정합니다." },
};

const semiconductorTickers = new Set(["NVDA", "AMD", "AVGO", "TSM", "MU", "005930", "000660", "006400"]);
const biotechTickers = new Set(["ABCL"]);
const broadEtfs = new Set(["SPY", "VOO", "IVV", "VT", "VTI"]);
const leveragedEtfs = new Set(["TQQQ", "SOXL", "UPRO"]);
const longBondTickers = new Set(["TLT"]);

export function determineRiskCharacter(metrics: PortfolioMetrics, lang: "ko" | "en"): RiskCharacter {
  const table = lang === "ko" ? riskCharacters : englishCharacters;
  const row = table.find((item) => metrics.riskScore >= item.min && metrics.riskScore <= item.max) ?? table[table.length - 1];
  return { name: row.name, quote: row.quote };
}

export function determinePortfolioBadges(holdings: EngineHolding[], metrics: PortfolioMetrics, lang: "ko" | "en"): Badge[] {
  if (lang !== "ko") return determineEnglishBadges(holdings, metrics);

  const top = metrics.topHolding;
  const techWeight = sectorWeight(holdings, "Technology");
  const healthWeight = sectorWeight(holdings, "Health Care") + tickerWeight(holdings, biotechTickers);
  const aerospaceWeight = sectorWeight(holdings, "Aerospace");
  const semiconductorWeight = tickerWeight(holdings, semiconductorTickers);
  const broadEtfWeight = tickerWeight(holdings, broadEtfs);
  const leveragedWeight = tickerWeight(holdings, leveragedEtfs);
  const cashWeight = holdings.filter((item) => item.asset === "Cash").reduce((sum, item) => sum + item.weight, 0);
  const goldWeight = holdings.filter((item) => item.sector === "Gold").reduce((sum, item) => sum + item.weight, 0);
  const longBondWeight = tickerWeight(holdings, longBondTickers);

  const badges: Badge[] = [];

  if (top && top.weight >= 40 && companyProfiles[top.ticker]) {
    const profile = companyProfiles[top.ticker];
    badges.push({ id: "company_concentration", priority: 1000, ...profile });
  }

  if (leveragedWeight >= 60) {
    badges.push({ id: "leverage", priority: 920, emoji: "🌊", title: "한강뷰 아니면 한강", description: "3배로 오르면 인생이 바뀝니다. 반대도 가능합니다." });
  } else if (leveragedWeight >= 40) {
    badges.push({ id: "leverage", priority: 900, emoji: "🔥", title: "변동성에 레버리지를 얹었습니다", description: "평범한 하루는 재미가 없습니다." });
  } else if (leveragedWeight >= 20) {
    badges.push({ id: "leverage", priority: 880, emoji: "⚡", title: "레버리지는 양념", description: "조금만 넣었다고 생각합니다." });
  }

  if (top) {
    if (top.weight >= 70) badges.push({ id: "single_stock", priority: 820, emoji: "🎰", title: "사실상 주주가 아니라 동업자", description: "이 정도면 실적 발표 때 출근해야 합니다." });
    else if (top.weight >= 50) badges.push({ id: "single_stock", priority: 800, emoji: "🎯", title: "분산투자는 패자의 변명", description: "맞으면 크게 맞고, 틀리면..." });
    else if (top.weight >= 40) badges.push({ id: "single_stock", priority: 780, emoji: "🎯", title: "한 우물 장인", description: "다른 종목은 눈에 들어오지 않습니다." });
    else if (top.weight >= 30) badges.push({ id: "single_stock", priority: 760, emoji: "🎯", title: "사랑하면 몰빵", description: "분산투자라는 단어를 아직 믿지 않습니다." });
  }

  if (semiconductorWeight >= 65) badges.push({ id: "semiconductor", priority: 720, emoji: "🧠", title: "반도체 없이는 못 살아", description: "HBM이라는 단어만 들으면 심장이 뜁니다." });
  if (techWeight >= 80) badges.push({ id: "tech", priority: 710, emoji: "💻", title: "나스닥이 곧 조국", description: "다우지수는 남의 나라 이야기입니다." });
  else if (techWeight >= 65) badges.push({ id: "tech", priority: 700, emoji: "💻", title: "실리콘밸리 주민등록자", description: "빅테크가 세상을 먹는다고 믿습니다." });
  if (healthWeight >= 80) badges.push({ id: "health", priority: 690, emoji: "🧪", title: "임상 결과가 내 금리 결정", description: "Phase 2 발표 날에는 잠을 자지 않습니다." });
  else if (healthWeight >= 60) badges.push({ id: "health", priority: 680, emoji: "🧬", title: "FDA와 운명공동체", description: "경제지표보다 임상 발표 날짜가 중요합니다." });
  if (aerospaceWeight >= 30) badges.push({ id: "aerospace", priority: 675, emoji: "🚀", title: "포트폴리오가 궤도에 있습니다", description: "지상보다 우주에서 답을 찾습니다." });

  if (broadEtfWeight >= 80) badges.push({ id: "bogle", priority: 620, emoji: "📚", title: "존 보글이 흐뭇해합니다", description: "시장 이기기를 포기했더니 마음이 편해졌습니다." });
  if (metrics.defensiveWeight >= 50) badges.push({ id: "defensive", priority: 600, emoji: "🛡️", title: "폭락장 생존 전문가", description: "남들이 수익률 볼 때 나는 생존율을 봅니다." });
  if (cashWeight >= 40) badges.push({ id: "cash", priority: 590, emoji: "💵", title: "폭락장을 기다리는 사냥꾼", description: "아직 안 샀습니다. 더 내려오세요." });
  if (goldWeight >= 30) badges.push({ id: "gold", priority: 580, emoji: "🥇", title: "중앙은행보다 금을 믿습니다", description: "화폐는 종이지만 금은 금입니다." });
  if (longBondWeight >= 35) badges.push({ id: "long_bond", priority: 570, emoji: "🏦", title: "파월의 입만 봅니다", description: "금리 0.25%p에 희비가 갈립니다." });

  if (metrics.positionCount >= 40) badges.push({ id: "overdiversified", priority: 520, emoji: "🏪", title: "미국 주식 편의점", description: "없는 종목을 찾는 게 더 어렵습니다." });
  else if (metrics.positionCount >= 25) badges.push({ id: "overdiversified", priority: 510, emoji: "🛒", title: "사실상 개인 ETF", description: "운용보수 0%의 ETF를 직접 만들었습니다." });
  else if (metrics.positionCount >= 15) badges.push({ id: "overdiversified", priority: 500, emoji: "🧺", title: "계란 바구니 수집가", description: "계란보다 바구니가 더 많습니다." });

  if (techWeight + healthWeight >= 65 && metrics.volatility >= 30) {
    badges.push({ id: "growth", priority: 480, emoji: "🚀", title: "미래에서 실적을 당겨왔습니다", description: "현재 이익보다 2035년이 중요합니다." });
  }

  if (badges.length === 0) {
    if (metrics.riskScore >= 65 || metrics.volatility >= 35) {
      badges.push({ id: "high_volatility_mix", priority: 100, emoji: "🎢", title: "변동성 놀이공원 입장권", description: "종목은 나눴지만 다들 꽤 세게 움직입니다." });
    } else if (metrics.riskScore >= 45) {
      badges.push({ id: "balanced_growth", priority: 100, emoji: "⚖️", title: "적당히 미친 투자자", description: "분산은 했지만 심심한 포트폴리오는 아닙니다." });
    } else {
      badges.push({ id: "balanced", priority: 100, emoji: "⚖️", title: "월가의 모범생", description: "튀지는 않지만 오래 살아남는 쪽입니다." });
    }
  }

  return dedupeBadges(badges);
}

function determineEnglishBadges(holdings: EngineHolding[], metrics: PortfolioMetrics): Badge[] {
  const top = metrics.topHolding;
  const techWeight = sectorWeight(holdings, "Technology");
  const semiconductorWeight = tickerWeight(holdings, semiconductorTickers);
  const broadEtfWeight = tickerWeight(holdings, broadEtfs);
  const badges: Badge[] = [];

  if (top && top.weight >= 50) badges.push({ id: "single_stock", priority: 800, emoji: "🎯", title: "One-Stock Main Character", description: "Diversification has left the chat." });
  else if (top && top.weight >= 30) badges.push({ id: "single_stock", priority: 760, emoji: "🎯", title: "Strong Conviction", description: "This portfolio has a favorite child." });
  if (semiconductorWeight >= 65) badges.push({ id: "semiconductor", priority: 720, emoji: "🧠", title: "Needs Chips to Function", description: "HBM is basically a love language." });
  else if (techWeight >= 65) badges.push({ id: "tech", priority: 700, emoji: "💻", title: "Silicon Valley Resident", description: "Big Tech eating the world is the base case." });
  if (broadEtfWeight >= 80) badges.push({ id: "bogle", priority: 620, emoji: "📚", title: "John Bogle Approves", description: "You stopped trying to beat the market and found peace." });
  if (metrics.defensiveWeight >= 50) badges.push({ id: "defensive", priority: 600, emoji: "🛡️", title: "Crash Survivalist", description: "Other people track returns. You track survival odds." });
  if (badges.length === 0) badges.push({ id: "balanced", priority: 100, emoji: "⚖️", title: "Balanced Enough", description: "Not too spicy. Not too sleepy." });
  return dedupeBadges(badges);
}

function dedupeBadges(badges: Badge[]) {
  const seen = new Set<string>();
  return badges
    .sort((a, b) => b.priority - a.priority)
    .filter((badge) => {
      if (seen.has(badge.id)) return false;
      seen.add(badge.id);
      return true;
    })
    .slice(0, 3);
}

function sectorWeight(holdings: EngineHolding[], sector: string) {
  return holdings.filter((item) => item.sector === sector).reduce((sum, item) => sum + item.weight, 0);
}

function tickerWeight(holdings: EngineHolding[], tickers: Set<string>) {
  return holdings.filter((item) => tickers.has(item.ticker)).reduce((sum, item) => sum + item.weight, 0);
}
