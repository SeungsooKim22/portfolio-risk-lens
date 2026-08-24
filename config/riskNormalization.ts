export type Anchor = {
  raw: number;
  score: number;
};

export const riskNormalizationAnchors = {
  volatility: [
    { raw: 5, score: 5 },
    { raw: 15, score: 25 },
    { raw: 25, score: 50 },
    { raw: 40, score: 75 },
    { raw: 65, score: 100 },
  ],
  downside: [
    { raw: 5, score: 5 },
    { raw: 15, score: 30 },
    { raw: 25, score: 55 },
    { raw: 40, score: 80 },
    { raw: 60, score: 100 },
  ],
  beta: [
    { raw: 0, score: 5 },
    { raw: 0.5, score: 25 },
    { raw: 1, score: 50 },
    { raw: 1.5, score: 75 },
    { raw: 2.5, score: 100 },
  ],
  leverage: [
    { raw: 0, score: 0 },
    { raw: 0.2, score: 25 },
    { raw: 0.5, score: 55 },
    { raw: 1, score: 85 },
    { raw: 1.5, score: 100 },
  ],
  idiosyncratic: [
    { raw: 10, score: 10 },
    { raw: 25, score: 35 },
    { raw: 40, score: 60 },
    { raw: 60, score: 85 },
    { raw: 80, score: 100 },
  ],
};

export function clamp(value: number, min = 0, max = 100) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function normalizeByAnchors(raw: number, anchors: Anchor[]) {
  const sorted = [...anchors].sort((a, b) => a.raw - b.raw);
  if (raw <= sorted[0].raw) return clamp(sorted[0].score);
  for (let index = 1; index < sorted.length; index += 1) {
    const left = sorted[index - 1];
    const right = sorted[index];
    if (raw <= right.raw) {
      const ratio = (raw - left.raw) / (right.raw - left.raw || 1);
      return clamp(left.score + ratio * (right.score - left.score));
    }
  }
  return clamp(sorted[sorted.length - 1].score);
}
