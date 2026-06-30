import { describe, expect, it, beforeEach } from 'vitest';
import { IntervalEnum } from '#shared/types/market';
import {
  clearHistoricalResultCache,
  createHistoricalResultCacheKey,
  getCachedHistoricalResult,
  setCachedHistoricalResult,
} from '../../../server/utils/historicalResultCache';

describe('historicalResultCache', () => {
  beforeEach(() => {
    clearHistoricalResultCache();
  });

  it('stores and reads cached historical results', () => {
    const key = createHistoricalResultCacheKey('historicalSimulation', 'BTCUSDT', IntervalEnum.OneHour, 500);
    const value = { ok: true };

    setCachedHistoricalResult(key, value);

    expect(getCachedHistoricalResult<typeof value>(key)).toEqual(value);
  });

  it('uses variant in cache key', () => {
    const keyA = createHistoricalResultCacheKey('historicalWalkForwardMulti', 'BTCUSDT', IntervalEnum.OneHour, 500, 3);
    const keyB = createHistoricalResultCacheKey('historicalWalkForwardMulti', 'BTCUSDT', IntervalEnum.OneHour, 500, 5);

    expect(keyA).not.toBe(keyB);
  });

  it('clears cache entries', () => {
    const key = createHistoricalResultCacheKey('historicalScoreCalibration', 'BTCUSDT', IntervalEnum.OneHour, 500);
    setCachedHistoricalResult(key, { ok: true });

    clearHistoricalResultCache();

    expect(getCachedHistoricalResult(key)).toBeNull();
  });
});
