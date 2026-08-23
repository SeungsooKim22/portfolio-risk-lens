"use client";

import { useMemo, useState } from "react";

type Lang = "ko" | "en";

type Holding = {
  ticker: string;
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
    story: "공유 카드",
    score: "리스크 점수",
    style: "투자 성향",
    mainRisk: "가장 눈에 띄는 위험",
    top3: "주요 보유 비중",
    largest: "가장 큰 비중",
    vol: "흔들림 예상",
    assets: "자산 구성",
    sectors: "섹터 노출",
    regions: "지역 노출",
    scenarios: "시장 충격 테스트",
    readout: "쉬운 해석",
    details: "상세 분석",
    notice: "교육용 간이 추정치입니다. 투자 조언이 아닙니다.",
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
    story: "Story card",
    score: "Risk score",
    style: "Investor style",
    mainRisk: "Main risk",
    top3: "Top 3",
    largest: "Largest holding",
    vol: "Estimated volatility",
    assets: "Asset mix",
    sectors: "Sector exposure",
    regions: "Regional exposure",
    scenarios: "Stress tests",
    readout: "Plain-English readout",
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
};

const translations: Record<string, string> = {
  "US Equity": "미국 주식",
  "US Equity ETF": "미국 주식 ETF",
  "Global Equity ETF": "글로벌 주식 ETF",
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
  International: "해외",
  Global: "글로벌",
  Local: "현지",
};

const sampleInput = "AAPL 25%\nMSFT 20%\nNVDA 20%\nSPY 20%\nTLT 10%\nGLD 5%";

function localize(label: string, lang: Lang) {
  return lang === "ko" ? translations[label] ?? label : label;
}

function parsePortfolio(value: string): Holding[] {
  return value
    .split(/\n|,/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawTicker, rawWeight] = line.split(/\s+/);
      const ticker = rawTicker.toUpperCase();
      const weight = Number.parseFloat((rawWeight || "0").replace("%", ""));
      const base = library[ticker] ?? {
        name: ticker,
        asset: "Unclassified Equity",
        sector: "Unknown",
        region: "Unknown",
        volatility: 30,
        stress: { techSelloff: -18, rateShock: -8, recession: -20, dollarDrop: -2 },
      };
      return { ticker, weight: Number.isFinite(weight) ? weight : 0, ...base };
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
  if (score >= 75) {
    return {
      page: "#eef8ef",
      ink: "#10231f",
      card: "#0d3b2e",
      cardSoft: "#15533f",
      accent: "#37d67a",
      accentSoft: "#bff3d2",
      stat: "#f6fff8",
      warning: "#ffb199",
    };
  }
  if (score >= 55) {
    return {
      page: "#fff7df",
      ink: "#2b2411",
      card: "#493a10",
      cardSoft: "#66501a",
      accent: "#f5ca45",
      accentSoft: "#ffec9f",
      stat: "#fffaf0",
      warning: "#ffad72",
    };
  }
  if (score >= 35) {
    return {
      page: "#fff0e5",
      ink: "#2f1d12",
      card: "#552a16",
      cardSoft: "#74391e",
      accent: "#f27a36",
      accentSoft: "#ffd0b2",
      stat: "#fff7f1",
      warning: "#ffb199",
    };
  }
  return {
    page: "#fff0f0",
    ink: "#2f1515",
    card: "#551d1d",
    cardSoft: "#733030",
    accent: "#ec4e4e",
    accentSoft: "#ffc5c5",
    stat: "#fff6f6",
    warning: "#ffb199",
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
  const concentrationScore = Math.min(100, topThree * 0.8 + (topHolding?.weight || 0) * 0.6);
  const riskScore = Math.round(Math.min(100, volatility * 1.55 + concentrationScore * 0.45));
  const style = getStyle(riskScore, lang);
  const tone = getTone(riskScore);
  const knownSectors = sectors.filter(([label]) => !isUnknownLabel(label));
  const unknownWeight = sectors.find(([label]) => isUnknownLabel(label))?.[1] ?? 0;
  const mainRisk = getMainRisk({
    lang,
    topHolding,
    topSector: knownSectors[0],
    unknownWeight,
  });
  const scenarios = [
    [lang === "ko" ? "나스닥 -20%" : "Nasdaq -20%", weighted(normalized, (item) => item.stress.techSelloff)],
    [lang === "ko" ? "금리 +1%" : "Rates +1%", weighted(normalized, (item) => item.stress.rateShock)],
    [lang === "ko" ? "경기침체" : "Recession", weighted(normalized, (item) => item.stress.recession)],
    [lang === "ko" ? "달러 약세" : "USD weakness", weighted(normalized, (item) => item.stress.dollarDrop)],
  ] as const;

  const insights = [
    unknownWeight > 35
      ? lang === "ko"
        ? `입력한 종목 중 ${fmt(unknownWeight)}는 아직 데이터가 부족해요.`
        : `${fmt(unknownWeight)} of the portfolio uses fallback classifications.`
      : topHolding && topHolding.weight > 25
      ? lang === "ko"
        ? `${topHolding.ticker} 하나가 전체의 ${fmt(topHolding.weight)}를 차지해요.`
        : `${topHolding.ticker} alone drives ${fmt(topHolding.weight)} of the portfolio.`
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
    ctx.fillStyle = "#f8f4ea";
    ctx.font = "800 42px Arial";
    ctx.fillText(t.brand, 104, 150);
    ctx.font = "700 100px Arial";
    ctx.fillText(`${riskScore}`, 104, 330);
    ctx.font = "800 42px Arial";
    ctx.fillStyle = tone.accent;
    ctx.fillText(`/100 ${t.score}`, 325, 330);
    ctx.fillStyle = "#f8f4ea";
    ctx.font = "800 78px Arial";
    wrapText(ctx, style, 104, 455, 820, 86);

    ctx.fillStyle = tone.cardSoft;
    ctx.fillRect(104, 680, 872, 230);
    ctx.fillStyle = tone.accentSoft;
    ctx.font = "800 32px Arial";
    ctx.fillText(t.mainRisk, 148, 755);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 60px Arial";
    wrapText(ctx, mainRisk, 148, 835, 760, 66);

    const statY = 1035;
    [
      [t.top3, fmt(topThree)],
      [t.largest, topHolding ? `${topHolding.ticker} ${fmt(topHolding.weight)}` : "-"],
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

    ctx.fillStyle = "#f8f4ea";
    ctx.font = "800 34px Arial";
    ctx.fillText(t.scenarios, 104, 1320);
    ctx.font = "700 34px Arial";
    scenarios.slice(0, 3).forEach(([label, value], index) => {
      const y = 1400 + index * 96;
      ctx.fillStyle = "#c9d8d1";
      ctx.fillText(label, 104, y);
      ctx.fillStyle = value < 0 ? tone.warning : tone.accentSoft;
      ctx.fillText(`${value > 0 ? "+" : ""}${fmt(value)}`, 770, y);
    });

    ctx.fillStyle = "#c9d8d1";
    ctx.font = "400 26px Arial";
    wrapText(ctx, t.notice, 104, 1760, 820, 34);
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
        await navigator.share({ title: t.brand, text: style, files: [file] });
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
              style={style}
              mainRisk={mainRisk}
              topThree={topThree}
              topHolding={topHolding}
              volatility={volatility}
              scenarios={scenarios}
              tone={tone}
            />
            <section className="rounded-lg p-5 text-white shadow-xl" style={{ backgroundColor: tone.card }}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-[#95d5b2]">{t.score}</p>
                  <h2 className="mt-2 text-4xl font-black">{riskScore}/100</h2>
                </div>
                <div className="rounded-md bg-white/10 px-4 py-3 text-right">
                  <p className="text-xs text-[#c9d8d1]">{t.style}</p>
                  <p className="max-w-56 text-xl font-black" style={{ color: tone.accent }}>{style}</p>
                </div>
              </div>
              <div className="mt-5 h-4 rounded-full bg-white/10">
                <div className="h-4 rounded-full" style={{ width: `${riskScore}%`, backgroundColor: tone.accent }} />
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Metric label={t.top3} value={fmt(topThree)} />
                <Metric label={t.largest} value={topHolding ? `${topHolding.ticker} ${fmt(topHolding.weight)}` : "-"} />
                <Metric label={t.vol} value={fmt(volatility)} />
              </div>
              <div className="mt-5 rounded-md bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[#95d5b2]">{t.mainRisk}</p>
                <p className="mt-2 text-2xl font-black">{mainRisk}</p>
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
                    <span className={`text-xl font-black ${value < 0 ? "text-[#c34e32]" : "text-[#2f7d6d]"}`}>{value > 0 ? "+" : ""}{fmt(value)}</span>
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
            <p className="mt-4 text-xs leading-5 text-[#6d7b76]">{t.notice}</p>
          </section>
        </div>
      </section>
    </main>
  );
}

function getStyle(score: number, lang: Lang) {
  if (score >= 78) return lang === "ko" ? "초록불 성장러" : "Green-light growth";
  if (score >= 58) return lang === "ko" ? "노란불 성장형" : "Yellow-light growth";
  if (score >= 38) return lang === "ko" ? "주황불 점검형" : "Orange-light watchlist";
  return lang === "ko" ? "빨간불 방어 필요" : "Red-light defensive";
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
    return lang === "ko" ? `${topHolding.ticker} 비중 과다` : `${topHolding.ticker} concentration`;
  }
  if (unknownWeight > 35) {
    return lang === "ko" ? "종목 정보 부족" : "Limited ticker data";
  }
  return lang === "ko" ? "하락장 민감도" : "Market drawdown sensitivity";
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white/10 p-4">
      <p className="text-xs text-[#c9d8d1]">{label}</p>
      <p className="mt-1 break-words text-xl font-black">{value}</p>
    </div>
  );
}

function StoryCard({
  t,
  riskScore,
  style,
  mainRisk,
  topThree,
  topHolding,
  volatility,
  scenarios,
  tone,
}: {
  t: (typeof labels)[Lang];
  riskScore: number;
  style: string;
  mainRisk: string;
  topThree: number;
  topHolding: Holding | null;
  volatility: number;
  scenarios: readonly (readonly [string, number])[];
  tone: ReturnType<typeof getTone>;
}) {
  return (
    <section className="mx-auto w-full max-w-[390px] rounded-lg p-5 text-white shadow-xl" style={{ backgroundColor: tone.card }}>
      <div className="aspect-[9/16] rounded-md border border-white/10 p-6" style={{ backgroundColor: tone.card }}>
        <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: tone.accent }} />
        <p className="mt-8 text-sm font-black uppercase tracking-[0.16em]" style={{ color: tone.accentSoft }}>{t.story}</p>
        <p className="mt-5 text-7xl font-black tracking-normal text-[#f8f4ea]">{riskScore}</p>
        <p className="text-2xl font-black" style={{ color: tone.accent }}>/100 {t.score}</p>
        <h2 className="mt-8 text-4xl font-black leading-tight text-[#f8f4ea]">{style}</h2>
        <div className="mt-8 rounded-md p-4" style={{ backgroundColor: tone.cardSoft }}>
          <p className="text-xs font-black uppercase tracking-[0.14em]" style={{ color: tone.accentSoft }}>{t.mainRisk}</p>
          <p className="mt-2 break-words text-2xl font-black">{mainRisk}</p>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-[#10231f]">
          <SmallStat label={t.top3} value={fmt(topThree)} tone={tone} />
          <SmallStat label={t.largest} value={topHolding ? topHolding.ticker : "-"} tone={tone} />
          <SmallStat label={t.vol} value={fmt(volatility)} tone={tone} />
        </div>
        <div className="mt-7 space-y-3">
          {scenarios.slice(0, 3).map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 text-sm font-black">
              <span className="text-[#c9d8d1]">{label}</span>
              <span style={{ color: value < 0 ? tone.warning : tone.accentSoft }}>{value > 0 ? "+" : ""}{fmt(value)}</span>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs leading-5 text-[#c9d8d1]">{t.notice}</p>
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
