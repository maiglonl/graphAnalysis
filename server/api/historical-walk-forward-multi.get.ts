import { DEFAULT_INTERVAL, DEFAULT_SYMBOL, IntervalEnum, type Candle } from '#shared/types/market';
import { API, HISTORICAL_SIMULATION } from '#shared/utils/detectors/constants';
import {
  createHistoricalResultCacheKey,
  getCachedHistoricalResult,
  setCachedHistoricalResult,
} from '../utils/historicalResultCache';
import {
  runMultiWindowWalkForwardSimulation,
  type MultiWindowWalkForwardSimulationResult,
} from '../utils/multiWindowWalkForwardSimulation';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const validIntervals = Object.values(IntervalEnum) as string[];

  const symbol = String(query.symbol || DEFAULT_SYMBOL).toUpperCase();
  const interval: IntervalEnum = validIntervals.includes(String(query.interval))
    ? (query.interval as IntervalEnum)
    : DEFAULT_INTERVAL;

  const windowCountRaw = Number(query.windowCount);
  const windowCount = Number.isFinite(windowCountRaw) && windowCountRaw >= HISTORICAL_SIMULATION.minWalkForwardWindowCount
    ? Math.min(windowCountRaw, HISTORICAL_SIMULATION.maxWalkForwardWindowCount)
    : HISTORICAL_SIMULATION.walkForwardWindowCount;
  const cacheKey = createHistoricalResultCacheKey('historicalWalkForwardMulti', symbol, interval, API.candleLimit, windowCount);
  const cached = getCachedHistoricalResult<MultiWindowWalkForwardSimulationResult>(cacheKey);
  if (cached) return cached;

  const response = await $fetch<{ symbol: string; interval: IntervalEnum; candles: Candle[] }>('/api/candles', {
    query: {
      symbol,
      interval,
      limit: API.candleLimit,
    },
  });

  const result = runMultiWindowWalkForwardSimulation({
    symbol: response.symbol,
    interval: response.interval,
    candles: response.candles,
    windowCount,
  });
  setCachedHistoricalResult(cacheKey, result);
  return result;
});
