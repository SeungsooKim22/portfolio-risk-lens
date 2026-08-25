# Screenshot Portfolio Importer

Portfolio Risk Lens treats screenshot upload as an input layer. It produces the same normalized `Portfolio` object as manual input, then the existing risk engine handles scoring, personas, badges, grouping, and stress tests.

## Data Flow

```text
Screenshot
  -> browser image preprocessing
  -> broker / screen detection
  -> extraction provider
  -> schema validation
  -> duplicate reconciliation
  -> weight calculation
  -> security resolution
  -> user review and correction
  -> normalized Portfolio
  -> existing risk engine
```

## Provider Abstraction

`ScreenshotExtractionProvider` is the only adapter boundary for OCR or future vision models. The current release uses:

- `TextScreenshotExtractionProvider`: converts OCR text into structured candidates.
- `MockScreenshotExtractionProvider`: deterministic test adapter.

A future OpenAI-compatible vision adapter should return `RawScreenshotExtraction` JSON only. The app should not consume model prose or vendor-specific response formats directly.

## Broker Detection

Broker detection is hint-based. It compares OCR text against `data/brokerageProfiles.ts` labels for the first Korean brokerage targets:

- Mirae Asset Securities M-STOCK
- Kiwoom HeroMoon S#
- Samsung Securities mPOP
- KB Securities M-able
- Korea Investment & Securities
- Toss Securities
- NH Investment & Securities NAMUH

Low confidence detection becomes `unknown` and generic extraction continues.

## Confidence

Position confidence is held as numeric provider confidence and shown in the UI as:

- `high`: recognized
- `medium`: please check
- `low`: low confidence

Rows with unknown security, missing weight, missing market value, possible return-percent confusion, or duplicate evidence are downgraded for review.

## Duplicate Reconciliation

Screenshots can overlap during scrolling. Reconciliation keys positions by resolved ticker when possible, or normalized name otherwise. Duplicate candidates are not blindly summed. The importer keeps the higher-confidence row, merges source screenshot ids, and adds `DUPLICATE_POSITION` for review.

## Weight Calculation

Weights are calculated in this order:

1. Explicit portfolio allocation percentage.
2. Position market value divided by total market value.
3. Quantity times current price, then market-value weighting.
4. If none is available, flag the row with `WEIGHT_NOT_FOUND`.

Weights from different currencies are not mixed without a warning.

## Security Resolution

The importer resolves raw names and tickers through the existing Security Master and aliases. Unknown securities remain in the review table and still produce a fallback portfolio position so the flow does not crash.

## Review Requirement

Screenshot imports always return `requiresReview = true`. The user must inspect and edit rows, then press "Analyze this portfolio" before the normalized candidate reaches the risk engine.

## Privacy Assumptions

The current browser OCR flow keeps images on the device and does not store originals. Future provider adapters must avoid logging raw screenshots or extracted financial values, and should support masking account numbers or names before any optional debugging upload.

## Warning Taxonomy

Warnings are explicit codes, including `UNKNOWN_BROKER`, `NO_POSITIONS_FOUND`, `UNKNOWN_SECURITY`, `WEIGHT_NOT_FOUND`, `MARKET_VALUE_NOT_FOUND`, `DUPLICATE_POSITION`, `PORTFOLIO_TOTAL_TOO_LOW`, `PORTFOLIO_TOTAL_TOO_HIGH`, `POSSIBLE_RETURN_PERCENT_AS_WEIGHT`, `MULTIPLE_MARKETS_DETECTED`, and `MULTIPLE_CURRENCIES_DETECTED`.
