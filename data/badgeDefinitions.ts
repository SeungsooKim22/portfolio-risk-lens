import { memeProfiles } from "./memeProfiles.ts";
import type { BadgeDefinition } from "../types/personality.ts";

export const badgeDefinitions: BadgeDefinition[] = [
  {
    id: "company_extreme",
    family: "company",
    priority: 100,
    eligibility: ({ holdings, features }) => {
      const top = holdings.find((item) => item.ticker === features.largestPositionTicker);
      return !!top?.security.memeProfileId && (features.largestPositionWeight ?? 0) >= 40;
    },
    variants: [{ emoji: "🧬", ko: { title: "회사와 운명공동체", description: "이 정도면 실적 발표 때 같이 긴장합니다." }, en: { title: "Company soulbound", description: "Earnings day is basically a personal event." } }],
  },
  {
    id: "leverage_extreme",
    family: "leverage",
    priority: 90,
    eligibility: ({ features }) => features.leveragedExposure >= 60,
    variants: [{ emoji: "🌊", ko: { title: "한강뷰 아니면 한강", description: "3배로 오르면 인생이 바뀝니다. 반대도 가능합니다." }, en: { title: "Penthouse or pavement", description: "Triple speed changes lives in both directions." } }],
  },
  {
    id: "leverage_high",
    family: "leverage",
    priority: 88,
    eligibility: ({ features }) => features.leveragedExposure >= 35,
    variants: [{ emoji: "🔥", ko: { title: "변동성에 레버리지를 얹었습니다", description: "평범한 하루는 재미가 없습니다." }, en: { title: "Volatility with extra fuel", description: "Ordinary market moves are not enough." } }],
  },
  {
    id: "single_extreme",
    family: "concentration",
    priority: 85,
    eligibility: ({ features }) => (features.largestPositionWeight ?? 0) >= 70,
    variants: [{ emoji: "🎰", ko: { title: "사실상 주주가 아니라 동업자", description: "이 정도면 회사 뉴스가 내 일정표입니다." }, en: { title: "Investor or cofounder?", description: "Company news has become your calendar." } }],
  },
  {
    id: "single_high",
    family: "concentration",
    priority: 82,
    eligibility: ({ features }) => (features.largestPositionWeight ?? 0) >= 50,
    variants: [{ emoji: "🎯", ko: { title: "분산투자는 패자의 변명", description: "맞으면 크게 맞고, 틀리면 크게 배웁니다." }, en: { title: "Diversification left the chat", description: "Right or wrong, this one will be loud." } }],
  },
  {
    id: "single_moderate",
    family: "concentration",
    priority: 80,
    eligibility: ({ features }) => (features.largestPositionWeight ?? 0) >= 30,
    variants: [{ emoji: "🎯", ko: { title: "상당한 확신", description: "이 포트폴리오에는 확실히 최애 종목이 있습니다." }, en: { title: "Strong conviction", description: "This portfolio clearly has a favorite child." } }],
  },
  {
    id: "semiconductor",
    family: "theme",
    priority: 78,
    eligibility: ({ features }) => features.dominantTheme === "semiconductor" && features.thematicConcentration >= 55,
    variants: [
      { emoji: "🧠", ko: { title: "반도체 없이는 못 살아", description: "HBM이라는 단어만 들으면 심장이 뜁니다." }, en: { title: "Needs chips to function", description: "HBM is basically a love language." } },
      { emoji: "🧠", ko: { title: "포트폴리오가 실리콘으로 만들어졌습니다", description: "업황 사이클이 곧 계좌 사이클입니다." }, en: { title: "Silicon bloodstream", description: "Your account moves with the chip cycle." } },
    ],
  },
  {
    id: "biotech",
    family: "theme",
    priority: 76,
    eligibility: ({ features }) => features.dominantTheme === "biotech" && features.thematicConcentration >= 45,
    variants: [{ emoji: "🧪", ko: { title: "FDA와 운명공동체", description: "경제지표보다 임상 발표 날짜가 중요합니다." }, en: { title: "Tied to the FDA calendar", description: "Trial dates matter more than macro days." } }],
  },
  {
    id: "space",
    family: "theme",
    priority: 74,
    eligibility: ({ features }) => features.dominantTheme === "space",
    variants: [{ emoji: "🚀", ko: { title: "포트폴리오가 궤도에 있습니다", description: "지상보다 우주에서 답을 찾습니다." }, en: { title: "Portfolio in orbit", description: "This allocation keeps looking upward." } }],
  },
  {
    id: "bogle",
    family: "broad-etf",
    priority: 70,
    eligibility: ({ features }) => features.broadEtfExposure >= 70,
    variants: [{ emoji: "📚", ko: { title: "존 보글이 흐뭇해합니다", description: "시장 이기기를 포기했더니 마음이 편해졌습니다." }, en: { title: "John Bogle approves", description: "You stopped trying to beat the market and found peace." } }],
  },
  {
    id: "defensive",
    family: "defensive",
    priority: 60,
    eligibility: ({ features }) => features.defensiveTilt >= 50,
    variants: [{ emoji: "🛡", ko: { title: "폭락장 생존 전문가", description: "남들이 수익률 볼 때 나는 생존율을 봅니다." }, en: { title: "Crash survivalist", description: "Other people track returns. You track survival odds." } }],
  },
  {
    id: "cash",
    family: "cash",
    priority: 58,
    eligibility: ({ features }) => features.cashExposure >= 40,
    variants: [{ emoji: "💵", ko: { title: "폭락장을 기다리는 사냥꾼", description: "아직 안 샀습니다. 더 내려오세요." }, en: { title: "Dry-powder hunter", description: "Not buying yet. Lower prices can talk." } }],
  },
  {
    id: "gold",
    family: "gold",
    priority: 56,
    eligibility: ({ features }) => features.dominantTheme === "gold" || features.commodityExposure >= 30,
    variants: [{ emoji: "🥇", ko: { title: "중앙은행보다 금을 믿습니다", description: "화폐는 종이지만 금은 금입니다." }, en: { title: "Gold-standard believer", description: "Paper is paper. Gold is gold." } }],
  },
  {
    id: "diversified",
    family: "diversification",
    priority: 45,
    eligibility: ({ holdings, features }) => holdings.length >= 15 && features.effectiveNumberOfPositions >= 10,
    variants: [{ emoji: "🧺", ko: { title: "계란 바구니 수집가", description: "종목 수만 많은 게 아니라 실제로도 꽤 나뉘어 있습니다." }, en: { title: "Basket collector", description: "Many positions, and the weights actually spread out." } }],
  },
  {
    id: "fallback",
    family: "fallback",
    priority: 10,
    eligibility: () => true,
    variants: [{ emoji: "⚖", ko: { title: "균형 감각 보유자", description: "튀지는 않지만 오래 살아남는 쪽입니다." }, en: { title: "Balanced enough", description: "Not too spicy. Not too sleepy." } }],
  },
];

export function companyBadgeTitle(ticker: string, weight: number) {
  const profile = Object.values(memeProfiles).find((item) => item.ticker === ticker);
  if (!profile) return null;
  if (weight >= 75) return profile.concentrationTitles?.extreme?.[0] ?? null;
  if (weight >= 60) return profile.concentrationTitles?.extreme?.[1] ?? profile.concentrationTitles?.high?.[0] ?? null;
  if (weight >= 40) return profile.concentrationTitles?.high?.[0] ?? null;
  return null;
}
