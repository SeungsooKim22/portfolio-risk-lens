# Current Risk Model Audit

## 현재 입력 구조

- `app/page.tsx`의 `textarea` 값이 `parsePortfolio()`로 전달된다.
- 줄 또는 쉼표 단위로 나눈 뒤, 마지막 숫자를 비중으로 읽는다.
- 총합이 100이 아니어도 `weight / totalWeight * 100`으로 정규화한다.
- 사용자가 한국어 기업명, 영문 기업명, 티커를 입력하면 `resolveTicker()`가 로컬 alias와 간단한 fuzzy match로 canonical ticker를 찾는다.

## 현재 종목 분류 구조

- 종목 데이터는 `app/page.tsx` 내부의 `library` 객체에 하드코딩되어 있다.
- alias 데이터도 같은 컴포넌트 내부의 `aliases` 객체에 있다.
- `asset`, `sector`, `region`, `volatility`, `stress`가 모두 한 객체 안에 들어 있다.
- ETF 여부, 레버리지 여부, 테마, 밈 프로필 같은 분석용/표현용 정보가 명확히 분리되어 있지 않다.

## 현재 risk score 계산식

현재 계산은 `app/page.tsx`의 `Home()` 내부에서 수행된다.

```text
topThree = 상위 3개 비중 합
volatility = 각 종목 volatility의 정규화 비중 가중평균
topSectorWeight = 가장 큰 known sector 비중

concentrationScore =
  min(100, topHoldingWeight * 0.9 + topThree * 0.25 + topSectorWeight * 0.45)

riskScore =
  round(min(100, volatility * 1.35 + concentrationScore * 0.3))
```

## 현재 stress test 계산식

- 각 종목의 `stress.techSelloff`, `stress.rateShock`, `stress.recession`, `stress.dollarDrop`를 비중 가중평균한다.
- 화면에는 다음 시나리오로 표시한다.
  - 나스닥 -20% 하락 시
  - 금리 1%p 상승 시
  - 경기침체 시
  - 달러 약세 시

## 현재 캐릭터/칭호 판정 방식

- `app/lib/characterEngine.ts`의 `determineRiskCharacter()`가 risk score 구간만 보고 7개 고정 캐릭터 중 하나를 선택한다.
- `determinePortfolioBadges()`는 holdings와 일부 metrics를 직접 보고 조건문으로 badge를 추가한다.
- badge dedupe는 `id` 기준이며, family 개념은 없다.
- risk character와 badge가 별도 목적을 갖지만 동일한 raw holdings/metrics에 의존한다.

## 현재 fallback 방식

- 알 수 없는 종목은 `Unclassified Equity`, `Unknown`, `Unknown`으로 처리된다.
- volatility는 30, stress는 기본값으로 들어간다.
- unknown이 많아도 분석은 계속되지만 화면의 자산/섹터/지역이 미분류로 크게 나타난다.

## 현재 구조의 문제점

- 종목 데이터, alias, 분석, UI가 `app/page.tsx`에 섞여 있어 새 종목을 추가할수록 유지보수가 어려워진다.
- risk score가 volatility와 단순 집중도 휴리스틱에 크게 의존해 일부 포트폴리오에서 100점으로 쉽게 포화된다.
- HHI가 없어 실질적인 분산 정도를 반영하지 못한다.
- 섹터 집중도와 종목 집중도가 명확히 분리되지 않는다.
- 레버리지 ETF를 일반 ETF와 구조적으로 구분하지 못한다.
- 캐릭터는 risk score 구간만 보고 결정되므로 포트폴리오의 주된 성향을 충분히 반영하지 못한다.
- badge는 family dedupe가 없어 비슷한 의미의 칭호가 동시에 나올 수 있다.
- risk score, personality, badge가 같은 raw 조건문에 얽혀 있어 "야수의 심장"과 "월가의 모범생" 같은 상반된 결과가 생길 수 있다.
- 가격 데이터나 covariance가 없는데도 volatility가 단일 숫자로 표시되어, 실제 historical risk와 heuristic estimate의 차이가 명확하지 않다.
