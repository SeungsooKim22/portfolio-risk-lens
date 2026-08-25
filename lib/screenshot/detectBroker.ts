import { brokerageProfiles } from "../../data/brokerageProfiles.ts";
import type { BrokerageParsingProfile, BrokerDetectionResult, PortfolioScreenshotMetadata, UploadedScreenshot } from "../../types/screenshotImport.ts";

const screenTypeHints: Array<[NonNullable<PortfolioScreenshotMetadata["screenType"]>, RegExp]> = [
  ["holdings", /보유|잔고|holdings?|positions?/i],
  ["portfolio", /포트폴리오|portfolio|allocation/i],
  ["account-assets", /총\s*금액|총\s*자산|계좌|assets?|account/i],
  ["profit-loss", /손익|수익률|profit|loss|p\/l/i],
];

export function detectBrokerFromScreenshot(screenshot: UploadedScreenshot): BrokerDetectionResult {
  return detectBrokerFromText(screenshot.text ?? "");
}

export function detectBrokerFromText(text: string, profiles: BrokerageParsingProfile[] = brokerageProfiles): BrokerDetectionResult {
  const normalized = compact(text);
  const matches = profiles
    .map((profile) => {
      const labels = [...(profile.knownLabels ?? []), ...(profile.layoutHints ?? [])];
      const evidence = labels.filter((label) => normalized.includes(compact(label)));
      const screenType = inferScreenType(text);
      const confidence = Math.min(0.98, evidence.length === 0 ? 0 : 0.34 + evidence.length * 0.16 + (screenType !== "unknown" ? 0.08 : 0));
      return { broker: profile.broker, app: profile.app, screenType, confidence, evidence };
    })
    .sort((a, b) => b.confidence - a.confidence);

  const best = matches[0];
  if (!best || best.confidence < 0.45) {
    return {
      broker: "unknown",
      app: undefined,
      screenType: inferScreenType(text),
      confidence: 0.2,
      evidence: [],
    };
  }

  return best;
}

export function profileForDetection(result: BrokerDetectionResult, profiles: BrokerageParsingProfile[] = brokerageProfiles) {
  return profiles.find((profile) => profile.broker === result.broker && profile.app === result.app);
}

function inferScreenType(text: string): NonNullable<PortfolioScreenshotMetadata["screenType"]> {
  for (const [screenType, pattern] of screenTypeHints) {
    if (pattern.test(text)) return screenType;
  }
  return "unknown";
}

function compact(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}
