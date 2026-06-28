import { MarketDataErrorCodeEnum, type Candle } from '#shared/types/market';
import type { GetCandlesParams, MarketDataProvider } from './MarketDataProvider';
import { MarketDataProviderError } from './MarketDataProviderError';

type BinanceKline = [number, string, string, string, string, string, number, string, number, string, string, string];

export class BinanceProvider implements MarketDataProvider {
  async getCandles(params: GetCandlesParams): Promise<Candle[]> {
    try {
      const raw = await $fetch<BinanceKline[]>('https://api.binance.com/api/v3/klines', {
        query: {
          symbol: params.symbol,
          interval: params.interval,
          limit: params.limit,
        },
      });

      if (!raw.length) {
        throw new MarketDataProviderError(MarketDataErrorCodeEnum.EmptyResponse, 502);
      }

      return raw.map((item) => ({
        time: Number(item[0]),
        open: Number(item[1]),
        high: Number(item[2]),
        low: Number(item[3]),
        close: Number(item[4]),
        volume: Number(item[5]),
      }));
    } catch (error: unknown) {
      if (error instanceof MarketDataProviderError) throw error;
      const statusCode = getErrorStatusCode(error);

      if (statusCode === 400) throw new MarketDataProviderError(MarketDataErrorCodeEnum.InvalidSymbol, 400);
      if (statusCode === 408 || statusCode === 504)
        throw new MarketDataProviderError(MarketDataErrorCodeEnum.Timeout, 504);
      if (statusCode === 418 || statusCode === 429)
        throw new MarketDataProviderError(MarketDataErrorCodeEnum.RateLimited, 429);

      throw new MarketDataProviderError(MarketDataErrorCodeEnum.ProviderUnavailable, 502);
    }
  }
}

function getErrorStatusCode(error: unknown): number | null {
  if (!error || typeof error !== 'object') return null;

  const maybeError = error as { statusCode?: unknown; response?: { status?: unknown } };

  if (typeof maybeError.statusCode === 'number') return maybeError.statusCode;
  if (typeof maybeError.response?.status === 'number') return maybeError.response.status;

  return null;
}
