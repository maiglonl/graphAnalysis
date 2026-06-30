import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IntervalEnum } from '#shared/types/market';
import { HISTORICAL_SIMULATION } from '#shared/utils/detectors/constants';
import {
  clearHistoricalResultCache,
  createHistoricalResultCacheKey,
  getCachedHistoricalResult,
  getOrSetHistoricalEndpointCache,
  setCachedHistoricalResult,
} from '../../../server/utils/historicalResultCache';

describe('historicalResultCache', () => {
  beforeEach(() => {
    clearHistoricalResultCache();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stores and reads cached historical results', () => {
    const key = createHistoricalResultCacheKey('historicalSimulation', 'BTCUSDT', IntervalEnum.OneHour, 500);
    const value = { ok: true };

    setCachedHistoricalResult(key, value);

    expect(getCachedHistoricalResult<typeof value>(key)).toEqual(value);
  });

  it('returns null for missing key', () => {
    const key = createHistoricalResultCacheKey('historicalSimulation', 'ETHUSDT', IntervalEnum.OneHour, 500);

    expect(getCachedHistoricalResult(key)).toBeNull();
  });

  it('returns null after TTL expires', () => {
    vi.useFakeTimers();
    const key = createHistoricalResultCacheKey('historicalSimulation', 'BTCUSDT', IntervalEnum.OneHour, 500);

    setCachedHistoricalResult(key, { data: 'value' });
    vi.advanceTimersByTime(HISTORICAL_SIMULATION.resultCacheTtlMs + 1);

    expect(getCachedHistoricalResult(key)).toBeNull();
  });

  it('returns value before TTL expires', () => {
    vi.useFakeTimers();
    const key = createHistoricalResultCacheKey('historicalSimulation', 'BTCUSDT', IntervalEnum.OneHour, 500);
    const value = { data: 'value' };

    setCachedHistoricalResult(key, value);
    vi.advanceTimersByTime(HISTORICAL_SIMULATION.resultCacheTtlMs - 1);

    expect(getCachedHistoricalResult(key)).toEqual(value);
  });

  it('prunes oldest entries when max entries is exceeded', () => {
    vi.useFakeTimers();
    const makeKey = (i: number) =>
      createHistoricalResultCacheKey('historicalSimulation', `SYM${i}`, IntervalEnum.OneHour, 500);

    for (let i = 0; i <= HISTORICAL_SIMULATION.resultCacheMaxEntries; i++) {
      setCachedHistoricalResult(makeKey(i), { index: i });
      vi.advanceTimersByTime(1);
    }

    expect(getCachedHistoricalResult(makeKey(0))).toBeNull();
    expect(getCachedHistoricalResult(makeKey(HISTORICAL_SIMULATION.resultCacheMaxEntries))).not.toBeNull();
  });

  it('different variants produce different cache keys', () => {
    const keyA = createHistoricalResultCacheKey('historicalWalkForwardMulti', 'BTCUSDT', IntervalEnum.OneHour, 500, 3);
    const keyB = createHistoricalResultCacheKey('historicalWalkForwardMulti', 'BTCUSDT', IntervalEnum.OneHour, 500, 5);
    const valueA = { windows: 3 };
    const valueB = { windows: 5 };

    setCachedHistoricalResult(keyA, valueA);
    setCachedHistoricalResult(keyB, valueB);

    expect(getCachedHistoricalResult(keyA)).toEqual(valueA);
    expect(getCachedHistoricalResult(keyB)).toEqual(valueB);
  });

  it('clears all cache entries', () => {
    const key = createHistoricalResultCacheKey('historicalScoreCalibration', 'BTCUSDT', IntervalEnum.OneHour, 500);
    setCachedHistoricalResult(key, { ok: true });

    clearHistoricalResultCache();

    expect(getCachedHistoricalResult(key)).toBeNull();
  });

  describe('getOrSetHistoricalEndpointCache', () => {
    it('returns cached value without calling factory when refresh=false', async () => {
      const key = createHistoricalResultCacheKey('historicalSimulation', 'BTCUSDT', IntervalEnum.OneHour, 500);
      const factory = vi.fn().mockResolvedValue({ data: 'fresh' });
      setCachedHistoricalResult(key, { data: 'cached' });

      const result = await getOrSetHistoricalEndpointCache(key, false, factory);

      expect(result).toEqual({ data: 'cached' });
      expect(factory).not.toHaveBeenCalled();
    });

    it('bypasses cache and calls factory when refresh=true', async () => {
      const key = createHistoricalResultCacheKey('historicalSimulation', 'BTCUSDT', IntervalEnum.OneHour, 500);
      const factory = vi.fn().mockResolvedValue({ data: 'fresh' });
      setCachedHistoricalResult(key, { data: 'cached' });

      const result = await getOrSetHistoricalEndpointCache(key, true, factory);

      expect(result).toEqual({ data: 'fresh' });
      expect(factory).toHaveBeenCalledOnce();
    });

    it('calls factory and caches result when key is missing', async () => {
      const key = createHistoricalResultCacheKey('historicalSimulation', 'BTCUSDT', IntervalEnum.FourHour, 500);
      const factory = vi.fn().mockResolvedValue({ data: 'computed' });

      const result = await getOrSetHistoricalEndpointCache(key, false, factory);

      expect(result).toEqual({ data: 'computed' });
      expect(factory).toHaveBeenCalledOnce();
      expect(getCachedHistoricalResult(key)).toEqual({ data: 'computed' });
    });

    it('stores factory result so subsequent requests use cache', async () => {
      const key = createHistoricalResultCacheKey('historicalSimulation', 'BTCUSDT', IntervalEnum.FourHour, 500);
      const factory = vi.fn().mockResolvedValue({ data: 'computed' });

      await getOrSetHistoricalEndpointCache(key, false, factory);
      await getOrSetHistoricalEndpointCache(key, false, factory);

      expect(factory).toHaveBeenCalledOnce();
    });
  });
});
