import { memeProfiles } from "./memeProfiles.ts";
import type { BadgeDefinition } from "../types/personality.ts";

export const badgeDefinitions: BadgeDefinition[] = [
  {
    id: "company_extreme",
    family: "company",
    priority: 100,
    relevance: ({ features }) => features.largestPositionWeight ?? 0,
    eligibility: ({ holdings, features }) => {
      const top = holdings.find((item) => item.ticker === features.largestPositionTicker);
      return !!top?.security.memeProfileId && (features.largestPositionWeight ?? 0) >= 40;
    },
    variants: [
      { emoji: "🧬", ko: { title: "회사와 운명공동체", description: "이 정도면 실적 발표 때 같이 긴장합니다." }, en: { title: "Company soulbound", description: "Earnings day is basically personal." } },
      { emoji: "📞", ko: { title: "IR 전화 받아도 됩니다", description: "회사 뉴스가 내 일정표에 들어왔습니다." }, en: { title: "IR might know you", description: "Company news has entered the calendar." } },
      { emoji: "🪪", ko: { title: "명예 임직원", description: "주주라기보다 동료에 가까운 비중입니다." }, en: { title: "Honorary employee", description: "This is closer to coworker than holder." } },
    ],
  },
  {
    id: "leverage_extreme",
    family: "leverage",
    priority: 96,
    relevance: ({ features }) => 80 + features.leveragedExposure,
    eligibility: ({ features }) => features.leveragedExposure >= 60,
    variants: [
      { emoji: "🌊", ko: { title: "한강뷰 아니면 한강", description: "3배로 오르면 인생이 바뀝니다. 반대도 가능합니다." }, en: { title: "Penthouse or pavement", description: "Triple speed changes lives both ways." } },
      { emoji: "⚡", ko: { title: "3배속 인생", description: "복리도 3배, 멘탈 테스트도 3배입니다." }, en: { title: "Triple-speed life", description: "Compounding and stress both accelerate." } },
      { emoji: "🎢", ko: { title: "계좌가 놀이기구", description: "하루 변동폭이 충분히 스릴 있습니다." }, en: { title: "Account theme ride", description: "Daily moves come with their own thrill." } },
    ],
  },
  {
    id: "leverage_high",
    family: "leverage",
    priority: 92,
    relevance: ({ features }) => 60 + features.leveragedExposure,
    eligibility: ({ features }) => features.leveragedExposure >= 25,
    variants: [
      { emoji: "🔥", ko: { title: "레버리지는 양념", description: "평범한 지수만으로는 조금 싱거웠습니다." }, en: { title: "Leverage as seasoning", description: "Plain index exposure tasted too mild." } },
      { emoji: "🏎️", ko: { title: "변동성에 부스터", description: "차트가 움직이면 계좌도 뛰어다닙니다." }, en: { title: "Volatility booster", description: "When the chart moves, the account runs." } },
    ],
  },
  {
    id: "single_extreme",
    family: "concentration",
    priority: 90,
    relevance: ({ features }) => 45 + (features.largestPositionWeight ?? 0),
    eligibility: ({ features }) => (features.largestPositionWeight ?? 0) >= 70,
    variants: [
      { emoji: "🎰", ko: { title: "사실상 동업자", description: "이 정도면 회사 뉴스가 내 뉴스입니다." }, en: { title: "Basically a partner", description: "Company news is now your news." } },
      { emoji: "🎯", ko: { title: "최애종목 보관함", description: "포트폴리오보다 팬심에 가깝습니다." }, en: { title: "Favorite-stock vault", description: "This feels closer to fandom than allocation." } },
      { emoji: "📌", ko: { title: "한 우물 장인", description: "계란이 아니라 바구니 하나를 믿습니다." }, en: { title: "One-basket craftsperson", description: "The basket, not the eggs, got the trust." } },
    ],
  },
  {
    id: "single_high",
    family: "concentration",
    priority: 86,
    relevance: ({ features }) => 35 + (features.largestPositionWeight ?? 0),
    eligibility: ({ features }) => (features.largestPositionWeight ?? 0) >= 40 || features.topThreeWeight >= 78,
    variants: [
      { emoji: "🎯", ko: { title: "분산투자는 결석", description: "맞으면 크게 맞고, 틀리면 크게 배웁니다." }, en: { title: "Diversification absent", description: "Right or wrong, this one will be loud." } },
      { emoji: "🧲", ko: { title: "종목 하나에 진심", description: "계좌의 무게중심이 확실합니다." }, en: { title: "Very sincere about one name", description: "The center of gravity is obvious." } },
    ],
  },
  {
    id: "semiconductor",
    family: "theme",
    priority: 82,
    relevance: ({ features }) => 35 + features.thematicConcentration,
    eligibility: ({ features }) => features.dominantTheme === "semiconductor" && features.thematicConcentration >= 45,
    variants: [
      { emoji: "🧠", ko: { title: "HBM이 곧 조국", description: "반도체 업황이 곧 내 경기입니다." }, en: { title: "HBM is home", description: "The chip cycle is the personal cycle." } },
      { emoji: "▣", ko: { title: "실리콘 포트폴리오", description: "웨이퍼 없이는 계좌가 허전합니다." }, en: { title: "Silicon portfolio", description: "The account feels empty without wafers." } },
      { emoji: "📈", ko: { title: "CAPEX 심박수", description: "투자 뉴스에 계좌가 반응합니다." }, en: { title: "CAPEX pulse", description: "Investment headlines move the mood." } },
    ],
  },
  {
    id: "biotech",
    family: "theme",
    priority: 80,
    relevance: ({ features }) => 35 + features.thematicConcentration,
    eligibility: ({ features }) => features.dominantTheme === "biotech" && features.thematicConcentration >= 40,
    variants: [
      { emoji: "🧪", ko: { title: "FDA와 운명공동체", description: "경제지표보다 임상 발표 날짜가 중요합니다." }, en: { title: "Tied to the FDA calendar", description: "Trial dates matter more than macro days." } },
      { emoji: "📄", ko: { title: "p-value 관찰자", description: "논문 초록을 실적 발표처럼 읽습니다." }, en: { title: "p-value watcher", description: "Abstracts read like earnings releases." } },
      { emoji: "⚗️", ko: { title: "임상 외길", description: "현금흐름보다 파이프라인을 먼저 봅니다." }, en: { title: "Clinical-trial lifer", description: "Pipeline comes before cash flow." } },
    ],
  },
  {
    id: "technology",
    family: "theme",
    priority: 76,
    relevance: ({ features }) => 25 + features.growthTilt,
    eligibility: ({ features }) => features.dominantTheme === "technology" && features.growthTilt >= 55,
    variants: [
      { emoji: "🖥️", ko: { title: "나스닥 시민권자", description: "빅테크가 세상을 먹는다고 믿습니다." }, en: { title: "Nasdaq citizen", description: "Big Tech eating the world is the base case." } },
      { emoji: "☁️", ko: { title: "서버 냄새 납니다", description: "클라우드 매출이 금리보다 먼저 보입니다." }, en: { title: "Smells like servers", description: "Cloud revenue shows up before rates." } },
    ],
  },
  {
    id: "space",
    family: "theme",
    priority: 74,
    relevance: ({ features }) => (features.dominantTheme === "space" ? 85 : 0),
    eligibility: ({ features }) => features.dominantTheme === "space",
    variants: [
      { emoji: "🚀", ko: { title: "포트폴리오가 궤도에 있습니다", description: "지상보다 우주에서 답을 찾습니다." }, en: { title: "Portfolio in orbit", description: "This allocation keeps looking upward." } },
      { emoji: "🛰️", ko: { title: "발사 일정 추적자", description: "경제지표보다 로켓 캘린더가 중요합니다." }, en: { title: "Launch-calendar watcher", description: "Launch dates outrank macro dates." } },
    ],
  },
  {
    id: "bogle",
    family: "broad-etf",
    priority: 70,
    relevance: ({ features }) => features.broadEtfExposure,
    eligibility: ({ features }) => features.broadEtfExposure >= 50,
    variants: [
      { emoji: "📚", ko: { title: "존 보글이 흐뭇해합니다", description: "시장 이기기를 포기했더니 마음이 편해졌습니다." }, en: { title: "John Bogle approves", description: "You stopped trying to beat the market and found peace." } },
      { emoji: "🧺", ko: { title: "시장 전체 매수자", description: "종목 고르기 귀찮아서 시장을 샀습니다." }, en: { title: "Whole-market buyer", description: "You skipped stock picking and bought the market." } },
    ],
  },
  {
    id: "defensive",
    family: "defensive",
    priority: 66,
    relevance: ({ features }) => features.defensiveTilt,
    eligibility: ({ features }) => features.defensiveTilt >= 35,
    variants: [
      { emoji: "🛡️", ko: { title: "오늘 밤도 편하게 잡니다", description: "남들이 수익률 볼 때 나는 생존율을 봅니다." }, en: { title: "Sleeps tonight", description: "Other people track returns. You track survival odds." } },
      { emoji: "🧯", ko: { title: "폭락장 소화기", description: "계좌에 방어 장비가 들어 있습니다." }, en: { title: "Crash extinguisher", description: "The account has defensive equipment." } },
    ],
  },
  {
    id: "cash",
    family: "cash",
    priority: 62,
    relevance: ({ features }) => features.cashExposure,
    eligibility: ({ features }) => features.cashExposure >= 25,
    variants: [
      { emoji: "💵", ko: { title: "아직 안 샀습니다", description: "더 내려오면 이야기하자는 태도입니다." }, en: { title: "Still not buying", description: "Lower prices can talk." } },
      { emoji: "🧊", ko: { title: "현금도 포지션", description: "기다림을 투자 전략으로 채택했습니다." }, en: { title: "Cash is a position", description: "Waiting became part of the strategy." } },
    ],
  },
  {
    id: "gold",
    family: "gold",
    priority: 58,
    relevance: ({ features }) => features.commodityExposure,
    eligibility: ({ features }) => features.dominantTheme === "gold" || features.commodityExposure >= 25,
    variants: [
      { emoji: "🥇", ko: { title: "중앙은행보다 금을 믿습니다", description: "화폐는 종이지만 금은 금입니다." }, en: { title: "Gold-standard believer", description: "Paper is paper. Gold is gold." } },
    ],
  },
  {
    id: "diversified",
    family: "diversification",
    priority: 50,
    relevance: ({ holdings, features }) => Math.min(85, holdings.length * 2 + features.effectiveNumberOfPositions * 4),
    eligibility: ({ holdings, features }) => holdings.length >= 8 && features.effectiveNumberOfPositions >= 5,
    variants: [
      { emoji: "🧺", ko: { title: "계란을 잘 나눴습니다", description: "종목 수만 많은 게 아니라 실제로도 꽤 나뉘어 있습니다." }, en: { title: "Eggs properly spread", description: "Many names, and the weights are not fake-diversified." } },
      { emoji: "⚖️", ko: { title: "리스크 관리팀 칭찬", description: "재미는 덜해도 균형감이 보입니다." }, en: { title: "Risk team nods", description: "Less dramatic, but the balance shows." } },
    ],
  },
  {
    id: "fallback",
    family: "fallback",
    priority: 10,
    relevance: ({ risk }) => (risk.score < 60 ? 30 : 12),
    eligibility: () => true,
    variants: [
      { emoji: "⚖️", ko: { title: "균형 감각 보유자", description: "튀지는 않지만 오래 살아남는 쪽입니다." }, en: { title: "Balanced enough", description: "Not too spicy. Not too sleepy." } },
      { emoji: "🧭", ko: { title: "방향은 있습니다", description: "아직 캐릭터가 과하진 않지만 흐름은 보입니다." }, en: { title: "There is a direction", description: "Not too extreme, but the shape is there." } },
    ],
  },
];

export function companyBadgeTitle(ticker: string, weight: number) {
  const profile = Object.values(memeProfiles).find((item) => item.ticker === ticker);
  if (!profile) return null;
  if (weight >= 75) return profile.concentrationTitles?.extreme?.[0] ?? null;
  if (weight >= 60) return profile.concentrationTitles?.extreme?.[1] ?? profile.concentrationTitles?.high?.[0] ?? null;
  if (weight >= 40) return profile.concentrationTitles?.high?.[0] ?? profile.concentrationTitles?.moderate?.[0] ?? null;
  return null;
}
