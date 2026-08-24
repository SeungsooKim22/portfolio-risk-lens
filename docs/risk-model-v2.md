# Risk Model v2

Portfolio Risk Lens v2는 입력을 먼저 표준 포트폴리오로 바꾼 뒤 feature vector를 계산하고, risk score는 그 feature만 사용한다.

```text
Portfolio Input
  -> Security Resolver / Security Master
  -> Portfolio Normalization
  -> Portfolio Analytics Engine
  -> Feature Vector
  -> Risk Score Engine
  -> Explainable Result
```

## Weight Normalization

모든 입력 비중은 합계로 나눈다.

```text
normalizedWeight = inputWeight / totalInputWeight
```

내부 UI 단위는 `0~100` 퍼센트 포인트를 사용한다. 따라서 `AAPL 50 MSFT 50`과 `AAPL 0.5 MSFT 0.5`는 같은 포트폴리오다.

## Feature Vector

주요 feature는 `types/analytics.ts`의 `PortfolioFeatures`가 기준이다.

- `volatility`: 가격 데이터가 없을 때는 Security Master의 expected volatility 가중평균을 사용한다.
- `downsideRisk`: historical CVaR 데이터가 없을 때는 stress scenario의 하락폭 기반 fallback을 사용한다.
- `concentration`: 종목 HHI 기반 집중도.
- `sectorConcentration`: 섹터 HHI 기반 집중도.
- `thematicConcentration`: primary theme HHI 기반 집중도.
- `diversification`: effective number of positions 기반 분산 점수.
- `leverage`: 레버리지 ETF의 effective exposure 기반 점수.
- `marketBeta`: benchmark beta 데이터가 없을 때는 asset type별 fallback beta 가중평균을 사용한다.
- `idiosyncraticRisk`: 개별 기업 비중, ETF 여부, 종목 집중도를 반영한다.

## HHI

```text
HHI = sum(wi^2)
Effective N = 1 / HHI
```

동일가중 포트폴리오의 최소 HHI를 보정해 concentration score를 만든다.

```text
ConcentrationScore =
100 * (HHI - 1/n) / (1 - 1/n)
```

단일 종목은 100, 동일가중으로 잘 나뉜 포트폴리오는 0에 가까워진다.

## Risk Score

Risk score는 다음 component의 가중합이다.

```text
0.35 * V volatility risk
0.20 * D downside risk
0.15 * C concentration risk
0.10 * B market beta risk
0.10 * L leverage risk
0.10 * I idiosyncratic risk
```

각 component는 먼저 `0~100`으로 정규화한다. 최종 점수도 `0~100`으로 clamp하고 UI에는 소수점 한 자리만 표시한다.

## Explainability

각 component는 `score`, `weight`, `contribution`을 가진다. contribution 합계는 최종 risk score와 같아야 한다. UI의 "왜 이 점수인가요?"는 이 breakdown을 표시한다.

## Data Confidence

현재 버전은 historical covariance, beta, CVaR 데이터가 없으므로 `analysisConfidence = "limited"` 또는 `"medium"`을 사용한다. 외부 가격 데이터가 연결되면 volatility는 `sqrt(w^T covariance w)`로 교체한다.
