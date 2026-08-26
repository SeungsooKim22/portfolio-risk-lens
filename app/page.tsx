"use client";

import { useMemo, useRef, useState } from "react";
import { analyzePortfolioText } from "../lib/analytics/analyzePortfolio";
import { groupWeights } from "../lib/analytics/calculateFeatures";
import { generateBadges } from "../lib/personality/generateBadges";
import { generateCharacter } from "../lib/personality/generateCharacter";
import { normalizeSecurityName, resolveSecurity } from "../lib/portfolio/resolveSecurity.ts";
import { aliases } from "../data/aliases.ts";
import { securityMaster } from "../data/securityMaster.ts";
import type { PortfolioFeatures, RiskBreakdownItem, ScenarioResult } from "../types/analytics.ts";
import type { NormalizedPosition } from "../types/portfolio.ts";
import type { Security } from "../types/security.ts";
import type { Badge, Lang, RiskCharacter } from "../types/personality.ts";

type DraftPosition = {
  id: string;
  rawName: string;
  weight: number;
};

type SecurityOption = {
  ticker: string;
  companyName: string;
  exchange?: string;
  aliases: string[];
  security: Security;
};

type Tone = ReturnType<typeof toneForScore>;

const labels = {
  ko: {
    brand: "Portfolio Risk Lens",
    eyebrow: "재미있는 리스크 성향 테스트",
    headline: "내 포트폴리오, 얼마나 위험할까?",
    subhead: "종목과 비중을 넣으면 리스크 점수부터 투자자 캐릭터까지 분석해드려요. 그리고 조금 놀려드립니다.",
    inputTitle: "포트폴리오 넣기",
    riskMeaningTitle: "리스크 점수는 낮을수록 안정적이에요.",
    riskMeaning: "0 = 매우 안정적 · 100 = 상당히 공격적. 높은 점수는 높은 수익 보장이 아니라 높은 변동성, 집중도, 하방 위험 가능성을 뜻해요.",
    searchLabel: "종목 검색",
    searchPlaceholder: "AAPL, Apple, 애플, 삼성전자...",
    weightLabel: "비중",
    weightPlaceholder: "25",
    add: "추가",
    popular: "인기 종목",
    recent: "최근 입력",
    holdings: "입력한 종목",
    currentAllocation: "현재 비중",
    left: "남았습니다.",
    complete: "포트폴리오 완성",
    over: "초과됐어요.",
    equalWeight: "전부 같은 비중",
    pasteTitle: "여러 줄 붙여넣기",
    pastePlaceholder: "AAPL 25%\nNVDA 20%\n삼성전자 15%",
    pasteApply: "붙여넣기 반영",
    analyze: "내 포트폴리오 분석하기",
    sample: "샘플",
    clear: "비우기",
    save: "이미지 저장",
    share: "공유",
    score: "리스크 점수",
    lowerSafer: "낮을수록 안정적",
    safer: "안정적",
    riskier: "공격적",
    personality: "투자자 캐릭터",
    badges: "획득한 칭호",
    keyInsight: "한 줄 요약",
    largest: "가장 큰 비중",
    concentration: "집중도",
    volatility: "변동성",
    effectiveN: "실질 분산 종목 수",
    allocation: "자산 구성",
    sectors: "섹터",
    regions: "국내/해외",
    stress: "시나리오",
    scoreWhy: "이 점수를 만든 이유",
    biggestReason: "가장 큰 이유",
    detail: "상세 분석",
    methodology: "리스크 점수는 어떻게 계산되나요?",
    methodologyText: "변동성, 하방 위험, 종목 집중도, 시장 민감도, 레버리지, 개별기업 위험을 종합해 계산합니다. 미래 수익률을 예측하는 점수는 아닙니다.",
    disclaimer: "재미와 참고를 위한 분석이며 투자 권유나 미래 수익률 예측이 아닙니다.",
    unknown: "이 종목은 아직 잘 모르겠어요. 티커를 한번 확인해주세요.",
    missingWeight: "비중 하나가 비어 있어요. 저도 계산은 숫자가 있어야 합니다.",
    allocationLow: "아직 포트폴리오가 덜 찼어요.",
    allocationHigh: "포트폴리오가 100%를 넘었어요. 레버리지는 아직 입력 기능에 없습니다.",
    normalized: "소수점 차이는 100% 기준으로 맞춰 분석했어요.",
    noShare: "이 브라우저에서는 이미지 저장으로 공유해주세요.",
    experimentalImport: "캡처 업로드는 v1에서 실험 기능으로 숨겨두었습니다.",
  },
  en: {
    brand: "Portfolio Risk Lens",
    eyebrow: "A playful portfolio risk test",
    headline: "How risky is your portfolio, really?",
    subhead: "Enter tickers and weights to get a serious risk score, a personality result, and a small roast.",
    inputTitle: "Add your portfolio",
    riskMeaningTitle: "Lower risk score means lower portfolio risk.",
    riskMeaning: "0 = very stable · 100 = very aggressive. A high score means volatility, concentration, or downside risk, not guaranteed return.",
    searchLabel: "Security search",
    searchPlaceholder: "AAPL, Apple, Samsung...",
    weightLabel: "Weight",
    weightPlaceholder: "25",
    add: "Add",
    popular: "Popular",
    recent: "Recently used",
    holdings: "Holdings",
    currentAllocation: "Current allocation",
    left: "left.",
    complete: "Portfolio complete",
    over: "over.",
    equalWeight: "Equal weight all",
    pasteTitle: "Paste multiple lines",
    pastePlaceholder: "AAPL 25%\nNVDA 20%\nSamsung 15%",
    pasteApply: "Apply paste",
    analyze: "Analyze my portfolio",
    sample: "Sample",
    clear: "Clear",
    save: "Save image",
    share: "Share",
    score: "Risk score",
    lowerSafer: "Lower is safer",
    safer: "Safer",
    riskier: "Riskier",
    personality: "Investor persona",
    badges: "Badges earned",
    keyInsight: "Quick read",
    largest: "Largest holding",
    concentration: "Concentration",
    volatility: "Volatility",
    effectiveN: "Effective holdings",
    allocation: "Asset mix",
    sectors: "Sectors",
    regions: "Regions",
    stress: "Scenarios",
    scoreWhy: "What made this score",
    biggestReason: "Biggest reason",
    detail: "Details",
    methodology: "How is the risk score calculated?",
    methodologyText: "It combines volatility, downside risk, concentration, market sensitivity, leverage, and company-specific risk. It does not predict future returns.",
    disclaimer: "For fun and educational reference only. Not investment advice or a return forecast.",
    unknown: "I do not know this security yet. Please check the ticker.",
    missingWeight: "One weight is missing. The math still needs numbers.",
    allocationLow: "The portfolio is not filled yet.",
    allocationHigh: "The portfolio is above 100%. Leverage is not an input feature here.",
    normalized: "Tiny rounding differences were normalized to 100%.",
    noShare: "This browser cannot share files directly. Please save the image.",
    experimentalImport: "Screenshot upload is hidden as an experimental v1 feature.",
  },
};

const sampleRows: DraftPosition[] = [
  { id: "sample-aapl", rawName: "AAPL", weight: 25 },
  { id: "sample-msft", rawName: "MSFT", weight: 20 },
  { id: "sample-nvda", rawName: "NVDA", weight: 20 },
  { id: "sample-spy", rawName: "SPY", weight: 20 },
  { id: "sample-tlt", rawName: "TLT", weight: 10 },
  { id: "sample-gld", rawName: "GLD", weight: 5 },
];

const popularTickers = ["AAPL", "NVDA", "TSLA", "MSFT", "QQQ", "VOO", "SCHD", "005930", "000660", "ABCL", "TQQQ", "GLD"];
const screenshotImportEnabled = false;

const translations: Record<string, string> = {
  "US Equity": "미국 주식",
  "US Equity ETF": "미국 주식 ETF",
  "Global Equity ETF": "글로벌 주식 ETF",
  "Global Equity": "글로벌 주식",
  "Korea Equity": "한국 주식",
  "Private Equity": "비상장 주식",
  "Long Bonds": "장기채",
  Bonds: "채권",
  Commodity: "원자재",
  Crypto: "가상자산",
  Cash: "현금",
  "Unclassified Equity": "미분류 주식",
  Technology: "기술",
  "Consumer Discretionary": "경기소비재",
  "Consumer Staples": "필수소비재",
  "Communication Services": "커뮤니케이션",
  "Health Care": "헬스케어",
  Financials: "금융",
  Industrials: "산업재",
  Materials: "소재",
  Energy: "에너지",
  Aerospace: "우주항공",
  "Broad Market": "광범위 시장",
  "Technology Tilt": "기술주 중심",
  "Dividend / Quality": "배당/퀄리티",
  "Technology Income": "기술주 인컴",
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

export default function Home() {
  const [lang, setLang] = useState<Lang>("ko");
  const [draftRows, setDraftRows] = useState<DraftPosition[]>(sampleRows);
  const [analysisInput, setAnalysisInput] = useState(buildPortfolioInput(sampleRows));
  const [query, setQuery] = useState("");
  const [weight, setWeight] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [recentTickers, setRecentTickers] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);
  const t = labels[lang];

  const options = useMemo(() => buildSecurityOptions(), []);
  const suggestions = useMemo(() => searchSecurities(query, options, recentTickers), [query, options, recentTickers]);
  const draftTotal = totalWeight(draftRows);
  const analysis = useMemo(() => analyzePortfolioText(analysisInput), [analysisInput]);
  const normalized = analysis.portfolio.positions;
  const sorted = [...normalized].sort((a, b) => b.weight - a.weight);
  const topHolding = sorted[0] ?? null;
  const sectors = groupedForUi(groupWeights(normalized, (item) => item.security.sector || "Unknown"), lang);
  const assets = groupedForUi(groupWeights(normalized, (item) => item.security.assetLabel || item.security.assetType), lang);
  const regions = groupedForUi(groupWeights(normalized, (item) => item.security.region || "Unknown"), lang);
  const riskScore = Number(analysis.risk.score.toFixed(1));
  const tone = toneForScore(riskScore);
  const personality = generateCharacter(normalized, analysis.features, analysis.risk, lang);
  const badges = generateBadges(normalized, analysis.features, analysis.risk, lang);
  const insight = keyInsight(normalized, analysis.features, riskScore, lang);
  const mascot = mascotFor(personality.dominantTrait, riskScore);
  const allocationIssue = allocationMessage(draftTotal, t);
  const hasUnknownDraft = draftRows.some((row) => row.rawName && resolveSecurity(row.rawName).resolution === "fallback");
  const canAnalyze = draftRows.length > 0 && draftRows.every((row) => row.weight > 0) && draftTotal >= 98 && draftTotal <= 102;

  function addHolding(name = query, rawWeight = weight) {
    const cleaned = name.trim();
    const parsedWeight = Number.parseFloat(rawWeight);
    if (!cleaned) return;
    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      setInputMessage(t.missingWeight);
      weightRef.current?.focus();
      return;
    }

    const resolved = resolveSecurity(cleaned);
    const nextRows = [...draftRows, { id: `${cleaned}-${Date.now()}`, rawName: cleaned, weight: parsedWeight }];
    setDraftRows(nextRows);
    setQuery("");
    setWeight("");
    setRecentTickers((items) => [resolved.ticker, ...items.filter((item) => item !== resolved.ticker)].slice(0, 6));
    setInputMessage(resolved.resolution === "fallback" ? t.unknown : "");
    window.setTimeout(() => searchRef.current?.focus(), 0);
  }

  function analyzeDraft() {
    if (!canAnalyze) {
      setInputMessage(allocationIssue);
      return;
    }
    setAnalysisInput(buildPortfolioInput(draftRows));
    setInputMessage(Math.abs(draftTotal - 100) > 0.05 ? t.normalized : "");
  }

  function applyPaste() {
    const parsed = parseDraftRows(pasteText);
    if (parsed.length === 0) return;
    setDraftRows(parsed);
    setInputMessage("");
  }

  function equalWeightAll() {
    if (draftRows.length === 0) return;
    const equal = 100 / draftRows.length;
    setDraftRows(draftRows.map((row) => ({ ...row, weight: equal })));
    setInputMessage("");
  }

  function updateRow(id: string, patch: Partial<DraftPosition>) {
    setDraftRows((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function removeRow(id: string) {
    setDraftRows((rows) => rows.filter((row) => row.id !== id));
  }

  function loadSample() {
    setDraftRows(sampleRows);
    setAnalysisInput(buildPortfolioInput(sampleRows));
    setInputMessage("");
  }

  function saveImage() {
    const canvas = drawShareCard({ lang, t, tone, riskScore, personality, badges, topHolding, features: analysis.features, insight, mascot });
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = lang === "ko" ? "portfolio-risk-lens.png" : "portfolio-risk-card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function shareImage() {
    const canvas = drawShareCard({ lang, t, tone, riskScore, personality, badges, topHolding, features: analysis.features, insight, mascot });
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
    <main className="min-h-screen overflow-hidden bg-[#fff5e6] text-[#1e211b]">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl gap-7 px-4 py-5 md:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-7">
        <div className="flex flex-col gap-5 lg:sticky lg:top-6 lg:h-[calc(100vh-48px)]">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-[#1e211b] text-sm font-black text-[#ffc767]">PRL</div>
              <div>
                <p className="text-sm font-black">{t.brand}</p>
                <p className="text-xs font-bold text-[#796d5e]">{t.eyebrow}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 rounded-full border border-[#e2cdaa] bg-white/70 p-1 text-xs font-black">
              <button onClick={() => setLang("ko")} className={`rounded-full px-3 py-2 ${lang === "ko" ? "bg-[#1e211b] text-white" : "text-[#6f6255]"}`}>KO</button>
              <button onClick={() => setLang("en")} className={`rounded-full px-3 py-2 ${lang === "en" ? "bg-[#1e211b] text-white" : "text-[#6f6255]"}`}>EN</button>
            </div>
          </header>

          <section className="grid gap-4">
            <div className="inline-flex w-fit rotate-[-1deg] rounded-full bg-[#ffd982] px-4 py-2 text-xs font-black text-[#362816] shadow-[4px_4px_0_#1e211b]">
              82.4 · {lang === "ko" ? "브레이크 없는 반도체 신봉자" : "No-brakes chip believer"}
            </div>
            <div>
              <h1 className="max-w-xl text-4xl font-black leading-[1.05] tracking-normal sm:text-5xl">{t.headline}</h1>
              <p className="mt-4 max-w-xl text-base font-bold leading-7 text-[#655a4d]">{t.subhead}</p>
            </div>
          </section>

          <section className="rounded-[18px] border-2 border-[#1e211b] bg-[#fffdf8] p-4 shadow-[7px_7px_0_#1e211b]">
            <div className="rounded-xl bg-[#fff0c9] p-3">
              <p className="text-sm font-black">{t.riskMeaningTitle}</p>
              <p className="mt-1 text-xs font-bold leading-5 text-[#685c4b]">{t.riskMeaning}</p>
            </div>

            <div className="mt-4 grid gap-3">
              <p className="text-lg font-black">{t.inputTitle}</p>
              <div className="grid gap-2 sm:grid-cols-[1fr_120px_74px]">
                <label className="grid gap-1 text-xs font-black text-[#655a4d]">
                  {t.searchLabel}
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        weightRef.current?.focus();
                      }
                    }}
                    placeholder={t.searchPlaceholder}
                    className="h-12 rounded-xl border-2 border-[#d9c29f] bg-white px-3 text-sm font-black outline-none transition focus:border-[#ff8a4c] focus:ring-4 focus:ring-[#ff8a4c]/20"
                  />
                </label>
                <label className="grid gap-1 text-xs font-black text-[#655a4d]">
                  {t.weightLabel}
                  <input
                    ref={weightRef}
                    value={weight}
                    inputMode="decimal"
                    onChange={(event) => setWeight(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addHolding();
                      }
                    }}
                    placeholder={t.weightPlaceholder}
                    className="h-12 rounded-xl border-2 border-[#d9c29f] bg-white px-3 text-sm font-black outline-none transition focus:border-[#ff8a4c] focus:ring-4 focus:ring-[#ff8a4c]/20"
                  />
                </label>
                <button type="button" onClick={() => addHolding()} className="self-end rounded-xl bg-[#1e211b] px-3 py-3 text-sm font-black text-white transition hover:translate-y-[-1px]">
                  {t.add}
                </button>
              </div>

              <SuggestionStrip
                title={query.trim() ? t.searchLabel : recentTickers.length > 0 ? t.recent : t.popular}
                suggestions={suggestions}
                query={query}
                onPick={(option) => {
                  setQuery(query.trim() ? query.trim() : option.ticker);
                  weightRef.current?.focus();
                }}
              />

              <AllocationMeter total={draftTotal} t={t} />
              {hasUnknownDraft && <p className="text-xs font-black text-[#af4e35]">{t.unknown}</p>}
              {inputMessage && <p className="rounded-lg bg-[#fff2d8] px-3 py-2 text-xs font-black text-[#8b5532]">{inputMessage}</p>}

              <div className="overflow-hidden rounded-xl border-2 border-[#ead3ad] bg-white">
                <div className="flex items-center justify-between border-b border-[#ead3ad] px-3 py-2">
                  <p className="text-sm font-black">{t.holdings}</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={equalWeightAll} className="rounded-full bg-[#fff0c9] px-3 py-1.5 text-xs font-black text-[#4a3823]">
                      {t.equalWeight}
                    </button>
                    <button type="button" onClick={() => setDraftRows([])} className="rounded-full bg-[#f9e0d5] px-3 py-1.5 text-xs font-black text-[#8d432d]">
                      {t.clear}
                    </button>
                  </div>
                </div>
                <div className="max-h-56 overflow-auto">
                  {draftRows.map((row) => {
                    const resolved = resolveSecurity(row.rawName);
                    return (
                      <div key={row.id} className="grid grid-cols-[1fr_92px_52px] items-center gap-2 border-b border-[#f1dfc1] px-3 py-2 last:border-b-0">
                        <div className="min-w-0">
                          <input
                            value={row.rawName}
                            onChange={(event) => updateRow(row.id, { rawName: event.target.value })}
                            className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm font-black outline-none focus:border-[#ff8a4c] focus:bg-[#fffaf1]"
                          />
                          <p className="truncate px-2 text-[11px] font-bold text-[#817363]">
                            {resolved.resolution === "fallback" ? t.unknown : `${resolved.ticker} · ${resolved.security.companyName}`}
                          </p>
                        </div>
                        <input
                          value={formatInputWeight(row.weight)}
                          inputMode="decimal"
                          onChange={(event) => updateRow(row.id, { weight: Number.parseFloat(event.target.value) || 0 })}
                          className="rounded-lg border border-[#ead3ad] bg-[#fffaf1] px-2 py-2 text-sm font-black outline-none focus:border-[#ff8a4c]"
                        />
                        <button type="button" onClick={() => removeRow(row.id)} className="rounded-lg bg-[#f7e8dc] py-2 text-xs font-black text-[#91462f]">
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <details className="rounded-xl border border-[#ead3ad] bg-[#fffaf1] p-3">
                <summary className="cursor-pointer text-sm font-black">{t.pasteTitle}</summary>
                <textarea
                  value={pasteText}
                  onChange={(event) => setPasteText(event.target.value)}
                  placeholder={t.pastePlaceholder}
                  className="mt-3 min-h-28 w-full resize-none rounded-xl border border-[#ead3ad] bg-white p-3 font-mono text-xs leading-5 outline-none focus:border-[#ff8a4c]"
                />
                <button type="button" onClick={applyPaste} className="mt-2 rounded-xl bg-[#1e211b] px-3 py-2 text-xs font-black text-white">
                  {t.pasteApply}
                </button>
              </details>

              {screenshotImportEnabled && <p className="text-xs font-bold text-[#796d5e]">{t.experimentalImport}</p>}

              <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                <button type="button" onClick={analyzeDraft} className={`rounded-xl px-4 py-3 text-sm font-black transition ${canAnalyze ? "bg-[#ff8a4c] text-[#1e211b] shadow-[4px_4px_0_#1e211b] hover:translate-y-[-1px]" : "bg-[#e5d4ba] text-[#7b6e5d]"}`}>
                  {t.analyze}
                </button>
                <button type="button" onClick={loadSample} className="rounded-xl bg-white px-3 py-3 text-sm font-black text-[#1e211b] ring-2 ring-[#ead3ad]">
                  {t.sample}
                </button>
                <button type="button" onClick={saveImage} className="rounded-xl bg-[#1e211b] px-3 py-3 text-sm font-black text-white">
                  {t.save}
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-5">
          <ShareCard
            t={t}
            lang={lang}
            tone={tone}
            riskScore={riskScore}
            personality={personality}
            badges={badges}
            topHolding={topHolding}
            features={analysis.features}
            insight={insight}
            mascot={mascot}
            onSave={saveImage}
            onShare={shareImage}
          />

          <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[18px] border-2 border-[#1e211b] bg-[#fffdf8] p-5">
              <h2 className="text-xl font-black">{t.scoreWhy}</h2>
              <p className="mt-2 text-sm font-bold text-[#675c50]">
                {t.biggestReason}: {biggestRiskReason(analysis.risk.breakdown, lang)}
              </p>
              <div className="mt-4 grid gap-3">
                {analysis.risk.breakdown.map((item) => (
                  <BreakdownRow key={item.key} item={item} lang={lang} />
                ))}
              </div>
            </div>

            <div className="rounded-[18px] border-2 border-[#1e211b] bg-[#fffdf8] p-5">
              <h2 className="text-xl font-black">{t.detail}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniMetric label={t.largest} value={topHolding ? `${topHolding.displayName} ${fmt(topHolding.weight)}` : "-"} />
                <MiniMetric label={t.concentration} value={concentrationLabel(analysis.features, lang)} />
                <MiniMetric label={t.volatility} value={fmt(analysis.features.annualizedVolatility)} />
                <MiniMetric label={t.effectiveN} value={analysis.features.effectiveNumberOfPositions.toFixed(1)} />
              </div>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-3">
            <ExposurePanel title={t.allocation} data={assets} accent="#ff8a4c" />
            <ExposurePanel title={t.sectors} data={sectors} accent="#6fbf8f" />
            <ExposurePanel title={t.regions} data={regions} accent="#7784d8" />
          </section>

          <section className="rounded-[18px] border-2 border-[#1e211b] bg-[#fffdf8] p-5">
            <h2 className="text-xl font-black">{t.stress}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {analysis.scenarios.map((scenario) => (
                <ScenarioTile key={scenario.key} scenario={scenario} lang={lang} />
              ))}
            </div>
          </section>

          <details className="rounded-[18px] border-2 border-[#e5c99e] bg-[#fffaf1] p-5">
            <summary className="cursor-pointer text-sm font-black">{t.methodology}</summary>
            <p className="mt-3 text-sm font-bold leading-6 text-[#675c50]">{t.methodologyText}</p>
            <p className="mt-3 text-xs font-bold leading-5 text-[#837363]">{t.disclaimer}</p>
          </details>
        </div>
      </section>
    </main>
  );
}

function SuggestionStrip({
  title,
  suggestions,
  query,
  onPick,
}: {
  title: string;
  suggestions: SecurityOption[];
  query: string;
  onPick: (option: SecurityOption) => void;
}) {
  if (suggestions.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-black text-[#796d5e]">{title}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {suggestions.slice(0, query.trim() ? 8 : 10).map((option) => (
          <button
            key={`${option.ticker}-${option.companyName}`}
            type="button"
            onClick={() => onPick(option)}
            className="shrink-0 rounded-full border border-[#ead3ad] bg-white px-3 py-2 text-left text-xs font-black text-[#2a271f] transition hover:border-[#ff8a4c]"
          >
            {option.ticker} <span className="font-bold text-[#827463]">{option.companyName}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AllocationMeter({ total, t }: { total: number; t: (typeof labels)[Lang] }) {
  const clamped = Math.min(120, Math.max(0, total));
  const status =
    total < 98
      ? `${fmt(100 - total)} ${t.left}`
      : total <= 102
        ? t.complete
        : `${fmt(total - 100)} ${t.over}`;
  return (
    <div className="rounded-xl bg-[#1e211b] p-3 text-white">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black">{t.currentAllocation}</p>
        <p className="text-sm font-black">{total.toFixed(1)} / 100%</p>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/20">
        <div className={`h-full rounded-full ${total > 102 ? "bg-[#ff5e45]" : total >= 98 ? "bg-[#78d88f]" : "bg-[#ffd36f]"}`} style={{ width: `${Math.min(100, clamped)}%` }} />
      </div>
      <p className="mt-2 text-xs font-bold text-white/80">{status}</p>
    </div>
  );
}

function ShareCard({
  t,
  lang,
  tone,
  riskScore,
  personality,
  badges,
  topHolding,
  features,
  insight,
  mascot,
  onSave,
  onShare,
}: {
  t: (typeof labels)[Lang];
  lang: Lang;
  tone: Tone;
  riskScore: number;
  personality: RiskCharacter;
  badges: Badge[];
  topHolding: NormalizedPosition | null;
  features: PortfolioFeatures;
  insight: string;
  mascot: ReturnType<typeof mascotFor>;
  onSave: () => void;
  onShare: () => void;
}) {
  return (
    <section className="rounded-[24px] border-2 border-[#1e211b] p-4 shadow-[10px_10px_0_#1e211b]" style={{ backgroundColor: tone.card }}>
      <div className="grid gap-5 lg:grid-cols-[1fr_180px]">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-normal" style={{ color: tone.muted }}>{t.brand}</p>
              <div className="mt-3 flex items-end gap-3">
                <h2 className="text-7xl font-black leading-none tracking-normal" style={{ color: tone.ink }}>{riskScore.toFixed(1)}</h2>
                <p className="pb-2 text-sm font-black" style={{ color: tone.accent }}>/100 {t.score}</p>
              </div>
              <p className="mt-2 text-sm font-black" style={{ color: tone.muted }}>{t.lowerSafer}</p>
            </div>
            <div className="grid h-32 w-32 rotate-[3deg] place-items-center rounded-[28px] border-2 border-[#1e211b] text-6xl shadow-[5px_5px_0_#1e211b]" style={{ backgroundColor: mascot.bg }}>
              {mascot.icon}
            </div>
          </div>

          <RiskMeter score={riskScore} t={t} tone={tone} />

          <div className="mt-6">
            <p className="text-xs font-black uppercase tracking-normal" style={{ color: tone.accent }}>{t.personality}</p>
            <h3 className="mt-2 max-w-2xl text-4xl font-black leading-tight tracking-normal" style={{ color: tone.ink }}>{personality.name}</h3>
            <p className="mt-3 max-w-2xl text-lg font-black leading-7" style={{ color: tone.muted }}>&quot;{personality.quote}&quot;</p>
          </div>
        </div>

        <div className="grid content-start gap-3">
          <p className="text-xs font-black uppercase tracking-normal" style={{ color: tone.accent }}>{t.badges}</p>
          {badges.map((badge) => (
            <div key={badge.id} className="rounded-2xl border-2 border-[#1e211b] bg-white/75 p-3">
              <p className="text-sm font-black" style={{ color: tone.ink }}>{badge.emoji} {badge.title}</p>
              <p className="mt-1 text-xs font-bold leading-5" style={{ color: tone.muted }}>{badge.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 border-t-2 border-[#1e211b]/15 pt-4 sm:grid-cols-3">
        <MiniMetric label={t.keyInsight} value={insight} />
        <MiniMetric label={t.largest} value={topHolding ? `${topHolding.displayName} ${fmt(topHolding.weight)}` : "-"} />
        <MiniMetric label={t.concentration} value={concentrationLabel(features, lang)} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={onSave} className="rounded-full bg-[#1e211b] px-4 py-2 text-sm font-black text-white">
          {t.save}
        </button>
        <button type="button" onClick={onShare} className="rounded-full bg-[#ffd36f] px-4 py-2 text-sm font-black text-[#1e211b] ring-2 ring-[#1e211b]">
          {t.share}
        </button>
      </div>
    </section>
  );
}

function RiskMeter({ score, t, tone }: { score: number; t: (typeof labels)[Lang]; tone: Tone }) {
  return (
    <div className="mt-5">
      <div className="flex justify-between text-xs font-black" style={{ color: tone.muted }}>
        <span>0 · {t.safer}</span>
        <span>100 · {t.riskier}</span>
      </div>
      <div className="relative mt-2 h-5 rounded-full border-2 border-[#1e211b] bg-[#6fbf8f]">
        <div className="absolute inset-y-0 right-0 w-2/3 rounded-r-full bg-gradient-to-r from-[#ffd36f] via-[#ff9a56] to-[#ef5a44]" />
        <div className="absolute top-1/2 h-9 w-4 -translate-y-1/2 rounded-full border-2 border-[#1e211b] bg-white shadow-[2px_2px_0_#1e211b]" style={{ left: `calc(${score}% - 8px)` }} />
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/70 p-3">
      <p className="text-[11px] font-black text-[#756858]">{label}</p>
      <p className="mt-1 text-sm font-black leading-5 text-[#1e211b]">{value}</p>
    </div>
  );
}

function BreakdownRow({ item, lang }: { item: RiskBreakdownItem; lang: Lang }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-sm font-black">
        <span>{lang === "ko" ? item.labelKo : item.labelEn}</span>
        <span>+{item.contribution.toFixed(1)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#f0dfc3]">
        <div className="h-full rounded-full bg-[#ff8a4c]" style={{ width: `${Math.min(100, item.contribution * 4)}%` }} />
      </div>
    </div>
  );
}

function ExposurePanel({ title, data, accent }: { title: string; data: [string, number][]; accent: string }) {
  return (
    <section className="rounded-[18px] border-2 border-[#1e211b] bg-[#fffdf8] p-5">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-4 grid gap-3">
        {data.slice(0, 5).map(([label, value]) => (
          <div key={label}>
            <div className="mb-1 flex items-center justify-between text-sm font-black">
              <span>{label}</span>
              <span>{fmt(value)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#f0dfc3]">
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, value)}%`, backgroundColor: accent }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ScenarioTile({ scenario, lang }: { scenario: ScenarioResult; lang: Lang }) {
  const label = lang === "ko" ? scenario.labelKo : scenario.labelEn;
  const value = scenario.value;
  return (
    <div className="rounded-2xl bg-[#fff4df] p-4">
      <p className="text-sm font-black">{label}</p>
      <p className={`mt-2 text-3xl font-black ${value < 0 ? "text-[#db553f]" : "text-[#2f8a59]"}`}>
        {value > 0 ? "+" : ""}{fmt(value)}
      </p>
      <p className="mt-2 text-xs font-bold leading-5 text-[#766858]">{scenarioComment(scenario.key, value, lang)}</p>
    </div>
  );
}

function buildSecurityOptions(): SecurityOption[] {
  const aliasMap = new Map<string, string[]>();
  Object.entries(aliases).forEach(([alias, ticker]) => {
    aliasMap.set(ticker, [...(aliasMap.get(ticker) ?? []), alias]);
  });
  return Object.values(securityMaster).map((security) => ({
    ticker: security.ticker,
    companyName: security.companyName,
    exchange: security.exchange,
    aliases: aliasMap.get(security.ticker) ?? [],
    security,
  }));
}

function searchSecurities(query: string, options: SecurityOption[], recentTickers: string[]) {
  const trimmed = query.trim();
  if (!trimmed) {
    const tickers = recentTickers.length > 0 ? recentTickers : popularTickers;
    return tickers.map((ticker) => options.find((option) => option.ticker === ticker)).filter((item): item is SecurityOption => Boolean(item));
  }
  const normalized = normalizeSecurityName(trimmed);
  const upper = trimmed.toUpperCase();
  return options
    .map((option) => {
      const company = normalizeSecurityName(option.companyName);
      const aliasScore = option.aliases.reduce((best, alias) => {
        if (alias === normalized) return Math.max(best, 95);
        if (alias.includes(normalized) || normalized.includes(alias)) return Math.max(best, 70);
        return best;
      }, 0);
      const score =
        option.ticker === upper
          ? 100
          : option.ticker.startsWith(upper)
            ? 82
            : company === normalized
              ? 92
              : company.includes(normalized)
                ? 76
                : aliasScore;
      return { option, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.option.ticker.localeCompare(b.option.ticker))
    .map((item) => item.option);
}

function parseDraftRows(value: string): DraftPosition[] {
  return value
    .split(/\n|,/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const match = line.match(/(.+?)\s+(-?\d+(?:\.\d+)?)\s*%?$/);
      return {
        id: `paste-${index}-${Date.now()}`,
        rawName: match?.[1]?.trim() || line,
        weight: Number.parseFloat(match?.[2] || "0") || 0,
      };
    })
    .filter((row) => row.rawName);
}

function buildPortfolioInput(rows: DraftPosition[]) {
  return rows
    .filter((row) => row.rawName.trim() && Number.isFinite(row.weight) && row.weight > 0)
    .map((row) => `${row.rawName.trim()} ${formatInputWeight(row.weight)}%`)
    .join("\n");
}

function totalWeight(rows: DraftPosition[]) {
  return rows.reduce((sum, row) => sum + (Number.isFinite(row.weight) ? row.weight : 0), 0);
}

function groupedForUi(groups: Record<string, number>, lang: Lang) {
  return Object.entries(groups)
    .map(([label, value]) => [lang === "ko" ? translations[label] ?? label : label, value] as [string, number])
    .sort((a, b) => b[1] - a[1]);
}

function toneForScore(score: number) {
  if (score < 35) return { card: "#eaf8e7", ink: "#1d2b20", muted: "#526352", accent: "#2e9d55" };
  if (score < 55) return { card: "#fff8d8", ink: "#302816", muted: "#6f6043", accent: "#d6922d" };
  if (score < 75) return { card: "#fff0df", ink: "#322116", muted: "#7b5b43", accent: "#e87537" };
  return { card: "#ffe6df", ink: "#321917", muted: "#7e4e48", accent: "#df4f3e" };
}

function mascotFor(trait: string, score: number) {
  if (trait === "semiconductor") return { icon: "▣", bg: "#dff2ff" };
  if (trait === "biotech") return { icon: "⚗", bg: "#e7f7df" };
  if (trait === "leverage") return { icon: "3×", bg: "#ffe1d3" };
  if (trait === "space") return { icon: "↗", bg: "#e7e5ff" };
  if (trait === "broadEtf") return { icon: "≋", bg: "#ecf8dc" };
  if (trait === "defensive" || score < 35) return { icon: "□", bg: "#dff4e6" };
  if (trait === "cash") return { icon: "$", bg: "#e9f9d5" };
  if (trait === "gold") return { icon: "Au", bg: "#fff0b8" };
  return { icon: "!", bg: score >= 75 ? "#ffd6ca" : "#ffe9c2" };
}

function keyInsight(positions: NormalizedPosition[], features: PortfolioFeatures, riskScore: number, lang: Lang) {
  const top = [...positions].sort((a, b) => b.weight - a.weight)[0];
  if (features.leveragedExposure >= 35) return lang === "ko" ? "변동성에 부스터가 달렸습니다." : "Volatility has a booster attached.";
  if (features.dominantTheme === "semiconductor" && features.thematicConcentration >= 55) return lang === "ko" ? "반도체에 꽤 진심이네요." : "This portfolio really believes in chips.";
  if (features.dominantTheme === "biotech" && features.thematicConcentration >= 45) return lang === "ko" ? "임상 발표가 계좌 이벤트입니다." : "Clinical readouts matter here.";
  if (top && top.weight >= 45) return lang === "ko" ? `${top.displayName}가 기침하면 계좌가 감기에 걸립니다.` : `If ${top.displayName} sneezes, the account catches a cold.`;
  if (features.broadEtfExposure >= 70 && riskScore < 35) return lang === "ko" ? "재미는 조금 없는데 계좌는 오래 삽니다." : "Less dramatic, probably more durable.";
  if (features.defensiveTilt >= 45) return lang === "ko" ? "수익 인증보다 생존 인증 쪽입니다." : "Survival has a seat at the table.";
  return lang === "ko" ? "선은 지키지만 욕심도 있습니다." : "Balanced, but not asleep.";
}

function concentrationLabel(features: PortfolioFeatures, lang: Lang) {
  if ((features.largestPositionWeight ?? 0) >= 60 || features.topThreeWeight >= 85) return lang === "ko" ? "매우 높음" : "Very high";
  if ((features.largestPositionWeight ?? 0) >= 35 || features.topThreeWeight >= 70) return lang === "ko" ? "높음" : "High";
  if (features.effectiveNumberOfPositions >= 10) return lang === "ko" ? "낮음" : "Low";
  return lang === "ko" ? "보통" : "Moderate";
}

function biggestRiskReason(items: RiskBreakdownItem[], lang: Lang) {
  const item = [...items].sort((a, b) => b.contribution - a.contribution)[0];
  return item ? (lang === "ko" ? item.labelKo : item.labelEn) : "-";
}

function scenarioComment(key: ScenarioResult["key"], value: number, lang: Lang) {
  if (key === "techSelloff" && value < -25) return lang === "ko" ? "시장보다 먼저 지하주차장에 도착할 수 있어요." : "It may reach the basement before the market does.";
  if (key === "recession" && value < -25) return lang === "ko" ? "경기침체에는 조금 예민한 편입니다." : "This one is sensitive to recessions.";
  if (key === "rateShock" && value < -12) return lang === "ko" ? "금리 뉴스에 계좌 표정이 바뀝니다." : "Rate headlines can change the account's mood.";
  if (value > 0) return lang === "ko" ? "이 시나리오에서는 방어력이 조금 보입니다." : "There is some ballast in this scenario.";
  return lang === "ko" ? "크게 이상하진 않지만 방심은 금물입니다." : "Not alarming, but worth watching.";
}

function allocationMessage(total: number, t: (typeof labels)[Lang]) {
  if (total < 98) return t.allocationLow;
  if (total > 102) return t.allocationHigh;
  return t.complete;
}

function drawShareCard({
  lang,
  t,
  tone,
  riskScore,
  personality,
  badges,
  topHolding,
  features,
  insight,
  mascot,
}: {
  lang: Lang;
  t: (typeof labels)[Lang];
  tone: Tone;
  riskScore: number;
  personality: RiskCharacter;
  badges: Badge[];
  topHolding: NormalizedPosition | null;
  features: PortfolioFeatures;
  insight: string;
  mascot: ReturnType<typeof mascotFor>;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#fff5e6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = tone.card;
  roundRect(ctx, 58, 58, 964, 1804, 42);
  ctx.fill();
  ctx.strokeStyle = "#1e211b";
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.fillStyle = tone.ink;
  ctx.font = "900 46px Arial";
  ctx.fillText(t.brand, 110, 150);
  ctx.font = "900 152px Arial";
  ctx.fillText(riskScore.toFixed(1), 110, 330);
  ctx.font = "900 42px Arial";
  ctx.fillStyle = tone.accent;
  ctx.fillText(`/100 ${t.score}`, 110, 390);
  ctx.fillStyle = tone.muted;
  ctx.font = "800 30px Arial";
  ctx.fillText(t.lowerSafer, 110, 438);

  ctx.fillStyle = mascot.bg;
  roundRect(ctx, 770, 145, 150, 150, 30);
  ctx.fill();
  ctx.strokeStyle = "#1e211b";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = tone.ink;
  ctx.font = "900 74px Arial";
  ctx.textAlign = "center";
  ctx.fillText(mascot.icon, 845, 245);
  ctx.textAlign = "left";

  drawCanvasRiskMeter(ctx, 110, 520, 860, riskScore, t);

  ctx.fillStyle = tone.accent;
  ctx.font = "900 30px Arial";
  ctx.fillText(t.personality, 110, 680);
  ctx.fillStyle = tone.ink;
  ctx.font = "900 74px Arial";
  wrapCanvasText(ctx, personality.name, 110, 780, 840, 84);
  ctx.fillStyle = tone.muted;
  ctx.font = "800 38px Arial";
  wrapCanvasText(ctx, `"${personality.quote}"`, 110, 965, 840, 48);

  ctx.fillStyle = tone.accent;
  ctx.font = "900 30px Arial";
  ctx.fillText(t.badges, 110, 1130);
  badges.slice(0, 3).forEach((badge, index) => {
    const y = 1180 + index * 126;
    ctx.fillStyle = "rgba(255,255,255,0.68)";
    roundRect(ctx, 110, y, 860, 96, 24);
    ctx.fill();
    ctx.fillStyle = tone.ink;
    ctx.font = "900 32px Arial";
    ctx.fillText(`${badge.emoji} ${badge.title}`, 138, y + 40);
    ctx.fillStyle = tone.muted;
    ctx.font = "700 24px Arial";
    ctx.fillText(badge.description, 138, y + 72);
  });

  const stats = [
    [t.keyInsight, insight],
    [t.largest, topHolding ? `${topHolding.displayName} ${fmt(topHolding.weight)}` : "-"],
    [t.concentration, concentrationLabel(features, lang)],
  ];
  stats.forEach(([label, value], index) => {
    const y = 1560 + index * 96;
    ctx.fillStyle = tone.muted;
    ctx.font = "800 25px Arial";
    ctx.fillText(label, 110, y);
    ctx.fillStyle = tone.ink;
    ctx.font = "900 32px Arial";
    wrapCanvasText(ctx, value, 110, y + 42, 820, 38);
  });

  return canvas;
}

function drawCanvasRiskMeter(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, score: number, t: (typeof labels)[Lang]) {
  ctx.fillStyle = "#6fbf8f";
  roundRect(ctx, x, y, width, 30, 15);
  ctx.fill();
  const gradient = ctx.createLinearGradient(x + width * 0.35, y, x + width, y);
  gradient.addColorStop(0, "#ffd36f");
  gradient.addColorStop(0.55, "#ff9a56");
  gradient.addColorStop(1, "#ef5a44");
  ctx.fillStyle = gradient;
  roundRect(ctx, x + width * 0.35, y, width * 0.65, 30, 15);
  ctx.fill();
  const markerX = x + (width * score) / 100;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, markerX - 10, y - 14, 20, 58, 9);
  ctx.fill();
  ctx.strokeStyle = "#1e211b";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#5b5045";
  ctx.font = "800 24px Arial";
  ctx.fillText(`0 · ${t.safer}`, x, y + 68);
  ctx.fillText(`100 · ${t.riskier}`, x + width - 180, y + 68);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
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

function fmt(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatInputWeight(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}
