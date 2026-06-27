import { MarketDataErrorCodeEnum } from '#shared/types/market';
import { createCandleCacheKey, getCachedCandles, setCachedCandles } from '../utils/candleCache';
import { normalizeCandleQuery } from '../utils/candleQuery';
import { isMarketDataProviderError } from '../utils/marketData/MarketDataProviderError';
import { marketDataProvider } from '../utils/marketData';

export default defineEventHandler(async (event) => {
  const query = normalizeCandleQuery(getQuery(event));

  if (!query.ok) {
    throw createError({ statusCode: 400, message: `errors.${query.errorCode}` });
  }

  const cacheKey = createCandleCacheKey(query.symbol, query.interval, query.limit);
  const cachedCandles = getCachedCandles(cacheKey);

  if (cachedCandles) {
    return { symbol: query.symbol, interval: query.interval, candles: cachedCandles };
  }

  try {
    const candles = await marketDataProvider.getCandles({
      symbol: query.symbol,
      interval: query.interval,
      limit: query.limit,
    });
    setCachedCandles(cacheKey, query.interval, candles);

    return { symbol: query.symbol, interval: query.interval, candles };
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
