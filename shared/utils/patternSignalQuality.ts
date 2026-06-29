import type { PatternSignal } from '#shared/types/market';
import { PatternDirectionEnum } from '#shared/types/market';
import { PatternFamilyEnum, PatternSignalRoleEnum, getPatternFamily, getPatternSignalRole } from '#shared/utils/patternFamilies';

const ROLE_WEIGHT = {
  [PatternSignalRoleEnum.Actionable]: 3,
  [PatternSignalRoleEnum.Warning]: 2,
  [PatternSignalRoleEnum.Context]: 1,
} as const;

const FAMILY_WEIGHT = {
  [PatternFamilyEnum.Liquidity]: 8,
  [PatternFamilyEnum.Structure]: 7,
  [PatternFamilyEnum.PriceAction]: 6,
  [PatternFamilyEnum.Trend]: 5,
  [PatternFamilyEnum.Momentum]: 4,
  [PatternFamilyEnum.Volume]: 3,
  [PatternFamilyEnum.Volatility]: 2,
  [PatternFamilyEnum.Candle]: 1,
} as const;

export type PatternQualityMetadata = {
  family: PatternFamilyEnum;
  role: PatternSignalRoleEnum;
  rank: number;
};

export function getPatternQualityMetadata(pattern: PatternSignal): PatternQualityMetadata {
  const family = getPatternFamily(pattern.id);
  const role = getPatternSignalRole(pattern.id);
  return {
    family,
    role,
    rank: ROLE_WEIGHT[role] * FAMILY_WEIGHT[family] * pattern.confidence,
  };
}

export function isActionablePatternSignal(pattern: PatternSignal): boolean {
  return getPatternSignalRole(pattern.id) === PatternSignalRoleEnum.Actionable;
}

export function isContextPatternSignal(pattern: PatternSignal): boolean {
  return getPatternSignalRole(pattern.id) === PatternSignalRoleEnum.Context;
}

export function isWarningPatternSignal(pattern: PatternSignal): boolean {
  return getPatternSignalRole(pattern.id) === PatternSignalRoleEnum.Warning;
}

export function sortPatternsBySignalQuality(patterns: PatternSignal[]): PatternSignal[] {
  return [...patterns].sort((a, b) => {
    const aMeta = getPatternQualityMetadata(a);
    const bMeta = getPatternQualityMetadata(b);
    if (aMeta.rank !== bMeta.rank) return bMeta.rank - aMeta.rank;
    if (a.confidence !== b.confidence) return b.confidence - a.confidence;
    return a.id.localeCompare(b.id);
  });
}

export function getPrimaryActionablePattern(patterns: PatternSignal[]): PatternSignal | null {
  return sortPatternsBySignalQuality(patterns.filter(isActionablePatternSignal))[0] ?? null;
}

export function countDirectionalConflicts(patterns: PatternSignal[]): number {
  const hasBullish = patterns.some((pattern) => pattern.direction === PatternDirectionEnum.Bullish);
  const hasBearish = patterns.some((pattern) => pattern.direction === PatternDirectionEnum.Bearish);
  return hasBullish && hasBearish ? 1 : 0;
}

export function groupPatternsByFamily(patterns: PatternSignal[]): Partial<Record<PatternFamilyEnum, PatternSignal[]>> {
  return patterns.reduce<Partial<Record<PatternFamilyEnum, PatternSignal[]>>>((acc, pattern) => {
    const family = getPatternFamily(pattern.id);
    acc[family] = [...(acc[family] ?? []), pattern];
    return acc;
  }, {});
}
