# Portfolio Risk Lens

Portfolio Risk Lens is a playful portfolio risk analyzer. Users can enter holdings and weights, then get a simple risk score, investor persona, shareable card, allocation breakdowns, scenario estimates, and a transparent explanation of how the score is calculated.

The product is designed for casual sharing and learning, not for investment advice.

## Features

- Manual portfolio input with ticker, English name, or Korean company-name matching
- Support for curated securities plus generated public-listing data for Nasdaq, NYSE, NYSE American, and KOSPI names
- Risk score breakdown by volatility, downside risk, concentration, market sensitivity, leverage, and company-specific risk
- Korean and English UI
- Shareable visual portfolio card
- Asset, sector, and domestic/international allocation summaries
- Simple scenario checks such as recession, dollar weakness, and Nasdaq drawdown
- Experimental screenshot-import architecture for future OCR/model-based portfolio extraction

## Risk Score

The score is a lightweight heuristic model:

```text
Score = volatility 35%
      + downside risk 20%
      + concentration risk 15%
      + market sensitivity 10%
      + leverage 10%
      + company-specific risk 10%
```

Curated securities use hand-reviewed assumptions. Securities from broad public listing data use sector and market defaults. Unsupported names are handled gracefully, but their analysis confidence is lower.

## Tech Stack

- Vinext
- React
- TypeScript
- Tailwind CSS
- Node.js test runner

## Getting Started

Requires Node.js `>=22.13.0`.

```bash
pnpm install
pnpm dev
```

Build and test:

```bash
pnpm test
pnpm lint
```

## Data

The generated security universe is built from freely accessible public listing sources. See:

- `docs/data-sourcing-plan.md`
- `data/generatedSecurityUniverse.ts`
- `scripts/build-security-universe.mjs`

## Disclaimer

This project is for fun and educational reference only. It is not investment advice, a recommendation to buy or sell securities, or a forecast of future returns.
