"use client";

import { useMemo, useRef, useState } from "react";

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

const sampleInput = "AAPL 25%\nMSFT 20%\nNVDA 20%\nSPY 20%\nTLT 10%\nGLD 5%";

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

function groupBy(items: Holding[], key: keyof Pick<Holding, "asset" | "sector" | "region">) {
  const grouped = items.reduce<Record<string, number>>((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + item.weight;
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

export default function Home() {
  const [input, setInput] = useState(sampleInput);
  const reportRef = useRef<HTMLDivElement>(null);

  const holdings = useMemo(() => parsePortfolio(input), [input]);
  const totalWeight = holdings.reduce((sum, item) => sum + item.weight, 0);
  const normalized = holdings.map((item) => ({ ...item, weight: (item.weight / (totalWeight || 1)) * 100 }));
  const sectors = groupBy(normalized, "sector");
  const assets = groupBy(normalized, "asset");
  const regions = groupBy(normalized, "region");
  const topHolding = normalized[0] ? [...normalized].sort((a, b) => b.weight - a.weight)[0] : null;
  const topThree = [...normalized].sort((a, b) => b.weight - a.weight).slice(0, 3).reduce((sum, item) => sum + item.weight, 0);
  const volatility = weighted(normalized, (item) => item.volatility);
  const concentrationScore = Math.min(100, topThree * 0.8 + (topHolding?.weight || 0) * 0.6);
  const riskScore = Math.round(Math.min(100, volatility * 1.55 + concentrationScore * 0.45));
  const scenarios = [
    ["Nasdaq -20%", weighted(normalized, (item) => item.stress.techSelloff)],
    ["Rates +1%", weighted(normalized, (item) => item.stress.rateShock)],
    ["Recession", weighted(normalized, (item) => item.stress.recession)],
    ["USD weakness", weighted(normalized, (item) => item.stress.dollarDrop)],
  ] as const;

  const insights = [
    topHolding && topHolding.weight > 25 ? `${topHolding.ticker} alone drives ${fmt(topHolding.weight)} of the portfolio.` : "Single-name concentration is controlled.",
    sectors[0] && sectors[0][1] > 45 ? `${sectors[0][0]} exposure is high at ${fmt(sectors[0][1])}.` : "Sector exposure is reasonably balanced.",
    regions[0] && regions[0][1] > 80 ? `${regions[0][0]} dominates regional exposure.` : "Regional exposure adds some diversification.",
  ].filter(Boolean);

  function downloadCard() {
    const canvas = document.createElement("canvas");
    const width = 1400;
    const height = 1000;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#f6f3ec";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#10231f";
    ctx.fillRect(56, 56, width - 112, height - 112);
    ctx.fillStyle = "#f8f4ea";
    ctx.font = "700 64px Arial";
    ctx.fillText("Portfolio Risk Lens", 110, 150);
    ctx.font = "400 30px Arial";
    ctx.fillStyle = "#c9d8d1";
    ctx.fillText("A plain-language risk snapshot from your allocation", 110, 200);
    ctx.fillStyle = "#f2b84b";
    ctx.font = "700 96px Arial";
    ctx.fillText(`${riskScore}/100`, 110, 330);
    ctx.fillStyle = "#f8f4ea";
    ctx.font = "700 34px Arial";
    ctx.fillText("Risk score", 110, 380);

    ctx.font = "700 32px Arial";
    ctx.fillText("Top exposures", 560, 300);
    ctx.font = "400 28px Arial";
    assets.slice(0, 4).forEach(([label, value], index) => {
      ctx.fillStyle = "#f8f4ea";
      ctx.fillText(`${label}: ${fmt(value)}`, 560, 350 + index * 45);
    });

    ctx.font = "700 32px Arial";
    ctx.fillText("Stress scenarios", 110, 520);
    ctx.font = "400 28px Arial";
    scenarios.forEach(([label, value], index) => {
      ctx.fillStyle = value < 0 ? "#ff9f7d" : "#95d5b2";
      ctx.fillText(`${label}: ${value > 0 ? "+" : ""}${fmt(value)}`, 110, 570 + index * 45);
    });

    ctx.fillStyle = "#f8f4ea";
    ctx.font = "700 32px Arial";
    ctx.fillText("Main notes", 720, 520);
    ctx.font = "400 26px Arial";
    insights.forEach((text, index) => ctx.fillText(text, 720, 570 + index * 50));
    ctx.fillStyle = "#c9d8d1";
    ctx.font = "400 22px Arial";
    ctx.fillText("Educational estimate only. Not financial advice.", 110, 890);

    const link = document.createElement("a");
    link.download = "portfolio-risk-lens.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <main className="min-h-screen bg-[#f6f3ec] text-[#10231f]">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-5 py-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="flex flex-col justify-between gap-8 py-4">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-[#10231f] text-lg font-black text-[#f2b84b]">R</div>
              <span className="text-sm font-bold uppercase tracking-[0.14em] text-[#42665c]">Portfolio Risk Lens</span>
            </div>
            <h1 className="max-w-2xl text-5xl font-black leading-[1.02] text-[#10231f] sm:text-6xl">
              Your portfolio, explained like a risk desk would.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#4a5f59]">
              Enter tickers and weights to generate a visual risk snapshot: concentration, sector exposure, stress scenarios, and a shareable report image.
            </p>
          </div>

          <div className="rounded-lg border border-[#d6cec0] bg-white p-4 shadow-sm">
            <label htmlFor="portfolio-input" className="text-sm font-bold text-[#10231f]">
              Portfolio input
            </label>
            <textarea
              id="portfolio-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              spellCheck={false}
              className="mt-3 min-h-52 w-full resize-none rounded-md border border-[#d6cec0] bg-[#fbfaf6] p-4 font-mono text-sm leading-7 outline-none transition focus:border-[#2f7d6d] focus:ring-4 focus:ring-[#2f7d6d]/15"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={() => setInput(sampleInput)} className="rounded-md bg-[#10231f] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#1c3c35]">
                Load sample
              </button>
              <button onClick={downloadCard} className="rounded-md bg-[#f2b84b] px-4 py-3 text-sm font-bold text-[#10231f] transition hover:bg-[#e6a92e]">
                Save report image
              </button>
            </div>
            <p className="mt-4 text-xs leading-5 text-[#6d7b76]">
              MVP estimates use built-in sample classifications and stress assumptions. Use it for exploration, not investment advice.
            </p>
          </div>
        </div>

        <div ref={reportRef} className="grid content-center gap-5">
          <section className="rounded-lg bg-[#10231f] p-5 text-white shadow-xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#95d5b2]">Risk snapshot</p>
                <h2 className="mt-2 text-3xl font-black">Score {riskScore}/100</h2>
              </div>
              <div className="rounded-md bg-white/10 px-4 py-3 text-right">
                <p className="text-xs text-[#c9d8d1]">Estimated volatility</p>
                <p className="text-2xl font-black text-[#f2b84b]">{fmt(volatility)}</p>
              </div>
            </div>
            <div className="mt-5 h-4 rounded-full bg-white/10">
              <div className="h-4 rounded-full bg-[#f2b84b]" style={{ width: `${riskScore}%` }} />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Metric label="Top 3 holdings" value={fmt(topThree)} />
              <Metric label="Largest position" value={topHolding ? `${topHolding.ticker} ${fmt(topHolding.weight)}` : "-"} />
              <Metric label="Recognized lines" value={`${holdings.length}`} />
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <Panel title="Asset mix" data={assets} accent="#2f7d6d" />
            <Panel title="Sector exposure" data={sectors} accent="#d86847" />
          </section>

          <section className="rounded-lg border border-[#d6cec0] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">Stress scenarios</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {scenarios.map(([label, value]) => (
                <div key={label} className="rounded-md bg-[#f6f3ec] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold">{label}</span>
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
            <h2 className="text-lg font-black">Plain-English readout</h2>
            <div className="mt-4 grid gap-3">
              {insights.map((text) => (
                <p key={text} className="rounded-md bg-[#eef6f2] px-4 py-3 text-sm font-semibold text-[#234940]">{text}</p>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white/10 p-4">
      <p className="text-xs text-[#c9d8d1]">{label}</p>
      <p className="mt-1 break-words text-xl font-black">{value}</p>
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
