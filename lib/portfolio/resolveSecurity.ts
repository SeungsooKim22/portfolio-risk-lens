import { aliases } from "../../data/aliases.ts";
import { getFallbackSecurity, securityMaster } from "../../data/securityMaster.ts";
import type { ResolvedPosition } from "../../types/portfolio.ts";
import type { Security, SecurityResolver } from "../../types/security.ts";

export function normalizeSecurityName(value: string) {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/보통주|우선주|우\b|주식회사|주식|inc\.?|corp\.?|corporation|co\.?|ltd\.?|plc/g, "")
    .replace(/[^a-z0-9가-힣.]/g, "");
}

function editDistance(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[a.length][b.length];
}

export class LocalSecurityResolver implements SecurityResolver {
  async resolve(tickerOrName: string) {
    return resolveSecurity(tickerOrName).security;
  }
}

export class ExternalSecurityResolverAdapter implements SecurityResolver {
  async resolve(): Promise<Security | null> {
    return null;
  }
}

export function resolveSecurity(rawName: string): Pick<ResolvedPosition, "ticker" | "displayName" | "security" | "resolution"> {
  const normalized = normalizeSecurityName(rawName);
  const upper = rawName.trim().toUpperCase().replace(/-/g, ".");

  if (securityMaster[upper]) {
    const security = securityMaster[upper];
    return { ticker: security.ticker, displayName: displayNameFor(rawName, security), security, resolution: "local" };
  }

  const normalizedUpper = normalized.toUpperCase();
  if (securityMaster[normalizedUpper]) {
    const security = securityMaster[normalizedUpper];
    return { ticker: security.ticker, displayName: displayNameFor(rawName, security), security, resolution: "local" };
  }

  const aliasTicker = aliases[normalized];
  if (aliasTicker && securityMaster[aliasTicker]) {
    const security = securityMaster[aliasTicker];
    return { ticker: security.ticker, displayName: displayNameFor(rawName, security), security, resolution: "alias" };
  }

  const fuzzy = Object.entries(aliases)
    .map(([alias, ticker]) => ({ alias, ticker, distance: editDistance(normalized, alias) }))
    .filter(({ alias, distance }) => normalized.length >= 3 && distance <= Math.max(1, Math.floor(alias.length * 0.22)))
    .sort((a, b) => a.distance - b.distance || a.alias.length - b.alias.length)[0];

  if (fuzzy && securityMaster[fuzzy.ticker]) {
    const security = securityMaster[fuzzy.ticker];
    return { ticker: security.ticker, displayName: displayNameFor(rawName, security), security, resolution: "fuzzy" };
  }

  const ticker = normalizedUpper || upper;
  const security = getFallbackSecurity(ticker, rawName);
  return { ticker, displayName: rawName || ticker, security, resolution: "fallback" };
}

function displayNameFor(rawName: string, security: Security) {
  return /^[A-Z0-9.\-]+$/.test(rawName.trim()) ? security.companyName : rawName.trim();
}
