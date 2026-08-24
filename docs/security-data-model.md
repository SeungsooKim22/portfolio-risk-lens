# Security Data Model

Security Master는 분석용 종목 정보의 source of truth다. 밈/CEO/칭호 문구는 별도 데이터로 관리한다.

## Security

```typescript
interface Security {
  ticker: string;
  exchange?: string;
  companyName: string;
  assetType: "equity" | "etf" | "bond" | "commodity" | "cash" | "crypto" | "reit" | "private" | "other";
  sector?: string;
  industry?: string;
  country?: string;
  currency?: string;
  region?: string;
  isETF: boolean;
  isBroadMarketETF?: boolean;
  isLeveraged?: boolean;
  leverageMultiple?: number;
  isInverse?: boolean;
  themes?: string[];
  primaryTheme?: string;
  expectedVolatility?: number;
  beta?: number;
  stress?: StressProfile;
  memeProfileId?: string;
}
```

## Resolver Layers

```text
1. Local Security Master
2. External symbol/security resolver
3. Local cache/database
4. Conservative fallback
```

현재 구현은 Local Security Master와 fallback을 제공하고, 외부 resolver interface를 준비한다. 외부 market-data API가 없을 때는 모르는 종목을 임의 섹터로 추측하지 않는다.

## MemeProfile

```typescript
interface MemeProfile {
  id: string;
  ticker: string;
  figure?: string;
  concentrationTitles?: {
    moderate?: string[];
    high?: string[];
    extreme?: string[];
  };
  quotes?: string[];
}
```

Security Master는 넓은 종목 커버리지를 목표로 하고, MemeProfile은 유명 종목에만 선택적으로 붙인다.
