import { afterEach, describe, expect, it, vi } from 'vitest';
import { IntervalEnum, type Candle } from '#shared/types/market';
import { createCandleCacheKey, getCachedCandles, setCachedCandles } from '../../server/utils/candleCache';

const candles: Candle[] = [
  { time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100 },
];

describe('candle cache', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('builds stable cache keys', () => {
    expect(createCandleCacheKey('BTCUSDT', IntervalEnum.OneHour, 500)).toBe('BTCUSDT:1h:500');
  });

  it('returns cached candles before expiration', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const key = createCandleCacheKey('ETHUSDT', IntervalEnum.OneHour, 500);

    setCachedCandles(key, IntervalEnum.OneHour, candles);

    expect(getCachedCandles(key)).toEqual(candles);
  });

  it('expires cached candles after interval ttl', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const key = createCandleCacheKey('SOLUSDT', IntervalEnum.OneMinute, 500);

    setCachedCandles(key, IntervalEnum.OneMinute, candles);
    vi.setSystemTime(new Date('2026-01-01T00:00:16.000Z'));

    expect(getCachedCandles(key)).toBeNull();
  });
});
