import { IntervalEnum, type Candle } from '#shared/types/market';

export type CandleCacheKey = `${string}:${IntervalEnum}:${number}`;

export type CandleCacheEntry = {
  candles: Candle[];
  expiresAt: number;
};

const cache = new Map<CandleCacheKey, CandleCacheEntry>();

const TTL_BY_INTERVAL: Record<IntervalEnum, number> = {
  [IntervalEnum.OneMinute]: 15_000,
  [IntervalEnum.FiveMinutes]: 30_000,
  [IntervalEnum.FifteenMinutes]: 60_000,
  [IntervalEnum.ThirtyMinutes]: 90_000,
  [IntervalEnum.OneHour]: 180_000,
  [IntervalEnum.FourHours]: 600_000,
  [IntervalEnum.OneDay]: 1_800_000,
};

export function createCandleCacheKey(symbol: string, interval: IntervalEnum, limit: number): CandleCacheKey {
  return `${symbol}:${interval}:${limit}`;
}

export function getCachedCandles(key: CandleCacheKey): Candle[] | null {
  const entry = cache.get(key);

  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.candles;
}

export function setCachedCandles(key: CandleCacheKey, interval: IntervalEnum, candles: Candle[]): void {
  cache.set(key, {
    candles,
    expiresAt: Date.now() + TTL_BY_INTERVAL[interval],
  });
}
