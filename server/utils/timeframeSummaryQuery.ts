import { DEFAULT_SYMBOL, IntervalEnum } from '#shared/types/market';

const DEFAULT_INTERVALS = [
  IntervalEnum.FifteenMinutes,
  IntervalEnum.OneHour,
  IntervalEnum.FourHours,
  IntervalEnum.OneDay,
] as const;

const MAX_INTERVALS = 4;

export type NormalizedTimeframeSummaryQuery = {
  symbol: string;
  intervals: IntervalEnum[];
};

export function normalizeTimeframeSummaryQuery(query: Record<string, unknown>): NormalizedTimeframeSummaryQuery {
  return {
    symbol: String(query.symbol || DEFAULT_SYMBOL)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, ''),
    intervals: parseIntervals(query.intervals),
  };
}

function parseIntervals(value: unknown): IntervalEnum[] {
  if (!value) return [...DEFAULT_INTERVALS];

  const allowedIntervals = new Set<string>(Object.values(IntervalEnum));

  return String(value)
    .split(',')
    .map((interval) => interval.trim())
    .filter((interval) => allowedIntervals.has(interval))
    .slice(0, MAX_INTERVALS) as IntervalEnum[];
}
