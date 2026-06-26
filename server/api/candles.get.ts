import { MarketDataErrorCodeEnum, DEFAULT_INTERVAL, DEFAULT_SYMBOL, IntervalEnum } from '#shared/types/market';
import { API } from '#shared/utils/detectors/constants';
import { createCandleCacheKey, getCachedCandles, setCachedCandles } from '../utils/candleCache';
import { isMarketDataProviderError } from '../utils/marketData/MarketDataProviderError';
import { marketDataProvider } from '../utils/marketData';

const ALLOWED_INTERVALS = new Set<string>(Object.values(IntervalEnum));

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const rawLimit = Number(query.limit || API.candleLimit);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, API.candleLimitMin), API.candleLimitMax)
    : API.candleLimit;

  const rawInterval = String(query.interval || DEFAULT_INTERVAL);
  const interval = ALLOWED_INTERVALS.has(rawInterval) ? (rawInterval as IntervalEnum) : null;
  const symbol = String(query.symbol || DEFAULT_SYMBOL)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  if (!symbol) {
    throw createError({ statusCode: 400, message: `errors.${MarketDataErrorCodeEnum.InvalidSymbol}` });
  }

  if (!interval) {
    throw createError({ statusCode: 400, message: `errors.${MarketDataErrorCodeEnum.InvalidInterval}` });
  }

  const cacheKey = createCandleCacheKey(symbol, interval, limit);
  const cachedCandles = getCachedCandles(cacheKey);

  if (cachedCandles) {
    return { symbol, interval, candles: cachedCandles };
  }

  try {
    const candles = await marketDataProvider.getCandles({ symbol, interval, limit });
    setCachedCandles(cacheKey, interval, candles);

    return { symbol, interval, candles };
  } catch (error: unknown) {
    if (isMarketDataProviderError(error)) {
      throw createError({ statusCode: error.statusCode, message: `errors.${error.code}` });
    }

    throw createError({
      statusCode: 502,
      message: `errors.${MarketDataErrorCodeEnum.ProviderUnavailable}`,
    });
  }
});
