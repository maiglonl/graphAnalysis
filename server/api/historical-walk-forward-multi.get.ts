import { DEFAULT_INTERVAL, DEFAULT_SYMBOL, IntervalEnum, type Candle } from '#shared/types/market';
import { API, HISTORICAL_SIMULATION } from '#shared/utils/detectors/constants';
import { runMultiWindowWalkForwardSimulation } from '../utils/multiWindowWalkForwardSimulation';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const validIntervals = Object.values(IntervalEnum) as string[];

  const symbol = String(query.symbol || DEFAULT_SYMBOL).toUpperCase();
  const interval: IntervalEnum = validIntervals.includes(String(query.interval))
    ? (query.interval as IntervalEnum)
    : DEFAULT_INTERVAL;

  const windowCountRaw = Number(query.windowCount);
  const windowCount = Number.isFinite(windowCountRaw) && windowCountRaw >= HISTORICAL_SIMULATION.minWalkForwardWindowCount
    ? windowCountRaw
    : HISTORICAL_SIMULATION.walkForwardWindowCount;

  const response = await $fetch<{ symbol: string; interval: IntervalEnum; candles: Candle[] }>('/api/candles', {
    query: {
      symbol,
      interval,
      limit: API.candleLimit,
    },
  });

  return runMultiWindowWalkForwardSimulation({
    symbol: response.symbol,
    interval: response.interval,
    candles: response.candles,
    windowCount,
  });
});
