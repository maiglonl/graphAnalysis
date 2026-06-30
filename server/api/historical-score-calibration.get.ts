import { DEFAULT_INTERVAL, DEFAULT_SYMBOL, IntervalEnum, type Candle } from '#shared/types/market';
import { API } from '#shared/utils/detectors/constants';
import {
  createHistoricalResultCacheKey,
  getCachedHistoricalResult,
  setCachedHistoricalResult,
} from '../utils/historicalResultCache';
import { runHistoricalScoreCalibration, type HistoricalScoreCalibrationResult } from '../utils/historicalScoreCalibration';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const validIntervals = Object.values(IntervalEnum) as string[];

  const symbol = String(query.symbol || DEFAULT_SYMBOL).toUpperCase();
  const interval: IntervalEnum = validIntervals.includes(String(query.interval))
    ? (query.interval as IntervalEnum)
    : DEFAULT_INTERVAL;
  const cacheKey = createHistoricalResultCacheKey('historicalScoreCalibration', symbol, interval, API.candleLimit);
  const cached = getCachedHistoricalResult<HistoricalScoreCalibrationResult>(cacheKey);
  if (cached) return cached;

  const response = await $fetch<{ symbol: string; interval: IntervalEnum; candles: Candle[] }>('/api/candles', {
    query: {
      symbol,
      interval,
      limit: API.candleLimit,
    },
  });

  const result = runHistoricalScoreCalibration({
    symbol: response.symbol,
    interval: response.interval,
    candles: response.candles,
  });
  setCachedHistoricalResult(cacheKey, result);
  return result;
});
