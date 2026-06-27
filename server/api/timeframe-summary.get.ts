import {
  DEFAULT_SYMBOL,
  IntervalEnum,
  type AnalyzeResponse,
  type MultiTimeframeResponse,
} from '#shared/types/market';
import { analyzeMarket } from '../utils/analyzeMarket';

const DEFAULT_INTERVALS = [
  IntervalEnum.FifteenMinutes,
  IntervalEnum.OneHour,
  IntervalEnum.FourHours,
  IntervalEnum.OneDay,
] as const;

const MAX_INTERVALS = 4;

export default defineEventHandler(async (event): Promise<MultiTimeframeResponse> => {
  const query = getQuery(event);
  const symbol = String(query.symbol || DEFAULT_SYMBOL)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  const intervals = parseIntervals(query.intervals);
  const items: AnalyzeResponse[] = [];

  for (const interval of intervals) {
    items.push(await analyzeMarket({ symbol, interval }));
  }

  return {
    symbol,
    items,
  };
});

function parseIntervals(value: unknown): IntervalEnum[] {
  if (!value) return [...DEFAULT_INTERVALS];

  const allowedIntervals = new Set<string>(Object.values(IntervalEnum));

  return String(value)
    .split(',')
    .map((interval) => interval.trim())
    .filter((interval) => allowedIntervals.has(interval))
    .slice(0, MAX_INTERVALS) as IntervalEnum[];
}
