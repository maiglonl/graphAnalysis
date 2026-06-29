import type { PatternSignal } from '#shared/types/market';
import { PatternDirectionEnum } from '#shared/types/market';
import { PatternFamilyEnum, PatternSignalRoleEnum, getPatternFamily, getPatternSignalRole } from '#shared/utils/patternFamilies';

export type SignalQualitySummaryItem = {
  key: PatternFamilyEnum | PatternSignalRoleEnum;
  total: number;
  bullish: number;
  bearish: number;
  neutral: number;
  averageConfidence: number;
};

export type SignalQualitySummary = {
  byFamily: SignalQualitySummaryItem[];
  byRole: SignalQualitySummaryItem[];
};

export function summarizeSignalsByQuality(patterns: PatternSignal[]): SignalQualitySummary {
  return {
    byFamily: summarize(patterns, (pattern) => getPatternFamily(pattern.id)),
    byRole: summarize(patterns, (pattern) => getPatternSignalRole(pattern.id)),
  };
}

function summarize<T extends PatternFamilyEnum | PatternSignalRoleEnum>(
  patterns: PatternSignal[],
  getKey: (pattern: PatternSignal) => T,
): SignalQualitySummaryItem[] {
  const grouped = new Map<T, PatternSignal[]>();

  patterns.forEach((pattern) => {
    const key = getKey(pattern);
    grouped.set(key, [...(grouped.get(key) ?? []), pattern]);
  });

  return [...grouped.entries()].map(([key, items]) => ({
    key,
    total: items.length,
    bullish: items.filter((pattern) => pattern.direction === PatternDirectionEnum.Bullish).length,
    bearish: items.filter((pattern) => pattern.direction === PatternDirectionEnum.Bearish).length,
    neutral: items.filter((pattern) => pattern.direction === PatternDirectionEnum.Neutral).length,
    averageConfidence: round(items.reduce((sum, pattern) => sum + pattern.confidence, 0) / items.length),
  })).sort((a, b) => b.total - a.total);
}

function round(value: number): number {
  return Number(value.toFixed(2));
}
