# Screenshot Dataset Guide

Use this directory only for sanitized benchmark samples. Do not commit real user screenshots, account numbers, names, balances, or other sensitive financial information.

## Folder Structure

```text
datasets/portfolio-screenshots/
  mirae-mstock/
    ios/
      light/
      dark/
    android/
      light/
      dark/
  kiwoom-heromoon/
    ios/
    android/
  samsung-mpop/
  kb-mable/
  korea-investment/
  toss/
  nh-namuh/
  unknown/
```

Future broker targets include Shinhan, Kakao Pay, Meritz, Hana, Daishin, Yuanta, LS, IBK, and Kyobo Securities.

## Annotation Format

Each sample image should have a matching JSON annotation:

```text
sample-001.png
sample-001.json
```

```json
{
  "broker": "Toss Securities",
  "platform": "ios",
  "theme": "light",
  "market": "US",
  "screenType": "holdings",
  "positions": [
    {
      "ticker": "AAPL",
      "companyName": "Apple",
      "marketValue": 4800.23,
      "currency": "USD",
      "weight": 24.8
    }
  ]
}
```

## Collection Target

An initial benchmark should aim for 70 to 210 sanitized screenshots:

- 7 primary Korean brokerages
- 10 to 30 representative screenshots per brokerage
- iOS and Android
- light and dark modes
- domestic, overseas, and mixed holdings
- 10 or more holdings
- overlapping scroll screenshots
- different font sizes
- holdings, account-assets, and profit/loss screens

## Benchmark Method

Measure extraction separately from risk scoring:

- row recall: how many true holdings were found
- ticker/name resolution accuracy
- weight accuracy
- market value accuracy
- duplicate detection accuracy
- false positive rate from cash, total rows, or return percentages

The importer should improve against this dataset without changing the portfolio risk engine.
