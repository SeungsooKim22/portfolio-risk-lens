export type AssetType =
  | "equity"
  | "etf"
  | "bond"
  | "commodity"
  | "cash"
  | "crypto"
  | "reit"
  | "private"
  | "other";

export type StressProfile = {
  techSelloff: number;
  rateShock: number;
  recession: number;
  dollarDrop: number;
};

export type Security = {
  ticker: string;
  exchange?: string;
  companyName: string;
  assetType: AssetType;
  assetLabel: string;
  sector?: string;
  industry?: string;
  country?: string;
  currency?: string;
  region?: string;
  isETF: boolean;
  isBroadMarketETF?: boolean;
  diversificationUnits?: number;
  isLeveraged?: boolean;
  leverageMultiple?: number;
  isInverse?: boolean;
  themes?: string[];
  primaryTheme?: string;
  expectedVolatility?: number;
  beta?: number;
  stress?: StressProfile;
  memeProfileId?: string;
};

export type MemeProfile = {
  id: string;
  ticker: string;
  figure?: string;
  concentrationTitles?: {
    moderate?: string[];
    high?: string[];
    extreme?: string[];
  };
  quotes?: string[];
};

export type SecurityResolver = {
  resolve(tickerOrName: string): Promise<Security | null>;
};
