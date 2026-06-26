import { DEFAULT_INTERVAL, DEFAULT_SYMBOL, IntervalEnum } from '#shared/types/market';
import { analyzeMarket } from '../utils/analyzeMarket';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const symbol = String(query.symbol || DEFAULT_SYMBOL).toUpperCase();
  const validIntervals = Object.values(IntervalEnum) as string[];
  const interval: IntervalEnum = validIntervals.includes(String(query.interval))
    ? (query.interval as IntervalEnum)
    : DEFAULT_INTERVAL;

  return analyzeMarket({ symbol, interval });
});
