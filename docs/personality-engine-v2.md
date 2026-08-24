# Personality Engine v2

Personality Engine은 risk score를 계산하지 않는다. 이미 계산된 `PortfolioFeatures`와 `RiskResult`만 읽어서 공유용 캐릭터와 칭호를 만든다.

## Main Character

메인 캐릭터는 두 부분으로 만든다.

```text
[Risk Modifier] + [Dominant Archetype]
```

- Risk Modifier는 risk score 구간에서 결정한다.
- Dominant Archetype은 feature strength를 비교해 결정한다.

예:

- 브레이크 없는 반도체 신봉자
- 겁 없는 바이오 외길 투자자
- 극도로 신중한 폭락장 생존자
- 목숨 두 개인 레버리지 광인

## Deterministic Variation

완전 random은 쓰지 않는다. 정규화된 포트폴리오를 ticker와 weight로 정렬한 뒤 stable hash를 만들고, 그 hash로 modifier, archetype, quote variant를 고른다. 같은 포트폴리오는 입력 순서가 달라도 같은 결과를 만든다.

## Dominant Trait

각 trait은 `0~100` strength를 가진다. 최소 activation threshold는 기본 `55`다. 아무 trait도 기준을 넘지 않으면 balanced archetype으로 fallback한다.

## Badge Engine

Badge는 family, priority, eligibility를 가진다.

```text
family: concentration, company, leverage, theme, sector, broad-etf, defensive, cash, gold, bond, diversification, fallback
```

규칙:

- 같은 family에서는 가장 priority가 높은 badge 하나만 선택한다.
- 최종 badge는 최대 3개다.
- company meme badge는 개별 기업 비중이 40% 이상일 때만 eligible하다.
- risk score가 높다는 이유만으로 특정 meme badge를 붙이지 않는다.

## Separation Rule

리스크 계산과 재미있는 표현은 분리한다. 예를 들어 금 비중이 높으면 "중앙은행보다 금을 믿습니다" badge는 가능하지만, 그 이유만으로 risk score를 높이지 않는다.
