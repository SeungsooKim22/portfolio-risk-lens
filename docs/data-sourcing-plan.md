# Data Sourcing Plan

Portfolio Risk Lens should not claim broad market coverage until the internal security dataset can resolve most real user inputs without falling back to `Unknown`.

## What Users Should Not See

Do not expose the full supported-security catalog in the public product UI. The catalog is an internal release-readiness tool, not a user-facing feature.

## Data Layers

### 1. Symbol And Name Master

Goal: resolve user inputs such as ticker, English name, Korean name, common nickname, and broker screenshot text.

Free source candidates:

- US listings: Nasdaq Trader Symbol Directory
  - `https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt`
  - `https://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt`
  - Useful fields: symbol, security name, listing market, ETF flag, test issue flag.
- US issuer reference: SEC company tickers by exchange
  - `https://www.sec.gov/files/company_tickers_exchange.json`
  - Useful fields: CIK, ticker, company title, exchange.
- Korea listed companies: OpenDART corp code API
  - `https://opendart.fss.or.kr/api/corpCode.xml`
  - Useful fields: corp code, official company name, English name, stock code.
- Korea listed-company download: KIND/KRX listed corporation list
  - `https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13`
  - Useful fields typically include Korean company name, stock code, industry, listing date, and region.

### 2. Sector And Asset Classification

Goal: prevent common listed equities from appearing as `Unknown`.

Practical approach:

- US equities: map SEC SIC or SIC description into our internal sectors.
- Korea equities: map KIND/KRX industry strings into our internal sectors.
- ETFs: keep a curated ETF registry for popular ETFs because ETF names alone do not reliably tell risk exposure.
- Private assets and crypto: keep curated entries only.

This means a ticker can be known even when its risk assumptions are still approximate. In that case, mark the position as `estimated`, not `unknown`.

### 3. Risk Assumptions

Goal: provide enough fields for the current risk engine:

- `assetLabel`
- `sector`
- `region`
- `expectedVolatility`
- `beta`
- stress profile
- themes

Initial public-beta approach:

- Use exact curated assumptions for major ETFs and high-usage stocks.
- Use sector/default assumptions for the long tail.
- Store confidence metadata so copy can say "추정" internally or in methodology when needed.

Do not pretend sector defaults are institution-grade risk data.

## Licensing Notes

The free sources above are good candidates for internal ingestion, but they are not all equivalent for public redistribution.

- Nasdaq Trader provides downloadable symbol-directory text files suitable for symbol lookup ingestion.
- SEC and OpenDART APIs are official reference sources, but requests should respect their API rules and limits.
- KRX/KIND data is publicly accessible, but KRX also operates a data marketplace with data purchase, distribution, and index licensing channels. Before bundling a large KRX-derived dataset into a public service, verify redistribution rights.

## Release Gate

Before SNS/public beta:

- Resolve at least 95% of a 100-portfolio Korean/US test set without fallback.
- Every alias must point to an existing security record.
- Every security record must have sector, region, asset type, volatility, beta, and stress assumptions.
- Unknown positions should be rare and clearly handled.
- Public copy must not claim full NASDAQ/KOSPI support until licensing and coverage are proven.
