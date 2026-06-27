import { DEFAULT_INTERVAL, DEFAULT_SYMBOL, IntervalEnum } from '#shared/types/market';
import { analyzeMarketWithCalibration } from '../utils/analyzeMarketWithCalibration';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const validIntervals = Object.values(IntervalEnum) as string[];

  const symbol = String(query.symbol || DEFAULT_SYMBOL).toUpperCase();
  const interval: IntervalEnum = validIntervals.includes(String(query.interval))
    ? (query.interval as IntervalEnum)
    : DEFAULT_INTERVAL;

  return analyzeMarketWithCalibration({ symbol, interval });
});
