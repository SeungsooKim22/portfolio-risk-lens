# Portfolio Risk Lens v1

## Core Hypothesis

Users will enjoy entering their portfolio if the result accurately analyzes risk and humorously characterizes their investing behavior.

## V1 Scope

The default public flow is manual input only:

```text
Manual Portfolio Input
  -> Portfolio Analysis
  -> Risk Score
  -> Personality / Roast Engine
  -> Badges / Traits
  -> Stress Test
  -> Shareable Result
```

## Primary Experience

Portfolio Risk Lens should feel like a fun financial personality test backed by real risk analytics. The result should combine credible numbers, a memorable personality, concise teasing, relevant badges, and a card users would want to save or share.

## Out Of Scope

- Brokerage account APIs
- Screenshot OCR as a default v1 flow
- CSV or Excel import
- Account synchronization
- Account authentication
- Professional portfolio-management workflows

Experimental screenshot importer code may remain in the codebase, but it should not interfere with the manual-first v1 experience.

## Risk Score Communication

Risk score direction must be visible before analysis:

```text
0 = very stable
100 = very aggressive
```

A high score means higher volatility, concentration, leverage, market sensitivity, or downside risk. It does not mean higher expected return.

## Personality Principles

- Risk calculations stay serious and separate from jokes.
- The meme layer never alters financial metrics.
- Distinctive portfolios get richer and sharper content.
- Balanced portfolios can receive fewer, calmer badges.
- Same normalized portfolio should reproduce the same result.
- Avoid generic or AI-sounding copy.

## Success Criterion

The product succeeds when users complete an analysis and voluntarily save or share the result with someone else.
